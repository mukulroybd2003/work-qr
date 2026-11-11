import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  FileCheck2,
  FileX2,
  QrCode,
  AlertTriangle,
  UserPlus,
  Scan,
  Download,
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { WorkerRecord, PermitRecord, QRCodeRecord } from '../types';

interface DashboardViewProps {
  workers: WorkerRecord[];
  permits: PermitRecord[];
  qrCodes: QRCodeRecord[];
  onNavigate: (view: string) => void;
  onOpenWorker: (workerId: number) => void;
  onCreateWorker: () => void;
  onExportCsv: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workers,
  permits,
  qrCodes,
  onNavigate,
  onOpenWorker,
  onCreateWorker,
  onExportCsv,
}) => {
  // Statistics Calculations
  const activeWorkers = workers.filter(w => w.is_active && !w.deleted_at);
  const inactiveWorkers = workers.filter(w => !w.is_active && !w.deleted_at);
  const totalWorkersCount = workers.filter(w => !w.deleted_at).length;

  const today = new Date().toISOString().split('T')[0];
  const activePermits = permits.filter(p => p.status === 'active' && p.declaration_end_date >= today);
  const expiredPermits = permits.filter(p => p.status === 'expired' || p.declaration_end_date < today);
  const totalPermitsCount = permits.length;

  const generatedQRsCount = qrCodes.filter(q => q.is_active).length;

  // Permits expiring in 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

  const expiringSoonPermits = permits.filter(
    p => p.declaration_end_date >= today && p.declaration_end_date <= thirtyDaysStr
  );

  // Nationality breakdown
  const nationalityMap: Record<string, number> = {};
  workers.forEach(w => {
    if (!w.deleted_at) {
      nationalityMap[w.nationality] = (nationalityMap[w.nationality] || 0) + 1;
    }
  });
  const sortedNationalities = Object.entries(nationalityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verification Engine Online</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Workforce Credential Control Center</h2>
          <p className="text-xs text-slate-500">
            Real-time permit declarations, tamper-resistant SHA-256 QR codes, and site authorization tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onCreateWorker}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all sm:text-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register Worker</span>
          </button>
          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all sm:text-sm"
          >
            <Scan className="h-4 w-4 text-emerald-600" />
            <span>Scan QR</span>
          </button>
          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all sm:text-sm"
            title="Download CSV report of workers"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 7 Core KPI Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {/* 1. Total Workers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Workers</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalWorkersCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">Total dossiers</div>
        </div>

        {/* 2. Active Workers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Workers</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{activeWorkers.length}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Valid credentials</div>
        </div>

        {/* 3. Inactive Workers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Inactive</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-700">{inactiveWorkers.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Archived/Pending</div>
        </div>

        {/* 4. Total Permits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Permits</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalPermitsCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">Declarations</div>
        </div>

        {/* 5. Active Permits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Permits</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{activePermits.length}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Within validity</div>
        </div>

        {/* 6. Expired Permits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expired</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <FileX2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">{expiredPermits.length}</div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Lapsed declaration</div>
        </div>

        {/* 7. Generated QR Codes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active QRs</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">{generatedQRsCount}</div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">Hashed SHA-256</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expiring Soon Permits Alert Column */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Expiring Within 30 Days</span>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
              {expiringSoonPermits.length}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {expiringSoonPermits.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No permits expiring in the next 30 days.
              </div>
            ) : (
              expiringSoonPermits.map(permit => {
                const worker = workers.find(w => w.id === permit.worker_id);
                return (
                  <div
                    key={permit.id}
                    onClick={() => onOpenWorker(permit.worker_id)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 hover:bg-amber-50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{worker?.full_name ?? 'Worker'}</div>
                      <div className="font-mono text-[11px] text-slate-500">{permit.permit_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-amber-700">{permit.declaration_end_date}</div>
                      <span className="text-[10px] text-amber-600">Requires renewal</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recently Enrolled Workers */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Recently Registered Workers</span>
            </div>
            <button
              onClick={() => onNavigate('workers')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Worker Code</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Profession</th>
                  <th className="px-4 py-3">Nationality</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {workers
                  .filter(w => !w.deleted_at)
                  .slice(0, 5)
                  .map(worker => (
                    <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        {worker.worker_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{worker.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{worker.id_number}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{worker.profession}</td>
                      <td className="px-4 py-3 text-slate-600">{worker.nationality}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenWorker(worker.id)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nationality Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Workforce by Nationality</h3>
          <div className="mt-4 space-y-3">
            {sortedNationalities.map(([nat, count]) => {
              const pct = Math.round((count / Math.max(1, totalWorkersCount)) * 100);
              return (
                <div key={nat}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{nat}</span>
                    <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Verification Integrity */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xs">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>Cryptographic Integrity</span>
          </div>
          <h3 className="mt-1 text-base font-bold text-white">SHA-256 Token Verification Architecture</h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            All worker verification badges utilize high-entropy 256-bit cryptographic tokens. Only cryptographic hashes are maintained in the database, preventing reverse engineering, credential forgery, or spoofing attacks.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
            <div>
              <div className="text-lg font-extrabold text-white">32 B</div>
              <div className="text-[10px] text-slate-400">Entropy Seed</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-emerald-400">SHA-256</div>
              <div className="text-[10px] text-slate-400">Hash Algorithm</div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-white">Zero PII</div>
              <div className="text-[10px] text-slate-400">In Payload URL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
