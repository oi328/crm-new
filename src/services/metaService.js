
const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787'
const defaultCallback = `${serverURL}/api/meta/webhook`
const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

export const metaService = {
  // Local Storage Management
  loadSettings: () => {
    try {
      return JSON.parse(localStorage.getItem('meta.integration') || '{}')
    } catch (_) {
      return {}
    }
  },

  saveSettings: (settings) => {
    localStorage.setItem('meta.integration', JSON.stringify(settings))
  },

  resetSettings: () => {
    localStorage.removeItem('meta.integration')
  },

  // Auth Helpers
  disconnectGmail: async () => {
    try {
      await fetch(`${apiBase}/api/oauth/google/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gmail' })
      })
    } catch (_) {}
    try {
      localStorage.removeItem('oauth_token_gmail')
      localStorage.removeItem('oauth_redirect_uri_gmail')
    } catch (_) {}
  },

  disconnectAds: async () => {
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

  // Simulation & Testing
  simulatePixelEvent: (settings, events, enableCapi) => {
    return {
      pixel_id: settings.pixelId || 'PIXEL_ID',
      event_name: Object.keys(events).find(k => events[k]) || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      action_source: enableCapi ? 'website+capi' : 'website',
      user_data: { email: 'lead@example.com', phone: '+201234567890' },
      custom_data: { value: 0, currency: 'USD' }
    }
  },

  sendCapiTest: async (payload) => {
    const res = await fetch(`${serverURL}/api/meta/capi/test`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    })
    return await res.json()
  },

  verifyWebhook: async (token) => {
    const url = `${serverURL}/api/meta/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token || '')}&hub.challenge=TEST`
    const r = await fetch(url)
    const text = await r.text()
    return { ok: r.ok, text }
  },

  fetchGmailLabels: async () => {
    const resp = await fetch(`${apiBase}/api/gmail/labels`)
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.error || 'labels_failed')
    return data
  },
  
  defaultCallback
}
