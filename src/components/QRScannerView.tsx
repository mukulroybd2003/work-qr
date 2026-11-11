import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  UploadCloud,
  Play,
  Square,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

interface QRScannerViewProps {
  onVerifiedTokenScanned: (rawToken: string) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({ onVerifiedTokenScanned }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Camera idle.');

  // Scan Result
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    token?: string;
    message: string;
    rawPayload?: string;
  } | null>(null);

  // Upload State
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setStatusMessage('Camera stopped.');
  }, []);

  const handleValidTokenRedirect = useCallback((token: string) => {
    setTimeout(() => {
      onVerifiedTokenScanned(token);
    }, 1200);
  }, [onVerifiedTokenScanned]);

  // Validate scanned payload and extract token
  const processDecodedPayload = useCallback((payload: string) => {
    const cleanPayload = payload.trim();

    // Pattern 1: http(s)://domain/#/verify/{token}
    // Pattern 2: http(s)://domain/verify/{token}
    // Pattern 3: /verify/{token}
    // Pattern 4: raw 64-char hex token
    let extractedToken: string | null = null;

    if (cleanPayload.includes('/verify/')) {
      const parts = cleanPayload.split('/verify/');
      if (parts.length >= 2) {
        const potentialToken = parts[1].split(/[?#&/]/)[0];
        if (potentialToken && potentialToken.length >= 32) {
          extractedToken = potentialToken;
        }
      }
    } else if (/^[a-f0-9]{64}$/i.test(cleanPayload)) {
      extractedToken = cleanPayload;
    }

    if (extractedToken) {
      setScanResult({
        success: true,
        token: extractedToken,
        message: 'Valid verification payload recognized! Redirecting to official certificate...',
        rawPayload: cleanPayload,
      });
      handleValidTokenRedirect(extractedToken);
    } else {
      // Check if it's an external URL
      if (cleanPayload.startsWith('http://') || cleanPayload.startsWith('https://')) {
        setScanResult({
          success: false,
          message:
            'External URL blocked: This QR code does not belong to the official verification service. External redirects are restricted.',
          rawPayload: cleanPayload,
        });
      } else {
        setScanResult({
          success: false,
          message: 'Unrecognized QR code format. Expected a 256-bit verification token.',
          rawPayload: cleanPayload,
        });
      }
    }
  }, [handleValidTokenRedirect]);

  // Frame scanning loop
  const scanVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        stopCamera();
        processDecodedPayload(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanVideo);
  }, [stopCamera, processDecodedPayload]);

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setStatusMessage('Requesting camera permissions...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setStatusMessage('Scanning active. Point camera at worker QR code.');
      animationFrameId.current = requestAnimationFrame(scanVideo);
    } catch (err: any) {
      console.error(err);
      setCameraError(
        err.message ||
          'Camera access failed. Ensure permission is granted in browser site settings and you are running on localhost or HTTPS.'
      );
      setStatusMessage('Camera error.');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle Image Upload Scanner
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WebP).');
      return;
    }

    setScanResult(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setUploadedPreview(result);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          setIsAnalyzing(false);

          if (code && code.data) {
            processDecodedPayload(code.data);
          } else {
            setScanResult({
              success: false,
              message:
                'No valid QR code was detected in the uploaded image. Please ensure the QR code is clearly visible and unblurred.',
            });
          }
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">QR Code Verification Scanner</h2>
        <p className="text-xs text-slate-500">
          Scan and inspect worker credential QR codes via live camera or digital image upload.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Scanner Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
          {/* Option Selector Tabs */}
          <div className="flex border-b border-slate-200 gap-3 pb-3">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('camera');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'camera'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Live Camera Scan</span>
            </button>

            <button
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>QR Image Upload</span>
            </button>
          </div>

          {/* TAB 1: LIVE CAMERA */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
                <video
                  ref={videoRef}
                  className={`h-full max-h-[360px] w-full object-cover ${!isCameraActive ? 'hidden' : 'block'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle Overlay */}
                {isCameraActive && (
                  <div className="pointer-events-none absolute h-52 w-52 rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    <div className="text-[11px] font-bold text-emerald-400">Align QR Code</div>
                  </div>
                )}

                {/* Idle Placeholder */}
                {!isCameraActive && (
                  <div className="p-8 text-center text-slate-400">
                    <Camera className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                    <div className="text-sm font-bold text-slate-300">Camera Inactive</div>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      Click &apos;Start Live Camera&apos; below to initialize device camera feed.
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Live Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop Camera</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium">{statusMessage}</div>
              </div>
            </div>
          )}

          {/* TAB 2: QR IMAGE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">Upload Worker QR Image</div>
                <p className="mt-1 text-xs text-slate-500">
                  Select a PNG, JPG, or WebP screenshot or physical badge photo.
                </p>
              </label>

              {uploadedPreview && (
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-4">
                  <img
                    src={uploadedPreview}
                    alt="Uploaded QR Preview"
                    className="h-16 w-16 rounded-lg object-contain bg-white border border-slate-200 p-1"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Uploaded File Preview</div>
                    <div className="text-[11px] text-slate-500">
                      {isAnalyzing ? 'Analyzing QR pattern...' : 'Image decoded.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scan Results Banner */}
          {scanResult && (
            <div
              className={`rounded-2xl border p-4 text-xs transition-all ${
                scanResult.success
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-sm">
                    {scanResult.success ? 'Verification Recognized' : 'Verification Rejected'}
                  </div>
                  <div>{scanResult.message}</div>
                  {scanResult.rawPayload && (
                    <div className="font-mono text-[10px] opacity-75 break-all mt-1 bg-white/60 p-2 rounded-lg border border-slate-200/50">
                      Payload: {scanResult.rawPayload}
                    </div>
                  )}
                  {scanResult.token && (
                    <div className="mt-2">
                      <button
                        onClick={() => onVerifiedTokenScanned(scanResult.token!)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Verification Certificate Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Safety Guarantees */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Security Protocols</span>
            </div>
            <h4 className="mt-1 text-sm font-bold text-slate-900">Zero Open-Redirect Policy</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              To defend inspectors and administrative users against phishing or malicious QR tampering, this scanner strictly evaluates decoded payloads. Any non-local or untrusted URLs are quarantined and blocked from automatic navigation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Troubleshooting Camera Access</h5>
            <ul className="mt-2 list-disc pl-4 space-y-1 text-xs text-slate-600">
              <li>Ensure browser permissions for <strong>Camera</strong> are granted.</li>
              <li>For mobile devices, the rear environment camera is automatically selected.</li>
              <li>Camera streaming requires an encrypted HTTPS connection or localhost.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
