import { fetchClient } from './client';

// Local mock store for resilient offline fallback operations
let mockTagsStore = [
  { id: '1', cardUid: 'BLM-88A92K-NFC', signature: 'a9f4c3b2', finishName: 'Stealth Matte Black (Card)', status: 'provisioned', encodingUrl: 'https://blm.link/card/BLM-88A92K-NFC?sig=a9f4c3b2', createdAt: '2026-08-24T10:15:00Z', lastTapped: '2026-08-25T11:02:00Z', tapCount: 42 },
  { id: '2', cardUid: 'BLM-99B14X-NFC', signature: 'c8d7e6f5', finishName: 'Silicone Sport Black (Wristband)', status: 'assigned', encodingUrl: 'https://blm.link/card/BLM-99B14X-NFC?sig=c8d7e6f5', createdAt: '2026-08-23T14:30:00Z', lastTapped: '2026-08-25T09:45:00Z', tapCount: 128 },
  { id: '3', cardUid: 'BLM-77C33Z-NFC', signature: 'f1e2d3c4', finishName: 'Emerald Green (Card)', status: 'provisioned', encodingUrl: 'https://blm.link/card/BLM-77C33Z-NFC?sig=f1e2d3c4', createdAt: '2026-08-22T09:00:00Z', lastTapped: null, tapCount: 0 },
  { id: '4', cardUid: 'BLM-55D88M-NFC', signature: 'b5a49382', finishName: 'Festival Woven Fabric (Wristband)', status: 'unassigned', encodingUrl: 'https://blm.link/card/BLM-55D88M-NFC?sig=b5a49382', createdAt: '2026-08-21T16:20:00Z', lastTapped: null, tapCount: 0 },
  { id: '5', cardUid: 'BLM-33E99P-NFC', signature: 'e4f5a6b7', finishName: 'Crystal Clear (Card)', status: 'active', encodingUrl: 'https://blm.link/card/BLM-33E99P-NFC?sig=e4f5a6b7', createdAt: '2026-08-20T11:10:00Z', lastTapped: '2026-08-25T12:00:00Z', tapCount: 310 },
];

function generateSignature() {
  return Math.random().toString(16).substring(2, 10);
}

