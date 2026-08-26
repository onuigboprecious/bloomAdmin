import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  Briefcase,
  Share2,
  Download,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Sparkles,
  Watch,
  CreditCard,
} from 'lucide-react';
import { Toast } from '../components/Common/Toast';

export const ProfilePage = () => {
  const { username } = useParams();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const formattedUsername = username || 'bloom_member';

  const handleCopyProfileUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setToastMessage({ message: 'Profile link copied to clipboard!', type: 'info' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:${formattedUsername};Bloom;;;
FN:Bloom Member (@${formattedUsername})
ORG:Bloom NFC Hardware Ecosystem
TITLE:Verified Bloom Card Owner
EMAIL:${formattedUsername}@bloom.ng
URL:${window.location.href}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${formattedUsername}.vcf`;
    link.click();
    setToastMessage({ message: 'Downloaded vCard contact file!', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <Toast
        message={toastMessage?.message}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl space-y-6">
          
          {/* Top Banner & Hardware Verified Badge */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Bloom NFC Tag</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          {/* User Profile Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#0088CC] to-[#7C3AED] p-1">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl font-black text-white font-mono uppercase">
                  {formattedUsername.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 text-slate-950">
                <Check className="w-4 h-4 font-bold" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white capitalize">{formattedUsername.replace('_', ' ')}</h1>
              <p className="text-sm font-mono text-cyan-400 mt-0.5">@{formattedUsername}</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                Innovator & Verified Bloom NFC Hardware Owner. Tap to exchange contact details instantly.
              </p>
            </div>
          </div>

          {/* Contact Details List */}
          <div className="space-y-2.5 pt-2">
            <a
              href={`mailto:${formattedUsername}@bloom.ng`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs font-mono transition-all text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{formattedUsername}@bloom.ng</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>Bloom Hardware Member</span>
              </div>
              <span className="text-[10px] text-slate-500">Verified</span>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadVCard}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#0088CC] to-[#00BCFF] hover:opacity-95 text-white rounded-2xl font-bold text-xs transition-all"
            >
              <Download className="w-4 h-4" />
              Save Contact
            </button>

            <button
              onClick={handleCopyProfileUrl}
              className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied Link' : 'Share Profile'}
            </button>
          </div>

          {/* Admin Navigation Footer */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/admin/provision"
              className="text-xs text-slate-500 hover:text-cyan-400 font-mono transition-colors"
            >
              ← Back to Admin Operations Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
