import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function Warehouse() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > المستودعات' : 'Inventory > Warehouse',
    save: isArabic ? 'حفظ المستودع' : 'Save Warehouse',
    listTitle: isArabic ? 'قائمة المستودعات' : 'Warehouses List',
    empty: isArabic ? 'لا توجد مستودعات بعد' : 'No warehouses yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    edit: isArabic ? 'تعديل' : 'Edit',
    delete: isArabic ? 'حذف' : 'Delete',

    formTitleBasic: isArabic ? '1- المعلومات الأساسية' : '1- Basic Information',
    warehouseName: isArabic ? 'اسم المستودع' : 'Warehouse Name',
    warehouseCode: isArabic ? 'رمز المستودع' : 'Warehouse Code',
    warehouseType: isArabic ? 'نوع المستودع' : 'Warehouse Type',
    status: isArabic ? 'الحالة' : 'Status',
    manager: isArabic ? 'المدير/الشخص المسؤول' : 'Manager/Responsible Person',
    contactNumber: isArabic ? 'رقم التواصل' : 'Contact Number',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    address: isArabic ? 'العنوان' : 'Address',
    city: isArabic ? 'المدينة' : 'City',

    formTitleOperational: isArabic ? '2- التفاصيل التشغيلية' : '2- Operational Details',
    storageCapacity: isArabic ? 'سعة التخزين' : 'Storage Capacity',
    sections: isArabic ? 'الأقسام' : 'Sections',
    allowedUsers: isArabic ? 'المستخدمون المسموح لهم' : 'Allowed Users',
    temperatureControlled: isArabic ? 'تحكم حراري' : 'Temperature Controlled',
    defaultSupplier: isArabic ? 'المورد الافتراضي' : 'Default Supplier',
    operatingHours: isArabic ? 'ساعات التشغيل' : 'Operating Hours',

    formTitleStock: isArabic ? '3- المخزون والجرد' : '3- Stock & Inventory',
    currentStockValue: isArabic ? 'قيمة المخزون الحالية' : 'Current Stock Value',
    minThreshold: isArabic ? 'الحد الأدنى' : 'Min Threshold',
    maxThreshold: isArabic ? 'الحد الأقصى' : 'Max Threshold',
    nextStockAudit: isArabic ? 'الجرد القادم' : 'Next Stock Audit',
    totalSkusStored: isArabic ? 'إجمالي الأكواد المخزنة' : 'Total SKUs Stored',
    lastStockAudit: isArabic ? 'آخر جرد' : 'Last Stock Audit',

    formTitleAttachments: isArabic ? '4- المرفقات' : '4- Attachments',
    validityCertificates: isArabic ? 'شهادات الصلاحية' : 'Validity Certificates',
    maintenanceReports: isArabic ? 'تقارير الصيانة الدورية' : 'Periodic Maintenance Reports',
    note: isArabic ? 'ملاحظة' : 'Note',
  }), [isArabic])

  const typeOptions = useMemo(() => (
    isArabic ? ['مركزي', 'إقليمي', 'تبريد'] : ['Central', 'Regional', 'Cold Storage']
  ), [isArabic])

  const statusOptions = useMemo(() => (
    isArabic ? ['نشط', 'متوقف'] : ['Active', 'Inactive']
  ), [isArabic])

  const STORAGE_KEY = 'inventoryWarehouses'

  const [form, setForm] = useState({
    warehouseName: '',
    warehouseCode: '',
    warehouseType: typeOptions[0] || '',
    status: statusOptions[0] || '',
    manager: '',
    contactNumber: '',
    email: '',
    address: '',
    city: '',
    storageCapacity: '',
    sections: '',
    allowedUsers: '',
    temperatureControlled: false,
    defaultSupplier: '',
    operatingHours: '',
    currentStockValue: '',
    minThreshold: '',
    maxThreshold: '',
    nextStockAudit: '',
    totalSkusStored: '',
    lastStockAudit: '',
    attachments: { validityCertificates: [], maintenanceReports: [] },
    note: ''
  })

  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setWarehouses(parsed)
      }
    } catch (e) { console.warn('Failed to load warehouses', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(warehouses)) } catch (e) {}
  }, [warehouses])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const onFileChange = (key, fileList) => {
    const names = Array.from(fileList || []).map(f => f.name)
    setForm(prev => ({
      ...prev,
      attachments: { ...prev.attachments, [key]: names }
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const trimmedName = (form.warehouseName || '').trim()
    if (!trimmedName) return

    const entry = {
      id: Date.now(),
      ...form,
      storageCapacity: form.storageCapacity ? Number(form.storageCapacity) : 0,
      currentStockValue: form.currentStockValue ? Number(form.currentStockValue) : 0,
      minThreshold: form.minThreshold ? Number(form.minThreshold) : 0,
      maxThreshold: form.maxThreshold ? Number(form.maxThreshold) : 0,
      totalSkusStored: form.totalSkusStored ? Number(form.totalSkusStored) : 0,
    }
    setWarehouses(prev => [entry, ...prev])
    setForm({
      warehouseName: '',
      warehouseCode: '',
      warehouseType: typeOptions[0] || '',
      status: statusOptions[0] || '',
      manager: '',
      contactNumber: '',
      email: '',
      address: '',
      city: '',
      storageCapacity: '',
      sections: '',
      allowedUsers: '',
      temperatureControlled: false,
      defaultSupplier: '',
      operatingHours: '',
      currentStockValue: '',
      minThreshold: '',
      maxThreshold: '',
      nextStockAudit: '',
      totalSkusStored: '',
      lastStockAudit: '',
      attachments: { validityCertificates: [], maintenanceReports: [] },
      note: ''
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  const onDelete = (id) => setWarehouses(prev => prev.filter(s => s.id !== id))

  const onEdit = (w) => {
    setForm({
      warehouseName: w.warehouseName || '',
      warehouseCode: w.warehouseCode || '',
      warehouseType: w.warehouseType || (typeOptions[0] || ''),
      status: w.status || (statusOptions[0] || ''),
      manager: w.manager || '',
      contactNumber: w.contactNumber || '',
      email: w.email || '',
      address: w.address || '',
      city: w.city || '',
      storageCapacity: w.storageCapacity != null ? String(w.storageCapacity) : '',
      sections: w.sections || '',
      allowedUsers: w.allowedUsers || '',
      temperatureControlled: Boolean(w.temperatureControlled),
      defaultSupplier: w.defaultSupplier || '',
      operatingHours: w.operatingHours || '',
      currentStockValue: w.currentStockValue != null ? String(w.currentStockValue) : '',
      minThreshold: w.minThreshold != null ? String(w.minThreshold) : '',
      maxThreshold: w.maxThreshold != null ? String(w.maxThreshold) : '',
      nextStockAudit: w.nextStockAudit || '',
      totalSkusStored: w.totalSkusStored != null ? String(w.totalSkusStored) : '',
      lastStockAudit: w.lastStockAudit || '',
      attachments: {
        validityCertificates: w.attachments?.validityCertificates || [],
        maintenanceReports: w.attachments?.maintenanceReports || [],
      },
      note: w.note || ''
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold">{labels.title}</h1>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleBasic}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.warehouseName}</label>
                <input name="warehouseName" value={form.warehouseName} onChange={onChange} placeholder={labels.warehouseName} className="input" required />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.warehouseCode}</label>
                <input name="warehouseCode" value={form.warehouseCode} onChange={onChange} placeholder={labels.warehouseCode} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.warehouseType}</label>
                <select name="warehouseType" value={form.warehouseType} onChange={onChange} className="input">
                  {typeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.status}</label>
                <select name="status" value={form.status} onChange={onChange} className="input">
                  {statusOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.manager}</label>
                <input name="manager" value={form.manager} onChange={onChange} placeholder={labels.manager} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.contactNumber}</label>
                <input name="contactNumber" value={form.contactNumber} onChange={onChange} placeholder={labels.contactNumber} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.email}</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder={labels.email} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.address}</label>
                <input name="address" value={form.address} onChange={onChange} placeholder={labels.address} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.city}</label>
                <input name="city" value={form.city} onChange={onChange} placeholder={labels.city} className="input" />
              </div>
            </div>
          </div>

          {/* Operational Details Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleOperational}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.storageCapacity}</label>
                <input type="number" name="storageCapacity" value={form.storageCapacity} onChange={onChange} placeholder={labels.storageCapacity} className="input" min="0" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.sections}</label>
                <input name="sections" value={form.sections} onChange={onChange} placeholder={labels.sections} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.allowedUsers}</label>
                <input name="allowedUsers" value={form.allowedUsers} onChange={onChange} placeholder={labels.allowedUsers} className="input" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="temperatureControlled" name="temperatureControlled" checked={form.temperatureControlled} onChange={onChange} />
                <label htmlFor="temperatureControlled" className="text-sm">{labels.temperatureControlled}</label>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.defaultSupplier}</label>
                <input name="defaultSupplier" value={form.defaultSupplier} onChange={onChange} placeholder={labels.defaultSupplier} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.operatingHours}</label>
                <input name="operatingHours" value={form.operatingHours} onChange={onChange} placeholder={labels.operatingHours} className="input" />
              </div>
            </div>
          </div>

          {/* Stock & Inventory Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleStock}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.currentStockValue}</label>
                <input type="number" name="currentStockValue" value={form.currentStockValue} onChange={onChange} placeholder={labels.currentStockValue} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.totalSkusStored}</label>
                <input type="number" name="totalSkusStored" value={form.totalSkusStored} onChange={onChange} placeholder={labels.totalSkusStored} className="input" min="0" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.minThreshold}</label>
                <input type="number" name="minThreshold" value={form.minThreshold} onChange={onChange} placeholder={labels.minThreshold} className="input" min="0" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.maxThreshold}</label>
                <input type="number" name="maxThreshold" value={form.maxThreshold} onChange={onChange} placeholder={labels.maxThreshold} className="input" min="0" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.nextStockAudit}</label>
                <input type="date" name="nextStockAudit" value={form.nextStockAudit} onChange={onChange} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.lastStockAudit}</label>
                <input type="date" name="lastStockAudit" value={form.lastStockAudit} onChange={onChange} className="input" />
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleAttachments}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.validityCertificates}</label>
                <input type="file" multiple onChange={(e) => onFileChange('validityCertificates', e.target.files)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.maintenanceReports}</label>
                <input type="file" multiple onChange={(e) => onFileChange('maintenanceReports', e.target.files)} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">{labels.note}</label>
                <textarea name="note" value={form.note} onChange={onChange} placeholder={labels.note} className="input h-24" />
              </div>
            </div>
          </div>

          {/* Spacer above Save */}
          <div className="h-6"></div>
          {/* Save */}
          <div className="flex justify-center">
            <button type="submit" className="btn bg-white text-blue-600 border border-blue-600 hover:bg-blue-50">{labels.save}</button>
          </div>
          {/* Spacer below Save */}
          <div className="h-6"></div>
        </form>

        {/* Warehouses List */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {warehouses.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start">{labels.warehouseName}</th>
                    <th className="text-start">{labels.warehouseCode}</th>
                    <th className="text-start">{labels.city}</th>
                    <th className="text-start">{labels.status}</th>
                    <th className="text-start">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map(w => (
                    <tr key={w.id}>
                      <td>{w.warehouseName}</td>
                      <td>{w.warehouseCode}</td>
                      <td>{w.city}</td>
                      <td>{w.status}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button type="button" className="btn btn-xs" onClick={() => onEdit(w)}>{labels.edit}</button>
                          <button type="button" className="btn btn-xs btn-danger" onClick={() => onDelete(w.id)}>{labels.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}