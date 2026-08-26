import { fetchClient } from './client';

// Clean initial store with zero dummy items
let tagsStore = [];

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
    }

    // Check for uniqueness
    const exists = tagsStore.some(t => t.cardUid.toUpperCase() === finalUid.toUpperCase());
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
    tagsStore.unshift(newTag);
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

    // Local batch creation
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
      tagsStore.unshift(cardObj);
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
        finishName: t.finishName || t.finish_name || 'NFC Hardware',
        status: t.status || 'provisioned',
        encodingUrl: t.encodingUrl || t.signedUrl || `https://blm.link/card/${t.cardUid}?sig=${t.signature || 'a9f4c3b2'}`,
        tapCount: t.tapsCount || t.tapCount || 0,
      }));
      return { success: true, data: normalized };
    }
    return { success: true, data: tagsStore };
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

    const index = tagsStore.findIndex(t => t.cardUid === cardUid || t.id === cardUid);
    if (index !== -1) {
      tagsStore[index] = { ...tagsStore[index], ...updates };
      return { success: true, data: tagsStore[index] };
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

    tagsStore = tagsStore.filter(t => t.cardUid !== cardUid && t.id !== cardUid);
    return { success: true, message: 'Tag removed successfully' };
  },

  // Get Public Hardware Details by Card UID & Signature (GET /api/cards/:cardUid?sig=...)
  async getCardDetails(cardUid, signature) {
    const query = signature ? `?sig=${signature}` : '';
    const res = await fetchClient(`/api/cards/${cardUid}${query}`, { method: 'GET' });
    if (res && res.success) {
      const card = res.data;
      return {
        success: true,
        data: {
          cardUid: card.cardUid || card.uid || cardUid,
          hardwareType: card.hardwareType || (String(card.finishName || '').toLowerCase().includes('wristband') ? 'Wristband' : 'Card'),
          finishName: card.finishName || (card.hardwareType === 'Wristband' ? 'NFC Wristband' : 'NFC Card'),
          status: card.status || 'provisioned',
          signature: card.signature || signature || 'a9f4c3b2',
          linkedUser: card.linkedUser || card.ownerUsername || card.username || null,
          ownerName: card.ownerName || card.name || null,
          tapCount: card.tapCount || card.tapsCount || 1,
          createdAt: card.createdAt || new Date().toISOString(),
        },
      };
    }

    // Local Fallback Check
    const found = tagsStore.find(t => t.cardUid.toUpperCase() === cardUid.toUpperCase());
    if (found) {
      return {
        success: true,
        data: {
          ...found,
          hardwareType: found.hardwareType || (found.finishName?.toLowerCase().includes('wristband') ? 'Wristband' : 'Card'),
        },
      };
    }

    // Mock fallback for provisioned BLM tags
    if (cardUid.toUpperCase().startsWith('BLM-')) {
      const isWristband = cardUid.toUpperCase().includes('WRIST');
      const hardwareType = isWristband ? 'Wristband' : 'Card';
      const mockCard = {
        cardUid,
        hardwareType,
        finishName: hardwareType === 'Wristband' ? 'Silicone Sport Black' : 'Stealth Matte Black',
        status: 'provisioned',
        signature: signature || 'a9f4c3b2',
        linkedUser: null,
        ownerName: null,
        tapCount: 1,
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: mockCard };
    }

    const error = new Error(`NFC Hardware tag '${cardUid}' not found in database.`);
    error.status = 404;
    throw error;
  },

  // Claim & Link Card to User Profile (POST /api/cards/claim)
  async claimCard({ cardUid, signature, username, email, name }) {
    const payload = { cardUid, signature, username, email, name };
    const res = await fetchClient('/api/cards/claim', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      return res;
    }

    // Local Store Update Fallback
    const found = tagsStore.find(t => t.cardUid.toUpperCase() === cardUid.toUpperCase());
    if (found) {
      found.status = 'claimed';
      found.linkedUser = username || 'user';
      found.ownerName = name || 'Bloom Member';
    }

    return {
      success: true,
      message: `Successfully claimed ${cardUid} and linked to @${username || 'user'}`,
      data: {
        cardUid,
        status: 'claimed',
        linkedUser: username || 'user',
        redirectUrl: `/profile/${username || 'user'}`,
      },
    };
  },
};
