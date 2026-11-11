import React, { useState } from 'react';
import {
  X,
  FolderCode,
  FolderDown,
  Copy,
  Check,
  FileCode,
  Database,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { PHP_PROJECT_FILES } from '../lib/phpCodeBase';
import { downloadZipArchive } from '../lib/zipExporter';

interface PHPProjectExplorerModalProps {
  onClose: () => void;
}

export const PHPProjectExplorerModal: React.FC<PHPProjectExplorerModalProps> = ({ onClose }) => {
  const fileKeys = Object.keys(PHP_PROJECT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>(fileKeys[0] || 'database/schema.sql');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileContent = PHP_PROJECT_FILES[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadZipArchive(PHP_PROJECT_FILES, 'worker-qr-system-production.zip');
    } catch (e) {
      console.error('ZIP generation failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-6 w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FolderCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">PHP 8.2 & MySQL Production Project Package</h3>
                <span className="rounded bg-emerald-900/80 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700">
                  Ready for XAMPP & cPanel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full standalone architecture with PDO transactions, SHA-256 tokens, CSRF protection, and zero dependencies required to run.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <FolderDown className="h-4 w-4" />
              <span>{isDownloading ? 'Bundling .ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar Explorer + Code Viewer */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Project Structure
            </div>
            {fileKeys.map(key => {
              const isSelected = selectedFile === key;
              const isSQL = key.endsWith('.sql');
              const isMD = key.endsWith('.md');
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-mono transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {isSQL ? (
                    <Database className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  ) : (
                    <FileCode className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                  )}
                  <span className="truncate">{key}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs">
              <span className="font-mono text-emerald-400 font-semibold">{selectedFile}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
              <pre className="text-slate-300">{fileContent}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
          <div>
            Location on Disk: <code className="font-mono text-slate-700 font-semibold">worker-qr-system/</code>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
