import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  type: 'Individual',
  country: '',
  city: '',
  addressLine: '',
  companyName: '',
  taxNumber: '',
  contacts: [],
  tags: [],
  notes: '',
  assignedSalesRep: '',
}

// Mock data for preview when API returns empty or fails
const MOCK_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'أحمد محمد',
    phone: '+201234567890',
    email: 'ahmed@example.com',
    type: 'Individual',
    country: 'Egypt',
    city: 'Cairo',
    addressLine: 'Nasr City',
    companyName: '',
    taxNumber: '',
    contacts: [],
    tags: ['VIP', 'Hot'],
    notes: 'عميل مهتم بمنتج جديد',
    assignedSalesRep: 'Ibrahim',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'CUST-002',
    name: 'Techno LLC',
    phone: '+971555123456',
    email: 'sales@techno.com',
    type: 'Company',
    country: 'UAE',
    city: 'Dubai',
    addressLine: 'Business Bay',
    companyName: 'Techno LLC',
    taxNumber: 'TRN-12345',
    contacts: [{ name: 'Sara Ali', phone: '+971555234567', email: 'sara@techno.com' }],
    tags: ['B2B'],
    notes: 'طلب عرض سعر لخدمة الدعم',
    assignedSalesRep: 'Adam',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'CUST-003',
    name: 'John Doe',
    phone: '+12025550123',
    email: 'john.doe@example.com',
    type: 'Individual',
    country: 'USA',
    city: 'New York',
    addressLine: '5th Avenue',
    companyName: '',
    taxNumber: '',
    contacts: [],
    tags: ['Priority'],
    notes: 'متابع للعرض التجريبي',
    assignedSalesRep: 'Noura',
    createdAt: new Date().toISOString(),
  },
]

