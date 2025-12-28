import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

// SLA schema
const EscalationActionEnum = z.enum([
  'NotifyManager',
  'ReassignHigherRank',
  'IncreasePriority',
  'NotifyCustomer',
  'MarkEscalated',
])

const SlaSchema = z.object({
  name: z.string().min(2).default('Default SLA'),
  serviceType: z.enum(['Complaint', 'Inquiry', 'Request', 'VIP Support', 'Technical Issue']),
  // store minutes for normalized math
  responseMinutes: z.number().int().min(1),
  // resolution per-priority in minutes
  resolutionMinutesByPriority: z.object({
    Low: z.number().int().min(1),
    Medium: z.number().int().min(1),
    High: z.number().int().min(1),
    Urgent: z.number().int().min(1),
  }),
  // escalation rules
  escalation: z.object({
    onResponseBreach: z.array(EscalationActionEnum).default([]),
    onResolutionBreach: z.array(EscalationActionEnum).default([]),
    escalateToRole: z.string().optional().or(z.literal('')),
  }).default({ onResponseBreach: [], onResolutionBreach: [] }),
  // targeting
  appliesTo: z.object({
    customerCategory: z.enum(['VIP', 'Regular']).optional(),
    customerIds: z.array(z.string()).optional().default([]),
    plan: z.string().optional().or(z.literal('')),
  }).default({}),
  active: z.boolean().default(true),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(SlaSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = create('slas', { ...data, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'sla', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, serviceType, active, page = 1, limit = 50, includeDeleted } = req.query
  const items = list('slas', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { serviceType, active: typeof active === 'string' ? active === 'true' : undefined },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('slas', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('slas', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(SlaSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = update('slas', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'sla', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('slas', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('slas', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'sla', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('slas', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('slas', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'sla', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

export default router