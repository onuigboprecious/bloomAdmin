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
  Mail,
  Phone,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  X,
  Eye,
  FileText,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { Toast } from '../components/Common/Toast';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [itemTypeFilter, setItemTypeFilter] = useState('All'); // 'All', 'Card', 'Wristband'
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

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
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        fetchOrders();
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to update order status', type: 'error' });
    }
  };

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setToastMessage({ message: `${fieldName} copied to clipboard`, type: 'info' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCsv = () => {
    if (!orders.length) return;
    const headers = [
      'Order ID',
      'Customer Name',
      'Email Address',
      'Phone Number',
      'Delivery Address',
      'Item & Style',
      'Quantity',
      'Total Amount (NGN)',
      'Payment Status',
      'Fulfillment Status',
      'Order Date'
    ];

    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.email,
      o.phone,
      o.address,
      o.finishName,
      o.quantity,
      o.totalAmount,
      o.paymentStatus,
      o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bloom-Hardware-Orders-${Date.now()}.csv`;
    link.click();
    setToastMessage({ message: 'Hardware Orders exported to CSV', type: 'success' });
  };

  // Safe Array extraction
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Metrics Calculations
  const totalOrdersCount = safeOrders.length;
  const pendingCount = safeOrders.filter(
    (o) => String(o?.status || 'pending').toLowerCase() === 'pending'
  ).length;
  const paidOrders = safeOrders.filter(
    (o) => String(o?.paymentStatus || 'paid').toLowerCase() === 'paid'
  );
  const totalRevenueNaira = paidOrders.reduce(
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
    const phoneStr = String(order?.phone || '');
    const addressStr = String(order?.address || '');
    const finishStr = String(order?.finishName || order?.finish_name || '');
    const statusStr = String(order?.status || 'pending').toLowerCase();
    const payStr = String(order?.paymentStatus || 'paid').toLowerCase();

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      idStr.toLowerCase().includes(search) ||
      nameStr.toLowerCase().includes(search) ||
      emailStr.toLowerCase().includes(search) ||
      phoneStr.toLowerCase().includes(search) ||
      addressStr.toLowerCase().includes(search) ||
      finishStr.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'All' || statusStr === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'All' || payStr === paymentFilter.toLowerCase();
    const matchesItemType =
      itemTypeFilter === 'All' ||
      (itemTypeFilter === 'Wristband' ? finishStr.includes('Wristband') : !finishStr.includes('Wristband'));

    return matchesSearch && matchesStatus && matchesPayment && matchesItemType;
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Physical Hardware Orders & Fulfillment
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track user physical NFC Card and Wristband purchases, verify customer contact details, delivery addresses, payment status, and update shipping fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            title="Refresh orders"
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

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{totalOrdersCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-mono text-amber-700 uppercase tracking-wider">Pending Shipping</p>
            <h3 className="text-3xl font-extrabold text-amber-800 font-mono mt-1">{pendingCount}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <span className="text-2xl font-bold font-mono">₦</span>
          </div>
          <div>
            <p className="text-xs font-mono text-emerald-700 uppercase tracking-wider">Paid Revenue (₦)</p>
            <h3 className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
              {formatNaira(totalRevenueNaira)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name, Email, Phone, Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#00BCFF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Card vs Wristband Item Filter */}
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#00BCFF]"
          >
            <option value="All">All Form Factors</option>
            <option value="Card">🎴 Cards Only</option>
            <option value="Wristband">⌚ Wristbands Only</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#00BCFF]"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">💳 Paid</option>
            <option value="Pending">⏳ Pending Payment</option>
          </select>

          {/* Fulfillment Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#00BCFF]"
            >
              <option value="All">All Fulfillment Statuses</option>
              <option value="Pending">Pending Shipping</option>
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
                <th className="px-6 py-3.5">Order Info</th>
                <th className="px-6 py-3.5">Customer & Contacts</th>
                <th className="px-6 py-3.5">Delivery Address</th>
                <th className="px-6 py-3.5">Item & Amount</th>
                <th className="px-6 py-3.5">Payment Status</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-mono">
                    Fetching physical hardware orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <PackageCheck className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-800">No orders found</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">No hardware orders match your search or filter parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = order.id || order.order_id || order.orderId || 'ORD-0000';
                  const customerName = order.customerName || order.customer_name || order.name || 'Direct Order';
                  const email = order.email || 'N/A';
                  const phone = order.phone || 'N/A';
                  const address = order.address || order.delivery_address || order.deliveryAddress || 'N/A';
                  const finishName = order.finishName || order.finish_name || 'Custom NFC Hardware';
                  const quantity = order.quantity || 1;
                  const totalAmount = order.totalAmount || order.amount || 0;
                  const paymentStatus = String(order.paymentStatus || 'paid').toLowerCase();
                  const status = String(order.status || 'pending').toLowerCase();
                  const isWristband = finishName.includes('Wristband');
                  const isPaid = paymentStatus === 'paid';

                  return (
                    <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                      {/* Order ID & Date */}
                      <td className="px-6 py-4">
                        <div className="font-mono">
                          <p className="font-bold text-slate-900 text-sm">{orderId}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </td>

                      {/* Customer & Contacts */}
                      <td className="px-6 py-4 font-mono">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm font-sans">{customerName}</p>
                          <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 mt-0.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed font-sans">{address}</span>
                        </div>
                      </td>

                      {/* Item & Total Amount */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-900">
                            {isWristband ? (
                              <Watch className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                            )}
                            {finishName}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="font-bold text-slate-900 font-mono text-sm">
                              {formatNaira(totalAmount)}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              ({quantity} {quantity === 1 ? 'unit' : 'units'})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="px-6 py-4 font-mono">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {isPaid ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                          {paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status Selector */}
                      <td className="px-6 py-4 font-mono">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                          className={`bg-slate-50 border text-xs font-mono font-bold px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer ${
                            status === 'pending'
                              ? 'border-amber-300 text-amber-800 bg-amber-50/60'
                              : status === 'shipped'
                              ? 'border-blue-300 text-blue-800 bg-blue-50/60'
                              : 'border-emerald-300 text-emerald-800 bg-emerald-50/60'
                          }`}
                        >
                          <option value="pending" className="bg-white">
                            ⏳ Pending
                          </option>
                          <option value="shipped" className="bg-white">
                            🚚 Shipped
                          </option>
                          <option value="delivered" className="bg-white">
                            ✅ Delivered
                          </option>
                        </select>
                      </td>

                      {/* Action View Modal */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-300"
                          title="Inspect complete order details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          View Order
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

      {/* Complete Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-300 rounded-2xl p-6 md:p-8 text-slate-900 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-md">
                <PackageCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
                    {selectedOrder.id || selectedOrder.order_id}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                    selectedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}>
                    Payment {selectedOrder.paymentStatus || 'Paid'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Customer Contact & Delivery Info */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
                Customer & Shipping Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold font-mono block">Customer Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{selectedOrder.customerName}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold font-mono block">Email Address</span>
                  <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-slate-900 font-bold">
                    <span>{selectedOrder.email}</span>
                    <button
                      onClick={() => handleCopyText(selectedOrder.email, 'Email')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                      title="Copy email"
                    >
                      {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold font-mono block">Phone Number</span>
                  <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-slate-900 font-bold">
                    <span>{selectedOrder.phone}</span>
                    <button
                      onClick={() => handleCopyText(selectedOrder.phone, 'Phone number')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                      title="Copy phone number"
                    >
                      {copiedField === 'Phone number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold font-mono block">Delivery Address</span>
                  <div className="flex items-start gap-1.5 mt-0.5 text-slate-900 font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items & Payment Summary */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
                Order Items & Billing Summary
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    {selectedOrder.finishName?.includes('Wristband') ? (
                      <Watch className="w-4 h-4 text-purple-600" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-sky-600" />
                    )}
                    <span className="font-bold text-slate-900 text-sm">{selectedOrder.finishName}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedOrder.quantity} x Unit(s)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal Amount</span>
                  <span className="font-bold text-slate-900">{formatNaira(selectedOrder.totalAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Payment Gateway Status</span>
                  <span className={`font-extrabold uppercase ${
                    selectedOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {selectedOrder.paymentStatus || 'PAID'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Paid (NGN)</span>
                  <span className="text-base font-black text-emerald-700">{formatNaira(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Status Update Action */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Update Fulfillment Shipping Status
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id || selectedOrder.order_id, e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="pending">⏳ Pending Shipping Queue</option>
                  <option value="shipped">🚚 Shipped to Delivery Address</option>
                  <option value="delivered">✅ Delivered to Customer</option>
                </select>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-sm"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