export const Customers = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Filters & search
  const [q, setQ] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterRep, setFilterRep] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/api/customers', {
        params: {
          q, type: filterType || undefined,
          assignedSalesRep: filterRep || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          limit: 50,
        }
      })
      const list = data?.data?.items || []
      setItems(Array.isArray(list) && list.length > 0 ? list : MOCK_CUSTOMERS)
    } catch (e) {
      setError('Failed to load customers')
      setItems(MOCK_CUSTOMERS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-apply filters on change with a small debounce for responsiveness
  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(timer)
  }, [q, filterType, filterRep, dateFrom, dateTo])

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(false)
  }

  const submit = async (e) => {
    e?.preventDefault?.()
    try {
      setLoading(true)
      setError('')
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : String(form.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        contacts: Array.isArray(form.contacts) ? form.contacts : [],
      }
      if (editingId) {
        await api.put(`/api/customers/${editingId}`, payload)
      } else {
        await api.post('/api/customers', payload)
      }
      await load()
      resetForm()
    } catch (e) {
      setError('Failed to save customer')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      type: item.type || 'Individual',
      country: item.country || '',
      city: item.city || '',
      addressLine: item.addressLine || '',
      companyName: item.companyName || '',
      taxNumber: item.taxNumber || '',
      contacts: item.contacts || [],
      tags: item.tags || [],
      notes: item.notes || '',
      assignedSalesRep: item.assignedSalesRep || item.assignedTo || '',
    })
    setShowForm(true)
  }

  const remove = async (id) => {
    try {
      setLoading(true)
      await api.delete(`/api/customers/${id}`)
      await load()
    } catch (e) {
      setError('Failed to delete customer')
    } finally {
      setLoading(false)
    }
  }

  const restore = async (id) => {
    try {
      setLoading(true)
      await api.post(`/api/customers/${id}/restore`)
      await load()
    } catch (e) {
      setError('Failed to restore customer')
    } finally {
      setLoading(false)
    }
  }

  const addEmptyContact = () => {
    setForm((f) => ({ ...f, contacts: [...(f.contacts || []), { name: '', phone: '', email: '' }] }))
  }

  const updateContact = (idx, key, value) => {
    setForm((f) => {
      const next = [...(f.contacts || [])]
      next[idx] = { ...next[idx], [key]: value }
      return { ...f, contacts: next }
    })
  }

  const removeContact = (idx) => {
    setForm((f) => {
      const next = [...(f.contacts || [])]
      next.splice(idx, 1)
      return { ...f, contacts: next }
    })
  }

  return (
      <div className="space-y-4 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden overflow-y-auto">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm) }}>Add Customer</button>
          </div>
        </div>

        {/* Filters */}
        <section className="nova-card glass-neon p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input className="input w-full min-w-0" placeholder="Search name/phone/email" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input w-full min-w-0" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
            <input className="input w-full min-w-0" placeholder="Assigned Sales Rep" value={filterRep} onChange={(e) => setFilterRep(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input w-full min-w-0" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input type="date" className="input w-full min-w-0" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Removed Apply button; filters auto-apply on change */}
            <button className="btn" onClick={() => { setQ(''); setFilterType(''); setFilterRep(''); setDateFrom(''); setDateTo(''); load() }}>Reset</button>
          </div>
        </section>

        {/* Form */}
        {showForm && (
          <section className="nova-card glass-neon p-4">
            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label className="label">Customer Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Customer Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Individual</option>
                  <option>Company</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="label">Country</label>
                <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="lg:col-span-2">
                <label className="label">Address Line</label>
                <input className="input" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
              </div>

              {/* B2B Only */}
              {form.type === 'Company' && (
                <>
                  <div>
                    <label className="label">Company Name *</label>
                    <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Tax Number</label>
                    <input className="input" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="label">Contacts</label>
                      <button type="button" className="btn btn-secondary" onClick={addEmptyContact}>Add Contact</button>
                    </div>
                    {(form.contacts || []).length === 0 && (
                      <div className="text-sm text-[var(--muted-text)]">No contacts</div>
                    )}
                    {(form.contacts || []).map((c, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <input className="input" placeholder="Contact Name" value={c.name} onChange={(e) => updateContact(idx, 'name', e.target.value)} />
                        <input className="input" placeholder="Contact Phone" value={c.phone} onChange={(e) => updateContact(idx, 'phone', e.target.value)} />
                        <div className="flex gap-2">
                          <input className="input" placeholder="Contact Email" value={c.email} onChange={(e) => updateContact(idx, 'email', e.target.value)} />
                          <button type="button" className="btn" onClick={() => removeContact(idx)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Extras */}
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input className="input" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div>
                <label className="label">Assigned Sales Rep</label>
                <input className="input" value={form.assignedSalesRep} onChange={(e) => setForm({ ...form, assignedSalesRep: e.target.value })} />
              </div>
              <div className="lg:col-span-2">
                <label className="label">Notes</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              {/* Actions */}
              <div className="lg:col-span-2 flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Save Changes' : 'Create Customer'}</button>
                <button type="button" className="btn" onClick={resetForm}>Cancel</button>
              </div>
              {error && <div className="lg:col-span-2 text-red-500 text-sm">{error}</div>}
            </form>
          </section>
        )}

        {/* Table */}
        <section className="nova-card glass-neon p-4">
          <div className="overflow-auto -mx-4">
            <table className="nova-table w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="text-left bg-[var(--table-header-bg)]">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Contact</th>
                  <th className="py-2 px-3">Company</th>
                  <th className="py-2 px-3">Tags</th>
                  <th className="py-2 px-3">Assigned Rep</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="py-3 px-3" colSpan={8}>Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td className="py-3 px-3" colSpan={8}>No customers</td></tr>
                )}
                {!loading && items.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--table-row-border)] odd:bg-[var(--table-row-bg)]">
                    <td className="py-2 px-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-[var(--muted-text)]">{c.email}</div>
                      <div className="text-xs text-[var(--muted-text)]">{c.phone}</div>
                    </td>
                    <td className="py-2 px-3">{c.type || '—'}</td>
                    <td className="py-2 px-3">
                      {Array.isArray(c.contacts) && c.contacts.length > 0 ? (
                        <>
                          <div className="text-xs">{c.contacts[0].name}</div>
                          <div className="text-xs text-[var(--muted-text)]">{c.contacts[0].phone}</div>
                          {c.contacts[0].email && (
                            <div className="text-xs text-[var(--muted-text)]">{c.contacts[0].email}</div>
                          )}
                        </>
                      ) : (c.email || c.phone) ? (
                        <>
                          <div className="text-xs">{c.email || '—'}</div>
                          {c.phone && (
                            <div className="text-xs text-[var(--muted-text)]">{c.phone}</div>
                          )}
                        </>
                      ) : c.city ? `${c.city}, ${c.country}` : (c.country || '—')}
                    </td>
                    <td className="py-2 px-3">{c.companyName || '—'}</td>
                    <td className="py-2 px-3">{Array.isArray(c.tags) ? c.tags.join(', ') : '—'}</td>
                    <td className="py-2 px-3">{c.assignedSalesRep || c.assignedTo || '—'}</td>
                    <td className="py-2 px-3 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        {!c.deletedAt && <button className="btn btn-secondary" onClick={() => startEdit(c)}>Edit</button>}
                        {!c.deletedAt && <button className="btn" onClick={() => remove(c.id)}>Delete</button>}
                        {c.deletedAt && <button className="btn btn-secondary" onClick={() => restore(c.id)}>Restore</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
  )
}

export default Customers
