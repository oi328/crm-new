// Simple Zod validator wrapper
export function validate(schema, payload) {
  try {
    const parsed = schema.parse(payload)
    return { success: true, data: parsed }
  } catch (e) {
    const issues = Array.isArray(e?.issues)
      ? e.issues.map((i) => ({ path: i.path, message: i.message }))
      : [{ message: 'validation_failed' }]
    return { success: false, errors: issues }
  }
}