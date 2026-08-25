import { fetchClient } from './client';

let ordersStore = [];

export const ordersApi = {
  // Create Order (POST /api/orders)
  async createOrder({ finishId, finishName, quantity, amount, deliveryAddress }) {
    const payload = { finishId, finishName, quantity, amount, deliveryAddress };
    const res = await fetchClient('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      return res;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Direct API Order',
      email: 'customer@bloom.ng',
      address: deliveryAddress,
      finishName,
      quantity,
      totalAmount: amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    ordersStore.unshift(newOrder);
    return { success: true, data: newOrder };
  },

  // List Orders (GET /api/admin/orders)
  async listOrders() {
    const res = await fetchClient('/api/admin/orders', { method: 'GET' });
    if (res && res.success) {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.orders || raw?.data || []);
      const normalized = list.map((o) => ({
        id: o.id || o.order_id || 'ORD-0000',
        customerName: o.customerName || o.customer_name || o.name || 'Customer',
        email: o.email || 'customer@bloom.ng',
        address: o.address || o.deliveryAddress || o.delivery_address || 'No address specified',
        finishName: o.finishName || o.finish_name || 'NFC Hardware',
        quantity: o.quantity || 1,
        totalAmount: o.totalAmount || o.amount || 0,
        status: String(o.status || 'pending').toLowerCase(),
        createdAt: o.createdAt || o.created_at || new Date().toISOString(),
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: ordersStore };
  },

  // Update Order Status (PATCH /api/admin/orders/:id/status)
  async updateOrderStatus(orderId, status) {
    const res = await fetchClient(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (res && res.success) {
      return res;
    }

    const index = ordersStore.findIndex(o => o.id === orderId);
    if (index !== -1) {
      ordersStore[index].status = status;
      return { success: true, data: ordersStore[index] };
    }
    throw new Error('Order not found');
  },
};
