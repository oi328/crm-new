// In-memory activity log for actions
const activityLog = []

export function logAction({ userId, companyId, entity, entityId, action, changes = {} }) {
  activityLog.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    companyId,
    entity,
    entityId,
    action,
    changes,
    at: new Date().toISOString(),
  })
}

export function getActivity({ companyId, entity, entityId }) {
  return activityLog.filter((a) =>
    (!companyId || String(a.companyId) === String(companyId)) &&
    (!entity || a.entity === entity) &&
    (!entityId || String(a.entityId) === String(entityId))
  )
}