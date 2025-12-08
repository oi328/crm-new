import jwt from 'jsonwebtoken'
import { fail } from './response.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return fail(res, 401, 'unauthorized')
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    return next()
  } catch (e) {
    return fail(res, 401, 'unauthorized')
  }
}

export function ensureCompanyAccess(entityCompanyId, userCompanyId) {
  return String(entityCompanyId) === String(userCompanyId)
}