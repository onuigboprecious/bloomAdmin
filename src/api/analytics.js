import { fetchClient } from './client';

export const analyticsApi = {
  // Fetch Overview Analytics (GET /api/analytics)
  async getAnalytics() {
    const res = await fetchClient('/api/analytics', { method: 'GET' });
    if (res && res.success) {
      const data = res.data || {};
      return {
        success: true,
        data: {
          totalTaps: data.totalTaps || data.total_taps || 0,
          monthlyTaps: data.monthlyTaps || data.monthly_taps || 0,
          uniqueVisitors: data.uniqueVisitors || data.unique_visitors || 0,
          leadsCaptured: data.leadsCaptured || data.leads_captured || 0,
          conversionRate: data.conversionRate || data.conversion_rate || '0%',
          totalCardsProvisioned: data.totalCardsProvisioned || 0,
          activeProfiles: data.activeProfiles || 0,
          hourlyMetrics: data.hourlyTaps || data.hourlyMetrics || [],
          finishDistribution: data.finishDistribution || [],
        },
      };
    }

    return {
      success: true,
      data: {
        totalTaps: 0,
        monthlyTaps: 0,
        uniqueVisitors: 0,
        leadsCaptured: 0,
        conversionRate: '0%',
        totalCardsProvisioned: 0,
        activeProfiles: 0,
        hourlyMetrics: [],
        finishDistribution: [],
      },
    };
  },
};
