import { Router } from 'express'
import { z } from 'zod'
import { ok, fail, paginate } from '../lib/response.js'
import { validate } from '../lib/validate.js'
import { create, list, getById } from '../lib/storage.js'
import { logAction } from '../lib/activity.js'

const router = Router()

// Survey submission schema
const SurveySchema = z.object({
  ticketId: z.string(),
  customerId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().or(z.literal('')),
  channel: z.enum(['Email', 'SMS', 'WhatsApp']).optional().default('Email')
})

// Submit a survey (CSAT)
router.post('/surveys', (req, res) => {
  const { success, data, errors } = validate(SurveySchema, req.body || {})
  if (!success) return fail(res, 422, 'validation_failed', { errors })
  const ticket = getById('tickets', data.ticketId)
  const customer = getById('customers', data.customerId)
  if (!ticket || String(ticket.companyId) !== String(req.user.companyId)) return fail(res, 404, 'ticket_not_found')
  if (!customer || String(customer.companyId) !== String(req.user.companyId)) return fail(res, 404, 'customer_not_found')

  const agent = ticket.assignedAgent || ''
  const item = create('surveys', {
    companyId: req.user.companyId,
    ticketId: data.ticketId,
    customerId: data.customerId,
    rating: data.rating,
    comment: data.comment || '',
    agent,
    submittedAt: new Date().toISOString(),
    channel: data.channel,
  })

  logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'survey', entityId: item.id, action: 'submit', changes: data })

  // Negative score follow-up workflow (rating ≤ 2)
  if (data.rating <= 2) {
    try {
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const escalationTicket = create('tickets', {
        companyId: req.user.companyId,
        customerId: data.customerId,
        subject: 'CSAT Negative Follow-up',
        description: `Auto-escalation due to low CSAT (rating=${data.rating}). Original Ticket: ${data.ticketId}`,
        type: 'Complaint',
        priority: 'Urgent',
        status: 'Escalated',
        channel: 'Customer Portal',
        assignedAgent: 'Quality Team',
        slaDeadline: deadline,
      })
      logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'ticket', entityId: escalationTicket.id, action: 'create_quality_followup', changes: { fromSurvey: item.id } })

      // Notification to supervisor (dev simulation)
      const note = create('notifications', {
        companyId: req.user.companyId,
        type: 'csat_alert',
        message: `Low CSAT (≤2) from customer ${data.customerId} on ticket ${data.ticketId}`,
        audience: 'Supervisor',
        at: new Date().toISOString(),
      })
      logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'notification', entityId: note.id, action: 'dispatch', changes: { channel: 'in-app' } })

      // Append to dissatisfied customers list
      const monthKey = new Date().toISOString().slice(0, 7) // YYYY-MM
      create('dissatisfiedCustomers', {
        companyId: req.user.companyId,
        customerId: data.customerId,
        surveyId: item.id,
        month: monthKey,
        addedAt: new Date().toISOString(),
      })
    } catch (e) {
      // Non-blocking: workflow errors shouldn't stop survey submission
      console.warn('[csat-escalation] failed', e)
    }
  }

  return ok(res, { item })
})

// List surveys
router.get('/surveys', (req, res) => {
  const { q, page = 1, limit = 20 } = req.query
  const items = list('surveys', { companyId: req.user.companyId, q })
  const out = paginate(items, page, limit)
  return ok(res, out)
})

// Stats for dashboard widgets
router.get('/surveys/stats', (req, res) => {
  const now = new Date()
  const monthKey = now.toISOString().slice(0, 7)
  const surveys = list('surveys', { companyId: req.user.companyId })
  const tickets = list('tickets', { companyId: req.user.companyId })

  const thisMonthSurveys = surveys.filter(s => (s.submittedAt || '').slice(0, 7) === monthKey)
  const closedThisMonth = tickets.filter(t => t.closedAt && t.closedAt.slice(0, 7) === monthKey)
  const avg = surveys.length ? (surveys.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) / surveys.length) : 0

  const byAgent = {}
  for (const s of surveys) {
    const a = s.agent || '—'
    byAgent[a] = byAgent[a] || { agent: a, count: 0, total: 0 }
    byAgent[a].count += 1
    byAgent[a].total += Number(s.rating) || 0
  }
  const agentStats = Object.values(byAgent).map(x => ({ agent: x.agent, avg: x.count ? x.total / x.count : 0, count: x.count }))
  const topAgents = agentStats.sort((a, b) => b.avg - a.avg).slice(0, 5)
  const bottomAgents = agentStats.slice().sort((a, b) => a.avg - b.avg).slice(0, 5)

  const dissatisfied = list('dissatisfiedCustomers', { companyId: req.user.companyId }).filter(d => d.month === monthKey)
  const responseRate = closedThisMonth.length ? Math.round((thisMonthSurveys.length / closedThisMonth.length) * 100) : 0

  return ok(res, {
    avgCSAT: Math.round(avg * 100) / 100,
    topAgents,
    bottomAgents,
    dissatisfiedCountThisMonth: dissatisfied.length,
    responseRatePercent: responseRate,
    totals: { surveys: surveys.length, closedTicketsThisMonth: closedThisMonth.length },
  })
})

export default router