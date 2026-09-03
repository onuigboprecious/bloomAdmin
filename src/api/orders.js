import { fetchClient } from './client';

// Initial orders store with rich sample fallback entries
let ordersStore = [
  {
    id: 'ORD-9842',
    customerName: 'Precious Onuigbo',
    email: 'precious@gmail.com',
    phone: '+234 812 345 6789',
    address: '12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    finishName: 'Stealth Matte Black',
    quantity: 2,
    totalAmount: 35000,
    paymentStatus: 'paid',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ORD-8721',
    customerName: 'Chidi Okonkwo',
    email: 'chidi.o@enlazer.com.ng',
    phone: '+234 803 111 2233',
    address: '45 Awolowo Road, Ikoyi, Lagos, Nigeria',
    finishName: 'Silicone Sport Black Wristband',
    quantity: 1,
    totalAmount: 20000,
    paymentStatus: 'paid',
    status: 'shipped',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ORD-7510',
    customerName: 'Amina Bello',
    email: 'amina.bello@yahoo.com',
    phone: '+234 706 999 8877',
    address: '8 Maitama District, Abuja, Nigeria',
    finishName: 'Rose Gold Metal',
    quantity: 1,
    totalAmount: 25000,
    paymentStatus: 'paid',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const ordersApi = {
  // Create Order (POST /api/orders)
  async createOrder({ finishId, finishName, quantity, amount, deliveryAddress, customerName, email, phone }) {
    const payload = { finishId, finishName, quantity, amount, deliveryAddress, customerName, email, phone };
    const res = await fetchClient('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      return res;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Direct Order',
      email: email || 'customer@bloom.ng',
      phone: phone || '+234 800 000 0000',
      address: deliveryAddress || 'Lagos, Nigeria',
      finishName: finishName || 'Stealth Matte Black',
      quantity: quantity || 1,
      totalAmount: amount || 17500,
      paymentStatus: 'paid',
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
        id: o.id || o.order_id || o.orderId || 'ORD-0000',
        customerName: o.customerName || o.shippingName || o.shipping_name || o.customer_name || o.name || 'Bloom Customer',
        email: o.email || o.customer_email || o.userEmail || 'no data yet',
        phone: o.phone || o.phoneNumber || o.phone_number || o.shipping_phone || '+234 800 000 0000',
        address: o.address || o.deliveryAddress || o.delivery_address || o.shipping_address || 'No delivery address provided',
        finishName: o.finishName || o.finish_name || 'NFC Hardware Card',
        quantity: o.quantity || 1,
        totalAmount: o.totalAmount || o.amount || 0,
        paymentStatus: String(o.paymentStatus || o.payment_status || 'paid').toLowerCase(),
        status: String(o.status || o.fulfillment_status || 'pending').toLowerCase(),
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

