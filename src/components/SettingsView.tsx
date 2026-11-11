import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  ShieldCheck,
  Activity,
  RotateCcw,
  Save,
  CheckCircle,
  FolderDown,
  Building,
  Mail,
  Phone,
  Eye,
} from 'lucide-react';
import { SystemSettings, AuditLogItem } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  auditLogs: AuditLogItem[];
  onSaveSettings: (newSettings: Partial<SystemSettings>) => void;
  onDownloadSQLBackup: () => void;
  onDownloadProjectZip: () => void;
  onResetFactoryData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  auditLogs,
  onSaveSettings,
  onDownloadSQLBackup,
  onDownloadProjectZip,
  onResetFactoryData,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Settings & Compliance Logs</h2>
          <p className="text-xs text-slate-500">
            Configure organization identity, public disclosure limits, cryptographic backup dumps, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadProjectZip}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
            title="Download full PHP/MySQL project files as .ZIP"
          >
            <FolderDown className="h-4 w-4" />
            <span>Download PHP Project (.ZIP)</span>
          </button>
          <button
            onClick={onDownloadSQLBackup}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            title="Export complete MySQL database SQL dump"
          >
            <Database className="h-4 w-4 text-slate-500" />
            <span>SQL Database Backup</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Settings Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Building className="h-4 w-4 text-emerald-600" />
              <span>Organization Branding & Verification Metadata</span>
            </div>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Settings Saved!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Title
                </label>
                <input
                  type="text"
                  value={formData.app_name}
                  onChange={e => setFormData({ ...formData, app_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compliance Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compliance Helpline Phone
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Worker Code Prefix
                </label>
                <input
                  type="text"
                  value={formData.worker_code_prefix}
                  onChange={e => setFormData({ ...formData, worker_code_prefix: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Theme Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                    className="h-8 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    readOnly
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Public Page Disclosure Settings */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span>Public Verification Disclosure Policy</span>
              </div>
              <p className="text-xs text-slate-500">
                Determine which employee demographic data attributes are rendered on anonymous QR verification scans.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-white p-2.5 border border-slate-200 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.public_show_photo}
                    onChange={e => setFormData({ ...formData, public_show_photo: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Render Worker Photo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-white p-2.5 border border-slate-200 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.public_show_id_number}
                    onChange={e => setFormData({ ...formData, public_show_id_number: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Render National ID / Residence</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-white p-2.5 border border-slate-200 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.public_show_gender}
                    onChange={e => setFormData({ ...formData, public_show_gender: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Render Gender</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-white p-2.5 border border-slate-200 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.public_show_dob}
                    onChange={e => setFormData({ ...formData, public_show_dob: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Render Date of Birth</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Save System Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Audit Logs Stream */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Immutable Audit Logs</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {auditLogs.length} events
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-200 font-mono text-[10px] font-bold text-slate-700 px-1.5 py-0.5">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {log.created_at.split(' ')[1] || log.created_at}
                  </span>
                </div>
                <div className="text-slate-800 font-medium leading-relaxed">{log.description}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {log.ip_address} &bull; {log.admin_name ?? 'System'}
                </div>
              </div>
            ))}
          </div>

          {/* Reset State Option */}
          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Reset all local worker records, permits, and QR tokens back to the initial factory seed data?'
                  )
                ) {
                  onResetFactoryData();
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Restore Factory Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