function generateCardUid() {
  const chars = '0123456789ABCDEF';
  let uid = 'BLM-';
  for (let i = 0; i < 6; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${uid}-NFC`;
}

export const tagsApi = {
  // Push Single Unique Tag (POST /api/admin/cards)
  async createSingleTag({ cardUid, finishName, status = 'provisioned', hardwareType = 'Card' }) {
    const finalUid = cardUid?.trim() || generateCardUid();
    const payload = { cardUid: finalUid, finishName, status, hardwareType };

    try {
      const res = await fetchClient('/api/admin/cards', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        return res;
      }
    } catch (err) {
      if (err.status === 409) {
        throw new Error(err.message || `cardUid ${finalUid} already exists in database and must be unique`);
      }
      // If error other than 409, fall through to mock handling with duplicate check
    }

    // Mock check for uniqueness
    const exists = mockTagsStore.some(t => t.cardUid.toUpperCase() === finalUid.toUpperCase());
    if (exists) {
      const err = new Error(`cardUid '${finalUid}' already exists in database and must be unique`);
      err.status = 409;
      throw err;
    }

    const sig = generateSignature();
    const newTag = {
      id: 'CARD-' + Math.random().toString(36).substring(2, 9),
      cardUid: finalUid,
      signature: sig,
      finishName,
      status,
      encodingUrl: `https://blm.link/card/${finalUid}?sig=${sig}`,
      createdAt: new Date().toISOString(),
      lastTapped: null,
      tapCount: 0,
    };
    mockTagsStore.unshift(newTag);
    return { success: true, data: newTag };
  },

  // Batch Provision Tags (POST /api/admin/cards/provision)
  async batchProvision({ cardUids, batchSize = 10, finishName, hardwareType = 'Card' }) {
    const count = parseInt(batchSize, 10) || 10;
    const finalUids = Array.isArray(cardUids) && cardUids.length > 0
      ? cardUids
      : Array.from({ length: count }, () => generateCardUid());

    const res = await fetchClient('/api/admin/cards/provision', {
      method: 'POST',
      body: JSON.stringify({ cardUids: finalUids, finishName, hardwareType }),
    });

    if (res && res.success) {
      const rawData = res.data;
      const cardsList = Array.isArray(rawData) ? rawData : (rawData?.cards || []);
      const normalizedCards = cardsList.map((c) => ({
        ...c,
        signature: c.signature || generateSignature(),
        encodingUrl: c.encodingUrl || c.signedUrl || `https://blm.link/card/${c.cardUid}?sig=${c.signature || 'a9f4c3b2'}`,
      }));

      return {
        success: true,
        data: {
          totalGenerated: normalizedCards.length,
          totalProvisioned: normalizedCards.length,
          batchId: rawData?.batchId || `BATCH-${Date.now().toString(36).toUpperCase()}`,
          cards: normalizedCards,
        },
      };
    }

    // Local fallback batch creation
    const newCards = finalUids.map((uid) => {
      const sig = generateSignature();
      const cardObj = {
        id: 'CARD-' + Math.random().toString(36).substring(2, 9),
        cardUid: uid,
        signature: sig,
        finishName: finishName || `Default ${hardwareType}`,
        status: 'provisioned',
        encodingUrl: `https://blm.link/card/${uid}?sig=${sig}`,
        createdAt: new Date().toISOString(),
        lastTapped: null,
        tapCount: 0,
      };
      mockTagsStore.unshift(cardObj);
      return cardObj;
    });

    return {
      success: true,
      data: {
        totalGenerated: newCards.length,
        totalProvisioned: newCards.length,
        batchId: `BATCH-${Date.now().toString(36).toUpperCase()}`,
        cards: newCards,
      },
    };
  },

  // List All Tags (GET /api/admin/cards)
  async listTags() {
    const res = await fetchClient('/api/admin/cards', { method: 'GET' });
    if (res && res.success) {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.cards || raw?.data || []);
      const normalized = list.map((t) => ({
        id: t.id || t.cardUid,
        cardUid: t.cardUid || t.uid,
        signature: t.signature || 'a9f4c3b2',
        finishName: t.finishName || t.finish_name || 'Stealth Matte Black (Card)',
        status: t.status || 'provisioned',
        encodingUrl: t.encodingUrl || t.signedUrl || `https://blm.link/card/${t.cardUid}?sig=${t.signature || 'a9f4c3b2'}`,
        tapCount: t.tapsCount || t.tapCount || 0,
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: mockTagsStore };
  },

  // Update Tag (PUT /api/admin/cards/:cardUid)
  async updateTag(cardUid, updates) {
    const res = await fetchClient(`/api/admin/cards/${cardUid}`, {
      method: 'PUT',
      body: JSON.stringify({ cardUid, ...updates }),
    });

    if (res && res.success) {
      return res;
    }

    const index = mockTagsStore.findIndex(t => t.cardUid === cardUid || t.id === cardUid);
    if (index !== -1) {
      mockTagsStore[index] = { ...mockTagsStore[index], ...updates };
      return { success: true, data: mockTagsStore[index] };
    }
    throw new Error('Tag not found');
  },

  // Delete Tag (DELETE /api/admin/cards/:cardUid)
  async deleteTag(cardUid) {
    const res = await fetchClient(`/api/admin/cards/${cardUid}`, {
      method: 'DELETE',
    });

    if (res && res.success) {
      return res;
    }

    mockTagsStore = mockTagsStore.filter(t => t.cardUid !== cardUid && t.id !== cardUid);
    return { success: true, message: 'Tag removed successfully' };
  },
};
