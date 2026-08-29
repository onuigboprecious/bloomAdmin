import React, { useState, useEffect } from 'react';
import { Users, Download, Search, Mail, Phone, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';

export const WaitlistPage = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [finishFilter, setFinishFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await api.getWaitlist();
      if (res && res.success) {
        setWaitlist(Array.isArray(res.data) ? res.data : []);
      } else {
        setWaitlist([]);
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to load waitlist registrations', type: 'error' });
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!waitlist.length) return;
    const headers = ['Customer Name', 'Email Address', 'Phone Number', 'Preferred Finish', 'Date Registered'];
    const rows = waitlist.map((w) => [
      w.name,
      w.email,
      w.phone,
      w.preferredFinish,
      w.dateRegistered,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bloom-VIP-Waitlist-${Date.now()}.csv`;
    link.click();
    setToastMessage({ message: 'VIP Waitlist exported to CSV', type: 'success' });
  };

  const safeWaitlist = Array.isArray(waitlist) ? waitlist : [];

  const filteredWaitlist = safeWaitlist.filter((w) => {
    const nameStr = String(w?.name || '');
    const emailStr = String(w?.email || '');
    const phoneStr = String(w?.phone || '');
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      nameStr.toLowerCase().includes(search) ||
      emailStr.toLowerCase().includes(search) ||
      phoneStr.toLowerCase().includes(search);
    const matchesFinish = finishFilter === 'All' || w.preferredFinish === finishFilter;
    return matchesSearch && matchesFinish;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      <Toast
        message={toastMessage?.message}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            EARLY ACCESS & VIP REGISTRATIONS
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">VIP Waitlist Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review early signup leads, preferred hardware finishes, contact details, and export for marketing outreach.
          </p>
        </div>

        {/* Action Button: Export to CSV */}
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Metric Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-purple-200 bg-purple-50/40 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-mono text-purple-700 uppercase tracking-wider">Total Waitlist Registrations</p>
            <h3 className="text-4xl font-extrabold text-slate-900 font-mono mt-1">{safeWaitlist.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase">Top Hardware Choice</p>
            <p className="text-xl font-bold text-slate-900 mt-1">Stealth Matte Black</p>
            <span className="text-xs text-[#0088CC] font-mono">42% of total waitlist signups</span>
          </div>
          <button
            onClick={fetchWaitlist}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
          />
        </div>

        <select
          value={finishFilter}
          onChange={(e) => setFinishFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 px-4 py-2.5 focus:outline-none focus:border-purple-600"
        >
          <option value="All">All Preferred Finishes</option>
          <option value="Stealth Matte Black">Stealth Matte Black</option>
          <option value="Emerald Green">Emerald Green</option>
          <option value="Sunset Amber">Sunset Amber</option>
          <option value="Custom Wood">Custom Wood</option>
          <option value="Crystal Clear">Crystal Clear</option>
        </select>
      </div>

      {/* Waitlist Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Email Address</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Preferred Finish</th>
                <th className="px-6 py-3.5 text-right">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 font-mono">
                    Loading VIP registrations...
                  </td>
                </tr>
              ) : filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-800">No data yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">No VIP early access signups recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWaitlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-sans">{entry.name || 'no data yet'}</td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.email || 'no data yet'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.phone || 'no data yet'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        {entry.preferredFinish || 'no data yet'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.dateRegistered ? new Date(entry.dateRegistered).toLocaleDateString() : 'no data yet'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
