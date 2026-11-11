import React from 'react';
import { 
  ShieldCheck, 
  Scan, 
  ExternalLink, 
  FolderDown, 
  LogOut, 
  Bell, 
  Menu
} from 'lucide-react';
import { AdminUser, SystemSettings } from '../types';

interface HeaderProps {
  currentView: string;
  settings: SystemSettings;
  adminUser: AdminUser | null;
  onNavigate: (view: string) => void;
  onOpenExplorer: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  settings,
  adminUser,
  onNavigate,
  onOpenExplorer,
  onLogout,
  onToggleSidebar,
}) => {
  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Executive Overview';
      case 'workers':
        return 'Worker Records & Credentials';
      case 'scanner':
        return 'QR Code Scanner & Live Verification';
      case 'custom-fields':
        return 'Dynamic Custom Fields Schema';
      case 'settings':
        return 'System Configuration & Audit Logs';
      case 'verify-preview':
        return 'Public Verification Preview';
      default:
        return 'Worker QR Management System';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 sm:text-lg">{getPageTitle()}</h1>
          <div className="hidden text-xs text-slate-500 sm:block">
            {settings.organization_name} &bull; <span className="font-medium text-emerald-600">Encrypted QR Engine</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action: Open QR Scanner */}
        <button
          onClick={() => onNavigate('scanner')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
            currentView === 'scanner'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
          title="Open Scanner"
        >
          <Scan className="h-4 w-4" />
          <span className="hidden sm:inline">QR Scanner</span>
        </button>

        {/* Quick Action: Public Verification Simulation */}
        <button
          onClick={() => onNavigate('verify-preview')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
          title="Simulate Public Verification Page"
        >
          <ExternalLink className="h-4 w-4 text-emerald-600" />
          <span className="hidden md:inline">Public Page</span>
        </button>

        {/* Full PHP/MySQL Source Code & Download Button */}
        <button
          onClick={onOpenExplorer}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 sm:text-sm"
          title="Browse & Download Full PHP/MySQL Project"
        >
          <FolderDown className="h-4 w-4 text-emerald-600" />
          <span className="hidden lg:inline">PHP / MySQL Files</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Admin User Chip */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {adminUser?.name ? adminUser.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden text-left lg:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">{adminUser?.name ?? 'Admin'}</div>
            <div className="text-[10px] text-slate-500 capitalize">{adminUser?.role ?? 'Superadmin'}</div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
