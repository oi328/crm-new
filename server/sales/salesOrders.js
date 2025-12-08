import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

const OrderSchema = z.object({
  customerId: z.string().optional(),
  quotationId: z.string(),
  items: z.array(z.any()).min(1),
  deliveryDate: z.string().optional(), // ISO
  paymentTerms: z.string().optional().or(z.literal('')),
  status: z.enum(['Pending', 'Processing', 'Delivered', 'Completed']).default('Pending'),
  notes: z.string().optional().or(z.literal('')),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(OrderSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const q = getById('quotations', data.quotationId)
  if (!q || String(q.companyId) !== String(req.user.companyId)) return fail(res, 404, 'quotation_not_found')
  const item = create('salesOrders', { ...data, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'salesOrder', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, status, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('salesOrders', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { status },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('salesOrders', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('salesOrders', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(OrderSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = update('salesOrders', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'salesOrder', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('salesOrders', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('salesOrders', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'salesOrder', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('salesOrders', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('salesOrders', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'salesOrder', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

// Relation: Sales Order hasOne Invoice -> create linked invoice
router.post('/:id/create-invoice', (req, res) => {
  const order = getById('salesOrders', req.params.id)
  if (!order || String(order.companyId) !== String(req.user.companyId)) return fail(res, 404, 'order_not_found')
  const subtotal = order.items.reduce((sum, it) => sum + (it.quantity || 1) * (it.unitPrice || 0) - (it.discount || 0), 0)
  const taxRate = Number(process.env.DEFAULT_TAX_RATE || 0.14)
  const tax = Math.round(subtotal * taxRate * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  const invoice = create('invoices', {
    companyId: req.user.companyId,
    salesOrderId: order.id,
    customerId: order.customerId || null,
    subtotal,
    tax,
    total,
    paymentStatus: 'Unpaid',
    dueDate: req.body?.dueDate || null,
    receiptAttachment: null,
  })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'invoice', entityId: invoice.id, action: 'create_from_order', changes: { salesOrderId: order.id } })
  return ok(res, { invoice, order })
})

export default router