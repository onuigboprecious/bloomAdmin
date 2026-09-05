import React from 'react';
import { Clock, ShieldAlert, LogOut, Activity } from 'lucide-react';

export const InactivityWarningModal = ({
  isOpen,
  remainingSeconds,
  onExtendSession,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 text-slate-900">
        {/* Header Icon */}
        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Modal Title & Subtitle */}
        <h3 className="text-xl font-bold text-center text-slate-900 font-sans tracking-tight mb-1">
          Are You Still There?
        </h3>
        <p className="text-sm text-center text-slate-500 font-sans leading-relaxed mb-6">
          You have been inactive for a while. For security, your session will automatically log out in:
        </p>

        {/* Countdown Seconds Badge */}
        <div className="flex flex-col items-center justify-center py-4 px-6 mb-6 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-700">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-800">
              {remainingSeconds}s
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 font-mono">
            Auto-Logout Countdown
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all focus:ring-2 focus:ring-slate-300"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Logout Now
          </button>

          <button
            type="button"
            onClick={onExtendSession}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00BCFF] hover:bg-[#00a3df] text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all focus:ring-2 focus:ring-cyan-400"
          >
            <Activity className="w-4 h-4" />
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
