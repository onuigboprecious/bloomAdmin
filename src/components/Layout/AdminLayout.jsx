import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Tag,
  PackageCheck,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Batch Provisioning',
      path: '/admin/provision',
      icon: Cpu,
      description: 'Generate signed card batches',
    },
    {
      name: 'Tag Management',
      path: '/admin/tags',
      icon: Tag,
      description: 'Single & inventory management',
    },
    {
      name: 'Orders & Fulfillment',
      path: '/admin/orders',
      icon: PackageCheck,
      description: 'Physical card fulfillment',
    },
    {
      name: 'VIP Waitlist',
      path: '/admin/waitlist',
      icon: Users,
      description: 'Early access signups',
    },
    {
      name: 'Platform Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      description: 'Taps & conversion metrics',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00BCFF] flex items-center justify-center text-white font-extrabold text-sm">
            B
          </div>
          <span className="font-bold tracking-tight text-slate-900 font-sans text-lg">
            BLOOM <span className="text-[#00BCFF] text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 ml-1">ADMIN</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo & Header */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#00BCFF] flex items-center justify-center text-white font-black text-xl">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 font-sans tracking-wide">
                  BLOOM
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#00BCFF] bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Hardware Operations</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Operations Center
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-cyan-50 text-[#00BCFF] border border-cyan-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-[#00BCFF]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer & Admin User Card */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          {/* User Account */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.name}
                className="w-9 h-9 rounded-lg object-cover border border-slate-300"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Chief Admin'}</p>
                <p className="text-[10px] text-[#00BCFF] font-mono truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
