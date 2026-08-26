import { tagsApi } from '../api/tags';
import { ordersApi } from '../api/orders';
import { waitlistApi } from '../api/waitlist';
import { analyticsApi } from '../api/analytics';
import { authApi } from '../api/auth';

export const api = {
  // 1. Tags & NFC Hardware
  provisionBatch: (params) => tagsApi.batchProvision(params),
  createSingleTag: (params) => tagsApi.createSingleTag(params),
  getTagsList: () => tagsApi.listTags(),
  getCardDetails: (cardUid, sig) => tagsApi.getCardDetails(cardUid, sig),
  claimCard: (params) => tagsApi.claimCard(params),
  updateTag: (cardUid, updates) => tagsApi.updateTag(cardUid, updates),
  deleteTag: (cardUid) => tagsApi.deleteTag(cardUid),

  // 2. Orders & Fulfillment
  createOrder: (params) => ordersApi.createOrder(params),
  getOrders: () => ordersApi.listOrders(),
  updateOrderStatus: (orderId, status) => ordersApi.updateOrderStatus(orderId, status),

  // 3. VIP Waitlist
  addWaitlistEntry: (params) => waitlistApi.addEntry(params),
  getWaitlist: () => waitlistApi.listWaitlist(),

  // 4. Analytics
  getAnalytics: () => analyticsApi.getAnalytics(),

  // 5. Auth
  login: (email, password) => authApi.login(email, password),
  me: () => authApi.me(),
  logout: () => authApi.logout(),
};
