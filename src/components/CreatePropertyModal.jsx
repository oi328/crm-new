import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function CreatePropertyModal({ onClose, isRTL, onSave }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState({
    name: '', city: '', developer: '', status: 'Available', units: '', area: '', price: '', description: '',
    gallery: [], layout: [], masterPlan: [], pdfs: [], threed: [], videos: [], mapUrl: '',
    mainImageFile: null, logoFile: null
  })

  const required = ['name','city','developer','status']
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    required.forEach(k => { if (!String(form[k]||'').trim()) e[k] = 'Required' })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleDrop = (key, files) => {
    setForm(v => ({...v, [key]: [...v[key], ...Array.from(files||[])]}))
  }

  const save = () => {
    if (!validate()) return
    onSave && onSave(form)
    onClose()
  }

  const TabBtn = ({ id, label }) => (
    <button className={`px-3 py-2 rounded-md border ${activeTab===id ? 'bg-blue-600 text-white' : ''}`} onClick={()=>setActiveTab(id)}>{label}</button>
  )

  const DropZone = ({ label, keyName }) => (
    <div className="border-2 border-dashed rounded-xl p-4 text-sm"
         onDragOver={(e)=>{e.preventDefault()}}
         onDrop={(e)=>{e.preventDefault(); handleDrop(keyName, e.dataTransfer.files)}}>
      <div className="text-[var(--muted-text)] mb-2">{label}</div>
      <input type="file" multiple onChange={(e)=>handleDrop(keyName, e.target.files)} />
      <div className="mt-2 text-xs text-[var(--muted-text)]">{form[keyName]?.length || 0} files</div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 glass-panel rounded-xl p-4 w-[1000px] max-w-[95vw]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{isRTL ? 'إنشاء عقار' : 'Create Property'}</h2>
          <button className="btn btn-glass" onClick={onClose}><FaTimes /></button>
        </div>

        <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TabBtn id="basic" label={isRTL ? 'معلومات أساسية' : 'Basic Info'} />
          <TabBtn id="more" label={isRTL ? 'معلومات إضافية' : 'More Info'} />
          <TabBtn id="gallery" label={isRTL ? 'المعرض' : 'Gallery'} />
          <TabBtn id="layout" label={isRTL ? 'المخطط' : 'Layout'} />
          <TabBtn id="master" label={isRTL ? 'المخطط العام' : 'Master Plan'} />
          <TabBtn id="pdf" label={isRTL ? 'PDF' : 'PDF'} />
          <TabBtn id="3d" label={isRTL ? '3D' : '3D'} />
          <TabBtn id="video" label={isRTL ? 'فيديو' : 'Video'} />
          <TabBtn id="map" label={isRTL ? 'خريطة' : 'Map'} />
        </div>

        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['name','city','developer','status','units','area','price'].map((k)=>(
              <div key={k}>
                <label className="label capitalize">{k}</label>
                <input className="input w-full" value={form[k]||''} onChange={(e)=>setForm(v=>({...v,[k]: e.target.value}))} />
                {errors[k] && <div className="text-red-500 text-xs mt-1">{isRTL ? 'حقل مطلوب' : 'Required field'}</div>}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label">{isRTL ? 'الوصف' : 'Description'}</label>
              <textarea className="input w-full" rows={3} value={form.description||''} onChange={(e)=>setForm(v=>({...v, description: e.target.value}))} />
            </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Logo URL</label>
              <input className="input w-full" value={form.logo||''} onChange={(e)=>setForm(v=>({...v, logo: e.target.value}))} />
              <label className="label mt-2">{isRTL ? 'رفع اللوجو' : 'Upload Logo'}</label>
              <input type="file" accept="image/*" onChange={(e)=>setForm(v=>({...v, logoFile: e.target.files?.[0] || null}))} />
              {(form.logoFile || form.logo) && (
                <div className="mt-2">
                  <img src={form.logoFile ? URL.createObjectURL(form.logoFile) : form.logo} alt="logo preview" className="h-16 w-auto object-contain rounded-md border" />
                </div>
              )}
            </div>
            <div>
              <label className="label">Main Image URL</label>
              <input className="input w-full" value={form.mainImage||''} onChange={(e)=>setForm(v=>({...v, mainImage: e.target.value}))} />
              <label className="label mt-2">{isRTL ? 'رفع الصورة الرئيسية' : 'Upload Main Image'}</label>
              <input type="file" accept="image/*" onChange={(e)=>setForm(v=>({...v, mainImageFile: e.target.files?.[0] || null}))} />
              {(form.mainImageFile || form.mainImage) && (
                <div className="mt-2">
                  <img src={form.mainImageFile ? URL.createObjectURL(form.mainImageFile) : form.mainImage} alt="main preview" className="h-28 w-full object-cover rounded-md border" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && <DropZone label={isRTL ? 'صور المعرض' : 'Gallery Images'} keyName="gallery" />}
        {activeTab === 'layout' && <DropZone label={isRTL ? 'صور المخطط' : 'Layout Images'} keyName="layout" />}
        {activeTab === 'master' && <DropZone label={isRTL ? 'صور المخطط العام' : 'Master Plan Images'} keyName="masterPlan" />}
        {activeTab === 'pdf' && <DropZone label={isRTL ? 'ملفات PDF' : 'PDF Files'} keyName="pdfs" />}
        {activeTab === '3d' && <DropZone label={isRTL ? 'ملفات ثلاثية الأبعاد' : '3D Files'} keyName="threed" />}
        {activeTab === 'video' && <DropZone label={isRTL ? 'ملفات الفيديو' : 'Video Files'} keyName="videos" />}
        {activeTab === 'map' && (
          <div>
            <label className="label">Map URL</label>
            <input className="input w-full" value={form.mapUrl||''} onChange={(e)=>setForm(v=>({...v, mapUrl: e.target.value}))} />
          </div>
        )}

        <div className={`mt-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn btn-primary" onClick={save}>{isRTL ? 'حفظ' : 'Save'}</button>
          <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
        </div>
      </div>
    </div>
  )
}