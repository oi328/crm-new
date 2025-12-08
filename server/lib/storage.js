import { v4 as uuidv4 } from 'uuid'

// Simple in-memory storage per collection
const db = {
  leads: [],
  opportunities: [],
  quotations: [],
  salesOrders: [],
  invoices: [],
  customers: [],
  tickets: [],
  surveys: [],
  notifications: [],
  dissatisfiedCustomers: [],
}

export function id() {
  return uuidv4()
}

export function collection(name) {
  if (!db[name]) db[name] = []
  return db[name]
}

export function create(name, payload) {
  const col = collection(name)
  const item = { id: id(), createdAt: new Date().toISOString(), updatedAt: null, deletedAt: null, ...payload }
  col.push(item)
  return item
}

export function getById(name, entityId) {
  const col = collection(name)
  return col.find((x) => String(x.id) === String(entityId)) || null
}

export function update(name, entityId, changes) {
  const col = collection(name)
  const idx = col.findIndex((x) => String(x.id) === String(entityId))
  if (idx === -1) return null
  col[idx] = { ...col[idx], ...changes, updatedAt: new Date().toISOString() }
  return col[idx]
}

export function softDelete(name, entityId) {
  return update(name, entityId, { deletedAt: new Date().toISOString() })
}

export function restore(name, entityId) {
  return update(name, entityId, { deletedAt: null })
}

export function list(name, { companyId, includeDeleted = false, q, filters = {} } = {}) {
  const col = collection(name)
  let items = col.filter((x) => String(x.companyId) === String(companyId))
  if (!includeDeleted) items = items.filter((x) => !x.deletedAt)
  if (q) {
    const qq = String(q).toLowerCase()
    items = items.filter((x) => JSON.stringify(x).toLowerCase().includes(qq))
  }
  // simple filters: match exact values for provided keys
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue
    items = items.filter((x) => String(x[k]) === String(v))
  }
  // sort by createdAt desc
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return items
}

export const dbRef = db