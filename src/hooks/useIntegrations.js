import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp, FaTelegram, FaGlobe } from 'react-icons/fa'
import { SiGoogleads, SiTiktok, SiMeta } from 'react-icons/si'
import { metaService } from '../services/metaService'

export function useIntegrations() {
  const { t } = useTranslation()
  const [activeIntegration, setActiveIntegration] = useState(null)
  
  // Connection States
  const [googleConnected, setGoogleConnected] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [metaConnected, setMetaConnected] = useState(false)

  // Initialize status from local storage or services
  useEffect(() => {
    // Check Meta Status
    const metaSettings = metaService.loadSettings()
    const isMetaConnected = !!(metaSettings.businessManagerId || metaSettings.pixelId || metaSettings.pageId)
    setMetaConnected(isMetaConnected)

    // Check Google Status
    const googleToken = localStorage.getItem('oauth_token_ads')
    setGoogleConnected(!!googleToken)
  }, [])

  // Integration List
  const integrationsList = [
    { 
      id: 'meta', 
      name: 'Meta (Facebook & Instagram)', 
      icon: SiMeta, 
      bg: 'bg-blue-600', 
      description: 'Connect Facebook & Instagram for Lead Ads, Pixel, and Messaging',
      connected: metaConnected,
      status: metaConnected ? t('Connected') : t('Disconnected')
    },
    { 
      id: 'google-ads', 
      name: 'Google Ads', 
      icon: SiGoogleads, 
      bg: 'bg-yellow-500', 
      description: 'Connect Google Ads to manage and track campaigns',
      connected: googleConnected,
      status: googleConnected ? t('Connected') : t('Disconnected')
    },
    { 
      id: 'tiktok', 
      name: 'TikTok Ads', 
      icon: SiTiktok, 
      bg: 'bg-gray-900', 
      description: 'Connect TikTok Ads for performance tracking',
      connected: false,
      status: t('Coming Soon')
    },
    { 
      id: 'whatsapp', 
      name: 'WhatsApp App', 
      icon: FaWhatsapp, 
      bg: 'bg-green-500', 
      description: 'Connect via WhatsApp Business API for customer messaging',
      connected: false,
      status: t('Available')
    },
    { 
      id: 'telegram', 
      name: 'Telegram', 
      icon: FaTelegram, 
      bg: 'bg-blue-400', 
      description: 'Connect via Telegram API for instant messaging',
      connected: false,
      status: t('Available')
    },
    { 
      id: 'webchat', 
      name: 'WebChat', 
      icon: FaGlobe, 
      bg: 'bg-purple-500', 
      description: 'Connect via WebChat API for website messaging',
      connected: false,
      status: t('Available')
    },
  ]

  const connect = (integrationId) => {
    const supported = ['meta', 'google-ads', 'tiktok', 'whatsapp', 'telegram', 'webchat']
    if (supported.includes(integrationId)) {
      setActiveIntegration(integrationId)
    } else {
      alert(t('Integration logic for this provider is not yet implemented.'))
    }
  }

  const configure = (integrationId) => {
    setActiveIntegration(integrationId)
  }

  const closeSettings = () => {
    setActiveIntegration(null)
    // Refresh connection status
    const metaSettings = metaService.loadSettings()
    setMetaConnected(!!(metaSettings.businessManagerId || metaSettings.pixelId || metaSettings.pageId))
  }

  // OAuth Logic (Moved from original file)
  const startGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID
    const redirectUriEnv = import.meta.env.VITE_GOOGLE_ADS_REDIRECT_URI
    const redirectUri = redirectUriEnv || `${window.location.origin}/crm-ibrahim/`
    const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords')
    const state = `ads:${Math.random().toString(36).slice(2)}`
    
    if (!clientId) {
      alert('Google Ads Client ID missing in .env')
      return
    }
    
    try { localStorage.setItem('oauth_redirect_uri_ads', redirectUri) } catch (_) {}
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true&state=${state}`
    window.location.href = oauthUrl
  }

  return {
    integrationsList,
    activeIntegration,
    connect,
    configure,
    closeSettings
  }
}
