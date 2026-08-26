import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download, ExternalLink, Check } from 'lucide-react';

export const QRCodeModal = ({ isOpen, onClose, cardData, onCopy }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && cardData?.encodingUrl && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        cardData.encodingUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0088CC',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, cardData]);

  if (!isOpen || !cardData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardData.encodingUrl);
    setCopied(true);
    if (onCopy) onCopy('Signed encoding URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const imageUri = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR-${cardData.cardUid}.png`;
      link.href = imageUri;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-50 border border-slate-300 rounded-2xl p-6 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-50 text-[#00BCFF] border border-cyan-200 mb-3">
            <span className="font-mono text-xl font-bold">NFC</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-sans">NFC Card QR Encoding</h3>
          <p className="text-sm text-slate-500 font-mono mt-1">{cardData.cardUid}</p>
        </div>

        {/* QR Canvas Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-100 border border-slate-200 rounded-xl mb-6">
          <canvas ref={canvasRef} className="rounded-lg" />
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00BCFF] animate-pulse"></span>
            Signature: <span className="text-[#00BCFF] font-semibold">{cardData.signature}</span>
          </div>
        </div>

        {/* Encoded URL Display */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Signed Encoding Target URL
          </label>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 break-all">
            <span className="truncate flex-1">{cardData.encodingUrl}</span>
            <a
              href={cardData.encodingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#00BCFF] hover:text-[#0099D6] p-1"
              title="Test URL in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-sm transition-all border border-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0088CC] hover:bg-[#007AAB] text-white rounded-xl font-bold text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
};
