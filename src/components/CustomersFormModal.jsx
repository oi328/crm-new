import React, { useState, useEffect } from 'react'
import { FaTimes, FaSave, FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTag, FaStickyNote, FaGlobe } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../shared/context/ThemeProvider'
import SearchableSelect from './SearchableSelect'

const CustomersFormModal = ({ isOpen, onClose, onSave, initialData = null, isRTL }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [formData, setFormData] = useState({
    customerCode: '',
    name: '',
    phone: '',
    email: '',
    type: 'Individual',
    source: 'New',
    companyName: '',
    taxNumber: '',
    country: '',
    city: '',
    addressLine: '',
    assignedSalesRep: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        customerCode: initialData.customerCode || initialData.id || ''
      })
    } else {
      setFormData({
        customerCode: '',
        name: '',
        phone: '',
        email: '',
        type: 'Individual',
        source: 'New',
        companyName: '',
        taxNumber: '',
        country: '',
        city: '',
        addressLine: '',
        assignedSalesRep: '',
        notes: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = isRTL ? 'اسم العميل مطلوب' : 'Customer name is required'
    if (!formData.phone?.trim()) newErrors.phone = isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const dataToSave = {
        ...formData,
        id: formData.customerCode // Use customerCode as ID if editing/adding logic uses ID
      }
      onSave(dataToSave)
    }
  }

  // Options
  const typeOptions = [
    { value: 'Individual', label: isRTL ? 'فرد' : 'Individual' },
    { value: 'Company', label: isRTL ? 'شركة' : 'Company' }
  ]

  const sourceOptions = [
    { value: 'Lead', label: isRTL ? 'ليد (عميل محتمل)' : 'Lead' },
    { value: 'New', label: isRTL ? 'جديد' : 'New' }
  ]

  // Mock Rep Options - In real app, pass via props
  const repOptions = [
    { value: 'Ahmed', label: 'Ahmed' },
    { value: 'Sara', label: 'Sara' },
    { value: 'Ibrahim', label: 'Ibrahim' }
  ]

  const inputClass = `w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
      : 'bg-white border-gray-300 text-theme-text placeholder-gray-400'
  }`

  const labelClass = `block text-sm font-medium mb-1 text-theme-text`
  const errorClass = "text-xs text-red-500 mt-1"

  return (
    <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`card relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 text-theme-text`}>
            <FaUser className="text-blue-600" />
            {initialData 
              ? (isRTL ? 'تعديل بيانات العميل' : 'Edit Customer') 
              : (isRTL ? 'إضافة عميل جديد' : 'Add New Customer')}
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-theme-text hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{isRTL ? 'كود العميل' : 'Customer Code'}</label>
              <div className="relative">
                <FaTag className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={e => setFormData({...formData, customerCode: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={isRTL ? 'كود العميل' : 'Customer Code'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {isRTL ? 'اسم العميل' : 'Customer Name'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} ${errors.name ? 'border-red-500' : ''}`}
                  placeholder={isRTL ? 'الاسم بالكامل' : 'Full Name'}
                />
              </div>
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div>
              <label className={labelClass}>
                {isRTL ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+20..."
                  dir="ltr"
                />
              </div>
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <div className="relative">
                <FaEnvelope className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="example@domain.com"
                />
              </div>
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'النوع' : 'Type'}</label>
              <SearchableSelect
                options={typeOptions}
                value={formData.type}
                onChange={v => setFormData({...formData, type: v || 'Individual'})}
                placeholder={isRTL ? 'اختر النوع' : 'Select Type'}
                className="w-full"
              />
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'المصدر' : 'Source'}</label>
              <SearchableSelect
                options={sourceOptions}
                value={formData.source}
                onChange={v => setFormData({...formData, source: v || 'New'})}
                placeholder={isRTL ? 'اختر المصدر' : 'Select Source'}
                className="w-full"
              />
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'مسؤول المبيعات' : 'Sales Person'}</label>
              <SearchableSelect
                options={repOptions}
                value={formData.assignedSalesRep}
                onChange={v => setFormData({...formData, assignedSalesRep: v || ''})}
                placeholder={isRTL ? 'تعيين إلى...' : 'Assign to...'}
                className="w-full"
              />
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 2: Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{isRTL ? 'اسم الشركة' : 'Company Name'}</label>
              <div className="relative">
                <FaBuilding className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={isRTL ? 'اسم الشركة (اختياري)' : 'Company Name (Optional)'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{isRTL ? 'الرقم الضريبي' : 'Tax Number'}</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                className={inputClass}
                placeholder="TRN-..."
              />
            </div>
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 3: Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>{isRTL ? 'الدولة' : 'Country'}</label>
              <div className="relative">
                <FaGlobe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'}`}
                  placeholder={isRTL ? 'الدولة' : 'Country'}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>{isRTL ? 'المدينة' : 'City'}</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className={inputClass}
                placeholder={isRTL ? 'المدينة' : 'City'}
              />
            </div>


          </div>

          <div className={`h-px w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />

          {/* Section 4: Extra */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelClass}>{isRTL ? 'ملاحظات' : 'Notes'}</label>
              <div className="relative">
                <FaStickyNote className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-theme-text`} />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className={`${inputClass} ${isRTL ? 'pr-10' : 'pl-10'} min-h-[100px] py-3`}
                  placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}  rounded-b-2xl`}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-theme-text hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            className="btn bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2"
          >
            <FaSave />
            {isRTL ? 'حفظ البيانات' : 'Save Data'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomersFormModal