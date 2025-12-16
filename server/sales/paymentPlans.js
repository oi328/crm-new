import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

// Template schema
const InstallmentSchema = z.object({
  label: z.string().min(1),
  percentage: z.number().min(0).max(100),
  dueAfterDays: z.number().min(0)
})
const PaymentPlanTemplateSchema = z.object({
  name: z.string().min(1),
  allowedStages: z.array(z.string()).default(['deal']),
  installments: z.array(InstallmentSchema).nonempty(),
})

// Create template
router.post('/templates', (req, res) => {
  const { success, data, errors } = validate(PaymentPlanTemplateSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const total = data.installments.reduce((acc, i) => acc + Number(i.percentage || 0), 0)
  if (Math.round(total) !== 100) return fail(res, 422, 'percent_total_invalid')
  const item = create('paymentPlans', { ...data, companyId: req.user.companyId, usedCount: 0 })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'payment_plan', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

// List templates
router.get('/templates', (req, res) => {
  const { page = 1, limit = 50, q } = req.query
  const items = list('paymentPlans', { companyId: req.user.companyId, q })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

// Get one template
router.get('/templates/:id', (req, res) => {
  const item = getById('paymentPlans', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

// Update template
router.put('/templates/:id', (req, res) => {
  const current = getById('paymentPlans', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(PaymentPlanTemplateSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  if (data.installments) {
    const total = data.installments.reduce((acc, i) => acc + Number(i.percentage || 0), 0)
    if (Math.round(total) !== 100) return fail(res, 422, 'percent_total_invalid')
  }
  const item = update('paymentPlans', req.params.id, data)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'payment_plan', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

// Delete template (blocked if used)
router.delete('/templates/:id', (req, res) => {
  const current = getById('paymentPlans', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  if (current.usedCount && current.usedCount > 0) return fail(res, 409, 'template_in_use')
  const item = softDelete('paymentPlans', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'payment_plan', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

// Generate schedule from a template
const GenerateSchema = z.object({
  templateId: z.string(),
  amount: z.number().min(0),
  startDate: z.string().optional(),
})
router.post('/generate-schedule', (req, res) => {
  const { success, data, errors } = validate(GenerateSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const tpl = getById('paymentPlans', data.templateId)
  if (!tpl || String(tpl.companyId) !== String(req.user.companyId)) return fail(res, 404, 'template_not_found')
  const start = data.startDate ? new Date(data.startDate) : new Date()
  const items = (tpl.installments || []).map(inst => {
    const due = new Date(start.getTime() + (inst.dueAfterDays || 0) * 24 * 60 * 60 * 1000)
    const now = new Date()
    const status = now > due ? 'Overdue' : 'Pending'
    return {
      label: inst.label,
      percentage: inst.percentage,
      amount: Math.round((data.amount * inst.percentage) / 100 * 100) / 100,
      dueDate: due.toISOString(),
      status,
    }
  })
  return ok(res, { items })
})

export default router

