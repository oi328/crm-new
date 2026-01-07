
export const whatsappService = {
  loadSettings: () => {
    try {
      return JSON.parse(localStorage.getItem('whatsapp.integration') || '{}')
    } catch (_) {
      return {}
    }
  },

  saveSettings: (settings) => {
    localStorage.setItem('whatsapp.integration', JSON.stringify(settings))
  },

  resetSettings: () => {
    localStorage.removeItem('whatsapp.integration')
  },

  simulateMessage: (settings) => {
    return {
      messaging_product: 'whatsapp',
      to: settings.testPhone || '+201000000000',
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' }
      }
    }
  },

  sendTestMessage: async (payload) => {
    await new Promise(r => setTimeout(r, 800))
    return { 
      ok: true, 
      messages: [{ id: 'wamid.HBgLM...', message_status: 'accepted' }] 
    }
  }
}
