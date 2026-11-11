import React, { useState } from 'react';
import {
  X,
  Printer,
  QrCode,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Heart,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  WorkerRecord,
  PermitRecord,
  WorkerBenefit,
  CustomFieldDefinition,
  QRCodeRecord,
} from '../types';

interface WorkerDetailModalProps {
  worker: WorkerRecord;
  permits: PermitRecord[];
  benefits: WorkerBenefit[];
  customValues: Array<CustomFieldDefinition & { value: string }>;
  qrCodes: QRCodeRecord[];
  onClose: () => void;
  onEdit: (workerId: number) => void;
  onOpenQRGenerator: (permitId: number) => void;
  onPrintBadge: (permitId: number) => void;
  onViewPublicVerification: (rawToken: string) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  permits,
  benefits,
  customValues,
  qrCodes,
  onClose,
  onEdit,
  onOpenQRGenerator,
  onPrintBadge,
  onViewPublicVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'permits' | 'identity' | 'benefits' | 'custom'>('permits');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Banner Header */}
        <div className="bg-slate-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {worker.photo ? (
                <img
                  src={worker.photo}
                  alt={worker.full_name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white shadow-md">
                  {worker.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{worker.full_name}</h3>
                  {worker.is_active ? (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-slate-300 font-mono">
                  {worker.worker_code} &bull; <span className="text-emerald-400 font-sans">{worker.profession}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(worker.id);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex border-b border-slate-800 gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('permits')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'permits'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Permits & QR Verification ({permits.length})
            </button>
            <button
              onClick={() => setActiveTab('identity')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'identity'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Employee Identity
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'benefits'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Benefits ({benefits.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Custom Metrics ({customValues.length})
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: PERMITS & QR CODES */}
          {activeTab === 'permits' && (
            <div className="space-y-4">
              {permits.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No permits recorded for this worker.
                </div>
              ) : (
                permits.map(permit => {
                  const activeQR = qrCodes.find(q => q.permit_id === permit.id && q.is_active);
                  const isExpired = permit.declaration_end_date < today;

                  return (
                    <div
                      key={permit.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{permit.permit_type}</div>
                          <div className="font-mono text-xs font-semibold text-emerald-700">{permit.permit_number}</div>
                        </div>
                        <div>
                          {isExpired ? (
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              Expired
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              Active & Valid
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 sm:grid-cols-2">
                        <div>
                          <span className="text-[11px] text-slate-400">Declaration Start:</span>{' '}
                          <span className="font-semibold text-slate-800">{permit.declaration_start_date}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400">Declaration End:</span>{' '}
                          <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                            {permit.declaration_end_date}
                          </span>
                        </div>
                      </div>

                      {/* QR Verification Status Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-emerald-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {activeQR ? 'Active Verification QR' : 'QR Not Generated'}
                            </div>
                            {activeQR && (
                              <div className="font-mono text-[10px] text-slate-500">
                                SHA-256: {activeQR.token_hash.slice(0, 16)}...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeQR && (
                            <>
                              <button
                                onClick={() => onViewPublicVerification(activeQR.raw_token)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Open Public Verification Certificate"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Public View</span>
                              </button>
                              <button
                                onClick={() => onPrintBadge(permit.id)}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                              >
                                <Printer className="h-3 w-3" />
                                <span>Print Badge</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onOpenQRGenerator(permit.id)}
                            className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>{activeQR ? 'Manage QR' : 'Generate QR'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: EMPLOYEE IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 font-semibold">National ID / Residence</div>
                  <div className="mt-1 text-sm font-mono font-bold text-slate-800">{worker.id_number}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 font-semibold">Nationality</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{worker.nationality}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 font-semibold">Gender</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{worker.gender}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <div className="text-[11px] text-slate-400 font-semibold">Date of Birth</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">
                    {worker.date_of_birth ?? 'Not Specified'}
                  </div>
                </div>
              </div>

              {worker.notes && (
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Administrative & Safety Notes
                  </div>
                  <div className="text-slate-700 leading-relaxed">{worker.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="space-y-3">
              {benefits.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No benefits configured for this worker.
                </div>
              ) : (
                benefits.map(b => (
                  <div key={b.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900">{b.benefit_name}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {b.benefit_type}
                        </span>
                        {b.is_public ? (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Public on QR
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                    {b.benefit_description && (
                      <div className="mt-1 text-xs text-slate-600">{b.benefit_description}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CUSTOM FIELDS */}
          {activeTab === 'custom' && (
            <div className="space-y-3">
              {customValues.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No custom field values recorded.
                </div>
              ) : (
                customValues.map(cf => (
                  <div key={cf.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        {cf.field_name}
                      </span>
                      {cf.is_public ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Public on QR
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Internal Only
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {cf.value || <span className="text-slate-400 font-normal italic">None provided</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
