import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

const ItemSchema = z.object({
  name: z.string().min(2), // Product/Service
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().optional().default(0),
})

const QuoteSchema = z.object({
  opportunityId: z.string(),
  items: z.array(ItemSchema).min(1),
  attachment: z.string().optional().or(z.literal('')),
  status: z.enum(['Draft', 'Sent']).default('Draft'),
  notes: z.string().optional().or(z.literal('')),
})

function computeTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice - (it.discount || 0), 0)
  const taxRate = Number(process.env.DEFAULT_TAX_RATE || 0.14)
  const tax = Math.round(subtotal * taxRate * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100
  return { subtotal, tax, total }
}

router.post('/', (req, res) => {
  const { success, data, errors } = validate(QuoteSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const opp = getById('opportunities', data.opportunityId)
  if (!opp || String(opp.companyId) !== String(req.user.companyId)) return fail(res, 404, 'opportunity_not_found')
  const totals = computeTotals(data.items)
  const item = create('quotations', { ...data, ...totals, companyId: req.user.companyId })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'quotation', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, status, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('quotations', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { status },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('quotations', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('quotations', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(QuoteSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  let changes = { ...data }
  if (data.items) {
    const totals = computeTotals(data.items)
    changes = { ...changes, ...totals }
  }
  const item = update('quotations', req.params.id, changes)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'quotation', entityId: item.id, action: 'update', changes })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('quotations', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('quotations', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'quotation', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('quotations', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('quotations', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'quotation', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

// Action: Send to Customer (status becomes Sent)
router.post('/:id/send', (req, res) => {
  const current = getById('quotations', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = update('quotations', req.params.id, { status: 'Sent' })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'quotation', entityId: item.id, action: 'send_to_customer' })
  return ok(res, { item })
})

// Action: Convert to Sales Order (creates linked Sales Order)
router.post('/:id/convert-to-sales-order', (req, res) => {
  const quote = getById('quotations', req.params.id)
  if (!quote || String(quote.companyId) !== String(req.user.companyId)) return fail(res, 404, 'quotation_not_found')
  const order = create('salesOrders', {
    companyId: req.user.companyId,
    quotationId: quote.id,
    customerId: req.body?.customerId || null,
    items: quote.items,
    deliveryDate: req.body?.deliveryDate || null,
    paymentTerms: req.body?.paymentTerms || '',
    status: 'Pending',
  })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'salesOrder', entityId: order.id, action: 'create_from_quotation', changes: { quotationId: quote.id } })
  return ok(res, { salesOrder: order, quotation: quote })
})

export default router