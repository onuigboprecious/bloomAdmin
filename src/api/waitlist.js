import { fetchClient } from './client';

let mockWaitlistStore = [
  { id: 'W-101', name: 'Kolawole Johnson', email: 'kola.johnson@innovate.ng', phone: '+234 803 123 4567', preferredFinish: 'Stealth Matte Black Card', dateRegistered: '2026-08-25T09:12:00Z' },
  { id: 'W-102', name: 'Nneka Eze', email: 'nneka.eze@creativebox.com', phone: '+234 812 987 6543', preferredFinish: 'Silicone Sport Wristband', dateRegistered: '2026-08-24T18:40:00Z' },
  { id: 'W-103', name: 'David Smith', email: 'david.smith@globaltech.org', phone: '+234 701 555 8899', preferredFinish: 'Emerald Green Card', dateRegistered: '2026-08-24T12:05:00Z' },
  { id: 'W-104', name: 'Zainab Umar', email: 'zainab.u@capitalpartners.ng', phone: '+234 809 444 3322', preferredFinish: 'Festival Fabric Wristband', dateRegistered: '2026-08-23T15:25:00Z' },
  { id: 'W-105', name: 'Tunde Bakare', email: 'tunde.bakare@startup.io', phone: '+234 818 222 1100', preferredFinish: 'Eco Leather Wristband', dateRegistered: '2026-08-22T08:50:00Z' },
];

export const waitlistApi = {
  // Add Waitlist Entry (POST /api/waitlist)
  async addEntry({ name, email, phone, preferredFinish }) {
    const payload = { name, email, phone, preferredFinish };
    const res = await fetchClient('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      return res;
    }

    const newEntry = {
      id: `W-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone: phone || 'N/A',
      preferredFinish: preferredFinish || 'Stealth Matte Black Card',
      dateRegistered: new Date().toISOString(),
    };
    mockWaitlistStore.unshift(newEntry);
    return { success: true, data: newEntry };
  },

  // List Waitlist Entries (GET /api/admin/waitlist)
  async listWaitlist() {
    const res = await fetchClient('/api/admin/waitlist', { method: 'GET' });
    if (res && res.success) {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.waitlist || raw?.data || []);
      const normalized = list.map((w) => ({
        id: w.id || `W-${Math.floor(100 + Math.random() * 900)}`,
        name: w.name || 'Anonymous VIP',
        email: w.email || 'vip@bloom.ng',
        phone: w.phone || 'N/A',
        preferredFinish: w.preferredFinish || w.preferred_finish || 'Stealth Matte Black Card',
        dateRegistered: w.dateRegistered || w.created_at || new Date().toISOString(),
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: mockWaitlistStore };
  },
};
