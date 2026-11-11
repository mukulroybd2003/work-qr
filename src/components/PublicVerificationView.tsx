import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  User,
  Heart,
  Sliders,
  Printer,
  ExternalLink,
  ArrowLeft,
  AlertOctagon,
  Lock,
} from 'lucide-react';
import {
  WorkerRecord,
  PermitRecord,
  WorkerBenefit,
  CustomFieldDefinition,
  SystemSettings,
  QRCodeRecord,
} from '../types';
import { storage } from '../lib/storage';

interface PublicVerificationViewProps {
  initialToken?: string;
  settings: SystemSettings;
  onBackToAdmin?: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  initialToken,
  settings,
  onBackToAdmin,
}) => {
  // Available demo tokens for testing
  const allQrs = storage.getQRCodes();
  const defaultToken = initialToken || (allQrs.length > 0 ? allQrs[0].raw_token : '');

  const [currentToken, setCurrentToken] = useState(defaultToken);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    isValid: boolean;
    errorReason?: string;
    worker?: WorkerRecord;
    permit?: PermitRecord;
    qr?: QRCodeRecord;
    publicBenefits?: WorkerBenefit[];
    publicCustomFields?: Array<CustomFieldDefinition & { value: string }>;
  } | null>(null);

  useEffect(() => {
    if (!currentToken) return;
    setLoading(true);
    storage.verifyToken(currentToken).then(res => {
      setVerificationData(res);
      setLoading(false);
    });
  }, [currentToken]);

  const today = new Date().toISOString().split('T')[0];
  const isPermitExpired =
    verificationData?.permit && verificationData.permit.declaration_end_date < today;

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4 sm:px-6">
      {/* Simulation Selector Bar (Non-printed test helper) */}
      <div className="no-print mx-auto mb-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Public Read-Only Verification Route
            </span>
          </div>

          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Admin Panel</span>
            </button>
          )}
        </div>

        {/* Quick Token Tester */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Test Scenarios:</span>
          {allQrs.map((q, idx) => {
            const permit = storage.getPermitById(q.permit_id);
            const worker = permit ? storage.getWorkerById(permit.worker_id) : undefined;
            const isCurrent = currentToken === q.raw_token;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentToken(q.raw_token)}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {worker?.full_name ? `${worker.full_name.split(' ')[0]}` : `Token ${idx + 1}`} (
                {q.is_active ? 'Active' : 'Revoked'})
              </button>
            );
          })}

          <button
            onClick={() => setCurrentToken('invalid_tampered_token_99999999999999999999999999999999')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              currentToken.startsWith('invalid')
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Test Invalid/Revoked Token
          </button>
        </div>
      </div>

      {/* Main Public Verification Document Container */}
      <div className="print-page mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Certificate Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt={settings.organization_name}
                  className="h-12 w-12 rounded-xl object-cover bg-white p-1 border border-emerald-400/30 shadow-md"
                />
              )}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  {settings.organization_name}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5">
                  WORKER INFORMATION RECORD
                </h1>
                <div className="mt-1 text-xs text-emerald-200/80 font-mono">
                  Verification Credential ID: {currentToken.slice(0, 8)}...{currentToken.slice(-8)}
                </div>
              </div>
            </div>

            {/* Verification Status Badge */}
            <div>
              {loading ? (
                <span className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-300">
                  Verifying Hash...
                </span>
              ) : verificationData?.isValid && !isPermitExpired ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-extrabold text-emerald-300 border border-emerald-400/40 shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>VERIFIED & AUTHORIZED</span>
                </div>
              ) : verificationData?.isValid && isPermitExpired ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-4 py-1.5 text-xs font-extrabold text-rose-300 border border-rose-400/40 shadow-xs backdrop-blur-xs">
                  <AlertOctagon className="h-4 w-4 text-rose-400" />
                  <span>PERMIT EXPIRED</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-4 py-1.5 text-xs font-extrabold text-rose-300 border border-rose-400/40 shadow-xs backdrop-blur-xs">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>INVALID / REVOKED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* CASE A: INVALID OR REVOKED */}
          {!loading && (!verificationData || !verificationData.isValid) && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Verification Notice</h3>
                <p className="text-sm font-semibold text-rose-600">
                  {verificationData?.errorReason || 'Invalid QR code or unrecognized authorization token.'}
                </p>
              </div>

              <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs text-slate-600 leading-relaxed">
                <strong>Notice to Verifier / Inspector:</strong> This QR credential could not be reconciled against active enterprise database records. This condition occurs if the worker has been archived, the permit was revoked, or this card has been superseded by a regenerated QR code.
              </div>

              <div className="text-xs text-slate-500">
                Direct compliance inquiry:{' '}
                <span className="font-bold text-slate-800">{settings.contact_email}</span>
              </div>
            </div>
          )}

          {/* CASE B: VALID RECORD */}
          {verificationData && verificationData.isValid && verificationData.worker && verificationData.permit && (
            <>
              {/* SECTION 1: PERMIT DATA */}
              <div>
                <div className="flex items-center gap-2 border-b-2 border-emerald-100 pb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  <span>Section 1: Permit & Authorization Data</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Permit Type</div>
                    <div className="mt-1 text-xs font-bold text-slate-900">
                      {verificationData.permit.permit_type}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Permit Number</div>
                    <div className="mt-1 text-xs font-mono font-bold text-emerald-700">
                      {verificationData.permit.permit_number}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Declaration Start Date</div>
                    <div className="mt-1 text-xs font-bold text-slate-800">
                      {verificationData.permit.declaration_start_date}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Declaration End Date</div>
                    <div
                      className={`mt-1 text-xs font-bold ${
                        isPermitExpired ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {verificationData.permit.declaration_end_date}
                      {isPermitExpired && ' (Expired)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: EMPLOYEE DATA */}
              <div>
                <div className="flex items-center gap-2 border-b-2 border-emerald-100 pb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <User className="h-4 w-4 text-emerald-600" />
                  <span>Section 2: Employee Demographic & Identity Data</span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-6 items-start">
                  {settings.public_show_photo && verificationData.worker.photo && (
                    <img
                      src={verificationData.worker.photo}
                      alt={verificationData.worker.full_name}
                      className="h-28 w-28 rounded-2xl object-cover border-2 border-slate-200 shadow-md shrink-0"
                    />
                  )}

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Full Name</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {verificationData.worker.full_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Worker System Code</div>
                      <div className="font-mono text-sm font-bold text-emerald-700 mt-0.5">
                        {verificationData.worker.worker_code}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Profession / Role</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {verificationData.worker.profession}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Nationality</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {verificationData.worker.nationality}
                      </div>
                    </div>

                    {settings.public_show_id_number && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          National / Residence ID
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                          {verificationData.worker.id_number}
                        </div>
                      </div>
                    )}

                    {settings.public_show_gender && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">Gender</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {verificationData.worker.gender}
                        </div>
                      </div>
                    )}

                    {settings.public_show_dob && verificationData.worker.date_of_birth && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">Date of Birth</div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {verificationData.worker.date_of_birth}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: APPROVED PUBLIC BENEFITS */}
              {verificationData.publicBenefits && verificationData.publicBenefits.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b-2 border-emerald-100 pb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Heart className="h-4 w-4 text-emerald-600" />
                    <span>Section 3: Approved Public Benefits & Coverage</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {verificationData.publicBenefits.map(b => (
                      <div key={b.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{b.benefit_name}</span>
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {b.benefit_type}
                          </span>
                        </div>
                        {b.benefit_description && (
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {b.benefit_description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: APPROVED PUBLIC CUSTOM FIELDS */}
              {verificationData.publicCustomFields && verificationData.publicCustomFields.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 border-b-2 border-emerald-100 pb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Sliders className="h-4 w-4 text-emerald-600" />
                    <span>Section 4: Operational Metrics & Certifications</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {verificationData.publicCustomFields.map(cf => (
                      <div key={cf.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold text-slate-500">{cf.field_name}</div>
                        <div className="mt-1 text-xs font-bold text-slate-800">
                          {cf.value || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Legal Notice & Print */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="max-w-md text-[11px] text-slate-500 leading-relaxed">
                    <strong>Independent Information Verification System:</strong> This record certifies that the presented worker details match valid records in the {settings.organization_name} workforce database. This document serves as an organizational verification credential and is not an official government certification.
                  </div>

                  <div className="no-print flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
