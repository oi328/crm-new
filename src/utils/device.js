// Simple device capture and persistence helpers
// Stores devices per user in localStorage under key: user_devices_<userId>

export function fingerprintDevice() {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : {}
    const scr = typeof screen !== 'undefined' ? screen : {}
    const base = [
      nav.userAgent || '-',
      nav.platform || '-',
      nav.language || '-',
      (scr.width || '-') + 'x' + (scr.height || '-'),
    ].join('|')
    let hash = 0
    for (let i = 0; i < base.length; i++) {
      hash = ((hash << 5) - hash) + base.charCodeAt(i)
      hash |= 0
    }
    return 'dev-' + Math.abs(hash).toString(36)
  } catch {
    return 'dev-unknown'
  }
}

export function detectDeviceName() {
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : ''
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Device'
  if (/Android/i.test(ua)) return 'Android Device'
  if (/Macintosh/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua)) return 'Linux PC'
  return 'Unknown Device'
}

export function detectBrowser() {
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : ''
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome'
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  return 'Unknown'
}

export function captureDeviceInfo() {
  const id = fingerprintDevice()
  const device = detectDeviceName()
  const browser = detectBrowser()
  const platform = typeof navigator !== 'undefined' ? (navigator.platform || 'unknown') : 'unknown'
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : ''
  const resolution = typeof screen !== 'undefined' ? `${screen.width || '-'}x${screen.height || '-'}` : '-'
  return {
    deviceId: id,
    device,
    browser,
    platform,
    userAgent: ua,
    resolution,
    ip: 'N/A', // could be filled by server later
    at: new Date().toISOString(),
  }
}

export function loadDevicesForUser(userId) {
  try {
    const raw = window.localStorage.getItem(`user_devices_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDeviceForUser(userId, device) {
  if (!userId || !device) return
  try {
    const key = `user_devices_${userId}`
    const cur = loadDevicesForUser(userId)
    const exists = cur.some(d => d.deviceId === device.deviceId)
    const next = exists ? cur.map(d => d.deviceId === device.deviceId ? { ...device } : d) : [device, ...cur]
    window.localStorage.setItem(key, JSON.stringify(next))
  } catch {}
}