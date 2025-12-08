import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function Suppliers() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > الموردون/البائعون' : 'Inventory > Suppliers/Vendors',
    formTitleBasic: isArabic ? 'المعلومات الأساسية' : 'Basic Information',
    formTitleBusiness: isArabic ? 'المعلومات التجارية' : 'Business Information',
    formTitleAttachments: isArabic ? 'المرفقات' : 'Attachments',
    supplierName: isArabic ? 'اسم المورد' : 'Supplier Name',
    supplierCode: isArabic ? 'رمز المورد' : 'Supplier Code',
    companyName: isArabic ? 'اسم الشركة' : 'Company Name',
    contactPerson: isArabic ? 'الشخص المسؤول' : 'Contact Person',
    phone: isArabic ? 'رقم الهاتف' : 'Phone Number',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    website: isArabic ? 'الموقع الإلكتروني' : 'Website',
    address: isArabic ? 'العنوان' : 'Address',
    taxId: isArabic ? 'الرقم الضريبي' : 'Tax ID',
    countryCity: isArabic ? 'الدولة/المدينة' : 'Country/City',
    supplierType: isArabic ? 'نوع المورد' : 'Supplier Type',
    category: isArabic ? 'التصنيف' : 'Category',
    productLine: isArabic ? 'خط المنتج' : 'Product Line',
    paymentTerms: isArabic ? 'شروط الدفع' : 'Payment Terms',
    currency: isArabic ? 'العملة' : 'Currency',
    creditLimit: isArabic ? 'حد الائتمان' : 'Credit Limit',
    discountRate: isArabic ? 'معدل الخصم (%)' : 'Discount Rate (%)',
    deliveryTime: isArabic ? 'مدة التسليم (أيام)' : 'Delivery Time (days)',
    contractDoc: isArabic ? 'عقد المورد' : 'Contract Document',
    certificates: isArabic ? 'شهادات المورد' : 'Supplier Certificates',
    quotations: isArabic ? 'عروض الأسعار' : 'Quotations',
    previousBills: isArabic ? 'فواتير سابقة' : 'Previous Bills',
    save: isArabic ? 'حفظ المورد' : 'Save Supplier',
    listTitle: isArabic ? 'قائمة الموردين' : 'Suppliers List',
    empty: isArabic ? 'لا يوجد موردون بعد' : 'No suppliers yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    edit: isArabic ? 'تعديل' : 'Edit',
    delete: isArabic ? 'حذف' : 'Delete',
  }), [isArabic])

  // Static options to match current design approach
  const supplierTypeOptions = useMemo(() => (
    isArabic ? ['شركة', 'فرد', 'وكيل'] : ['Company', 'Individual', 'Agent']
  ), [isArabic])
  const categoryOptions = useMemo(() => (
    isArabic ? ['مواد خام', 'خدمات', 'أجهزة'] : ['Raw Materials', 'Services', 'Hardware']
  ), [isArabic])
  const paymentTermOptions = useMemo(() => (
    isArabic ? ['نقدًا', '30 يوم', '60 يوم'] : ['Cash', 'Net 30', 'Net 60']
  ), [isArabic])
  const currencyOptions = useMemo(() => (
    isArabic ? ['ريال', 'دولار', 'يورو'] : ['SAR', 'USD', 'EUR']
  ), [isArabic])
  const productLineOptions = useMemo(() => (
    isArabic ? ['الالكترونيات', 'الإنشاءات', 'الخدمات'] : ['Electronics', 'Construction', 'Services']
  ), [isArabic])

  const STORAGE_KEY = 'inventorySuppliers'

  const [form, setForm] = useState({
    supplierName: '',
    supplierCode: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    taxId: '',
    countryCity: '',
    supplierType: supplierTypeOptions[0] || '',
    category: categoryOptions[0] || '',
    productLine: productLineOptions[0] || '',
    paymentTerms: paymentTermOptions[0] || '',
    currency: currencyOptions[0] || '',
    creditLimit: '',
    discountRate: '',
    deliveryTime: '',
    attachments: {
      contractDoc: [],
      certificates: [],
      quotations: [],
      previousBills: []
    }
  })

  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setSuppliers(parsed)
      }
    } catch (e) { console.warn('Failed to load suppliers', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers)) } catch (e) {}
  }, [suppliers])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    const trimmedName = (form.supplierName || '').trim()
    if (!trimmedName) return

    const entry = {
      id: Date.now(),
      ...form,
      creditLimit: form.creditLimit ? Number(form.creditLimit) : 0,
      discountRate: form.discountRate ? Number(form.discountRate) : 0,
      deliveryTime: form.deliveryTime ? Number(form.deliveryTime) : 0,
    }
    setSuppliers(prev => [entry, ...prev])
    setForm({
      supplierName: '',
      supplierCode: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      taxId: '',
      countryCity: '',
      supplierType: supplierTypeOptions[0] || '',
      category: categoryOptions[0] || '',
      productLine: productLineOptions[0] || '',
      paymentTerms: paymentTermOptions[0] || '',
      currency: currencyOptions[0] || '',
      creditLimit: '',
      discountRate: '',
      deliveryTime: '',
      attachments: { contractDoc: [], certificates: [], quotations: [], previousBills: [] }
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  const onDelete = (id) => setSuppliers(prev => prev.filter(s => s.id !== id))

  const onEdit = (s) => {
    setForm({
      supplierName: s.supplierName || '',
      supplierCode: s.supplierCode || '',
      companyName: s.companyName || '',
      contactPerson: s.contactPerson || '',
      phone: s.phone || '',
      email: s.email || '',
      website: s.website || '',
      address: s.address || '',
      taxId: s.taxId || '',
      countryCity: s.countryCity || '',
      supplierType: s.supplierType || (supplierTypeOptions[0] || ''),
      category: s.category || (categoryOptions[0] || ''),
      productLine: s.productLine || (productLineOptions[0] || ''),
      paymentTerms: s.paymentTerms || (paymentTermOptions[0] || ''),
      currency: s.currency || (currencyOptions[0] || ''),
      creditLimit: s.creditLimit != null ? String(s.creditLimit) : '',
      discountRate: s.discountRate != null ? String(s.discountRate) : '',
      deliveryTime: s.deliveryTime != null ? String(s.deliveryTime) : '',
      attachments: {
        contractDoc: s.attachments?.contractDoc || [],
        certificates: s.attachments?.certificates || [],
        quotations: s.attachments?.quotations || [],
        previousBills: s.attachments?.previousBills || []
      }
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold">{labels.title}</h1>

        {/* Basic Information */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleBasic}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.supplierName}</label>
                <input name="supplierName" value={form.supplierName} onChange={onChange} placeholder={labels.supplierName} className="input" required />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.supplierCode}</label>
                <input name="supplierCode" value={form.supplierCode} onChange={onChange} placeholder={labels.supplierCode} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.companyName}</label>
                <input name="companyName" value={form.companyName} onChange={onChange} placeholder={labels.companyName} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.contactPerson}</label>
                <input name="contactPerson" value={form.contactPerson} onChange={onChange} placeholder={labels.contactPerson} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.phone}</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder={labels.phone} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.email}</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder={labels.email} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.website}</label>
                <input name="website" value={form.website} onChange={onChange} placeholder={labels.website} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.address}</label>
                <input name="address" value={form.address} onChange={onChange} placeholder={labels.address} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.taxId}</label>
                <input name="taxId" value={form.taxId} onChange={onChange} placeholder={labels.taxId} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.countryCity}</label>
                <input name="countryCity" value={form.countryCity} onChange={onChange} placeholder={labels.countryCity} className="input" />
              </div>
            </div>
          </div>

          {/* Business Information Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleBusiness}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.supplierType}</label>
                <select name="supplierType" value={form.supplierType} onChange={onChange} className="input">
                  {supplierTypeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.category}</label>
                <select name="category" value={form.category} onChange={onChange} className="input">
                  {categoryOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.productLine}</label>
                <select name="productLine" value={form.productLine} onChange={onChange} className="input">
                  {productLineOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.paymentTerms}</label>
                <select name="paymentTerms" value={form.paymentTerms} onChange={onChange} className="input">
                  {paymentTermOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.currency}</label>
                <select name="currency" value={form.currency} onChange={onChange} className="input">
                  {currencyOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.creditLimit}</label>
                <input type="number" name="creditLimit" value={form.creditLimit} onChange={onChange} placeholder={labels.creditLimit} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.discountRate}</label>
                <input type="number" name="discountRate" value={form.discountRate} onChange={onChange} placeholder={labels.discountRate} className="input" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.deliveryTime}</label>
                <input type="number" name="deliveryTime" value={form.deliveryTime} onChange={onChange} placeholder={labels.deliveryTime} className="input" min="0" step="1" />
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
            <h2 className="text-xl font-medium mb-4">{labels.formTitleAttachments}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">{labels.contractDoc}</label>
                <input type="file" multiple onChange={(e) => onFileChange('contractDoc', e.target.files)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.certificates}</label>
                <input type="file" multiple onChange={(e) => onFileChange('certificates', e.target.files)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.quotations}</label>
                <input type="file" multiple onChange={(e) => onFileChange('quotations', e.target.files)} className="input" />
              </div>
              <div>
                <label className="block text-sm mb-1">{labels.previousBills}</label>
                <input type="file" multiple onChange={(e) => onFileChange('previousBills', e.target.files)} className="input" />
              </div>
            </div>
          </div>

          {/* Save */}
          <div>
            <button type="submit" className="btn btn-primary">{labels.save}</button>
          </div>
        </form>

        {/* Suppliers List */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {suppliers.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[180px]">{labels.supplierName}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.companyName}</th>
                    <th className="text-start px-3 min-w-[120px]">{labels.supplierCode}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.contactPerson}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.phone}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.email}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.countryCity}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.supplierType}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.category}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.productLine}</th>
                    <th className="text-start px-3 min-w-[120px]">{labels.currency}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.creditLimit}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.discountRate}</th>
                    <th className="text-center px-3 min-w-[140px]">{labels.deliveryTime}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(s => (
                    <tr key={s.id}>
                      <td className="px-3"><span className="font-medium">{s.supplierName}</span></td>
                      <td className="px-3">{s.companyName}</td>
                      <td className="px-3">{s.supplierCode}</td>
                      <td className="px-3">{s.contactPerson}</td>
                      <td className="px-3">{s.phone}</td>
                      <td className="px-3">{s.email}</td>
                      <td className="px-3">{s.countryCity}</td>
                      <td className="px-3">{s.supplierType}</td>
                      <td className="px-3">{s.category}</td>
                      <td className="px-3">{s.productLine}</td>
                      <td className="px-3">{s.currency}</td>
                      <td className="px-3 text-center">{(s.creditLimit ?? 0).toFixed(2)}</td>
                      <td className="px-3 text-center">{(s.discountRate ?? 0).toFixed(2)}</td>
                      <td className="px-3 text-center">{s.deliveryTime ?? 0}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(s)}>{labels.edit}</button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(s.id)}>{labels.delete}</button>
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