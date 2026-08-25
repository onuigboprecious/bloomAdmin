import { fetchClient } from './client';

let mockOrdersStore = [
  { id: 'ORD-9021', customerName: 'Oluwaseun Adebayo', email: 'seun.adebayo@gmail.com', address: '14 Victoria Island Rd, Lagos', finishName: 'Stealth Matte Black Card', quantity: 2, totalAmount: 45000, status: 'pending', createdAt: '2026-08-25T08:30:00Z' },
  { id: 'ORD-8944', customerName: 'Chidi Okonkwo', email: 'chidi.o@techfirm.ng', address: '8 Admiralty Way, Lekki Phase 1, Lagos', finishName: 'Silicone Sport Wristband', quantity: 5, totalAmount: 112500, status: 'shipped', createdAt: '2026-08-24T16:15:00Z' },
  { id: 'ORD-8812', customerName: 'Aisha Bello', email: 'aisha.bello@designco.com', address: '22 Maitama Extension, Abuja', finishName: 'Emerald Green Card', quantity: 1, totalAmount: 25000, status: 'delivered', createdAt: '2026-08-23T11:45:00Z' },
  { id: 'ORD-8790', customerName: 'Babajide Ogundele', email: 'baba.ogundele@fintech.io', address: '45 Allen Avenue, Ikeja, Lagos', finishName: 'Festival Fabric Wristband', quantity: 3, totalAmount: 75000, status: 'pending', createdAt: '2026-08-22T19:00:00Z' },
  { id: 'ORD-8655', customerName: 'Fatima Abubakar', email: 'fatima.ab@venturehub.ng', address: '10 Trans-Amadi Road, Port Harcourt', finishName: 'Crystal Clear Card', quantity: 4, totalAmount: 98000, status: 'delivered', createdAt: '2026-08-21T13:20:00Z' },
];

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
    mockOrdersStore.unshift(newOrder);
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
        customerName: o.customerName || o.customer_name || o.name || 'Anonymous Customer',
        email: o.email || 'customer@bloom.ng',
        address: o.address || o.deliveryAddress || o.delivery_address || 'No address specified',
        finishName: o.finishName || o.finish_name || 'Stealth Matte Black Card',
        quantity: o.quantity || 1,
        totalAmount: o.totalAmount || o.amount || 25000,
        status: String(o.status || 'pending').toLowerCase(),
        createdAt: o.createdAt || o.created_at || new Date().toISOString(),
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: mockOrdersStore };
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

    const index = mockOrdersStore.findIndex(o => o.id === orderId);
    if (index !== -1) {
      mockOrdersStore[index].status = status;
      return { success: true, data: mockOrdersStore[index] };
    }
    throw new Error('Order not found');
  },
};
