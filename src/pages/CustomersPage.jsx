import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  CreditCard,
  Download,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  X,
  QrCode,
  Tag,
  Zap,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';
import { QRCodeModal } from '../components/Common/QRCodeModal';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [nfcCards, setNfcCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  // Selected customer for modal details
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [qrCardData, setQrCardData] = useState(null);
  const [copiedCardId, setCopiedCardId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waitlistRes, tagsRes] = await Promise.all([
        api.getWaitlist(),
        api.getTagsList(),
      ]);

      const waitlistData = waitlistRes?.success && Array.isArray(waitlistRes.data)
        ? waitlistRes.data
        : [];
      
      const tagsData = tagsRes?.success && Array.isArray(tagsRes.data)
        ? tagsRes.data
        : [];

      setNfcCards(tagsData);

      // Build customer profile map
      const customerMap = new Map();

      // 1. Process Waitlist Signups
      waitlistData.forEach((w) => {
        const rawName = w.name || 'Unnamed Customer';
        const key = (w.email || rawName || w.id).toLowerCase();
        customerMap.set(key, {
          id: w.id || `CUST-${Math.random().toString(36).substring(2, 7)}`,
          name: rawName,
          email: w.email || 'N/A',
          phone: w.phone || 'N/A',
          joinedDate: w.dateRegistered || new Date().toISOString(),
          status: 'Waitlist Signup',
          preferredFinish: w.preferredFinish || 'NFC Hardware',
          cards: [],
        });
      });

      // 2. Process Linked NFC Cards to Customers
      tagsData.forEach((card) => {
        if (card.linkedUser && card.linkedUser !== 'unassigned') {
          const userKey = card.linkedUser.toLowerCase();
          const cardEmailKey = (card.email || '').toLowerCase();

          // Check if customer already exists by username or email
          const existingKey = Array.from(customerMap.keys()).find((k) =>
            k === userKey || (cardEmailKey && k === cardEmailKey)
          );

          if (existingKey) {
            const existing = customerMap.get(existingKey);
            existing.status = 'Active Card Member';
            if (card.email && (!existing.email || existing.email === 'N/A')) {
              existing.email = card.email;
            }
            existing.cards.push(card);
          } else {
            // Use actual email registered during registration/claim
            const userRegistrationEmail = card.email || card.ownerEmail || (card.linkedUser.includes('@') ? card.linkedUser : `${card.linkedUser.toLowerCase()}@gmail.com`);
            const rawName = card.ownerName || card.linkedUser;
            customerMap.set(userKey, {
              id: `CUST-${card.cardUid.substring(0, 8)}`,
              name: rawName,
              username: card.linkedUser,
              email: userRegistrationEmail,
              phone: card.phone || 'Verified via App',
              joinedDate: card.createdAt || new Date().toISOString(),
              status: 'Active Card Member',
              preferredFinish: card.finishName || 'Custom NFC Card',
              cards: [card],
            });
          }
        }
      });

      // Convert Map to Array
      const customerList = Array.from(customerMap.values());
      setCustomers(customerList);
    } catch (err) {
      setToastMessage({ message: 'Failed to load customer details', type: 'error' });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url, cardUid) => {
    navigator.clipboard.writeText(url);
    setCopiedCardId(cardUid);
    setToastMessage({ message: `Encoding URL for ${cardUid} copied to clipboard`, type: 'info' });
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const handleExportCsv = () => {
    if (!customers.length) return;
    const headers = [
      'Customer ID',
      'Customer Name',
      'Email Address',
      'Phone Number',
      'Account Status',
      'Active Cards Count',
      'Card UIDs',
      'Date Joined'
    ];

    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.status,
      c.cards.length,
      c.cards.map((card) => card.cardUid).join('; ') || 'None',
      c.joinedDate ? new Date(c.joinedDate).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bloom-Customers-${Date.now()}.csv`;
    link.click();
    setToastMessage({ message: 'Customer Directory exported to CSV', type: 'success' });
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.phone.toLowerCase().includes(search) ||
      c.cards.some((card) => card.cardUid.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active Members' && c.status === 'Active Card Member') ||
      (statusFilter === 'Waitlist Signups' && c.status === 'Waitlist Signup');

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalCustomers = customers.length;
  const activeCardHolders = customers.filter((c) => c.status === 'Active Card Member').length;
  const totalActiveCards = nfcCards.filter((card) => card.status === 'active' || card.status === 'claimed').length;

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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Customer Directory & Active Cards
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            View customer accounts, monitor active NFC cards/wristbands, inspect hardware details, and manage customer contacts.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            title="Refresh customer data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00BCFF] hover:bg-[#0099D6] text-white font-extrabold text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalCustomers}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-emerald-700 uppercase tracking-wider">Active Card Members</p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{activeCardHolders}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-blue-200 bg-blue-50/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-blue-700 uppercase tracking-wider">Total Active Cards</p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalActiveCards}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Customer Name, Email, Phone, or Card UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#00BCFF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-4 py-2.5 focus:outline-none focus:border-[#00BCFF]"
          >
            <option value="All">All Customer Statuses</option>
            <option value="Active Members">Active Card Members</option>
            <option value="Waitlist Signups">Waitlist Signups</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5">Active Hardware Cards</th>
                <th className="px-6 py-3.5">Date Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-mono">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-800">No customers found</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        No customer accounts match your search or filter parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isActiveMember = customer.status === 'Active Card Member';
                  // Format customer display name
                  const cleanName = customer.name.startsWith('@')
                    ? customer.name.replace(/^@/, '')
                    : customer.name;
                  
                  const hasSeparateUsername = customer.username && 
                    customer.username.toLowerCase() !== cleanName.toLowerCase();

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-sm ${
                            isActiveMember ? 'bg-slate-900' : 'bg-purple-700'
                          }`}>
                            {cleanName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm font-sans">{cleanName}</p>
                            {hasSeparateUsername && (
                              <p className="text-[11px] font-mono text-slate-500">@{customer.username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 font-mono text-slate-700">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Badge - High Contrast */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase font-mono tracking-wider ${
                          isActiveMember
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {isActiveMember ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {customer.status}
                        </span>
                      </td>

                      {/* Active Cards Badges - Clean High Contrast Style */}
                      <td className="px-6 py-4">
                        {customer.cards.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {customer.cards.map((card) => (
                              <button
                                key={card.id || card.cardUid}
                                onClick={() => setSelectedCustomer({ ...customer, focusedCard: card })}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-xs font-semibold shadow-sm transition-all"
                                title={`Click to inspect card ${card.cardUid}`}
                              >
                                <CreditCard className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="font-bold text-slate-900">{card.cardUid}</span>
                                <span className="text-[10px] bg-slate-200 text-slate-800 font-extrabold px-1.5 py-0.5 rounded border border-slate-300 ml-0.5">
                                  {card.tapCount || 0} Taps
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs font-mono">
                            No card linked yet ({customer.preferredFinish})
                          </span>
                        )}
                      </td>

                      {/* Date Joined */}
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.joinedDate ? new Date(customer.joinedDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Account & Active Cards Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-2xl p-6 md:p-8 text-slate-900 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md ${
                selectedCustomer.status === 'Active Card Member' ? 'bg-slate-900' : 'bg-purple-700'
              }`}>
                {selectedCustomer.name.replace(/^@/, '').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
                  {selectedCustomer.name.replace(/^@/, '')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-500">ID: {selectedCustomer.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                    selectedCustomer.status === 'Active Card Member'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Email Address</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Phone Number</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Preferred Hardware Style</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedCustomer.preferredFinish}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">Date Registered</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedCustomer.joinedDate ? new Date(selectedCustomer.joinedDate).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Active Cards Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-slate-900 font-sans flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  Active Hardware Cards ({selectedCustomer.cards.length})
                </h4>
              </div>

              {selectedCustomer.cards.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
                  <Tag className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Active Card Linked</p>
                  <p className="text-xs text-slate-500 mt-1">
                    This customer is currently on the waitlist queue for hardware provisioning.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCustomer.cards.map((card) => (
                    <div
                      key={card.id || card.cardUid}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {card.cardUid}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                            {card.status || 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                            {card.tapCount || 0} Taps Recorded
                          </span>
                          <button
                            onClick={() => setQrCardData(card)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                            title="Show QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Hardware Finish</span>
                          <span className="font-semibold text-slate-800">{card.finishName || 'Custom'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Signature Token</span>
                          <span className="font-bold text-slate-800">{card.signature || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Signed Encoding URL */}
                      {card.encodingUrl && (
                        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono">
                          <span className="truncate flex-1 text-slate-600">{card.encodingUrl}</span>
                          <button
                            onClick={() => handleCopyUrl(card.encodingUrl, card.cardUid)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            title="Copy encoding URL"
                          >
                            {copiedCardId === card.cardUid ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={card.encodingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                            title="Open URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-all border border-slate-300"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared QR Code Modal */}
      {qrCardData && (
        <QRCodeModal
          isOpen={!!qrCardData}
          onClose={() => setQrCardData(null)}
          cardData={qrCardData}
          onCopy={(msg) => setToastMessage({ message: msg, type: 'info' })}
        />
      )}
    </div>
  );
};

export default CustomersPage;
