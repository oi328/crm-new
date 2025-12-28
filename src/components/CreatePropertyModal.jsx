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
  FaGlobe, FaExternalLinkAlt, FaCloudDownloadAlt, FaBuilding
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
  { id: 1, label: 'Core Details', labelAr: 'التفاصيل الأساسية', icon: FaHome },
  { id: 2, label: 'Features', labelAr: 'مواصفات العقار', icon: FaList },
  { id: 3, label: 'Media', labelAr: 'الوسائط', icon: FaImages },
  { id: 4, label: 'Location', labelAr: 'الموقع', icon: FaMapMarkedAlt },
  { id: 5, label: 'Financial', labelAr: 'المالية', icon: FaFileContract },
  { id: 6, label: 'CIL', labelAr: 'بيانات العميل', icon: FaAddressCard },
  { id: 7, label: 'Publish & Marketing', labelAr: 'النشر والتوزيع', icon: FaExternalLinkAlt },
]

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Office', 'Retail', 'Warehouse', 'Land']
const PROJECTS = [
  'Palm Hills',
  'Mountain View',
  'Hyde Park',
  'Mivida',
  'Madinaty',
  'Rehab City',
  'The Waterway',
  'Zed Towers',
  'Badya',
  'O West',
  'Cairo Festival City',
  'Uptown Cairo',
  'Marassi',
  'Hacienda Bay',
  'Sodic East'
]
const PURPOSES = ['For Sale', 'For Rent']
const BEDROOMS = ['Studio', '1', '2', '3', '4', '5', '6', '7+']
const BATHROOMS = ['1', '2', '3', '4', '5', '6+']
const AMENITIES_INDOOR = ['Built-in Wardrobes', 'Central A/C', "Maid's Room", 'Kitchen Appliances', 'Balcony', 'Private Garden', 'Private Pool', 'Walk-in Closet']
const AMENITIES_BUILDING = ['Shared Pool', 'Shared Gym', 'Security', 'Covered Parking', 'Concierge', 'Pets Allowed', "Children's Play Area", 'Barbecue Area']
const PAYMENT_TERMS = ['Cash', 'Bank Finance', 'Installments', 'Cheques']
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
            {f.name}
          </div>
        ))}
      </div>
    )}
  </div>
)

const ButtonGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === opt 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-700 text-[var(--muted-text)] hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
)

// --- Main Wizard Component ---

