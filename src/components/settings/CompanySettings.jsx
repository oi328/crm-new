import React, { useState } from 'react'
import { Upload } from 'lucide-react'

const CompanySettings = () => {
  const [form, setForm] = useState({
    name: 'Acme Inc.',
    logo: '',
    address: '123 Nile St, Cairo',
    phone: '+201000000000',
    email: 'info@acme.com',
    description: 'Leading CRM company',
    currency: 'EGP',
    timezone: 'Africa/Cairo'
  })
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <input value={form.name} onChange={e=>setField('name', e.target.value)} className="input-soft w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input value={form.phone} onChange={e=>setField('phone', e.target.value)} className="input-soft w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={form.email} onChange={e=>setField('email', e.target.value)} className="input-soft w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1">Address</label>
              <input value={form.address} onChange={e=>setField('address', e.target.value)} className="input-soft w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <textarea value={form.description} onChange={e=>setField('description', e.target.value)} className="input-soft w-full" rows={3} />
            </div>
            <div>
              <label className="block text-sm mb-1">Currency</label>
              <select value={form.currency} onChange={e=>setField('currency', e.target.value)} className="input-soft w-full">
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Timezone</label>
              <input value={form.timezone} onChange={e=>setField('timezone', e.target.value)} className="input-soft w-full" />
            </div>
          </div>
          <div className="mt-4">
            <button className="btn btn-primary">Save</button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Logo</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">LOGO</div>
              )}
            </div>
            <label className="btn btn-glass inline-flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setField('logo', reader.result)
                reader.readAsDataURL(file)
              }} />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {form.logo ? <img src={form.logo} alt="logo" /> : null}
              </div>
              <div>
                <div className="font-semibold">{form.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{form.email}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">{form.address}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">{form.phone}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">{form.description}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">Currency: {form.currency}</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">Timezone: {form.timezone}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanySettings