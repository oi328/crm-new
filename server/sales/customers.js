import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, getById, update, softDelete, restore, collection } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

// Full customer schema per requirements
const ContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
})

const CustomerSchema = z.object({
  // Basic Information
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['Individual', 'Company']).default('Individual'),

  // Address (optional)
  country: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  addressLine: z.string().optional().or(z.literal('')),

  // B2B Only
  companyName: z.string().optional().or(z.literal('')),
  taxNumber: z.string().optional().or(z.literal('')),
  contacts: z.array(ContactSchema).optional().default([]),

  // Extra Fields
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().or(z.literal('')),
  assignedSalesRep: z.string().optional().or(z.literal('')),
}).superRefine((val, ctx) => {
  // If type is Company, require companyName
  if (val.type === 'Company' && (!val.companyName || String(val.companyName).trim().length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['companyName'], message: 'company_name_required_for_company_type' })
  }
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(CustomerSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = create('customers', {
    ...data,
    companyId: req.user.companyId,
    createdBy: req.user.userId,
    assignedTo: data.assignedSalesRep || null,
  })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'customer', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, page = 1, limit = 20, includeDeleted, type, assignedSalesRep, dateFrom, dateTo } = req.query
  const isAdmin = ['Super Admin', 'Admin', 'Owner'].includes(String(req.user.role || ''))
  let items = collection('customers')
  // company scope
  if (!isAdmin) items = items.filter((x) => String(x.companyId) === String(req.user.companyId))
  // deleted filter
  if (String(includeDeleted) !== 'true') items = items.filter((x) => !x.deletedAt)
  // search by name/phone/email
  if (q && String(q).trim().length) {
    const qq = String(q).toLowerCase()
    items = items.filter((x) =>
      String(x.name || '').toLowerCase().includes(qq) ||
      String(x.phone || '').toLowerCase().includes(qq) ||
      String(x.email || '').toLowerCase().includes(qq)
    )
  }
  // filters: type, assignedSalesRep
  if (type) items = items.filter((x) => String(x.type) === String(type))
  if (assignedSalesRep) items = items.filter((x) => String(x.assignedSalesRep || x.assignedTo || '') === String(assignedSalesRep))
  // creation date range
  const from = dateFrom ? new Date(dateFrom) : null
  const to = dateTo ? new Date(dateTo) : null
  if (from) items = items.filter((x) => new Date(x.createdAt) >= from)
  if (to) items = items.filter((x) => new Date(x.createdAt) <= to)
  // sort by createdAt desc
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('customers', req.params.id)
  if (!item) return fail(res, 404, 'not_found')
  const isAdmin = ['Super Admin', 'Admin', 'Owner'].includes(String(req.user.role || ''))
  if (!isAdmin && String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('customers', req.params.id)
  if (!current) return fail(res, 404, 'not_found')
  const isAdmin = ['Super Admin', 'Admin', 'Owner'].includes(String(req.user.role || ''))
  if (!isAdmin && String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(CustomerSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const item = update('customers', req.params.id, {
    ...data,
    assignedTo: data.assignedSalesRep !== undefined ? data.assignedSalesRep : current.assignedTo,
  })
  logAction({ userId: req.user.userId, companyId: current.companyId, entity: 'customer', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('customers', req.params.id)
  if (!current) return fail(res, 404, 'not_found')
  const isAdmin = ['Super Admin', 'Admin', 'Owner'].includes(String(req.user.role || ''))
  if (!isAdmin && String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('customers', req.params.id)
  logAction({ userId: req.user.userId, companyId: current.companyId, entity: 'customer', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('customers', req.params.id)
  if (!current) return fail(res, 404, 'not_found')
  const isAdmin = ['Super Admin', 'Admin', 'Owner'].includes(String(req.user.role || ''))
  if (!isAdmin && String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('customers', req.params.id)
  logAction({ userId: req.user.userId, companyId: current.companyId, entity: 'customer', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

export default router