export default function CreatePropertyModal({ onClose, isRTL, onSave, isEdit, buildings = [], owners = [], initialData = null }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    purpose: 'For Sale',
    propertyType: 'Apartment',
    project: '',
    adTitle: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'm²',
    // Step 2
    amenities: [],
    description: '',
    // Step 3
    images: [],
    videoUrl: '',
    virtualTourUrl: '',
    floorPlans: [],
    // Step 4
    address: '',
    locationUrl: '',
    location: null, // Would be coords
    nearby: [],
    // Step 5
    price: '',
    currency: 'EGP',
    cashDiscount: '',
    installmentPlans: [],
    serviceCharges: '',
    maintenanceDeposit: '',
    documents: [],
    // Step 6 (CIL)
    cilTo: '',
    cilSubject: '',
    cilContent: '',
    cilSignature: '',
    cilAttachments: [],
    // Step 7
    contactName: 'Current User',
    contactEmail: 'user@example.com',
    contactPhone: '+20 123 456 7890',
    status: 'Draft',
    marketingPackage: 'standard'
  })

  const [errors, setErrors] = useState({})
  const [channels, setChannels] = useState([
    {
      id: 'property-finder',
      name: 'Property Finder',
      type: 'portal',
      active: false,
      selectedPackage: 'standard',
      packages: [
        { id: 'standard', name: 'Standard Listing', remaining: 80 },
        { id: 'featured', name: 'Featured Listing', remaining: 3 },
        { id: 'premium', name: 'Premium Listing', remaining: 1 },
      ],
      status: 'Not Published',
      lastSyncAt: '—',
    },
    {
      id: 'bayut',
      name: 'Bayut',
      type: 'portal',
      active: false,
      selectedPackage: 'standard',
      packages: [
        { id: 'standard', name: 'Standard Listing', remaining: 40 },
        { id: 'featured', name: 'Featured Listing', remaining: 5 },
      ],
      status: 'Not Published',
      lastSyncAt: '—',
    },
    {
      id: 'zillow',
      name: 'Zillow',
      type: 'portal',
      active: false,
      selectedPackage: 'standard',
      packages: [
        { id: 'standard', name: 'Standard Listing', remaining: 120 },
        { id: 'premium', name: 'Premium Listing', remaining: 2 },
      ],
      status: 'Not Published',
      lastSyncAt: '—',
    },
    {
      id: 'company-site',
      name: 'Company Website',
      type: 'website',
      active: true,
      selectedPackage: null,
      packages: [],
      status: 'Live',
      lastSyncAt: 'Just now',
    },
  ])
  const [actionMessage, setActionMessage] = useState('')

  const buildingOptions = React.useMemo(() => {
    if (!formData.project) return buildings.map(b => b.name)
    return buildings.filter(b => b.project === formData.project).map(b => b.name)
  }, [buildings, formData.project])

  const ownerOptions = React.useMemo(() => owners.map(o => o.name), [owners])

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [isEdit, initialData])

  // Scroll to top on step change
  useEffect(() => {
    const content = document.getElementById('wizard-content')
    if (content) content.scrollTop = 0
  }, [currentStep])

  // Validation Logic
  const validateStep = (step) => {
    const newErrors = {}
    let isValid = true

    if (step === 1) {
      if (!formData.adTitle.trim()) newErrors.adTitle = 'Title is required'
      if (!formData.area) newErrors.area = 'Area is required'
      if (!formData.bedrooms && formData.propertyType !== 'Office' && formData.propertyType !== 'Land') newErrors.bedrooms = 'Required'
    }
    if (step === 5) {
      if (!formData.price) newErrors.price = 'Price is required'
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
      onSave && onSave({ ...formData, marketingChannels: channels })
      onClose()
    }
  }

  // --- Payment Plan Helpers ---
  const addInstallmentPlan = () => {
    setFormData(prev => ({
      ...prev,
      installmentPlans: [...prev.installmentPlans, { 
        downPayment: '', 
        years: '', 
        deliveryDate: '', 
        extraPayment: '', 
        extraPaymentFrequency: 'Annual' 
      }]
    }))
  }

  const removeInstallmentPlan = (index) => {
    setFormData(prev => ({
      ...prev,
      installmentPlans: prev.installmentPlans.filter((_, i) => i !== index)
    }))
  }

  const updateInstallmentPlan = (index, field, value) => {
    const newPlans = [...formData.installmentPlans]
    newPlans[index][field] = value
    setFormData(prev => ({ ...prev, installmentPlans: newPlans }))
  }

  const importProjectPlan = () => {
    if (!formData.project) return
    // Mock fetching project plan based on selected project
    // In real app, this would be an API call
    setFormData(prev => ({
      ...prev,
      installmentPlans: [
        { downPayment: '10', years: '8', deliveryDate: '2026', extraPayment: '', extraPaymentFrequency: 'Annual' },
        { downPayment: '15', years: '7', deliveryDate: '2025', extraPayment: '', extraPaymentFrequency: 'Annual' }
      ]
    }))
  }

  // --- Step Renderers ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Purpose */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'الغرض' : 'Purpose'}</label>
          <SearchableSelect 
            options={PURPOSES} 
            value={formData.purpose} 
            onChange={v => setFormData({...formData, purpose: v})} 
            isRTL={isRTL}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'الحالة' : 'Status'}</label>
          <SearchableSelect 
            options={['Available', 'Reserved', 'Sold', 'Resale', 'Rent']} 
            value={formData.status} 
            onChange={v => setFormData({...formData, status: v})} 
            isRTL={isRTL}
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="label">{isRTL ? 'نوع العقار' : 'Property Type'}</label>
          <SearchableSelect 
            options={PROPERTY_TYPES} 
            value={formData.propertyType} 
            onChange={v => setFormData({...formData, propertyType: v})} 
            isRTL={isRTL}
          />
        </div>
        {/* Project */}
        <div className="space-y-2">
            <label className="label">{isRTL ? 'المشروع' : 'Project'}</label>
            <SearchableSelect 
              options={PROJECTS} 
              value={formData.project} 
              onChange={v => setFormData({...formData, project: v})} 
              isRTL={isRTL}
              placeholder={isRTL ? 'اختر المشروع (اختياري)' : 'Select Project'}
            />
          </div>

        {/* Building */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
             <FaBuilding className="text-gray-400" />
             {isRTL ? 'المبنى' : 'Building'}
          </label>
          <SearchableSelect 
            options={buildingOptions} 
            value={formData.building} 
            onChange={v => setFormData({...formData, building: v})} 
            isRTL={isRTL}
            placeholder={isRTL ? 'اختر المبنى' : 'Select Building'}
          />
        </div>

        {/* Owner */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
             <FaUser className="text-gray-400" />
             {isRTL ? 'المالك' : 'Owner'}
          </label>
          <SearchableSelect 
            options={ownerOptions} 
            value={formData.owner} 
            onChange={v => setFormData({...formData, owner: v})} 
            isRTL={isRTL}
            placeholder={isRTL ? 'اختر المالك' : 'Select Owner'}
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaHeading className="text-gray-400" />
          {isRTL ? 'عنوان الإعلان' : 'Ad Title'}
          <span className="text-red-500">*</span>
        </label>
        <div>
          <input 
            className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.adTitle ? 'border-red-500' : ''}`}
            value={formData.adTitle}
            onChange={e => setFormData({...formData, adTitle: e.target.value})}
            placeholder={isRTL ? 'مثال: شقة فاخرة تطل على النيل' : 'e.g., Luxury Apartment with Nile View'}
          />
        </div>
        {errors.adTitle && <p className="text-red-500 text-xs">{errors.adTitle}</p>}
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="label">{isRTL ? 'غرف النوم' : 'Bedrooms'}</label>
          <select 
            value={formData.bedrooms}
            onChange={e => setFormData({...formData, bedrooms: e.target.value})}
            className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.bedrooms ? 'border-red-500' : ''}`}
          >
            <option value="">{isRTL ? 'اختر عدد الغرف' : 'Select bedrooms'}</option>
            {BEDROOMS.map(bedroom => (
              <option key={bedroom} value={bedroom}>{bedroom}</option>
            ))}
          </select>
          {errors.bedrooms && <p className="text-red-500 text-xs">{errors.bedrooms}</p>}
        </div>
        <div className="space-y-2">
          <label className="label">{isRTL ? 'الحمامات' : 'Bathrooms'}</label>
          <select 
            value={formData.bathrooms}
            onChange={e => setFormData({...formData, bathrooms: e.target.value})}
            className="input dark:bg-gray-800 w-full border border-black dark:border-gray-700"
          >
            <option value="">{isRTL ? 'اختر عدد الحمامات' : 'Select bathrooms'}</option>
            {BATHROOMS.map(bathroom => (
              <option key={bathroom} value={bathroom}>{bathroom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Area */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaRulerCombined className="text-gray-400" />
          {isRTL ? 'المساحة' : 'Area'}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input 
              type="number"
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.area ? 'border-red-500' : ''}`}
              value={formData.area}
              onChange={e => setFormData({...formData, area: e.target.value})}
              placeholder="0"
            />
          </div>
          <select 
            className="input dark:bg-gray-800 w-24 border border-black dark:border-gray-700"
            value={formData.areaUnit}
            onChange={e => setFormData({...formData, areaUnit: e.target.value})}
          >
            <option value="m²">m²</option>
            <option value="ft²">ft²</option>
          </select>
        </div>
        {errors.area && <p className="text-red-500 text-xs">{errors.area}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="label flex items-center gap-2">
          <FaAlignLeft className="text-gray-400" />
          {isRTL ? 'الوصف التفصيلي' : 'Detailed Description'}
        </label>
        <div>
          <textarea 
            className={`input dark:bg-gray-800 w-full min-h-[150px] font-sans border border-black dark:border-gray-700`}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder={isRTL ? 'اكتب وصفاً جذاباً للعقار...' : 'Write a compelling description...'}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{isRTL ? 'المرافق الداخلية' : 'Indoor Amenities'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_INDOOR.map(item => (
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

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{isRTL ? 'مرافق المبنى' : 'Building Amenities'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_BUILDING.map(item => (
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
      {/* Images */}
      <div className="space-y-2">
        <label className="label">{isRTL ? 'صور العقار' : 'Property Images'}</label>
        <FileUploader 
          label={isRTL ? 'اسحب وأفلت الصور هنا' : 'Drag & Drop Photos Here'}
          subLabel={isRTL ? 'أو اضغط للاختيار' : 'or click to browse'}
          files={formData.images}
          onDrop={(files) => setFormData(prev => ({...prev, images: [...prev.images, ...files]}))}
          accept="image/*"
        />
      </div>

      {/* Floor Plans */}
      <div className="space-y-2">
        <label className="label">{isRTL ? 'مخططات الطوابق' : 'Floor Plans'}</label>
        <FileUploader 
          label={isRTL ? 'اسحب وأفلت المخططات' : 'Upload Floor Plans'}
          subLabel="2D or 3D layouts"
          files={formData.floorPlans}
          onDrop={(files) => setFormData(prev => ({...prev, floorPlans: [...prev.floorPlans, ...files]}))}
          accept="image/*,.pdf"
        />
      </div>

      {/* Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaLink className="text-gray-400" />
          {isRTL ? 'رابط جولة الفيديو' : 'Video Tour URL'}
        </label>
        <div>
            <input 
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
              placeholder="YouTube / Vimeo link"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaLink className="text-gray-400" />
          {isRTL ? 'رابط جولة افتراضية' : '360° Virtual Tour URL'}
        </label>
        <div>
            <input 
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
              value={formData.virtualTourUrl}
              onChange={e => setFormData({...formData, virtualTourUrl: e.target.value})}
              placeholder="Matterport link"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-6">
        {/* Method 1: Detailed Address */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaMapMarkedAlt className="text-gray-400" />
          {isRTL ? '1. العنوان بالتفصيل' : '1. Detailed Address'}
        </label>
        <div>
            <textarea 
              className={`input dark:bg-gray-800 w-full min-h-[80px] border border-black dark:border-gray-700 `}
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder={isRTL ? 'اكتب العنوان بالتفصيل (اسم الشارع، رقم المبنى، المنطقة...)' : 'Enter detailed address (Street name, Building No, Area...)'}
            />
          </div>
        </div>

        {/* Method 2: Location URL */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaLink className="text-gray-400" />
          {isRTL ? '2. رابط الموقع (URL)' : '2. Location URL'}
        </label>
        <div>
            <input 
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
              value={formData.locationUrl}
              onChange={e => setFormData({...formData, locationUrl: e.target.value})}
              placeholder={isRTL ? 'الصق رابط موقع جوجل ماب هنا' : 'Paste Google Maps link here'}
            />
          </div>
        </div>

        {/* Method 3: Map Pin */}
        <div className="space-y-2">
          <label className="label">{isRTL ? '3. تحديد الموقع على الخريطة' : '3. Pin Location on Map'}</label>
          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 relative z-0">
            {currentStep === 4 && (
              <MapContainer 
                center={formData.location || [30.0444, 31.2357]} // Default to Cairo
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker 
                  location={formData.location} 
                  setLocation={(loc) => setFormData(prev => ({...prev, location: loc}))}
                  setLocationUrl={(url) => setFormData(prev => ({...prev, locationUrl: url}))}
                />
              </MapContainer>
            )}
            
            {!formData.location && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce pointer-events-none">
                {isRTL ? 'اضغط على الخريطة لتحديد الموقع' : 'Tap on map to pin location'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nearby */}
      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="label">{isRTL ? 'معالم قريبة' : 'Nearby Landmarks'}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['School', 'Hospital', 'Mall', 'Metro Station', 'Airport', 'Park', 'Gym', 'Supermarket'].map(item => (
            <label key={item} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.nearby.includes(item)}
                onChange={e => {
                  if (e.target.checked) setFormData(prev => ({...prev, nearby: [...prev.nearby, item]}))
                  else setFormData(prev => ({...prev, nearby: prev.nearby.filter(i => i !== item)}))
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

  const renderStep5 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaTag className="text-gray-400" />
          {isRTL ? 'السعر' : 'Price'}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
              <input 
                type="number"
                className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 ${errors.price ? 'border-red-500' : ''}`}
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <select 
              className="input dark:bg-gray-800 w-24 border border-black dark:border-gray-700"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
            >
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaHandHoldingUsd className="text-gray-400" />
          {isRTL ? 'رسوم الخدمة السنوية' : 'Annual Service Charges'}
          <Tooltip text="Estimated annual maintenance and service fees" />
        </label>
        <div>
            <input 
              type="number"
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
              value={formData.serviceCharges}
              onChange={e => setFormData({...formData, serviceCharges: e.target.value})}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label flex items-center gap-2">
          <FaShieldAlt className="text-gray-400" />
          {isRTL ? 'وديعة الصيانة' : 'Maintenance Deposit'}
        </label>
        <div>
            <input 
              type="number"
              className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
              value={formData.maintenanceDeposit}
              onChange={e => setFormData({...formData, maintenanceDeposit: e.target.value})}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Payment Plan */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          {isRTL ? 'خطط الدفع' : 'Payment Plans'}
        </h3>

        {/* Cash Discount */}
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <label className="label text-sm font-medium flex items-center gap-2">
          <FaPercentage className="text-gray-400" />
          {isRTL ? 'خصم الكاش' : 'Cash Discount'}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
              <input 
                type="number"
                className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
                value={formData.cashDiscount}
                onChange={e => setFormData({...formData, cashDiscount: e.target.value})}
                placeholder={isRTL ? 'نسبة الخصم %' : 'Discount Percentage %'}
              />
            </div>
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-4 rounded-lg font-bold text-gray-500 border border-gray-200 dark:border-gray-600">
              %
            </div>
          </div>
        </div>

        {/* Installment Plans */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label mb-0">{isRTL ? 'أنظمة التقسيط' : 'Installment Plans'}</label>
            {formData.project && (
              <button 
                onClick={importProjectPlan}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <FaCloudUploadAlt size={12} />
                {isRTL ? `جلب خطة ${formData.project}` : `Fetch ${formData.project} Plan`}
              </button>
            )}
          </div>
          
          {formData.installmentPlans.map((plan, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 relative group animate-fadeIn">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-[var(--muted-text)] uppercase flex items-center gap-1">
                  <FaPercentage className="text-gray-400 text-xs" />
                  {isRTL ? 'المقدم %' : 'Down Payment %'}
                </label>
                <div>
                  <input 
                    type="number"
                    className={`input dark:bg-gray-800 w-full text-sm py-1 border border-black dark:border-gray-700 `}
                    value={plan.downPayment}
                    onChange={e => updateInstallmentPlan(index, 'downPayment', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-[var(--muted-text)] uppercase flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400 text-xs" />
                  {isRTL ? 'المدة (سنوات)' : 'Years'}
                </label>
                <div>
                  <input 
                    type="number"
                    className={`input dark:bg-gray-800 w-full text-sm py-1 border border-black dark:border-gray-700 `}
                    value={plan.years}
                    onChange={e => updateInstallmentPlan(index, 'years', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-[var(--muted-text)] uppercase flex items-center gap-1">
                  <FaKey className="text-gray-400 text-xs" />
                  {isRTL ? 'تاريخ الاستلام' : 'Delivery'}
                </label>
                <div>
                  <input 
                    type="number"
                    className={`input dark:bg-gray-800 w-full text-sm py-1 border border-black dark:border-gray-700 `}
                    value={plan.deliveryDate}
                    onChange={e => updateInstallmentPlan(index, 'deliveryDate', e.target.value)}
                    placeholder="Year"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-[var(--muted-text)] uppercase flex items-center gap-1">
                  <FaPlus className="text-gray-400 text-xs" />
                  {isRTL ? 'دفعة إضافية' : 'Extra Payment'}
                </label>
                <div>
                  <input 
                    type="number"
                    className={`input dark:bg-gray-800 w-full text-sm py-1 border border-black dark:border-gray-700 `}
                    value={plan.extraPayment || ''}
                    onChange={e => updateInstallmentPlan(index, 'extraPayment', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] text-[var(--muted-text)] uppercase flex items-center gap-1">
                  <FaClock className="text-gray-400 text-xs" />
                  {isRTL ? 'تكرار الدفع' : 'Frequency'}
                </label>
                <div>
                  <select 
                    className={`input dark:bg-gray-800 w-full text-sm py-1 border border-black dark:border-gray-700 `}
                    value={plan.extraPaymentFrequency || 'Annual'}
                    onChange={e => updateInstallmentPlan(index, 'extraPaymentFrequency', e.target.value)}
                  >
                    <option value="Annual">{isRTL ? 'سنوية' : 'Annual'}</option>
                    <option value="Semi-Annual">{isRTL ? 'نصف سنوية' : 'Semi-Annual'}</option>
                    <option value="Quarterly">{isRTL ? 'ربع سنوية' : 'Quarterly'}</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button 
                  onClick={() => removeInstallmentPlan(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addInstallmentPlan}
            className="w-full py-3 border-2 border-dashed border-black dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-[var(--muted-text)] hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <FaPlus size={14} />
            {isRTL ? 'إضافة نظام تقسيط' : 'Add Installment Plan'}
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-2">
        <label className="label">
          {isRTL ? 'المستندات القانونية' : 'Legal Documents'}
          <Tooltip text="Upload Title Deeds, Permits, or Authorization letters (Private)" />
        </label>
        <FileUploader 
          label={isRTL ? 'رفع المستندات' : 'Upload Documents'}
          subLabel="PDF, JPG, PNG (Max 10MB)"
          files={formData.documents}
          onDrop={(files) => setFormData(prev => ({...prev, documents: [...prev.documents, ...files]}))}
          accept=".pdf,.jpg,.jpeg,.png"
        />
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

  const renderStep6 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Contact Info Preview */}
      <div className="dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FaBullhorn className="text-blue-500" />
          {isRTL ? 'معلومات التواصل' : 'Contact Information'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-[var(--muted-text)] block text-xs uppercase tracking-wider flex items-center gap-1">
              <FaUser className="text-gray-400" />
              {isRTL ? 'الاسم' : 'Name'}
            </span>
            <div>
              <input 
                className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[var(--muted-text)] block text-xs uppercase tracking-wider flex items-center gap-1">
              <FaEnvelope className="text-gray-400" />
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </span>
            <div>
              <input 
                className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
                value={formData.contactEmail}
                onChange={e => setFormData({...formData, contactEmail: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[var(--muted-text)] block text-xs uppercase tracking-wider flex items-center gap-1">
              <FaPhone className="text-gray-400" />
              {isRTL ? 'الهاتف' : 'Phone'}
            </span>
            <div>
              <input 
                className={`input dark:bg-gray-800 w-full border border-black dark:border-gray-700 `}
                value={formData.contactPhone}
                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>



      {/* Channel Management */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExternalLinkAlt className="text-blue-500" />
            <h3 className="font-semibold">
              {isRTL ? 'القنوات التسويقية' : 'Channel Management'}
            </h3>
          </div>
          <span className="text-xs text-[var(--muted-text)]">
            {isRTL ? 'اختر القنوات وخطة الترقية لكل بوابة' : 'Select channels and package per portal'}
          </span>
        </div>

        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:!bg-slate-800 p-4 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {channel.type === 'website' ? (
                    <FaGlobe className="text-emerald-500" />
                  ) : (
                    <FaExternalLinkAlt className="text-blue-500" />
                  )}
                  <div>
                    <div className="font-semibold">{channel.name}</div>
                    <div className="text-xs text-[var(--muted-text)]">
                      {channel.type === 'website'
                        ? isRTL ? 'موقع الشركة' : 'Company website'
                        : isRTL ? 'بوابة خارجية' : 'External portal'}
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={channel.active}
                    onChange={(e) => handleChannelToggle(channel.id, e.target.checked)}
                  />
                  <span className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors relative">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all peer-checked:translate-x-5" />
                  </span>
                  <span className="text-sm">{channel.active ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}</span>
                </label>
              </div>

              {channel.type === 'portal' && channel.active && (
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="text-sm text-[var(--muted-text)]">
                    {isRTL ? 'باقة التسويق' : 'Marketing package'}
                  </div>
                  <select
                    className="input dark:bg-gray-800 w-full md:w-80 border border-gray-300 dark:border-gray-700"
                    value={channel.selectedPackage}
                    onChange={(e) => handlePackageChange(channel.id, e.target.value)}
                  >
                    {channel.packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.remaining} {isRTL ? 'متبقي' : 'remaining'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-[var(--muted-text)]">
                <div className={statusBadge(channel.status)}>
                  {isRTL ? 'الحالة:' : 'Status:'}{' '}{channel.status}
                </div>
                <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {isRTL ? 'آخر مزامنة:' : 'Last synced:'}{' '}
                  <span className="font-semibold">{channel.lastSyncAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Materials */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:!bg-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FaCloudDownloadAlt className="text-purple-500" />
          <h3 className="font-semibold">
            {isRTL ? 'إنشاء مواد تسويقية' : 'Marketing Materials'}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            onClick={handleGenerateBrochure}
          >
            {isRTL ? 'توليد كتيب PDF' : 'Generate PDF Brochure'}
          </button>
          <button
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
            onClick={handleEmailTemplate}
          >
            {isRTL ? 'إنشاء حملة بريدية' : 'Create Email Campaign'}
          </button>
        </div>
      </div>

      {/* Main Actions */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:!bg-slate-800 p-4 flex flex-wrap justify-between gap-3 items-center">
        <div className="text-sm text-[var(--muted-text)]">
          {isRTL ? 'احفظ كمسودة أو انشر للقنوات المحددة' : 'Save as draft or publish to selected channels'}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white border-none"
            onClick={handleSaveDraft}
          >
            {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
          </button>
          <button
            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            onClick={markPublish}
          >
            {isRTL ? 'نشر للقنوات المحددة' : 'Publish to Selected Channels'}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          {actionMessage}
        </div>
      )}
    </div>
  )

  const handleChannelToggle = (id, active) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, active, status: active ? 'Pending Sync' : 'Not Published' } : ch
      )
    )
  }

  const handlePackageChange = (id, pkgId) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, selectedPackage: pkgId } : ch))
    )
  }

  const markPublish = () => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.active
          ? {
              ...ch,
              status: 'Pending Sync',
              lastSyncAt: new Date().toLocaleString(),
            }
          : ch
      )
    )
    setActionMessage(isRTL ? 'تم تجهيز النشر وسيتم التوزيع في الخلفية.' : 'Publish queued; background syndication will start shortly.')
  }

  const handleSaveDraft = () => {
    setActionMessage(isRTL ? 'تم الحفظ كمسودة دون نشر.' : 'Saved as draft without publishing.')
  }

  const handleGenerateBrochure = () => {
    setActionMessage(isRTL ? 'سيتم توليد كتيب PDF عبر الخدمة الخلفية.' : 'PDF brochure generation will be handled by backend.')
  }

  const handleEmailTemplate = () => {
    setActionMessage(isRTL ? 'سيتم تجهيز قالب بريد للتصدير من لوحة الحملات.' : 'Email template will be prepared for campaigns.')
  }

  const statusBadge = (status) => {
    const base = 'px-2 py-1 rounded font-semibold text-xs'
    if (status === 'Live') return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200`
    if (status === 'Pending Sync') return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200`
    if (status === 'Error') return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200`
    return `${base} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200`
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div
        className="relative z-[210] bg-white dark:bg-slate-950 rounded-2xl w-[900px] max-w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp"
      >
        
        {/* Header & Progress Bar */}
        <div
          className="bg-blue-50 dark:!bg-slate-900 border-b border-gray-200 dark:!border-slate-700 pt-1 px-2 pb-5 md:pt-2 md:px-3 md:pb-6"
          style={{ background: 'var(--panel-bg)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-4">
              {isEdit ? (isRTL ? 'تعديل العقار' : 'Edit Property') : (isRTL ? 'إضافة عقار جديد' : 'Add Property')}
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
        <div
          id="wizard-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"
        >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStepCIL()}
            {currentStep === 7 && renderStep6()}
        </div>

        {/* Footer Navigation */}
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
