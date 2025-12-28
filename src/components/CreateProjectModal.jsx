import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { 
  FaTimes, FaHome, FaList, FaImages, FaMapMarkedAlt, 
  FaFileContract, FaBullhorn, FaCheck, FaArrowRight, 
  FaArrowLeft, FaInfoCircle, FaCloudUploadAlt, FaLink, FaMapMarkerAlt,
  FaPlus, FaTrash, FaHeading, FaRulerCombined, FaAlignLeft, 
  FaTag, FaHandHoldingUsd, FaShieldAlt, FaPercentage, 
  FaCalendarAlt, FaKey, FaUser, FaEnvelope, FaPhone, FaClock, FaAddressCard,
  FaGlobe, FaExternalLinkAlt, FaCloudDownloadAlt, FaBuilding, FaCity
} from 'react-icons/fa'
import SearchableSelect from './SearchableSelect'

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Component to handle clicks
const MapPicker = ({ location, setLocation, setLocationUrl }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setLocation(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
      // Generate Google Maps URL
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
      setLocationUrl(googleMapsUrl)
    },
  })

  return location === null ? null : (
    <Marker position={location}></Marker>
  )
}

// --- Constants & Options ---
const STEPS = [
  { id: 1, label: 'Core Details', labelAr: 'التفاصيل الأساسية', icon: FaBuilding },
  { id: 2, label: 'Features', labelAr: 'مواصفات المشروع', icon: FaList },
  { id: 3, label: 'Media', labelAr: 'الوسائط', icon: FaImages },
  { id: 4, label: 'Location', labelAr: 'الموقع', icon: FaMapMarkedAlt },
  { id: 5, label: 'Financial', labelAr: 'المالية', icon: FaFileContract },
  { id: 6, label: 'CIL', labelAr: 'بيانات العميل', icon: FaAddressCard },
  { id: 7, label: 'Publish', labelAr: 'النشر', icon: FaExternalLinkAlt },
]

const PROJECT_CATEGORIES = ['Residential', 'Commercial', 'Administrative', 'Medical', 'Coastal', 'Mixed Use']
const DEVELOPERS = ['Palm Hills', 'Mountain View', 'Sodic', 'Emaar Misr', 'Ora Developers', 'City Edge', 'Tatweer Misr', 'Hyde Park']
const CITIES = ['New Cairo', 'Sheikh Zayed', 'New Capital', 'North Coast', 'Ain Sokhna', 'October City', 'Maadi']
const PROJECT_STATUS = ['Under Construction', 'Ready to Move', 'Launch Soon', 'Sold Out']
const AMENITIES = ['Club House', 'Gym', 'Spa', 'Kids Area', 'Commercial Area', 'Mosque', 'Swimming Pools', 'Security', 'Parking', 'Medical Center', 'School', 'University']

// --- Helper Components ---
const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <FaInfoCircle className="text-gray-400 hover:text-blue-500 transition-colors" size={14} />
    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
)

const FileUploader = ({ label, subLabel, files, onDrop, accept = "*", multiple = true }) => (
  <div className="border-2 border-dashed border-black dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative">
    <input 
      type="file" 
      multiple={multiple} 
      accept={accept}
      onChange={(e) => onDrop(Array.from(e.target.files || []))}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
        <FaCloudUploadAlt size={24} />
      </div>
      <h4 className="font-medium text-sm">{label}</h4>
      <p className="text-xs text-[var(--muted-text)]">{subLabel}</p>
    </div>
    {files && files.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2 justify-center pointer-events-none">
        {files.map((f, i) => (
          <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-[150px]">
            {typeof f === 'string' ? f.split('/').pop() : f.name}
          </div>
        ))}
      </div>
    )}
  </div>
)

