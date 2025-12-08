import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById, update, softDelete, restore } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

// Ticket schema موسّع وفق المواصفات
const TicketSchema = z.object({
  customerId: z.string(),
  subject: z.string().min(3),
  description: z.string().min(3),
  // نوع الحالة: Complaint | Inquiry | Request
  type: z.enum(['Complaint', 'Inquiry', 'Request']).default('Inquiry'),
  // أولوية: إضافة Urgent
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Low'),
  // حالة: إضافة Escalated، والإبقاء على Open/In Progress/Closed
  status: z.enum(['Open', 'In Progress', 'Escalated', 'Closed']).default('Open'),
  // قناة الوصول
  channel: z.enum(['Email', 'Phone', 'WhatsApp', 'Customer Portal', 'Social Media']).default('Email'),
  // بيانات التواصل (اختياري)
  contactPhone: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactWhatsapp: z.string().optional().or(z.literal('')),
  // المكلّف بالتذكرة
  assignedAgent: z.string().optional().or(z.literal('')),
  // موعد SLA النهائي للرد/الحل
  slaDeadline: z.string().optional().or(z.literal('')),
  // ملاحظات الحل عند الإغلاق
  resolutionNotes: z.string().optional().or(z.literal('')),
  // مرفقات (روابط ملفات مرفوعة)
  attachments: z.array(z.string()).optional().default([]),
  // طوابع زمنية إضافية لقياس SLA
  firstResponseAt: z.string().optional().or(z.literal('')),
  closedAt: z.string().optional().or(z.literal('')),
})

router.post('/', (req, res) => {
  const { success, data, errors } = validate(TicketSchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const customer = getById('customers', data.customerId)
  if (!customer || String(customer.companyId) !== String(req.user.companyId)) return fail(res, 404, 'customer_not_found')
  // توليد رقم تذكرة مقروء (اختياري بالإضافة إلى الـ UUID)
  const readableNumber = `T-${Date.now().toString().slice(-8)}`
  const item = create('tickets', { ...data, companyId: req.user.companyId, ticketNumber: readableNumber })
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'ticket', entityId: item.id, action: 'create', changes: data })
  return ok(res, { item })
})

router.get('/', (req, res) => {
  const { q, status, priority, page = 1, limit = 20, includeDeleted } = req.query
  const items = list('tickets', {
    companyId: req.user.companyId,
    includeDeleted: String(includeDeleted) === 'true',
    q,
    filters: { status, priority },
  })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

router.get('/:id', (req, res) => {
  const item = getById('tickets', req.params.id)
  if (!item || String(item.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  return ok(res, { item })
})

router.put('/:id', (req, res) => {
  const current = getById('tickets', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const { success, data, errors } = validate(TicketSchema.partial(), req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  // استخلاص تغييرات الحالة لضبط firstResponseAt/closedAt تلقائياً
  let next = { ...data }
  // إذا خرجت من الحالة Open لأول مرة، سجّل firstResponseAt إن لم تكن موجودة
  if (data.status && data.status !== 'Open' && !current.firstResponseAt) {
    next.firstResponseAt = new Date().toISOString()
  }
  // إذا تحولت إلى Closed لأول مرة، سجّل closedAt
  if (data.status === 'Closed' && !current.closedAt) {
    next.closedAt = new Date().toISOString()
    // محاكاة إرسال رابط نموذج التقييم عبر القنوات الثلاث
    try {
      const channels = ['Email', 'SMS', 'WhatsApp']
      for (const ch of channels) {
        logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'survey_invite', entityId: current.id, action: 'send', changes: { channel: ch } })
      }
    } catch (_) {}
  }
  const item = update('tickets', req.params.id, next)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'ticket', entityId: item.id, action: 'update', changes: data })
  return ok(res, { item })
})

router.delete('/:id', (req, res) => {
  const current = getById('tickets', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = softDelete('tickets', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'ticket', entityId: item.id, action: 'soft_delete' })
  return ok(res, { item })
})

router.post('/:id/restore', (req, res) => {
  const current = getById('tickets', req.params.id)
  if (!current || String(current.companyId) !== String(req.user.companyId)) return fail(res, 404, 'not_found')
  const item = restore('tickets', req.params.id)
  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'ticket', entityId: item.id, action: 'restore' })
  return ok(res, { item })
})

export default router