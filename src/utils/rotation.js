// Utilities for Rotation Settings behavior across the app

export const defaultRotationSettings = {
  allowAssignRotation: true,
  delayAssignRotation: false,
  workFrom: '00:00',
  workTo: '23:59',
  reshuffleColdLeads: false,
  reshuffleColdLeadsNumber: 0,
}

export function getRotationSettings() {
  try {
    const raw = localStorage.getItem('rotationSettings')
    if (!raw) return { ...defaultRotationSettings }
    const parsed = JSON.parse(raw)
    return { ...defaultRotationSettings, ...parsed }
  } catch {
    return { ...defaultRotationSettings }
  }
}

function parseTimeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return 0
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10) || 0)
  return h * 60 + m
}

export function isWithinWorkingHours(date = new Date(), from = '00:00', to = '23:59') {
  const minutes = date.getHours() * 60 + date.getMinutes()
  const fromMin = parseTimeToMinutes(from)
  const toMin = parseTimeToMinutes(to)
  if (fromMin <= toMin) {
    // Same-day window
    return minutes >= fromMin && minutes <= toMin
  }
  // Overnight window (e.g., 22:00 -> 06:00)
  return minutes >= fromMin || minutes <= toMin
}

export function canAssignNow(date = new Date()) {
  const s = getRotationSettings()
  if (!s.allowAssignRotation) {
    return { ok: false, reason: 'Rotation is disabled' }
  }
  const within = isWithinWorkingHours(date, s.workFrom, s.workTo)
  if (!within && s.delayAssignRotation) {
    return { ok: false, reason: 'Assignments delayed until working hours' }
  }
  return { ok: true }
}

export function getReshuffleLimit() {
  const s = getRotationSettings()
  return s.reshuffleColdLeads ? Number(s.reshuffleColdLeadsNumber || 0) : 0
}