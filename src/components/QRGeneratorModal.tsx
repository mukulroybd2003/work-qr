import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { WorkerRecord, PermitRecord, QRCodeRecord, SystemSettings } from '../types';

interface QRGeneratorModalProps {
  permit: PermitRecord;
  worker: WorkerRecord;
  existingQR?: QRCodeRecord;
  settings: SystemSettings;
  onClose: () => void;
  onGenerateOrRegenerate: (permitId: number) => Promise<QRCodeRecord>;
  onRevoke: (permitId: number) => void;
  onViewPublicVerification: (rawToken: string) => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  permit,
  worker,
  existingQR,
  settings,
  onClose,
  onGenerateOrRegenerate,
  onRevoke,
  onViewPublicVerification,
}) => {
  const [currentQR, setCurrentQR] = useState<QRCodeRecord | undefined>(existingQR);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute verification URL
  const origin = window.location.origin;
  const verificationUrl = currentQR && currentQR.is_active
    ? `${origin}#/verify/${currentQR.raw_token}`
    : '';

  useEffect(() => {
    if (currentQR && currentQR.is_active && verificationUrl) {
      QRCode.toDataURL(verificationUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR data URL', err));
    } else {
      setQrDataUrl('');
    }
  }, [currentQR, verificationUrl]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const newQR = await onGenerateOrRegenerate(permit.id);
      setCurrentQR(newQR);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate cryptographic QR token.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = () => {
    if (
      confirm(
        `Are you sure you want to revoke this QR code? Verification attempts using this token will be instantly rejected.`
      )
    ) {
      onRevoke(permit.id);
      if (currentQR) {
        setCurrentQR({ ...currentQR, is_active: false, revoked_at: new Date().toISOString() });
      }
    }
  };

  const copyVerificationLink = () => {
    if (!verificationUrl) return;
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${worker.worker_code}_${permit.permit_number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSVG = async () => {
    if (!verificationUrl) return;
    try {
      const svgString = await QRCode.toString(verificationUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${worker.worker_code}_${permit.permit_number}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const printBadgeCard = () => {
    window.print();
  };

  const isExpired = new Date(permit.declaration_end_date) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic QR Credential</h3>
              <p className="text-xs text-slate-300 font-mono">
                {permit.permit_number} &bull; {worker.full_name} ({worker.worker_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Status Alert */}
          {isExpired && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <div className="text-xs text-rose-800">
                <span className="font-bold">Permit Expired on {permit.declaration_end_date}:</span> While a QR code can be generated, public verification scans will display an official &apos;Permit Expired&apos; notification.
              </div>
            </div>
          )}

          {/* QR Display Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-md">
                {qrDataUrl && currentQR && currentQR.is_active ? (
                  <img
                    src={qrDataUrl}
                    alt="Worker QR Verification Code"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <ShieldAlert className="h-10 w-10 text-slate-300 mb-2" />
                    <div className="text-xs font-bold text-slate-600">No Active QR</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Click &apos;Generate Token&apos; to issue a new verification code.</div>
                  </div>
                )}
              </div>

              {/* Status Pill */}
              <div className="mt-3">
                {currentQR && currentQR.is_active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Cryptographically Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Revoked / Inactive</span>
                  </span>
                )}
              </div>
            </div>

            {/* Details & Actions */}
            <div className="flex-1 space-y-3.5 w-full">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verification Route URL
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={verificationUrl || 'No active token issued'}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-700 select-all"
                  />
                  {currentQR && currentQR.is_active && (
                    <button
                      onClick={copyVerificationLink}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                      title="Copy URL"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {currentQR && currentQR.is_active && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Database SHA-256 Hash
                  </div>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-white p-2 text-[10px] font-mono text-slate-600 break-all">
                    {currentQR.token_hash}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                {currentQR && currentQR.is_active ? (
                  <>
                    <button
                      onClick={downloadPNG}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>PNG</span>
                    </button>
                    <button
                      onClick={downloadSVG}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => onViewPublicVerification(currentQR.raw_token)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Public Record</span>
                    </button>
                    <button
                      onClick={handleRevoke}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      <span>Revoke Token</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Generate Cryptographic Token</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Regenerate Note */}
          {currentQR && currentQR.is_active && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Regenerate Token:</span> Issues a new 32-byte cryptographic token and automatically revokes the previous token.
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0 ml-3"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate QR</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
