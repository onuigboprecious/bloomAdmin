import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Copy,
  QrCode,
  Download,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Watch,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { QRCodeModal } from '../components/Common/QRCodeModal';
import { Toast } from '../components/Common/Toast';

export const ProvisionPage = () => {
  const [batchSize, setBatchSize] = useState('10');
  const [customSize, setCustomSize] = useState('');
  const [hardwareType, setHardwareType] = useState('Card'); // 'Card' or 'Wristband'
  const [finishStyle, setFinishStyle] = useState('Stealth Matte Black');
  const [loading, setLoading] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);
  const [selectedQrCard, setSelectedQrCard] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedUid, setCopiedUid] = useState(null);

  const cardFinishes = [
    { name: 'Stealth Matte Black', color: 'bg-slate-900 text-white border-slate-700' },
    { name: 'Emerald Green', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: 'Sunset Amber', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { name: 'Custom Wood', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    { name: 'Crystal Clear', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  ];

  const wristbandFinishes = [
    { name: 'Silicone Sport Black', color: 'bg-slate-900 text-white border-slate-700' },
    { name: 'Festival Woven Fabric', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { name: 'Waterproof Glow Blue', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { name: 'Emerald Silicone Strap', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { name: 'Eco Leather Strap', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  ];

  const activeFinishes = hardwareType === 'Card' ? cardFinishes : wristbandFinishes;
  const fullFinishName = `${finishStyle} (${hardwareType})`;

  const handleHardwareTypeChange = (type) => {
    setHardwareType(type);
    if (type === 'Card') {
      setFinishStyle('Stealth Matte Black');
    } else {
      setFinishStyle('Silicone Sport Black');
    }
  };

  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    const count = batchSize === 'custom' ? parseInt(customSize, 10) : parseInt(batchSize, 10);
    if (!count || count <= 0 || count > 500) {
      setToastMessage({ message: 'Please enter a valid batch size between 1 and 500', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.provisionBatch({ batchSize: count, finishName: fullFinishName, hardwareType });
      if (res.success) {
        setProvisionResult(res.data);
        setToastMessage({
          message: `Successfully provisioned ${res.data.totalProvisioned} NFC ${hardwareType}s (${finishStyle})`,
          type: 'success',
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0088CC', '#00BCFF', '#10B981'],
        });
      }
    } catch (err) {
      setToastMessage({ message: err.message || 'Failed to generate NFC batch', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url, uid) => {
    navigator.clipboard.writeText(url);
    setCopiedUid(uid);
    setToastMessage({ message: `Copied URL for ${uid}`, type: 'info' });
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleDownloadCsv = () => {
    if (!provisionResult || !provisionResult.cards?.length) return;
    const headers = ['UID / Tag ID', 'Signature', 'Hardware Type', 'Finish Style', 'Status', 'Signed Encoding URL', 'Created At'];
    const rows = provisionResult.cards.map((c) => [
      c.cardUid,
      c.signature,
      hardwareType,
      c.finishName,
      c.status,
      c.encodingUrl,
      c.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NFC-Batch-${hardwareType}-${finishStyle.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    link.click();
    setToastMessage({ message: 'Downloaded Encoding CSV file', type: 'success' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      <Toast
        message={toastMessage?.message}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white via-cyan-50/50 to-slate-50 border border-slate-200 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/80 border border-cyan-200 text-[#0088CC] text-xs font-mono mb-3">
              <Cpu className="w-3.5 h-3.5" />
              NFC HARDWARE PROVISIONING ENGINE
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              NFC Batch Provisioning Tool (Cards & Wristbands)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Provision bulk NFC hardware (Cards or Wristbands), generate cryptographic signatures, and create signed URL payloads ready for physical encoder writing.
            </p>
          </div>
          {provisionResult && (
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0088CC] hover:bg-[#007AAB] text-white font-extrabold text-sm shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export Batch CSV
            </button>
          )}
        </div>
      </div>

      {/* Batch Form Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Select Form Factor (Card vs Wristband) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
            1. Select Hardware Form Factor (Card or Wristband)
          </label>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleHardwareTypeChange('Card')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                hardwareType === 'Card'
                  ? 'bg-cyan-50 border-[#0088CC] text-[#0088CC] shadow-sm ring-2 ring-[#0088CC]/30'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => handleHardwareTypeChange('Wristband')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                hardwareType === 'Wristband'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm ring-2 ring-purple-500/30'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Watch className="w-5 h-5" />
              <span>Wristband</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerateBatch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 2: Batch Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                2. Select Batch Quantity
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['10', '50', '100', 'custom'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBatchSize(size)}
                    className={`py-3 px-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                      batchSize === size
                        ? 'bg-cyan-50 border-[#0088CC] text-[#0088CC] shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {size === 'custom' ? 'Custom' : `${size} Units`}
                  </button>
                ))}
              </div>
              {batchSize === 'custom' && (
                <input
                  type="number"
                  placeholder="Enter custom count (e.g. 250)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  min="1"
                  max="500"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0088CC]"
                />
              )}
            </div>

            {/* Step 3: Finish Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                3. Select {hardwareType} Style / Finish
              </label>
              <select
                value={finishStyle}
                onChange={(e) => setFinishStyle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:border-[#0088CC] focus:ring-1 focus:ring-[#0088CC] transition-all"
              >
                {activeFinishes.map((f) => (
                  <option key={f.name} value={f.name} className="bg-white text-slate-900">
                    {f.name}
                  </option>
                ))}
              </select>

              {/* Finish Badge Preview */}
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500">Selected Option:</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono">
                  {hardwareType}: {finishStyle}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 py-3.5 px-8 bg-[#0088CC] hover:bg-[#007AAB] text-white font-extrabold text-base rounded-xl shadow-cyan-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Signed Cryptographic Payloads...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Signed NFC {hardwareType} Batch
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Output Batch Results Section */}
      {provisionResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-mono uppercase">Batch ID</p>
              <p className="text-lg font-bold text-[#0088CC] font-mono mt-1">{provisionResult.batchId}</p>
            </div>
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-mono uppercase">Total Generated Units</p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">{provisionResult.totalGenerated}</p>
            </div>
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-mono uppercase">Provisioned Status</p>
              <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {provisionResult.totalProvisioned} / {provisionResult.totalGenerated} Ready
              </p>
            </div>
          </div>

          {/* Provisioned Cards/Wristbands Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Provisioned NFC {hardwareType} Batch
                </h3>
                <p className="text-xs text-slate-500">Hardware generated with unique signatures</p>
              </div>
              <button
                onClick={handleDownloadCsv}
                className="text-xs font-mono font-bold text-[#0088CC] hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Encoding CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Hardware UID</th>
                    <th className="px-6 py-3.5">Signature</th>
                    <th className="px-6 py-3.5">Form Factor & Style</th>
                    <th className="px-6 py-3.5">Signed Encoding URL</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {provisionResult.cards.map((card) => (
                    <tr key={card.cardUid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0088CC]" />
                        {card.cardUid}
                      </td>
                      <td className="px-6 py-4 text-[#0088CC] font-semibold">{card.signature}</td>
                      <td className="px-6 py-4 font-sans text-slate-700">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                          {hardwareType === 'Card' ? <CreditCard className="w-3 h-3 text-[#0088CC]" /> : <Watch className="w-3 h-3 text-purple-600" />}
                          {card.finishName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {card.encodingUrl}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyUrl(card.encodingUrl, card.cardUid)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Copy URL"
                          >
                            {copiedUid === card.cardUid ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedQrCard(card)}
                            className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-[#0088CC] border border-cyan-200 transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Dialog Modal */}
      <QRCodeModal
        isOpen={!!selectedQrCard}
        onClose={() => setSelectedQrCard(null)}
        cardData={selectedQrCard}
        onCopy={(msg) => setToastMessage({ message: msg, type: 'info' })}
      />
    </div>
  );
};
