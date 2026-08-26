import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  MapPin,
  CreditCard,
  Watch,
} from 'lucide-react';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemTypeFilter, setItemTypeFilter] = useState('All'); // 'All', 'Card', 'Wristband'
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res && res.success && res.data) {
        setOrders(Array.isArray(res.data) ? res.data : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to load physical hardware orders', type: 'error' });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res && res.success) {
        setToastMessage({
          message: `Order ${orderId} updated to '${newStatus.toUpperCase()}'`,
          type: 'success',
        });
        fetchOrders();
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to update order status', type: 'error' });
    }
  };

  // Safe Array extraction
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Metrics Calculations
  const totalOrdersCount = safeOrders.length;
  const pendingCount = safeOrders.filter(
    (o) => String(o?.status || 'pending').toLowerCase() === 'pending'
  ).length;
  const totalRevenueNaira = safeOrders.reduce(
    (sum, o) => sum + Number(o?.totalAmount || o?.amount || 0),
    0
  );

  // Formatting currency to Nigerian Naira ₦
  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  const filteredOrders = safeOrders.filter((order) => {
    const idStr = String(order?.id || order?.order_id || order?.orderId || '');
    const nameStr = String(order?.customerName || order?.customer_name || order?.name || '');
    const emailStr = String(order?.email || '');
    const finishStr = String(order?.finishName || order?.finish_name || '');
    const statusStr = String(order?.status || 'pending').toLowerCase();

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      idStr.toLowerCase().includes(search) ||
      nameStr.toLowerCase().includes(search) ||
      emailStr.toLowerCase().includes(search) ||
      finishStr.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'All' || statusStr === statusFilter.toLowerCase();
    const matchesItemType =
      itemTypeFilter === 'All' ||
      (itemTypeFilter === 'Wristband' ? finishStr.includes('Wristband') : !finishStr.includes('Wristband'));

    return matchesSearch && matchesStatus && matchesItemType;
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0088CC] text-xs font-mono mb-2">
            <PackageCheck className="w-3.5 h-3.5" />
            FULFILLMENT OPERATIONS (CARDS & WRISTBANDS)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Physical Hardware Orders & Fulfillment</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track user physical NFC Card and Wristband purchases, manage shipping queues, and update delivery statuses.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium border border-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0088CC]">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{totalOrdersCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-mono text-amber-700 uppercase tracking-wider">Pending Shipping</p>
            <h3 className="text-3xl font-extrabold text-amber-800 font-mono mt-1">{pendingCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <span className="text-2xl font-bold font-mono">₦</span>
          </div>
          <div>
            <p className="text-xs font-mono text-emerald-700 uppercase tracking-wider">Total Revenue (₦)</p>
            <h3 className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
              {formatNaira(totalRevenueNaira)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#0088CC]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Card vs Wristband Item Filter */}
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#0088CC]"
          >
            <option value="All">All Items (Cards & Wristbands)</option>
            <option value="Card">🎴 Cards</option>
            <option value="Wristband">⌚ Wristbands</option>
          </select>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 px-4 py-2.5 focus:outline-none focus:border-[#0088CC]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer & Delivery Address</th>
                <th className="px-6 py-3.5">Item & Style</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Update Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 font-mono">
                    Fetching physical hardware orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <PackageCheck className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-800">No data yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">No physical hardware orders have been placed yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = order.id || order.order_id || order.orderId || 'ORD-0000';
                  const customerName = order.customerName || order.customer_name || order.name || 'Anonymous Customer';
                  const email = order.email || 'N/A';
                  const address = order.address || order.delivery_address || order.deliveryAddress || 'No Address Specified';
                  const finishName = order.finishName || order.finish_name || 'Stealth Matte Black Card';
                  const quantity = order.quantity || 1;
                  const totalAmount = order.totalAmount || order.amount || 25000;
                  const status = String(order.status || 'pending').toLowerCase();
                  const isWristband = finishName.includes('Wristband');

                  return (
                    <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                      {/* Order ID */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        <span className="text-[#0088CC]">{orderId}</span>
                      </td>

                      {/* Customer & Address */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{customerName}</p>
                          <p className="text-slate-500 font-mono text-[11px]">{email}</p>
                          <div className="flex items-center gap-1 text-slate-500 mt-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Item & Style */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-900">
                          {isWristband ? (
                            <Watch className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-[#0088CC]" />
                          )}
                          {finishName}
                        </span>
                        <span className="block text-slate-500 font-mono text-[11px] mt-1">
                          Qty: {quantity} {quantity === 1 ? 'unit' : 'units'}
                        </span>
                      </td>

                      {/* Total Amount (₦) */}
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700 text-sm">
                        {formatNaira(totalAmount)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : status === 'shipped'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {status === 'pending' && <Clock className="w-3 h-3" />}
                          {status === 'shipped' && <Truck className="w-3 h-3" />}
                          {status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {status}
                        </span>
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-6 py-4 text-right">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                          className="bg-slate-50 border border-slate-300 text-xs font-mono font-semibold text-slate-900 px-3 py-2 rounded-xl focus:outline-none focus:border-[#0088CC] cursor-pointer"
                        >
                          <option value="pending" className="bg-white">
                            Mark Pending
                          </option>
                          <option value="shipped" className="bg-white">
                            Mark Shipped 🚚
                          </option>
                          <option value="delivered" className="bg-white">
                            Mark Delivered ✅
                          </option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
