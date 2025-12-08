import { Router } from 'express'
import leadsRouter from './leads.js'
import opportunitiesRouter from './opportunities.js'
import quotationsRouter from './quotations.js'
import salesOrdersRouter from './salesOrders.js'
import invoicesRouter from './invoices.js'
import customersRouter from './customers.js'
import ticketsRouter from './tickets.js'
import slasRouter from './slas.js'
import feedbacksRouter from './feedbacks.js'
import { ok } from '../lib/response.js'
import { getActivity } from '../lib/activity.js'

const r = Router()

r.get('/activity', (req, res) => {
  const out = getActivity({ companyId: req.user.companyId })
  return ok(res, { items: out })
})

r.use('/leads', leadsRouter)
r.use('/opportunities', opportunitiesRouter)
r.use('/quotations', quotationsRouter)
r.use('/sales-orders', salesOrdersRouter)
r.use('/invoices', invoicesRouter)
r.use('/customers', customersRouter)
r.use('/tickets', ticketsRouter)
r.use('/slas', slasRouter)
r.use('/feedbacks', feedbacksRouter)

// Customers Module namespace: mirror sales endpoints under /api/customers/*
// This satisfies REST paths like /api/customers/opportunities, /api/customers/quotations, etc.
r.use('/customers/opportunities', opportunitiesRouter)
r.use('/customers/quotations', quotationsRouter)
r.use('/customers/sales-orders', salesOrdersRouter)
r.use('/customers/invoices', invoicesRouter)

export default r