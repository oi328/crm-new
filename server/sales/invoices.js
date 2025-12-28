import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

const InvoiceSchema = z.object({
  customerId: z.string().optional(),
  salesOrderId: z.string(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentStatus: z.enum(['Paid', 'Unpaid', 'Partial']).default('Unpaid'),
  dueDate: z.string().optional(),
  receiptAttachment: z.string().optional().or(z.literal('')),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(InvoiceSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const so = getById('salesOrders', data.salesOrderId)
  if (!so || String(so.companyId) !== String(req.user.companyId)) return fail(res, 404, 'sales_order_not_found')
  const item = create('invoices', { ...data, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'invoice', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, paymentStatus, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('invoices', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { paymentStatus },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('invoices', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('invoices', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(InvoiceSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = update('invoices', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'invoice', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('invoices', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('invoices', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'invoice', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('invoices', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('invoices', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'invoice', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

export default router