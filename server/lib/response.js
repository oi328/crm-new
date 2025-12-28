// Unified API response helpers
export function ok(res, data = {}, message = '') {
  return res.json({ status: true, message, data })
}

export function fail(res, code = 400, message = 'error', data = {}) {
  return res.status(code).json({ status: false, message, data })
}

export function paginate(list = [], page = 1, limit = 20) {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Math.min(100, Number(limit) || 20))
  const start = (p - 1) * l
  const items = list.slice(start, start + l)
  return {
    items,
    meta: {
      page: p,
      limit: l,
      total: list.length,
      pages: Math.ceil(list.length / l) || 1,
    },
  }
}