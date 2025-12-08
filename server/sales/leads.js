import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

const LeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().min(2),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).default('New'),
  notes: z.string().optional().or(z.literal('')),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(LeadSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = create('leads', { ...data, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'lead', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, status, source, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('leads', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { status, source },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('leads', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('leads', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(LeadSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = update('leads', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'lead', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('leads', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('leads', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'lead', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('leads', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('leads', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'lead', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

// Convert Lead -> Opportunity
router.post('/:id/convert-to-opportunity', (req, res) => {
  const lead = getById('leads', req.params.id)
  if (!lead || String(lead.companyId) !== String(req.user.companyId)) return fail(res, 404, 'lead_not_found')
  const opp = create('opportunities', {
    companyId: req.user.companyId,
    leadId: lead.id,
    status: 'New',
    stage: 'Qualification',
    notes: req.body?.notes || '',
  })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'opportunity', entityId: opp.id, action: 'create_from_lead', changes: { leadId: lead.id } })
  return ok(res, { opportunity: opp, lead })
})

export default router