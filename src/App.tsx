import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './lib/storage';
import { AdminUser, SystemSettings } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { WorkersView } from './components/WorkersView';
import { QRScannerView } from './components/QRScannerView';
import { CustomFieldsView } from './components/CustomFieldsView';
import { SettingsView } from './components/SettingsView';
import { PublicVerificationView } from './components/PublicVerificationView';
import { WorkerCreateModal } from './components/WorkerCreateModal';
import { WorkerEditModal } from './components/WorkerEditModal';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { QRGeneratorModal } from './components/QRGeneratorModal';
import { PHPProjectExplorerModal } from './components/PHPProjectExplorerModal';
import { LoginView } from './components/LoginView';
import { PHP_PROJECT_FILES } from './lib/phpCodeBase';
import { downloadZipArchive } from './lib/zipExporter';

export default function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => storage.getSession());
  const [settings, setSettings] = useState<SystemSettings>(() => storage.getSettings());

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hash-based routing for public verification (e.g. #/verify/:token)
  const [publicRouteToken, setPublicRouteToken] = useState<string | null>(null);

  // Modals state
  const [isCreateWorkerOpen, setIsCreateWorkerOpen] = useState(false);
  const [selectedWorkerIdForDetail, setSelectedWorkerIdForDetail] = useState<number | null>(null);
  const [selectedWorkerIdForEdit, setSelectedWorkerIdForEdit] = useState<number | null>(null);
  const [selectedPermitIdForQR, setSelectedPermitIdForQR] = useState<number | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  // Reactive data states from storage
  const [workers, setWorkers] = useState(() => storage.getWorkers(true));
  const [permits, setPermits] = useState(() => storage.getPermits());
  const [benefits, setBenefits] = useState(() => storage.getBenefits());
  const [customFields, setCustomFields] = useState(() => storage.getCustomFields());
  const [qrCodes, setQRCodes] = useState(() => storage.getQRCodes());
  const [auditLogs, setAuditLogs] = useState(() => storage.getAuditLogs());

  const refreshData = useCallback(() => {
    setWorkers(storage.getWorkers(true));
    setPermits(storage.getPermits());
    setBenefits(storage.getBenefits());
    setCustomFields(storage.getCustomFields());
    setQRCodes(storage.getQRCodes());
    setAuditLogs(storage.getAuditLogs());
    setSettings(storage.getSettings());
  }, []);

  // Listen for window hash changes (e.g., #/verify/TOKEN)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/verify/')) {
        const token = hash.replace('#/verify/', '');
        setPublicRouteToken(token);
      } else {
        setPublicRouteToken(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Login handler
  const handleLoginSuccess = (admin: AdminUser) => {
    storage.setSession(admin);
    setAdminUser(admin);
    storage.logAudit('ADMIN_LOGIN', 'Admin', admin.id, `Admin ${admin.name} logged in successfully.`);
    refreshData();
  };

  // Logout handler
  const handleLogout = () => {
    if (adminUser) {
      storage.logAudit('ADMIN_LOGOUT', 'Admin', adminUser.id, `Admin ${adminUser.name} signed out.`);
    }
    storage.setSession(null);
    setAdminUser(null);
  };

  // Create Worker
  const handleSaveNewWorker = (
    workerData: any,
    permitData: any,
    benefitsData: any,
    customFieldValues: any
  ) => {
    storage.saveWorker(workerData, permitData, benefitsData, customFieldValues);
    refreshData();
    setIsCreateWorkerOpen(false);
  };

  // Update Worker
  const handleUpdateWorker = (
    workerId: number,
    workerData: any,
    permitData: any,
    benefitsData: any,
    customFieldValues: any
  ) => {
    storage.updateWorker(workerId, workerData, permitData, benefitsData, customFieldValues);
    refreshData();
    setSelectedWorkerIdForEdit(null);
  };

  // Soft Delete Worker
  const handleDeleteWorker = (workerId: number) => {
    storage.softDeleteWorker(workerId);
    refreshData();
  };

  // QR Code Operations
  const handleGenerateOrRegenerateQR = async (permitId: number) => {
    const newQR = await storage.generateOrRegenerateQR(permitId);
    refreshData();
    return newQR;
  };

  const handleRevokeQR = (permitId: number) => {
    storage.revokeQR(permitId);
    refreshData();
  };

  // Export CSV
  const handleExportCSV = () => {
    const activeList = workers.filter(w => !w.deleted_at);
    let csv = 'Worker Code,Full Name,ID Number,Profession,Nationality,Gender,Status,Permit Number,Permit Expiry\n';
    activeList.forEach(w => {
      const p = permits.find(item => item.worker_id === w.id);
      csv += `"${w.worker_code}","${w.full_name}","${w.id_number}","${w.profession}","${w.nationality}","${w.gender}","${
        w.is_active ? 'Active' : 'Inactive'
      }","${p?.permit_number ?? 'N/A'}","${p?.declaration_end_date ?? 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export SQL Backup
  const handleExportSQLBackup = () => {
    let sql = `-- ========================================================\n`;
    sql += `-- WORKER QR VERIFICATION MANAGEMENT SYSTEM - SQL BACKUP\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- ========================================================\n\n`;

    // Dump workers
    sql += `-- DUMPING TABLE: workers\n`;
    workers.forEach(w => {
      sql += `INSERT INTO workers (id, worker_code, full_name, id_number, profession, nationality, gender, is_active, created_at) VALUES (${w.id}, '${w.worker_code}', '${w.full_name.replace(/'/g, "''")}', '${w.id_number}', '${w.profession.replace(/'/g, "''")}', '${w.nationality}', '${w.gender}', ${w.is_active ? 1 : 0}, '${w.created_at}');\n`;
    });

    // Dump permits
    sql += `\n-- DUMPING TABLE: permits\n`;
    permits.forEach(p => {
      sql += `INSERT INTO permits (id, worker_id, permit_type, permit_number, declaration_start_date, declaration_end_date, status) VALUES (${p.id}, ${p.worker_id}, '${p.permit_type}', '${p.permit_number}', '${p.declaration_start_date}', '${p.declaration_end_date}', '${p.status}');\n`;
    });

    // Dump QR codes
    sql += `\n-- DUMPING TABLE: qr_codes\n`;
    qrCodes.forEach(q => {
      sql += `INSERT INTO qr_codes (id, permit_id, token_hash, is_active, generated_at) VALUES (${q.id}, ${q.permit_id}, '${q.token_hash}', ${q.is_active ? 1 : 0}, '${q.generated_at}');\n`;
    });

    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker_qr_database_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    storage.logAudit('DATABASE_BACKUP', 'System', undefined, 'Admin downloaded full SQL database backup.');
    refreshData();
  };

  // Download complete PHP/MySQL project .ZIP
  const handleDownloadProjectZip = async () => {
    await downloadZipArchive(PHP_PROJECT_FILES, 'worker-qr-system-production.zip');
    storage.logAudit('PROJECT_ZIP_EXPORT', 'System', undefined, 'Admin downloaded full PHP 8.2 & MySQL source project archive (.ZIP).');
    refreshData();
  };

  // Reset factory seed
  const handleResetFactory = () => {
    storage.resetToFactorySeed();
    refreshData();
  };

  // 1. If viewing via URL hash #/verify/{token}, render Public Verification Page
  if (publicRouteToken) {
    return (
      <PublicVerificationView
        initialToken={publicRouteToken}
        settings={settings}
        onBackToAdmin={() => {
          window.location.hash = '';
          setPublicRouteToken(null);
        }}
      />
    );
  }

  // 2. If viewing 'verify-preview' from inside the application, render Public View
  if (currentView === 'verify-preview') {
    return (
      <PublicVerificationView
        settings={settings}
        onBackToAdmin={() => setCurrentView('dashboard')}
      />
    );
  }

  // 3. If not logged in, render Login View
  if (!adminUser) {
    return <LoginView settings={settings} onLoginSuccess={handleLoginSuccess} />;
  }

  // Resolve active objects for modals
  const selectedWorkerForDetail = selectedWorkerIdForDetail
    ? workers.find(w => w.id === selectedWorkerIdForDetail)
    : undefined;
  const selectedWorkerForEdit = selectedWorkerIdForEdit
    ? workers.find(w => w.id === selectedWorkerIdForEdit)
    : undefined;
  const selectedPermitForQR = selectedPermitIdForQR
    ? permits.find(p => p.id === selectedPermitIdForQR)
    : undefined;
  const workerForQR = selectedPermitForQR
    ? workers.find(w => w.id === selectedPermitForQR.worker_id)
    : undefined;
  const existingQRForPermit = selectedPermitForQR
    ? qrCodes.find(q => q.permit_id === selectedPermitForQR.id && q.is_active)
    : undefined;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        isOpen={sidebarOpen}
        settings={settings}
        workerCount={workers.filter(w => !w.deleted_at).length}
        onNavigate={setCurrentView}
        onCloseMobile={() => setSidebarOpen(false)}
        onOpenExplorer={() => setIsExplorerOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header
          currentView={currentView}
          settings={settings}
          adminUser={adminUser}
          onNavigate={setCurrentView}
          onOpenExplorer={() => setIsExplorerOpen(true)}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && (
            <DashboardView
              workers={workers}
              permits={permits}
              qrCodes={qrCodes}
              onNavigate={setCurrentView}
              onOpenWorker={id => setSelectedWorkerIdForDetail(id)}
              onCreateWorker={() => setIsCreateWorkerOpen(true)}
              onExportCsv={handleExportCSV}
            />
          )}

          {currentView === 'workers' && (
            <WorkersView
              workers={workers}
              permits={permits}
              qrCodes={qrCodes}
              onCreateWorker={() => setIsCreateWorkerOpen(true)}
              onOpenWorker={id => setSelectedWorkerIdForDetail(id)}
              onEditWorker={id => setSelectedWorkerIdForEdit(id)}
              onDeleteWorker={handleDeleteWorker}
              onOpenQRGenerator={permitId => setSelectedPermitIdForQR(permitId)}
              onPrintBadge={permitId => setSelectedPermitIdForQR(permitId)}
              onExportCsv={handleExportCSV}
            />
          )}

          {currentView === 'scanner' && (
            <QRScannerView
              onVerifiedTokenScanned={token => {
                window.location.hash = `#/verify/${token}`;
              }}
            />
          )}

          {currentView === 'custom-fields' && (
            <CustomFieldsView
              fields={customFields}
              onAddField={field => {
                storage.addCustomField(field);
                refreshData();
              }}
              onToggleField={id => {
                storage.toggleCustomField(id);
                refreshData();
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              auditLogs={auditLogs}
              onSaveSettings={newSettings => {
                storage.updateSettings(newSettings);
                refreshData();
              }}
              onDownloadSQLBackup={handleExportSQLBackup}
              onDownloadProjectZip={handleDownloadProjectZip}
              onResetFactoryData={handleResetFactory}
            />
          )}
        </main>
      </div>

      {/* MODAL: Register Worker */}
      {isCreateWorkerOpen && (
        <WorkerCreateModal
          customFields={customFields.filter(f => f.is_active)}
          existingWorkers={workers}
          existingPermits={permits}
          onClose={() => setIsCreateWorkerOpen(false)}
          onSave={handleSaveNewWorker}
        />
      )}

      {/* MODAL: Worker Detail Dossier */}
      {selectedWorkerForDetail && (
        <WorkerDetailModal
          worker={selectedWorkerForDetail}
          permits={permits.filter(p => p.worker_id === selectedWorkerForDetail.id)}
          benefits={benefits.filter(b => b.worker_id === selectedWorkerForDetail.id)}
          customValues={storage.getCustomValuesForWorker(selectedWorkerForDetail.id)}
          qrCodes={qrCodes}
          onClose={() => setSelectedWorkerIdForDetail(null)}
          onEdit={id => setSelectedWorkerIdForEdit(id)}
          onOpenQRGenerator={permitId => setSelectedPermitIdForQR(permitId)}
          onPrintBadge={permitId => setSelectedPermitIdForQR(permitId)}
          onViewPublicVerification={rawToken => {
            window.location.hash = `#/verify/${rawToken}`;
          }}
        />
      )}

      {/* MODAL: Edit Worker */}
      {selectedWorkerForEdit && (
        <WorkerEditModal
          worker={selectedWorkerForEdit}
          permit={permits.find(p => p.worker_id === selectedWorkerForEdit.id)}
          benefits={benefits.filter(b => b.worker_id === selectedWorkerForEdit.id)}
          customFields={customFields}
          customValues={storage.getCustomValuesForWorker(selectedWorkerForEdit.id)}
          existingWorkers={workers}
          onClose={() => setSelectedWorkerIdForEdit(null)}
          onSave={handleUpdateWorker}
        />
      )}

      {/* MODAL: QR Generator & Badge Print */}
      {selectedPermitForQR && workerForQR && (
        <QRGeneratorModal
          permit={selectedPermitForQR}
          worker={workerForQR}
          existingQR={existingQRForPermit}
          settings={settings}
          onClose={() => setSelectedPermitIdForQR(null)}
          onGenerateOrRegenerate={handleGenerateOrRegenerateQR}
          onRevoke={handleRevokeQR}
          onViewPublicVerification={rawToken => {
            window.location.hash = `#/verify/${rawToken}`;
          }}
        />
      )}

      {/* MODAL: Full PHP 8.2 / MySQL Source Explorer & ZIP Downloader */}
      {isExplorerOpen && (
        <PHPProjectExplorerModal onClose={() => setIsExplorerOpen(false)} />
      )}
    </div>
  );
}
