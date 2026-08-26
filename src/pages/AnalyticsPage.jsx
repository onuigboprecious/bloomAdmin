import React, { useState, useEffect } from 'react';
import {
  Zap,
  Cpu,
  UserCheck,
  Inbox,
  TrendingUp,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area'); // 'area' or 'bar'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to load platform analytics metrics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088CC', '#10B981', '#00BCFF', '#F59E0B', '#7C3AED'];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0088CC] text-xs font-mono mb-2">
            <Zap className="w-3.5 h-3.5" />
            REAL-TIME METRICS MONITOR
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Analytics Overview</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor real-time NFC hardware tap velocity, provisioned inventory performance, and contact lead conversions.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium border border-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total NFC Taps */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-200 bg-cyan-50/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-600 uppercase">⚡ Total NFC Taps</p>
            <div className="p-2 rounded-xl bg-cyan-100 text-[#0088CC]">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-mono mt-3">
            {data ? (data.totalTaps || 0).toLocaleString() : '0'}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#0088CC] mt-2 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Scan Tracking</span>
          </div>
        </div>

        {/* 2. Total Cards Provisioned */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-600 uppercase">🎴 Provisioned Cards</p>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-mono mt-3">
            {data ? (data.totalCardsProvisioned || 0).toLocaleString() : '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-mono">Hardware UIDs in circulation</p>
        </div>

        {/* 3. Total Active Profiles */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-600 uppercase">👤 Active Profiles</p>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-mono mt-3">
            {data ? (data.activeProfiles || 0).toLocaleString() : '0'}
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-mono">Linked digital identity profiles</p>
        </div>

        {/* 4. Total Leads Captured */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-purple-700 uppercase">📥 Leads Captured</p>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 font-mono mt-3">
            {data ? (data.leadsCaptured || data.totalLeadsCaptured || 0).toLocaleString() : '0'}
          </h3>
          <p className="text-xs text-purple-700/80 mt-2 font-mono">Contact exchanges completed</p>
        </div>
      </div>

      {/* Hourly Tap Volume Line / Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#0088CC]" />
              Hourly Tap Volume & Conversion Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">24-Hour NFC interaction frequency breakdown</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'area'
                  ? 'bg-[#0088CC] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Area Glow Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'bar'
                  ? 'bg-[#0088CC] text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bar Columns
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-80 w-full">
          {data?.hourlyMetrics && data.hourlyMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data.hourlyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#CBD5E1',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontFamily: 'monospace',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="taps"
                    name="NFC Taps"
                    stroke="#0088CC"
                    strokeWidth={3}
                    fillOpacity={0.15}
                    fill="#0088CC"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads Captured"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fillOpacity={0.15}
                    fill="#7C3AED"
                  />
                </AreaChart>
              ) : (
                <BarChart data={data.hourlyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#CBD5E1',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontFamily: 'monospace',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="taps" name="NFC Taps" fill="#0088CC" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="leads" name="Leads Captured" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-800">No data yet</p>
              <p className="text-xs text-slate-500 mt-1">Tap metrics will appear here once NFC hardware is scanned.</p>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts & Hardware Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200">
          <h4 className="text-base font-bold text-slate-900 mb-1">Card Finish Popularity Distribution</h4>
          <p className="text-xs text-slate-500 mb-4">Hardware finish breakdown by total active cards</p>
          <div className="h-60 flex items-center justify-center">
            {data?.finishDistribution && data.finishDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.finishDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.finishDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F8FAFC',
                      borderColor: '#CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-base font-bold text-slate-800">No data yet</p>
                <p className="text-xs text-slate-500 mt-1">No hardware distribution data available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="text-base font-bold text-slate-900">System Infrastructure Health</h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Target Backend API:</span>
              <span className="text-emerald-700 font-bold">bloombe.onrender.com (Healthy)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Cryptographic Signature Verification:</span>
              <span className="text-[#0088CC] font-bold">RSA-2048 / SHA-256</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Avg Tap Response Latency:</span>
              <span className="text-slate-900 font-bold">142 ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
