import { fetchClient } from './client';

let waitlistStore = [];

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
      preferredFinish: preferredFinish || 'NFC Hardware',
      dateRegistered: new Date().toISOString(),
    };
    waitlistStore.unshift(newEntry);
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
        name: w.name || 'no data yet',
        email: w.email || 'no data yet',
        phone: w.phone || 'no data yet',
        preferredFinish: w.preferredFinish || w.preferred_finish || 'no data yet',
        dateRegistered: w.dateRegistered || w.created_at || new Date().toISOString(),
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: waitlistStore };
  },
};
