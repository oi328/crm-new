import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

const OppSchema = z.object({
  leadId: z.string().optional(),
  customerId: z.string().optional(),
  contact: z.string().optional().or(z.literal('')),
  amount: z.number().nonnegative().optional(),
  expectedCloseDate: z.string().optional(), // ISO
  status: z.enum(['New', 'In Progress', 'Won', 'Lost']).default('New'),
  stage: z.enum(['Qualification', 'Proposal', 'Negotiation', 'Final']).default('Qualification'),
  notes: z.string().optional().or(z.literal('')),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(OppSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  // verify lead if provided
  if (data.leadId) {
    const lead = getById('leads', data.leadId)
    if (!lead || String(lead.companyId) !== String(req.user.companyId)) return fail(res, 404, 'lead_not_found')
  }
  const item = create('opportunities', { ...data, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'opportunity', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, status, stage, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('opportunities', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { status, stage },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('opportunities', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('opportunities', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(OppSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  if (data.leadId) {
    const lead = getById('leads', data.leadId)
    if (!lead || String(lead.companyId) !== String(req.user.companyId)) return fail(res, 404, 'lead_not_found')
  }
  const item = update('opportunities', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'opportunity', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('opportunities', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('opportunities', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'opportunity', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('opportunities', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('opportunities', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'opportunity', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

export default router