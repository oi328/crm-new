
const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787'
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

export const googleAdsService = {
  // Local Storage Management
  loadSettings: () => {
    try {
      return JSON.parse(localStorage.getItem('google.ads.integration') || '{}')
    } catch (_) {
      return {}
    }
  },

  saveSettings: (settings) => {
    localStorage.setItem('google.ads.integration', JSON.stringify(settings))
  },

  resetSettings: () => {
    localStorage.removeItem('google.ads.integration')
    localStorage.removeItem('oauth_token_ads')
  },

  // Auth & API
  disconnect: async () => {
    try {
      await fetch(`${apiBase}/api/oauth/google/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'ads' })
      })
    } catch (_) {}
    try {
      localStorage.removeItem('oauth_token_ads')
      localStorage.removeItem('oauth_redirect_uri_ads')
    } catch (_) {}
  },

  // Simulation
  simulateConversion: (settings) => {
    return {
      conversionActionId: settings.conversionActionId || 'CONVERSION_ACTION_ID',
      conversionTime: new Date().toISOString(),
      conversionValue: 100,
      currencyCode: 'USD',
      gclid: 'TEST_GCLID_' + Math.floor(Math.random() * 1000000),
      user_data: { email: 'lead@example.com', phone: '+201234567890' }
    }
  },

  sendConversionTest: async (payload) => {
    // In a real app, this would hit your backend which then hits Google Ads API
    // For now, we simulate a backend response
    await new Promise(r => setTimeout(r, 800))
    return { 
      ok: true, 
      partialFailureError: null,
      results: [{ conversionAction: payload.conversionActionId, gclid: payload.gclid, status: 'UPLOADED' }] 
    }
  }
}