// --- Main Component ---
export default function CreateProjectModal({ onClose, isRTL, onSave, mode = 'create', initialValues = null }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Core Details
    name: '',
    developer: '',
    category: '',
    status: 'Under Construction',
    deliveryDate: '',
    description: '',
    
    // Step 2: Features
    amenities: [],
    
    // Step 3: Media
    logo: [],
    mainImage: [],
    gallery: [],
    masterPlan: [],
    videoUrl: '',
    brochure: [],
    
    // Step 4: Location
    city: '',
    address: '',
    location: null,
    locationUrl: '',
    
    // Step 5: Financial
    minPrice: '',
    maxPrice: '',
    minSpace: '',
    maxSpace: '',
    currency: 'EGP',
    paymentPlans: [],
    
    // Step 6: CIL
    cilTo: '',
    cilSubject: '',
    cilContent: '',
    cilSignature: '',
    cilAttachments: [],
    
    // Step 7: Publish
    contactName: 'Current User',
    marketingPackage: 'standard'
  })

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        // Ensure arrays are arrays
        amenities: initialValues.amenities || [],
        paymentPlans: initialValues.paymentPlans || [],
        // Handle files - if string url, wrap in array or keep as is depending on uploader logic
        // But FileUploader expects array of File objects usually, or we can adapt it to show existing URLs
        logo: initialValues.logo ? [initialValues.logo] : [], 
        mainImage: initialValues.image ? [initialValues.image] : [],
        gallery: initialValues.galleryImages || [],
        masterPlan: initialValues.masterPlanImages || [],
        // Map other fields
        minPrice: initialValues.minPrice || '',
        maxPrice: initialValues.maxPrice || '',
        minSpace: initialValues.minSpace || '',
        maxSpace: initialValues.maxSpace || '',
        videoUrl: initialValues.videoUrls || '',
        // Map CIL if exists
        cilTo: initialValues.cil?.to || '',
        cilSubject: initialValues.cil?.subject || '',
        cilContent: initialValues.cil?.content || '',
        cilSignature: initialValues.cil?.signature || '',
        cilAttachments: initialValues.cil?.attachments || [],
      }))
    }
  }, [initialValues])

  const [errors, setErrors] = useState({})

  // Scroll to top
  useEffect(() => {
    const content = document.getElementById('wizard-content')
    if (content) content.scrollTop = 0
  }, [currentStep])

  // Validation
  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Project Name is required'
      if (!formData.developer) newErrors.developer = 'Developer is required'
      if (!formData.category) newErrors.category = 'Category is required'
    }
    
    if (step === 5) {
      if (!formData.minPrice) newErrors.minPrice = 'Min Price is required'
    }

    if (step === 6) {
      if (!formData.cilTo.trim()) newErrors.cilTo = 'To is required'
      if (!formData.cilSubject.trim()) newErrors.cilSubject = 'Subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFinish = () => {
    if (validateStep(currentStep)) {
      onSave && onSave(formData)
      onClose()
    }
  }

  // --- Payment Plan Helpers ---
  const addPaymentPlan = () => {
    setFormData(prev => ({
      ...prev,
      paymentPlans: [...prev.paymentPlans, { 
        downPayment: '', 
        years: '', 
        deliveryDate: '', 
        type: 'Equal Installments'
      }]
    }))
  }

  const removePaymentPlan = (index) => {
    setFormData(prev => ({
      ...prev,
      paymentPlans: prev.paymentPlans.filter((_, i) => i !== index)
    }))
  }

  const updatePaymentPlan = (index, field, value) => {
    const newPlans = [...formData.paymentPlans]
    newPlans[index][field] = value
    setFormData(prev => ({ ...prev, paymentPlans: newPlans }))
  }

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Project Name */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaHeading className="text-gray-400" />
          {isRTL ? 'اسم المشروع' : 'Project Name'}
          <span className="text-red-500">*</span>
        </label>
        <input 
          className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.name ? 'border-red-500' : ''}`}
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          placeholder={isRTL ? 'مثال: بالم هيلز القاهرة الجديدة' : 'e.g., Palm Hills New Cairo'}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Developer */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'المطور' : 'Developer'}</label>
          <SearchableSelect 
            options={DEVELOPERS} 
            value={formData.developer} 
            onChange={v => setFormData({...formData, developer: v})} 
            isRTL={isRTL}
            placeholder={isRTL ? 'اختر المطور' : 'Select Developer'}
          />
          {errors.developer && <p className="text-red-500 text-xs">{errors.developer}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'التصنيف' : 'Category'}</label>
          <SearchableSelect 
            options={PROJECT_CATEGORIES} 
            value={formData.category} 
            onChange={v => setFormData({...formData, category: v})} 
            isRTL={isRTL}
            placeholder={isRTL ? 'اختر التصنيف' : 'Select Category'}
          />
          {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'الحالة' : 'Status'}</label>
          <select 
            className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            {PROJECT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Delivery Date */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            {isRTL ? 'تاريخ التسليم' : 'Delivery Date'}
          </label>
          <input 
            type="date"
            className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
            value={formData.deliveryDate}
            onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
          />
        </div>
      </div>

      

      {/* Description */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaAlignLeft className="text-gray-400" />
          {isRTL ? 'وصف المشروع' : 'Project Description'}
        </label>
        <textarea 
          className="input dark:bg-gray-800 w-full min-h-[150px] font-sans border border-black dark:border-gray-700"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder={isRTL ? 'اكتب وصفاً شاملاً للمشروع...' : 'Write a comprehensive description...'}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{isRTL ? 'مرافق المشروع' : 'Project Amenities'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES.map(item => (
            <label key={item} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.amenities.includes(item)}
                onChange={e => {
                  if (e.target.checked) setFormData(prev => ({...prev, amenities: [...prev.amenities, item]}))
                  else setFormData(prev => ({...prev, amenities: prev.amenities.filter(i => i !== item)}))
                }}
                className="checkbox rounded text-blue-600"
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'شعار المشروع' : 'Project Logo'}</label>
          <FileUploader 
            label={isRTL ? 'تحميل الشعار' : 'Upload Logo'}
            subLabel="PNG, JPG"
            files={formData.logo}
            onDrop={(files) => setFormData(prev => ({...prev, logo: files}))}
            accept="image/*"
            multiple={false}
          />
        </div>

        {/* Main Image */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'الصورة الرئيسية' : 'Main Image'}</label>
          <FileUploader 
            label={isRTL ? 'تحميل الصورة' : 'Upload Cover'}
            subLabel="High Quality"
            files={formData.mainImage}
            onDrop={(files) => setFormData(prev => ({...prev, mainImage: files}))}
            accept="image/*"
            multiple={false}
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <label className="label">{isRTL ? 'معرض الصور' : 'Gallery'}</label>
        <FileUploader 
          label={isRTL ? 'صور المشروع' : 'Project Photos'}
          subLabel={isRTL ? 'اسحب وأفلت الصور' : 'Drag & Drop Photos'}
          files={formData.gallery}
          onDrop={(files) => setFormData(prev => ({...prev, gallery: [...prev.gallery, ...files]}))}
          accept="image/*"
        />
      </div>

      {/* Master Plan */}
      <div className="space-y-2">
        <label className="label">{isRTL ? 'المخطط العام' : 'Master Plan'}</label>
        <FileUploader 
          label={isRTL ? 'تحميل المخطط' : 'Upload Master Plan'}
          subLabel="Image or PDF"
          files={formData.masterPlan}
          onDrop={(files) => setFormData(prev => ({...prev, masterPlan: [...prev.masterPlan, ...files]}))}
          accept="image/*,.pdf"
        />
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaLink className="text-gray-400" />
          {isRTL ? 'رابط الفيديو' : 'Video URL'}
        </label>
        <input 
          className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
          value={formData.videoUrl}
          onChange={e => setFormData({...formData, videoUrl: e.target.value})}
          placeholder="YouTube / Vimeo link"
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaCity className="text-gray-400" />
            {isRTL ? 'المدينة' : 'City'}
          </label>
          <SearchableSelect 
            options={CITIES} 
            value={formData.city} 
            onChange={v => setFormData({...formData, city: v})} 
            isRTL={isRTL}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            {isRTL ? 'العنوان' : 'Address'}
          </label>
          <input 
            className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            placeholder={isRTL ? 'العنوان بالتفصيل...' : 'Detailed address...'}
          />
        </div>
      </div>

      {/* Map */}
      <div className="space-y-2">
        <label className="label">{isRTL ? 'تحديد الموقع على الخريطة' : 'Pin Location on Map'}</label>
        <div className="h-[300px] rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 relative z-0">
          <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapPicker 
              location={formData.location} 
              setLocation={(loc) => setFormData({...formData, location: loc})}
              setLocationUrl={(url) => setFormData({...formData, locationUrl: url})}
            />
          </MapContainer>
        </div>
        {formData.locationUrl && (
           <div className="text-xs text-blue-500 mt-1 truncate">{formData.locationUrl}</div>
        )}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FaTag className="text-blue-500" />
          {isRTL ? 'نطاق السعر' : 'Price Range'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label text-xs">{isRTL ? 'من' : 'From'}</label>
            <input 
              type="number"
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.minPrice ? 'border-red-500' : ''}`}
              value={formData.minPrice}
              onChange={e => setFormData({...formData, minPrice: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="label text-xs">{isRTL ? 'إلى' : 'To'}</label>
            <input 
              type="number"
              className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
              value={formData.maxPrice}
              onChange={e => setFormData({...formData, maxPrice: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Space Range */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FaRulerCombined className="text-blue-500" />
          {isRTL ? 'نطاق المساحة (متر مربع)' : 'Space Range (sqm)'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label text-xs">{isRTL ? 'من' : 'From'}</label>
            <input 
              type="number"
              className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
              value={formData.minSpace}
              onChange={e => setFormData({...formData, minSpace: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="label text-xs">{isRTL ? 'إلى' : 'To'}</label>
            <input 
              type="number"
              className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
              value={formData.maxSpace}
              onChange={e => setFormData({...formData, maxSpace: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Payment Plans */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
           <h3 className="font-semibold flex items-center gap-2">
             <FaHandHoldingUsd className="text-blue-500" />
             {isRTL ? 'خطط الدفع' : 'Payment Plans'}
           </h3>
           <button onClick={addPaymentPlan} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
             <FaPlus size={10} /> {isRTL ? 'إضافة خطة' : 'Add Plan'}
           </button>
        </div>
        
        {formData.paymentPlans.map((plan, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
            <button onClick={() => removePaymentPlan(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <FaTrash size={12} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{isRTL ? 'المقدم (%)' : 'Down Payment (%)'}</label>
                <input 
                  type="number" 
                  className="input py-1 px-2 text-sm w-full border border-black dark:border-gray-700"
                  value={plan.downPayment}
                  onChange={e => updatePaymentPlan(idx, 'downPayment', e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{isRTL ? 'عدد السنوات' : 'Years'}</label>
                <input 
                  type="number" 
                  className="input py-1 px-2 text-sm w-full border border-black dark:border-gray-700"
                  value={plan.years}
                  onChange={e => updatePaymentPlan(idx, 'years', e.target.value)}
                  placeholder="8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted-text)]">{isRTL ? 'الاستلام' : 'Delivery'}</label>
                <input 
                  type="text" 
                  className="input py-1 px-2 text-sm w-full border border-black dark:border-gray-700"
                  value={plan.deliveryDate}
                  onChange={e => updatePaymentPlan(idx, 'deliveryDate', e.target.value)}
                  placeholder="2027"
                />
              </div>
            </div>
          </div>
        ))}
        {formData.paymentPlans.length === 0 && (
          <p className="text-sm text-[var(--muted-text)] text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            {isRTL ? 'لا توجد خطط دفع مضافة' : 'No payment plans added'}
          </p>
        )}
      </div>
    </div>
  )

  const renderStepCIL = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl mb-4">
         <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <FaAddressCard />
            {isRTL ? 'خطاب اهتمام العميل (CIL)' : 'Client Interest Letter (CIL)'}
         </h3>
         <p className="text-xs text-blue-600 dark:text-blue-300">
            {isRTL ? 'قم بتعبئة بيانات الخطاب لإرساله.' : 'Fill in the letter details to send it.'}
         </p>
      </div>

      <div className="space-y-4">
        {/* To */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaUser className="text-gray-400" />
            {isRTL ? 'إلى' : 'To'}
            <span className="text-red-500">*</span>
          </label>
          <input 
            className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.cilTo ? 'border-red-500' : ''}`}
            value={formData.cilTo}
            onChange={e => setFormData({...formData, cilTo: e.target.value})}
            placeholder={isRTL ? 'اسم المستقبل' : 'Recipient Name'}
          />
          {errors.cilTo && <p className="text-red-500 text-xs">{errors.cilTo}</p>}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaTag className="text-gray-400" />
            {isRTL ? 'الموضوع' : 'Subject'}
            <span className="text-red-500">*</span>
          </label>
          <input 
            className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.cilSubject ? 'border-red-500' : ''}`}
            value={formData.cilSubject}
            onChange={e => setFormData({...formData, cilSubject: e.target.value})}
            placeholder={isRTL ? 'موضوع الخطاب' : 'Letter Subject'}
          />
          {errors.cilSubject && <p className="text-red-500 text-xs">{errors.cilSubject}</p>}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaAlignLeft className="text-gray-400" />
            {isRTL ? 'المحتوى' : 'Content'}
          </label>
          <textarea 
            className="input dark:bg-gray-800 w-full min-h-[150px] font-sans border border-black dark:border-gray-700"
            value={formData.cilContent}
            onChange={e => setFormData({...formData, cilContent: e.target.value})}
            placeholder={isRTL ? 'اكتب محتوى الخطاب هنا...' : 'Write letter content here...'}
          />
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaFileContract className="text-gray-400" />
            {isRTL ? 'التوقيع' : 'Signature'}
          </label>
          <input 
            className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
            value={formData.cilSignature}
            onChange={e => setFormData({...formData, cilSignature: e.target.value})}
            placeholder={isRTL ? 'توقيعك' : 'Your Signature'}
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <FaCloudUploadAlt className="text-gray-400" />
            {isRTL ? 'المرفقات' : 'Attachments'}
          </label>
          <FileUploader 
            label={isRTL ? 'رفع مرفقات' : 'Upload Attachments'}
            subLabel="PDF, JPG, PNG"
            files={formData.cilAttachments}
            onDrop={(files) => setFormData(prev => ({...prev, cilAttachments: [...prev.cilAttachments, ...files]}))}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
          <FaCheck size={40} />
        </div>
        <h3 className="text-2xl font-bold">{isRTL ? 'المشروع جاهز للنشر!' : 'Project Ready to Publish!'}</h3>
        <p className="text-[var(--muted-text)] max-w-md">
          {isRTL ? 'تم إدخال جميع البيانات المطلوبة. يمكنك الآن نشر المشروع ليكون متاحاً للعملاء.' : 'All required details have been entered. You can now publish the project to make it available to clients.'}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-4">{isRTL ? 'ملخص المشروع' : 'Project Summary'}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
             <span className="block text-[var(--muted-text)] text-xs">{isRTL ? 'الاسم' : 'Name'}</span>
             <span className="font-medium">{formData.name || '—'}</span>
          </div>
          <div>
             <span className="block text-[var(--muted-text)] text-xs">{isRTL ? 'المطور' : 'Developer'}</span>
             <span className="font-medium">{formData.developer || '—'}</span>
          </div>
          <div>
             <span className="block text-[var(--muted-text)] text-xs">{isRTL ? 'الحالة' : 'Status'}</span>
             <span className="font-medium">{formData.status || '—'}</span>
          </div>
          <div>
             <span className="block text-[var(--muted-text)] text-xs">{isRTL ? 'السعر يبدأ من' : 'Min Price'}</span>
             <span className="font-medium">{formData.minPrice || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Shell */}
      <div 
        className="relative z-[210] bg-white dark:!bg-slate-950 rounded-2xl w-[900px] max-w-full h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
        style={{ background: 'var(--panel-bg)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        
        {/* Header & Progress Bar */}
        <div className="bg-blue-50 dark:!bg-slate-900 border-b border-gray-200 dark:!border-slate-700 pt-1 px-2 pb-5 md:pt-2 md:px-3 md:pb-6"
                  style={{ background: 'var(--panel-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-4">
              {mode === 'edit' 
                ? (isRTL ? 'تعديل المشروع' : 'Edit Project')
                : (isRTL ? 'إضافة مشروع جديد' : 'Add Project')
              }
                    </h2>
                    <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-red-500"
          >
            <FaTimes size={20} />
          </button>
                  </div>
        
                  {/* Stepper */}
                  <div className="flex items-center justify-between relative px-2 md:px-8">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full" />
                    <div 
                      className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    
                    {STEPS.map((step) => {
                      const isActive = step.id === currentStep
                      const isCompleted = step.id < currentStep
                      return (
                        <div key={step.id} className="flex flex-col items-center gap-1 relative group cursor-pointer" onClick={() => step.id < currentStep && setCurrentStep(step.id)}>
                          <div 
                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                              isActive 
                                ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30' 
                                : isCompleted 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : ' dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <FaCheck size={8} /> : <step.icon size={10} />}
                          </div>
                          <span className={`absolute top-full mt-0.5 text-[9px] font-medium whitespace-nowrap transition-colors duration-300 ${
                            isActive ? 'text-blue-600' : 'text-gray-400'
                          } hidden md:block`}>
                            {isRTL ? step.labelAr : step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
        </div>

        {/* Content Area */}
        <div id="wizard-content" className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStepCIL()}
          {currentStep === 7 && renderStep7()}
        </div>

        {/* Footer Actions */}
        <div
                  className="p-2 dark:bg-slate-900/70 backdrop-blur-md border-t border-blue-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <button 
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`btn btn-sm bg-gray-500 hover:bg-gray-600 text-white border-none px-3 py-1 text-xs flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
                    {isRTL ? <FaArrowRight /> : <FaArrowLeft />}
                    {isRTL ? 'السابق' : 'Back'}
                  </button>
        
                  <div className="text-xs text-[var(--muted-text)] font-medium">
                    {isRTL ? `خطوة ${currentStep} من ${STEPS.length}` : `Step ${currentStep} of ${STEPS.length}`}
                  </div>
        
                  <button 
                  onClick={currentStep === STEPS.length ? handleFinish : handleNext}
                  className={`btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none font-medium flex items-center gap-2`}
                >
                  {currentStep === STEPS.length ? (
                    <>
                      <FaCheck /> {isRTL ? 'نشر الإعلان' : 'Publish Listing'}
                    </>
                  ) : (
                    <>
                      {isRTL ? 'التالي' : 'Next'} {isRTL ? <FaArrowLeft /> : <FaArrowRight />}
                    </>
                  )}
                </button>
                </div>
      </div>
    </div>
  )
}
