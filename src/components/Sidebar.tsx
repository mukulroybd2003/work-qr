import React from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Sliders,
  Settings,
  ShieldCheck,
  FolderCode,
  ExternalLink,
  X,
  FileCheck2,
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SidebarProps {
  currentView: string;
  isOpen: boolean;
  settings: SystemSettings;
  workerCount: number;
  onNavigate: (view: string) => void;
  onCloseMobile: () => void;
  onOpenExplorer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isOpen,
  settings,
  workerCount,
  onNavigate,
  onCloseMobile,
  onOpenExplorer,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workers', label: 'Workers', icon: Users, badge: workerCount },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'custom-fields', label: 'Custom Fields', icon: Sliders },
    { id: 'settings', label: 'Settings & Logs', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-900/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Worker QR</div>
              <div className="text-[10px] text-emerald-400 font-medium">Verification System</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Administrative Modules
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Portals & Source
          </div>
          <div className="space-y-1">
            {/* Public Page View */}
            <button
              onClick={() => {
                onNavigate('verify-preview');
                onCloseMobile();
              }}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                currentView === 'verify-preview'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>Public Verification</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
            </button>

            {/* PHP/MySQL Project Source Code Explorer */}
            <button
              onClick={() => {
                onOpenExplorer();
                onCloseMobile();
              }}
              className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-900 hover:text-emerald-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <FolderCode className="h-4 w-4 text-amber-400" />
                <span>PHP/MySQL Source</span>
              </div>
              <span className="rounded bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                XAMPP
              </span>
            </button>
          </div>
        </div>

        {/* System Tech Spec Banner */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/60">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Stack: PHP 8.2 + MySQL</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              InnoDB &bull; SHA-256 Tokens &bull; CSRF Protected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
