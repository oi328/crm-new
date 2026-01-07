import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../components/SearchableSelect'
import { FaFilter,FaUser, FaShareAlt, FaEllipsisV, FaPlus, FaMapMarkerAlt, FaBuilding, FaTimes, FaEye, FaEdit, FaTrash, FaUpload, FaSearch, FaChevronDown, FaChevronUp, FaImage, FaFilePdf, FaVideo, FaPaperclip, FaTags, FaCity, FaCloudDownloadAlt, FaChevronLeft, FaChevronRight, FaDownload, FaFileExcel, FaFileImport, FaFileExport, FaFileCsv } from 'react-icons/fa'
import PropertyCard from '../components/PropertyCard'
import PropertiesSummaryPanel from '../components/PropertiesSummaryPanel'
import ImportPropertiesModal from '../components/ImportPropertiesModal'
import CreatePropertyModal from '../components/CreatePropertyModal'
import { projectsData } from '../data/projectsData'
import { useCompanySetup } from './settings/company-setup/store/CompanySetupContext.jsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Range Slider Component
const RangeSlider = ({ min, max, value, onChange, label, isRTL, unit = '' }) => {
  const [minVal, maxVal] = value
  
  // Handlers
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - 1)
    onChange([val, maxVal])
  }
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + 1)
    onChange([minVal, val])
  }

  // Percentages for track
  const minPercent = ((minVal - min) / (max - min)) * 100
  const maxPercent = ((maxVal - min) / (max - min)) * 100

  return (
    <div className="w-full p-1">
      <h3 className="text-xs font-medium text-[var(--muted-text)] mb-4">{label}</h3>
      
      <div className="relative w-full h-4 mb-4 group">
        {/* Track Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full"></div>
        
        {/* Active Range Track */}
        <div 
          className="absolute top-1/2 h-1 bg-gray-800 dark:bg-gray-200 -translate-y-1/2 rounded-full"
          style={{ 
            left: isRTL ? `${100 - maxPercent}%` : `${minPercent}%`, 
            right: isRTL ? `${minPercent}%` : `${100 - maxPercent}%` 
          }}
        ></div>

        {/* Inputs */}
        <style>{`
          .range-slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: auto;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 2px solid #333;
            cursor: pointer;
            margin-top: -5px; /* centers thumb on track */
          }
          .range-slider-thumb::-moz-range-thumb {
            pointer-events: auto;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 2px solid #333;
            cursor: pointer;
            border: none;
          }
        `}</style>
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="range-slider-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full appearance-none bg-transparent pointer-events-none z-20"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-slider-thumb absolute top-1/2 -translate-y-1/2 left-0 w-full appearance-none bg-transparent pointer-events-none z-20"
        />
      </div>
      
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5">
           <span className="text-xs text-gray-500 font-medium">{isRTL ? 'من' : 'From'}</span>
           <div className="relative">
             <input 
               type="number" 
               value={minVal} 
               onChange={handleMinChange}
               className="input py-0.5 px-2 w-20 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg"
             />
           </div>
        </div>
        <div className="flex items-center gap-1.5">
           <span className="text-xs text-gray-500 font-medium">{isRTL ? 'إلى' : 'To'}</span>
           <div className="relative">
             <input 
               type="number" 
               value={maxVal} 
               onChange={handleMaxChange}
               className="input py-0.5 px-2 w-20 text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-lg"
             />
           </div>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const { i18n } = useTranslation()
  const isRTL = String(i18n.language || '').startsWith('ar')
  const { companySetup } = useCompanySetup()
  const [planPreview, setPlanPreview] = useState(null)
  const [isPlanPreviewOpen, setIsPlanPreviewOpen] = useState(false)
  const openPlanPreview = (plan) => { setPlanPreview(plan); setIsPlanPreviewOpen(true) }
  const closePlanPreview = () => { setIsPlanPreviewOpen(false); setPlanPreview(null) }
  const printPlan = (plan) => {
    const w = window.open('', '_blank')
    if (!w) return
    const currencyFmt = (v) => new Intl.NumberFormat('en-EG', { maximumFractionDigits: 2 }).format(Number(v || 0))
    w.document.write(`
      <html><head><title>Payment Plan</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
        .actions { margin-top: 16px; }
      </style>
      </head><body>
      <h2>${isRTL ? 'معاينة خطة الدفع' : 'Payment Plan Preview'}</h2>
      <table>
        <tbody>
          <tr><th>${isRTL ? 'المقدم' : 'Down Payment'}</th><td>${plan.downPayment || '-' } ${String(plan.downPaymentType||'amount')==='percentage' ? '%' : ''}</td></tr>
          <tr><th>${isRTL ? 'نوع الحجز' : 'Reservation Type'}</th><td>${plan.reservationType || '-'}</td></tr>
          <tr><th>${isRTL ? 'دفعة الاستلام' : 'Receipt Amount'}</th><td>${currencyFmt(plan.receiptAmount)}</td></tr>
          <tr><th>${isRTL ? 'قيمة القسط' : 'Installment Amount'}</th><td>${currencyFmt(plan.installmentAmount)}</td></tr>
          <tr><th>${isRTL ? 'تكرار القسط' : 'Installment Frequency'}</th><td>${plan.installmentFrequency || '-'}</td></tr>
          <tr><th>${isRTL ? 'السنوات' : 'Years'}</th><td>${plan.years || '-'}</td></tr>
          <tr><th>${isRTL ? 'دفعة إضافية' : 'Extra Payment'}</th><td>${currencyFmt(plan.extraPayment)}</td></tr>
          <tr><th>${isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency'}</th><td>${plan.extraPaymentFrequency || '-'}</td></tr>
          <tr><th>${isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count'}</th><td>${plan.extraPaymentCount || '0'}</td></tr>
          <tr><th>${isRTL ? 'الاستلام' : 'Delivery'}</th><td>${plan.deliveryDate || '-'}</td></tr>
        </tbody>
      </table>
      <div class="actions">
        <button onclick="window.print()" style="padding:8px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">${isRTL ? 'طباعة' : 'Print'}</button>
      </div>
      </body></html>
    `)
    w.document.close()
  }
  const downloadPlanPdf = (plan, index, title='Property') => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`${isRTL ? 'خطة الدفع' : 'Payment Plan'} #${index+1} - ${title}`, 14, 18)
    const rows = [
      [isRTL ? 'المقدم' : 'Down Payment', `${plan.downPayment || '-'} ${String(plan.downPaymentType||'amount')==='percentage' ? '%' : ''}`],
      [isRTL ? 'نوع الحجز' : 'Reservation Type', plan.reservationType || '-'],
      [isRTL ? 'دفعة الاستلام' : 'Receipt Amount', String(plan.receiptAmount || '0')],
      [isRTL ? 'قيمة القسط' : 'Installment Amount', String(plan.installmentAmount || '0')],
      [isRTL ? 'تكرار القسط' : 'Installment Frequency', plan.installmentFrequency || '-'],
      [isRTL ? 'السنوات' : 'Years', String(plan.years || '-')],
      [isRTL ? 'دفعة إضافية' : 'Extra Payment', String(plan.extraPayment || '0')],
      [isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency', plan.extraPaymentFrequency || '-'],
      [isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count', String(plan.extraPaymentCount || '0')],
      [isRTL ? 'الاستلام' : 'Delivery', plan.deliveryDate || '-'],
    ]
    autoTable(doc, {
      head: [[isRTL ? 'الحقل' : 'Field', isRTL ? 'القيمة' : 'Value']],
      body: rows,
      startY: 24,
      styles: { fontSize: 10 }
    })
    doc.save(`payment-plan-${index+1}.pdf`)
  }
  useEffect(() => {
    try { document.documentElement.dir = isRTL ? 'rtl' : 'ltr' } catch {}
  }, [isRTL])
  // theme toggle removed on this page per request

  const STORAGE_KEY = 'inventoryProperties_v2'
  const BUILDING_KEY = 'inventoryBuildings'
  const THIRD_PARTY_KEY = 'inventoryThirdParties'

  const [properties, setProperties] = useState([])
  const [buildings, setBuildings] = useState([])
  const [thirdParties, setThirdParties] = useState([])

  useEffect(() => {
    // Load Properties
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw).map(p => ({...p, purpose: p.purpose || (['Resale', 'Rent'].includes(p.status) ? p.status : 'Primary')}))
        setProperties(data)
      } else {
        const data = SAMPLE_PROPERTIES.map(p => ({...p, purpose: p.purpose || (['Resale', 'Rent'].includes(p.status) ? p.status : 'Primary')}))
        setProperties(data)
      }
    } catch { 
      const data = SAMPLE_PROPERTIES.map(p => ({...p, purpose: p.purpose || (['Resale', 'Rent'].includes(p.status) ? p.status : 'Primary')}))
      setProperties(data) 
    }

    // Load Buildings
    try {
      const raw = localStorage.getItem(BUILDING_KEY)
      if (raw) setBuildings(JSON.parse(raw))
    } catch {}

    // Load Third Parties (Owners)
    try {
      const raw = localStorage.getItem(THIRD_PARTY_KEY)
      if (raw) setThirdParties(JSON.parse(raw))
    } catch {}
  }, [])


  useEffect(() => {
    if (properties.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
    }
  }, [properties])

  const SAMPLE_PROPERTIES = useMemo(()=>[
    {
      id: 1000,
      name: 'Modern Luxury Villa',
      adTitle: 'Modern Luxury Villa in Palm Hills',
      adTitleAr: 'فيلا فاخرة حديثة في بالم هيلز',
      project: 'Palm Hills',
      category: 'Residential',
      propertyType: 'Villa',
      unitNumber: 'V-1000',
      unitCode: 'PH-V1000',
      building: 'Zone B',
      bua: 600,
      hasExternalArea: true,
      internalArea: 550,
      externalArea: 50,
      totalArea: 600,
      area: 600,
      areaUnit: 'm²',
      internalMeterPrice: 25000,
      externalMeterPrice: 12000,
      meterPrice: 24000,
      totalPrice: 15000000,
      price: 15000000,
      currency: 'EGP',
      bedrooms: 6,
      bathrooms: 7,
      rooms: 6,
      floor: 0,
      finishing: 'Finished',
      view: 'Golf',
      purpose: 'Primary',
      status: 'Available',
      elevator: true,
      ownerName: 'Alice Smith',
      ownerMobile: '+201222222222',
      rentCost: 0,
      amenities: ['Private Pool', 'Smart Home', 'Golf View'],
      description: 'A stunning modern villa with golf course views and smart home integration.',
      descriptionAr: 'فيلا حديثة مذهلة تطل على ملعب الجولف ومزودة بنظام المنزل الذكي.',
      images: [
        'https://images.unsplash.com/photo-1600596542815-22b5c03295b6?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop'
      ],
      mainImage: 'https://images.unsplash.com/photo-1600596542815-22b5c03295b6?q=80&w=1200&auto=format&fit=crop',
      logo: 'https://dummyimage.com/100x100/222/fff.png&text=MLV',
      videoUrl: 'https://www.youtube.com/watch?v=example',
      virtualTourUrl: 'https://matterport.com/example',
      floorPlans: ['https://dummyimage.com/600x800/eee/000.png&text=Plan+A'],
      documents: ['Brochure.pdf'],
      address: '456 Golf Road',
      addressAr: '٤٥٦ طريق الجولف',
      city: 'Giza',
      locationUrl: 'https://maps.google.com/?q=30.0,31.0',
      nearby: ['Golf Club', 'International School'],
      discount: 100000,
      discountType: 'amount',
      reservationAmount: 200000,
      garageAmount: 150000,
      maintenanceAmount: 600000,
      netAmount: 14900000,
      totalAfterDiscount: 14900000,
      serviceCharges: 10000,
      maintenanceDeposit: 20000,
      receipt: 1500000,
      installmentPlans: [
        {
          downPayment: 15,
          downPaymentType: 'percentage',
          years: 7,
          deliveryDate: '2027',
          installmentAmount: 120000,
          installmentFrequency: 'Quarterly',
          reservationAmount: 50000
        },
        {
          downPayment: 1000000,
          downPaymentType: 'amount',
          years: 5,
          deliveryDate: '2026',
          installmentAmount: 200000,
          installmentFrequency: 'Monthly',
          reservationAmount: 75000
        }
      ],
      cil: {
        to: 'Sales Director',
        toAr: 'مدير المبيعات',
        subject: 'VIP Client',
        subjectAr: 'عميل VIP',
        content: 'Client looking for immediate move-in.',
        contentAr: 'العميل يبحث عن استلام فوري.',
        signature: 'Agent Y',
        signatureAr: 'الوكيل ص'
      },
      contactName: 'Agent Y',
      contactEmail: 'agenty@example.com',
      contactPhone: '+20199999999',
      marketingPackage: 'Gold',
      createdDate: '2025-01-15',
      createdBy: 'Sales Manager',
      lastUpdated: '2025-01-16',
      progress: 0,
      units: 1,
      developer: 'Palm Hills Dev'
    },
    {
      id: 999,
      name: 'Grand Luxury Palace',
      adTitle: 'Grand Luxury Palace',
      adTitleAr: 'قصر الفخامة الكبير',
      project: 'Palm Hills',
      category: 'Residential',
      propertyType: 'Villa',
      unitNumber: 'V-99',
      unitCode: 'PH-V99',
      building: 'Zone A',
      bua: 500,
      hasExternalArea: true,
      internalArea: 450,
      externalArea: 50,
      totalArea: 500,
      area: 500,
      areaUnit: 'm²',
      internalMeterPrice: 20000,
      externalMeterPrice: 10000,
      meterPrice: 19000,
      totalPrice: 9500000,
      price: 9500000,
      currency: 'EGP',
      bedrooms: 7,
      bathrooms: 8,
      rooms: 7,
      floor: 0,
      finishing: 'Core & Shell',
      view: 'Garden',
      purpose: 'Primary',
      status: 'Available',
      elevator: true,
      ownerName: 'John Doe',
      ownerMobile: '+201000000000',
      rentCost: 0,
      amenities: ['Private Pool', 'Private Garden', 'Security', 'Maid\'s Room'],
      description: 'A magnificent villa with vast gardens and premium finishing.',
      descriptionAr: 'فيلا رائعة مع حدائق واسعة وتشطيب مميز.',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop'
      ],
      mainImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop',
      logo: 'https://dummyimage.com/100x100/d4af37/fff.png&text=GLP',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      virtualTourUrl: 'https://matterport.com/discover/space/1',
      floorPlans: ['https://dummyimage.com/600x800/eee/000.png&text=Floor+Plan'],
      documents: ['Contract Template.pdf'],
      address: '123 Palm Hills Blvd',
      addressAr: '١٢٣ شارع بالم هيلز',
      city: 'Cairo',
      locationUrl: 'https://maps.google.com/?q=30.0444,31.2357',
      nearby: ['School', 'Club'],
      discount: 50000,
      discountType: 'amount',
      reservationAmount: 100000,
      garageAmount: 200000,
      maintenanceAmount: 500000,
      netAmount: 10150000,
      totalAfterDiscount: 9450000,
      serviceCharges: 5000,
      maintenanceDeposit: 10000,
      receipt: 1000000,
      installmentPlans: [
        {
          downPayment: 10,
          downPaymentType: 'percentage',
          years: 5,
          deliveryDate: '2026',
          installmentAmount: 150000,
          installmentFrequency: 'Monthly'
        }
      ],
      cil: {
        to: 'Sales Manager',
        toAr: 'مدير المبيعات',
        subject: 'Client Interest',
        subjectAr: 'اهتمام عميل',
        content: 'Client is interested in this property.',
        contentAr: 'العميل مهتم بهذا العقار.',
        signature: 'Agent X',
        signatureAr: 'الوكيل س'
      },
      contactName: 'Agent X',
      contactEmail: 'agent@example.com',
      contactPhone: '+20123456789',
      marketingPackage: 'Premium',
      createdDate: '2025-01-01',
      createdBy: 'System Admin',
      lastUpdated: '2025-01-05',
      progress: 100,
      units: 1,
      developer: 'Palm Hills Dev'
    },
    {
      id: 1, name: 'Nile View Residences', city: 'Cairo', developer: 'Hima Dev', status: 'Available',
      units: 120, unit: 'NVR-101', area: 120, price: 2500000, documents: 12, lastUpdated: '2025-11-05',
      logo: 'https://dummyimage.com/100x100/000/fff.png&text=NV',
      mainImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
      description: 'Prime apartments overlooking the Nile with modern amenities.', progress: 35, estimatedRevenue: 85000000,
      type: 'Apartment', createdBy: 'Admin', createdDate: '2025-01-10', paymentPlan: 'Standard',
      rooms: 3, floor: 1
    },
    {
      id: 2, name: 'Palm Villas', city: 'Giza', developer: 'Hima Dev', status: 'Reserved',
      units: 60, unit: 'PV-205', area: 300, price: 6500000, documents: 8, lastUpdated: '2025-11-06',
      logo: 'https://dummyimage.com/100x100/111/fff.png&text=PV',
      mainImage: 'https://images.unsplash.com/photo-1505691728975-327f93beedb3?q=80&w=1200&auto=format&fit=crop',
      description: 'Luxury villas with private gardens and pools.', progress: 60, estimatedRevenue: 120000000,
      type: 'Villa', createdBy: 'Sales Agent', createdDate: '2025-02-15', paymentPlan: 'Premium',
      rooms: 5, floor: 2
    },
    {
      id: 3, name: 'Smart Offices', city: 'New Cairo', developer: 'TechBuild', status: 'Sold',
      units: 40, unit: 'SO-304', area: 95, price: 1800000, documents: 18, lastUpdated: '2025-11-03',
      logo: 'https://dummyimage.com/100x100/333/fff.png&text=SO',
      mainImage: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop',
      description: 'Modern offices with smart building features.', progress: 100, estimatedRevenue: 48000000,
      type: 'Office', createdBy: 'Admin', createdDate: '2025-03-20', paymentPlan: 'Standard',
      rooms: 2, floor: 1
    },
    {
      id: 4, name: 'Marina Bay Apartments', city: 'Alexandria', developer: 'SeaSide Dev', status: 'Available',
      units: 200, unit: 'MBA-401', area: 110, price: 2100000, documents: 10, lastUpdated: '2025-10-29',
      logo: 'https://dummyimage.com/100x100/555/fff.png&text=MB',
      mainImage: 'https://images.unsplash.com/photo-1449844908441-774d237f3b16?q=80&w=1200&auto=format&fit=crop',
      description: 'Sea view apartments with premium facilities.', progress: 45, estimatedRevenue: 150000000,
      type: 'Apartment', createdBy: 'Manager', createdDate: '2025-04-05', paymentPlan: 'Flexible',
      rooms: 2, floor: 1
    },
    {
      id: 5, name: 'City Heights', city: 'Cairo', developer: 'Hima Dev', status: 'Resale',
      units: 1, unit: 'CH-505', area: 150, price: 3500000, documents: 5, lastUpdated: '2025-11-10',
      logo: 'https://dummyimage.com/100x100/777/fff.png&text=CH',
      mainImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
      description: 'Luxury apartment for resale in City Heights.', progress: 100, estimatedRevenue: 3500000,
      type: 'Apartment', createdBy: 'Agent 2', createdDate: '2025-05-12', paymentPlan: 'Cash',
      rooms: 3, floor: 1
    },
    {
      id: 6, name: 'Downtown Loft', city: 'Giza', developer: 'TechBuild', status: 'Rent',
      units: 1, unit: 'DL-601', area: 80, price: 15000, documents: 3, lastUpdated: '2025-11-12',
      logo: 'https://dummyimage.com/100x100/999/fff.png&text=DL',
      mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
      description: 'Modern loft available for rent.', progress: 100, estimatedRevenue: 180000,
      type: 'Apartment', createdBy: 'Admin', createdDate: '2025-06-01', paymentPlan: 'Monthly',
      rooms: 1, floor: 1
    },
    {
      id: 7, name: 'Green Valley Villas', city: 'New Cairo', developer: 'Hima Dev', status: 'Available',
      units: 50, unit: 'GV-701', area: 400, price: 9000000, documents: 15, lastUpdated: '2025-11-15',
      logo: 'https://dummyimage.com/100x100/222/fff.png&text=GV',
      mainImage: 'https://images.unsplash.com/photo-1600596542815-22b5c03295b6?q=80&w=1200&auto=format&fit=crop',
      description: 'Spacious villas in a green compound.', progress: 80, estimatedRevenue: 450000000,
      type: 'Villa', createdBy: 'Sales Agent', createdDate: '2025-07-10', paymentPlan: 'Premium',
      rooms: 6, floor: 2
    },
    {
      id: 8, name: 'Skyline Tower', city: 'Cairo', developer: 'TechBuild', status: 'Reserved',
      units: 150, unit: 'ST-802', area: 90, price: 2200000, documents: 20, lastUpdated: '2025-11-18',
      logo: 'https://dummyimage.com/100x100/444/fff.png&text=ST',
      mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
      description: 'High-rise apartments with city views.', progress: 55, estimatedRevenue: 330000000,
      type: 'Apartment', createdBy: 'Manager', createdDate: '2025-08-05', paymentPlan: 'Standard',
      rooms: 2, floor: 1
    },
    {
      id: 9, name: 'Seaside Resort', city: 'Alexandria', developer: 'SeaSide Dev', status: 'Sold',
      units: 80, unit: 'SR-903', area: 75, price: 1500000, documents: 8, lastUpdated: '2025-11-20',
      logo: 'https://dummyimage.com/100x100/666/fff.png&text=SR',
      mainImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
      description: 'Cozy chalets by the sea.', progress: 100, estimatedRevenue: 120000000,
      type: 'Apartment', createdBy: 'Admin', createdDate: '2025-08-20', paymentPlan: 'Cash',
      rooms: 1, floor: 1
    },
    {
      id: 10, name: 'Tech Park Offices', city: 'New Cairo', developer: 'TechBuild', status: 'Available',
      units: 30, unit: 'TP-1004', area: 150, price: 3000000, documents: 25, lastUpdated: '2025-11-22',
      logo: 'https://dummyimage.com/100x100/888/fff.png&text=TP',
      mainImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
      description: 'Premium office spaces in Tech Park.', progress: 90, estimatedRevenue: 90000000,
      type: 'Office', createdBy: 'Sales Agent', createdDate: '2025-09-01', paymentPlan: 'Flexible',
      rooms: 3, floor: 1
    },
    {
      id: 11, name: 'Garden City Apartment', city: 'Cairo', developer: 'Hima Dev', status: 'Rent',
      units: 1, unit: 'GC-1105', area: 200, price: 25000, documents: 5, lastUpdated: '2025-11-25',
      logo: 'https://dummyimage.com/100x100/aaa/fff.png&text=GC',
      mainImage: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1200&auto=format&fit=crop',
      description: 'Historic apartment in Garden City.', progress: 100, estimatedRevenue: 300000,
      type: 'Apartment', createdBy: 'Agent 2', createdDate: '2025-09-15', paymentPlan: 'Monthly',
      rooms: 4, floor: 2
    },
    {
      id: 12, name: 'Pyramids View', city: 'Giza', developer: 'Hima Dev', status: 'Available',
      units: 100, unit: 'PV-1206', area: 130, price: 2800000, documents: 10, lastUpdated: '2025-11-28',
      logo: 'https://dummyimage.com/100x100/ccc/fff.png&text=PV',
      mainImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
      description: 'Apartments with a direct view of the Pyramids.', progress: 20, estimatedRevenue: 280000000,
      type: 'Apartment', createdBy: 'Manager', createdDate: '2025-10-01', paymentPlan: 'Standard',
      rooms: 3, floor: 1
    },
    {
      id: 13, name: 'Mediterranean Villa', city: 'Alexandria', developer: 'SeaSide Dev', status: 'Resale',
      units: 1, unit: 'MV-1307', area: 500, price: 12000000, documents: 6, lastUpdated: '2025-11-30',
      logo: 'https://dummyimage.com/100x100/eee/fff.png&text=MV',
      mainImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1200&auto=format&fit=crop',
      description: 'Exclusive villa on the Mediterranean coast.', progress: 100, estimatedRevenue: 12000000,
      type: 'Villa', createdBy: 'Admin', createdDate: '2025-10-10', paymentPlan: 'Cash',
      rooms: 7, floor: 3
    },
    {
      id: 14, name: 'Urban Loft', city: 'New Cairo', developer: 'TechBuild', status: 'Available',
      units: 20, unit: 'UL-1408', area: 100, price: 1900000, documents: 12, lastUpdated: '2025-12-01',
      logo: 'https://dummyimage.com/100x100/000/fff.png&text=UL',
      mainImage: 'https://images.unsplash.com/photo-1505693416388-502844569c43?q=80&w=1200&auto=format&fit=crop',
      description: 'Stylish lofts for young professionals.', progress: 60, estimatedRevenue: 38000000,
      type: 'Apartment', createdBy: 'Sales Agent', createdDate: '2025-10-20', paymentPlan: 'Flexible',
      rooms: 2, floor: 1
    },
    {
      id: 15, name: 'Corporate Hub', city: 'Cairo', developer: 'TechBuild', status: 'Reserved',
      units: 10, unit: 'CH-1509', area: 250, price: 5000000, documents: 18, lastUpdated: '2025-12-03',
      logo: 'https://dummyimage.com/100x100/222/fff.png&text=CH',
      mainImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
      description: 'Headquarters ready office spaces.', progress: 95, estimatedRevenue: 50000000,
      type: 'Office', createdBy: 'Manager', createdDate: '2025-11-01', paymentPlan: 'Premium',
      rooms: 5, floor: 2
    },
    {
      id: 16, name: 'Sunset Apartments', city: 'Giza', developer: 'Hima Dev', status: 'Available',
      units: 80, unit: 'SA-1610', area: 110, price: 2000000, documents: 14, lastUpdated: '2025-12-05',
      logo: 'https://dummyimage.com/100x100/444/fff.png&text=SA',
      mainImage: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?q=80&w=1200&auto=format&fit=crop',
      description: 'Affordable apartments with sunset views.', progress: 40, estimatedRevenue: 160000000,
      type: 'Apartment', createdBy: 'Agent 2', createdDate: '2025-11-10', paymentPlan: 'Standard',
      rooms: 2, floor: 1
    },
    {
      id: 17, name: 'Royal Palace', city: 'New Cairo', developer: 'Hima Dev', status: 'Sold',
      units: 5, unit: 'RP-1711', area: 800, price: 25000000, documents: 22, lastUpdated: '2025-12-08',
      logo: 'https://dummyimage.com/100x100/666/fff.png&text=RP',
      mainImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop',
      description: 'Ultra-luxury palaces for the elite.', progress: 100, estimatedRevenue: 125000000,
      type: 'Villa', createdBy: 'Admin', createdDate: '2025-11-20', paymentPlan: 'Cash',
      rooms: 10, floor: 4
    },
    {
      id: 18, name: 'Blue Lagoon', city: 'Alexandria', developer: 'SeaSide Dev', status: 'Available',
      units: 120, unit: 'BL-1812', area: 95, price: 1800000, documents: 9, lastUpdated: '2025-12-10',
      logo: 'https://dummyimage.com/100x100/888/fff.png&text=BL',
      mainImage: 'https://images.unsplash.com/photo-1512918760513-95f69295d7eb?q=80&w=1200&auto=format&fit=crop',
      description: 'Apartments surrounding a large lagoon.', progress: 30, estimatedRevenue: 216000000,
      type: 'Apartment', createdBy: 'Sales Agent', createdDate: '2025-12-01', paymentPlan: 'Flexible',
      rooms: 2, floor: 1
    },
    {
      id: 19, name: 'Creative Studio', city: 'Cairo', developer: 'TechBuild', status: 'Rent',
      units: 5, unit: 'CS-1913', area: 60, price: 10000, documents: 4, lastUpdated: '2025-12-12',
      logo: 'https://dummyimage.com/100x100/aaa/fff.png&text=CS',
      mainImage: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=1200&auto=format&fit=crop',
      description: 'Small studios for creative work.', progress: 100, estimatedRevenue: 50000,
      type: 'Office', createdBy: 'Manager', createdDate: '2025-12-05', paymentPlan: 'Monthly',
      rooms: 1, floor: 1
    },
    {
      id: 20, name: 'Family Home', city: 'Giza', developer: 'Hima Dev', status: 'Available',
      units: 60, unit: 'FH-2014', area: 180, price: 4000000, documents: 11, lastUpdated: '2025-12-15',
      logo: 'https://dummyimage.com/100x100/ccc/fff.png&text=FH',
      mainImage: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200&auto=format&fit=crop',
      description: 'Perfect homes for growing families.', progress: 70, estimatedRevenue: 240000000,
      type: 'Apartment', createdBy: 'Agent 2', createdDate: '2025-12-10', paymentPlan: 'Standard',
      rooms: 3, floor: 1
    },
    {
      id: 1001,
      adTitle: 'Luxury Apartment – Nile View',
      name: 'Nile View Prime Unit A-12',
      city: 'Cairo',
      developer: 'Be Souhola Dev',
      status: 'Available',
      units: 1,
      unit: 'NV-A12',
      area: 165,
      totalArea: 165,
      areaUnit: 'm²',
      price: 4200000,
      currency: 'EGP',
      lastUpdated: '2025-12-31',
      logo: 'https://dummyimage.com/120x120/1e40af/ffffff.png&text=BS',
      mainImage: 'https://images.unsplash.com/photo-1512918760513-95f69295d7eb?q=80&w=1200&auto=format&fit=crop',
      description: 'Fully finished luxury apartment with direct Nile view, high-end finishes, smart home features, and access to premium amenities.',
      type: 'Apartment',
      propertyType: 'Apartment',
      createdBy: 'Admin',
      createdDate: '2025-12-31',
      paymentPlan: 'Standard',
      rooms: 3,
      bedrooms: 3,
      bathrooms: 2,
      floor: 12,
      ownerMobile: '+201001234567',
      contactName: 'Sales Team',
      contactEmail: 'sales@example.com',
      contactPhone: '+201001234567',
      marketingPackage: 'Premium',
      address: 'Corniche El Nile, Garden City, Cairo',
      locationUrl: 'https://www.google.com/maps?q=30.0444,31.2357',
      images: [
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop'
      ],
      floorPlans: [
        'https://images.unsplash.com/photo-1505693416388-502844569c43?q=80&w=1200&auto=format&fit=crop',
        'https://example.com/floorplan-a12.pdf'
      ],
      documents: [
        'https://example.com/brochure-a12.pdf',
        'https://example.com/specs-a12.pdf'
      ],
      videoUrl: 'https://cdn.example.com/videos/nile-view-a12.mp4',
      virtualTourUrl: 'https://example.com/virtual-tour/nv-a12',
      installmentPlans: [
        { downPayment: '10%', years: 4, deliveryDate: '2026-06-01' },
        { downPayment: '20%', years: 5, deliveryDate: '2026-12-01' }
      ],
      amenities: ['Central AC', 'Smart Home', 'Security 24/7', 'Underground Parking', 'Gym Access']
    }
  ], [])

  const [showAllFilters, setShowAllFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    project: '',
    building: '',
    owner: '',
    developer: '',
    type: '',
    status: '',
    unit: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    createdBy: '',
    createdDate: '',
    paymentPlan: '',
    room: '',
    floor: ''
  })
  
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  
  const cities = useMemo(() => Array.from(new Set([...projectsData.map(p => p.city), ...properties.map(p => p.city)].filter(Boolean))).sort(), [properties])
  const developers = useMemo(() => Array.from(new Set([...projectsData.map(p => p.developer), ...properties.map(p => p.developer)].filter(Boolean))).sort(), [properties])
  const types = useMemo(() => Array.from(new Set([...projectsData.map(p => p.category), ...properties.map(p => p.type)].filter(Boolean))).sort(), [properties])
  const allStatuses = useMemo(() => Array.from(new Set([...projectsData.map(p => p.status), ...properties.map(p => p.status)].filter(Boolean))).sort(), [properties])
  const allPaymentPlans = useMemo(() => Array.from(new Set(properties.map(p => p.paymentPlan).filter(Boolean))).sort(), [properties])
  const allUnits = useMemo(() => Array.from(new Set(properties.map(p => p.unit).filter(Boolean))).sort(), [properties])
  const allProjects = useMemo(() => Array.from(new Set([...projectsData.map(p => p.name), ...properties.map(p => p.name)])).sort(), [properties])
  const allUsers = useMemo(() => Array.from(new Set(properties.map(p => p.createdBy).filter(Boolean))).sort(), [properties])
  const allRooms = useMemo(() => Array.from(new Set(properties.map(p => p.rooms).filter(Boolean))).sort((a,b)=>a-b), [properties])
  const allfloor = useMemo(() => Array.from(new Set(properties.map(p => p.floor).filter(Boolean))).sort((a,b)=>a-b), [properties])
  
  const allBuildings = useMemo(() => buildings.map(b => b.name), [buildings])
  const allOwners = useMemo(() => thirdParties.filter(t => t.type === 'Owner').map(t => t.name), [thirdParties])

  const filtered = useMemo(()=>{
    return properties.filter(p => {
      // 0. Search
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && 
            !p.developer.toLowerCase().includes(q) && 
            !p.city.toLowerCase().includes(q) &&
            !p.unit.toLowerCase().includes(q)) return false
      }
      // 1. Projects
      if (filters.project && p.name !== filters.project) return false
      // 1.1 Buildings
      if (filters.building && p.building !== filters.building) return false
      // 1.2 Owners
      if (filters.owner && p.owner !== filters.owner) return false
      
      // 2. Developer
      if (filters.developer && filters.developer !== 'All' && p.developer !== filters.developer) return false
      // 3. Type
      if (filters.type && filters.type !== 'All' && (p.type || 'Apartment') !== filters.type) return false
      // 4. Status
      if (filters.status && filters.status !== 'All' && p.status !== filters.status) return false
      // 5. Unit Code
      if (filters.unit && p.unit !== filters.unit) return false
      // 6. City
      if (filters.city && filters.city !== 'All' && p.city !== filters.city) return false
      
      // 7. Price Range
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false
      
      // 8. Space Range
      if (filters.minArea && p.area < Number(filters.minArea)) return false
      if (filters.maxArea && p.area > Number(filters.maxArea)) return false
      
      // 9. Created By
      if (filters.createdBy && p.createdBy !== filters.createdBy) return false

      // 10. Created Date
      if (filters.createdDate && p.createdDate !== filters.createdDate) return false

      // 11. Payment Plan
      if (filters.paymentPlan && p.paymentPlan !== filters.paymentPlan) return false

      // 12. Rooms
      if (filters.room && p.rooms !== Number(filters.room)) return false
      
      // 13. floor
      if (filters.floor && p.floor !== Number(filters.floor)) return false

      return true
    })
  }, [properties, filters])

  const stats = useMemo(()=>{
    return {
      total: properties.length,
      totalUnits: properties.reduce((a,b)=>a + (b.units||0), 0),
      sold: properties.filter(p=>p.status==='Sold').length,
      available: properties.filter(p=>p.status==='Available').length,
      reserved: properties.filter(p=>p.status==='Reserved').length,
      resale: properties.filter(p=>p.status==='Resale').length,
      rent: properties.filter(p=>p.status==='Rent').length,
    }
  }, [properties])

  const clearFilters = () => {
    setFilters({
      search: '',
      project: '',
      building: '',
      owner: '',
      developer: '',
      type: '',
      status: '',
      unit: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      createdBy: '',
      createdDate: '',
      paymentPlan: '',
      room: '',
      floor: ''
    })
  }

  const handleSaveProperty = (payload) => {
    if (isEdit && selected) {
      setProperties(prev => prev.map(p => p.id === selected.id ? { ...p, ...payload } : p))
    } else {
      const newProperty = {
        id: Date.now(),
        ...payload,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Current User',
        name: payload.adTitle || payload.project // Ensure name exists for display
      }
      setProperties(prev => [newProperty, ...prev])
    }
    setShowCreateModal(false)
    setIsEdit(false)
    setSelected(null)
  }

  const Label = {
    title: isRTL ? 'العقارات' : 'Properties',
    search: isRTL ? 'بحث' : 'Search',
    filter: isRTL ? 'تصفية' : 'Filter',
    importProperties: isRTL ? 'استيراد' : 'Import',
    createProperty: isRTL ? 'إضافة عقار' : 'Add Property',
    clearFilters: isRTL ? 'اعادة التعيين' : 'Reset',
    exportCSV: isRTL ? 'تصدير CSV' : 'Export CSV',
    exportPDF: isRTL ? 'تصدير PDF' : 'Export PDF',
    projects: isRTL ? 'المشاريع' : 'Projects',
    buildings: isRTL ? 'المباني' : 'Buildings',
    owners: isRTL ? 'الملاك' : 'Owners',
    developer: isRTL ? 'المطور' : 'Developer',
    city: isRTL ? 'المدينة' : 'City',
    status: isRTL ? 'الحالة' : 'Status',
    unitCode: isRTL ? 'كود الوحدة' : 'Unit Code',
    type: isRTL ? 'النوع' : 'Type',
    paymentPlan: isRTL ? 'خطة الدفع' : 'Payment Plan',
    priceRange: isRTL ? 'نطاق السعر' : 'Price Range',
    spaceRange: isRTL ? 'نطاق المساحة' : 'Space Range',
    createdBy: isRTL ? 'بواسطة' : 'Created By',
    createdDate: isRTL ? 'تاريخ الإنشاء' : 'Created Date',
    room: isRTL ? 'الغرف' : 'Rooms',
    floor: isRTL ? 'الدور' : 'Floor',
  }

  const exportCSV = () => {
    const headers = ['name','city','developer','status','units','area','price','documents','lastUpdated','progress']
    const rows = filtered.map(p => headers.map(h => p[h] ?? ''))
    const csv = headers.join(',') + '\n' + rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'properties.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    const [{ default: jsPDF }, autotable] = await Promise.all([
      import('jspdf'), import('jspdf-autotable')
    ])
    const doc = new jsPDF()
    const headers = ['Name','City','Dev','Status','Units','Area','Price']
    const rows = filtered.map(p => [p.name,p.city,p.developer,p.status,p.units,p.area,p.price])
    autotable.default(doc, { head: [headers], body: rows })
    doc.save('properties.pdf')
  }

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  useEffect(() => {
    setPage(1)
  }, [filtered, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(()=> filtered.slice((page-1)*pageSize, page*pageSize), [filtered, page, pageSize])

  const goPrevPage = () => setPage(p => Math.max(1, p - 1))
  const goNextPage = () => setPage(p => Math.min(totalPages, p + 1))

  const shownFrom = useMemo(() => (filtered.length === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, filtered.length])
  const shownTo = useMemo(() => Math.min(page * pageSize, filtered.length), [page, pageSize, filtered.length])

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden min-w-0">
          <div className="glass-panel rounded-xl p-4 md:p-6 relative z-30">

           <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4">
            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3">
              <div className="relative flex flex-col items-start gap-1">
                <h1 className="page-title text-xl md:text-2xl font-bold text-start">{Label.title}</h1>
                <span
                  aria-hidden="true"
                  className="inline-block h-[2px] w-full rounded
               bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>

            </div>

            <div className="w-full lg:w-auto flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
              <button className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2" onClick={()=>setShowImportModal(true)}>
                <FaFileImport />{Label.importProperties}
              </button>

              <button className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white border-none flex items-center justify-center gap-2" onClick={() => { setIsEdit(false); setShowCreateModal(true); }}>
                <FaPlus /> {Label.createProperty}
              </button>
              
              <div className="relative w-full lg:w-auto">
                <button 
                  className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2" 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <FaFileExport  />
                  {isRTL ? 'تصدير' : 'Export'}
                  <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} size={10} />
                </button>
                
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-full sm:w-32 overflow-hidden ltr:right-0 rtl:left-0">
                      <button 
                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => {
                          exportCSV()
                          setShowExportMenu(false)
                        }}
                      >
                        CSV
                      </button>
                      <button 
                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => {
                          exportPDF()
                          setShowExportMenu(false)
                        }}
                      >
                        PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FaFilter className="text-blue-500" /> {Label.filter}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAllFilters(prev => !prev)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
                  <FaChevronDown size={10} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <button onClick={clearFilters} className="flex-1 sm:flex-none px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-center">
                  {Label.clearFilters}
                </button>
              </div>
            </div>

            {/* First Row (Always Visible) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
                {/* 1. Search */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {Label.search}</label>
                   <input className="input w-full" value={filters.search} onChange={e=>setFilters({...filters, search: e.target.value})} placeholder={isRTL ? 'بحث...' : 'Search...'} />
                </div>

                {/* 2. Developer */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaBuilding className="text-blue-500" size={10} /> {Label.developer}</label>
                   <SearchableSelect 
                     options={developers} 
                     value={filters.developer} 
                     onChange={val => setFilters({...filters, developer: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 3. Projects */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaBuilding className="text-blue-500" size={10} /> {Label.projects}</label>
                   <SearchableSelect 
                     options={allProjects} 
                     value={filters.project} 
                     onChange={val => setFilters({...filters, project: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 3.1 Buildings */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaBuilding className="text-blue-500" size={10} /> {Label.buildings}</label>
                   <SearchableSelect 
                     options={allBuildings} 
                     value={filters.building} 
                     onChange={val => setFilters({...filters, building: val})} 
                     isRTL={isRTL} 
                   />
                </div>
            </div>

            {/* Collapsible Section (Rest of the filters) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>

                {/* 3.2 Owners */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaUser className="text-blue-500" size={10} /> {Label.owners}</label>
                   <SearchableSelect 
                     options={allOwners} 
                     value={filters.owner} 
                     onChange={val => setFilters({...filters, owner: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 4. Unit Code */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {Label.unitCode}</label>
                   <SearchableSelect 
                     options={allUnits} 
                     value={filters.unit} 
                     onChange={val => setFilters({...filters, unit: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 5. Payment Plan */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.paymentPlan}</label>
                   <SearchableSelect 
                     options={allPaymentPlans} 
                     value={filters.paymentPlan} 
                     onChange={val => setFilters({...filters, paymentPlan: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 6. Type */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.type}</label>
                   <SearchableSelect 
                     options={types} 
                     value={filters.type} 
                     onChange={val => setFilters({...filters, type: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 7. Status */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.status}</label>
                   <SearchableSelect 
                     options={allStatuses} 
                     value={filters.status} 
                     onChange={val => setFilters({...filters, status: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 8. City */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaMapMarkerAlt className="text-blue-500" size={10} /> {Label.city}</label>
                   <SearchableSelect 
                     options={cities} 
                     value={filters.city} 
                     onChange={val => setFilters({...filters, city: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 9. Created By */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.createdBy}</label>
                   <SearchableSelect 
                     options={allUsers} 
                     value={filters.createdBy} 
                     onChange={val => setFilters({...filters, createdBy: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 10. Created Date */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.createdDate}</label>
                   <input 
                     type="date" 
                     className="input w-full"
                     value={filters.createdDate} 
                     onChange={e=>setFilters({...filters, createdDate: e.target.value})} 
                   />
                </div>

                {/* 11. Price Range */}
                <div className="col-span-1">
                  <RangeSlider
                    label={Label.priceRange}
                    min={0}
                    max={10000000}
                    value={[Number(filters.minPrice || 0), Number(filters.maxPrice || 10000000)]}
                    onChange={([min, max]) => setFilters({...filters, minPrice: min, maxPrice: max})}
                    isRTL={isRTL}
                  />
                </div>

                {/* 12. Space Range */}
                <div className="col-span-1">
                  <RangeSlider
                    label={Label.spaceRange}
                    min={0}
                    max={1000}
                    value={[Number(filters.minArea || 0), Number(filters.maxArea || 1000)]}
                    onChange={([min, max]) => setFilters({...filters, minArea: min, maxArea: max})}
                    isRTL={isRTL}
                  />
                </div>

                {/* 13. Rooms */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.room}</label>
                   <SearchableSelect 
                     options={allRooms.map(String)} 
                     value={filters.room} 
                     onChange={val => setFilters({...filters, room: val})} 
                     isRTL={isRTL} 
                   />
                </div>

                {/* 14. floor */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaFilter className="text-blue-500" size={10} /> {Label.floor}</label>
                   <SearchableSelect 
                     options={allfloor.map(String)} 
                     value={filters.floor} 
                     onChange={val => setFilters({...filters, floor: val})} 
                     isRTL={isRTL} 
                   />
                </div>
            </div>
          </div>
        </div>

        {/* صف فاضي فوق "الجدول" (نعتبر الملخص كجدول) */}
        <div className="h-4" />

        {/* Summary KPIs */}
        <PropertiesSummaryPanel stats={stats} isRTL={isRTL} onFilter={(f)=>{
          if (f.type==='status') setFilters(prev => ({...prev, status: f.value}))
          else clearFilters()
        }} />

        {/* 5 صفوف فاضية تحت الفلتر */}
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />

        {/* Properties List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {paged.map(p => (
            <PropertyCard
              key={p.id}
              p={p}
              isRTL={isRTL}
              onView={setSelected}
              onEdit={()=>{ setSelected(p); setIsEdit(true); setShowCreateModal(true) }}
              onShare={() => {
                try {
                  const payload = {
                    id: p.id,
                    name: p.adTitle || p.name,
                    city: p.city,
                    mainImage: p.mainImage,
                    price: p.price,
                    currency: p.currency,
                    bedrooms: p.bedrooms ?? p.rooms,
                    bathrooms: p.bathrooms ?? p.doors,
                    area: p.area ?? p.totalArea,
                    areaUnit: p.areaUnit,
                    description: p.description,
                    ownerMobile: p.ownerMobile,
                    propertyType: p.propertyType || p.type,
                    logo: p.logo,
                    images: Array.isArray(p.images) ? p.images : [],
                    floorPlans: Array.isArray(p.floorPlans) ? p.floorPlans : [],
                    documents: Array.isArray(p.documents) ? p.documents : [],
                    videoUrl: p.videoUrl,
                    virtualTourUrl: p.virtualTourUrl,
                    address: p.address,
                    locationUrl: p.locationUrl,
                    installmentPlans: Array.isArray(p.installmentPlans) ? p.installmentPlans : [],
                  }
                  const json = JSON.stringify(payload)
                  const bytes = new TextEncoder().encode(json)
                  let bin = ''
                  bytes.forEach(b => { bin += String.fromCharCode(b) })
                  const data = btoa(bin)
                  const base = (import.meta.env?.BASE_URL || '/')
                  const prefix = base.endsWith('/') ? base.slice(0, -1) : base
                  const scope = prefix === '/' ? '' : prefix
                  const companyName = (companySetup && companySetup.companyInfo && companySetup.companyInfo.companyName) || ''
                  const companyParam = companyName ? `&company=${encodeURIComponent(companyName)}` : ''
                  const url = `${window.location.origin}${scope}/#/landing/property?data=${encodeURIComponent(data)}${companyParam}`
                  if (navigator?.share) {
                    navigator.share({ title: payload.name || 'Property', text: 'View property details', url })
                  } else {
                    navigator.clipboard && navigator.clipboard.writeText(url)
                    const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: (isRTL ? 'تم نسخ رابط المشاركة' : 'Share link copied') } })
                    window.dispatchEvent(evt)
                  }
                } catch {}
              }}
              onDelete={()=>alert('Delete clicked')}
            />
          ))}
        </div>

        {/* صف فاضي تحت الكروت */}
        <div className="h-4" />

        {/* Pagination Footer */}
        <div className="mt-2 flex items-center justify-between rounded-xl p-2 glass-panel">
          <div className="text-xs text-[var(--muted-text)]">
            {isRTL ? `عرض ${shownFrom}–${shownTo} من ${filtered.length}` : `Showing ${shownFrom}–${shownTo} of ${filtered.length}`}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-sm btn-ghost"
                onClick={goPrevPage}
                disabled={page <= 1}
                title={isRTL ? 'السابق' : 'Prev'}
              >
                <FaChevronLeft className={isRTL ? 'scale-x-[-1]' : ''} />
              </button>
              <span className="text-sm">{isRTL ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={goNextPage}
                disabled={page >= totalPages}
                title={isRTL ? 'التالي' : 'Next'}
              >
                <FaChevronRight className={isRTL ? 'scale-x-[-1]' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--muted-text)]">{isRTL ? 'لكل صفحة:' : 'Per page:'}</span>
              <select
                className="input w-24 text-sm"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showImportModal && (
          <ImportPropertiesModal onClose={()=>setShowImportModal(false)} isRTL={isRTL} onImported={(rows)=> console.log('Imported rows', rows)} />
        )}
        {showCreateModal && (
          <CreatePropertyModal 
            onClose={()=>setShowCreateModal(false)} 
            isRTL={isRTL} 
            isEdit={isEdit} 
            onSave={handleSaveProperty} 
            buildings={buildings}
            owners={thirdParties.filter(t => t.type === 'Owner')}
            initialData={isEdit ? selected : null}
          />
        )}
        {selected && (<PropertyDetailsModal p={selected} isRTL={isRTL} onClose={()=>setSelected(null)} />)}
      </div>
  )
}

function PropertyDetailsModal({ p, isRTL, onClose }) {
  const [activeTab, setActiveTab] = useState('core')
  const [preview, setPreview] = useState({ list: [], index: -1 })
  const tabs = [
    { id: 'core', label: isRTL ? 'التفاصيل الأساسية' : 'Core Details' },
    { id: 'features', label: isRTL ? 'مواصفات العقار' : 'Features' },
    { id: 'media', label: isRTL ? 'الوسائط' : 'Media' },
    { id: 'location', label: isRTL ? 'الموقع' : 'Location' },
    { id: 'financial', label: isRTL ? 'المالية' : 'Financial' },
    { id: 'cil', label: isRTL ? 'بيانات العميل' : 'CIL' },
    { id: 'publish', label: isRTL ? 'النشر والتوزيع' : 'Publish & Marketing' },
  ]
  const ReadOnlyField = ({ label, value }) => (
    <div>
      <label className="block text-xs text-[var(--muted-text)] mb-1">{label}</label>
      <div className="p-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 text-sm min-h-[38px]">{value || '-'}</div>
    </div>
  )
  const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">{children}</h3>
  )
  const normalizeSrc = (img) => typeof img === 'string' ? img : (img ? URL.createObjectURL(img) : '')
  const openPreview = (list, idx) => setPreview({ list: (Array.isArray(list) ? list : []).map(normalizeSrc).filter(Boolean), index: idx })
  const closePreview = () => setPreview({ list: [], index: -1 })
  const prevImg = () => setPreview(v => ({ ...v, index: (v.index - 1 + v.list.length) % v.list.length }))
  const nextImg = () => setPreview(v => ({ ...v, index: (v.index + 1) % v.list.length }))
  const toDataUrl = async (src) => {
    if (src instanceof File) {
      return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(src) })
    }
    const resp = await fetch(src)
    const blob = await resp.blob()
    return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
  }
  const fitAddImage = async (doc, dataUrl) => {
    const img = new Image()
    img.src = dataUrl
    await new Promise((r)=>{ img.onload = r })
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    const m = 20
    const aw = pw - m*2
    const ah = ph - m*2
    const ratio = Math.min(aw / img.width, ah / img.height)
    const w = img.width * ratio
    const h = img.height * ratio
    const x = m + (aw - w)/2
    const y = m + (ah - h)/2
    const fmt = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    doc.addImage(dataUrl, fmt, x, y, w, h)
  }
  const downloadImagesPdf = async () => {
    const list = [
      ...(p.mainImage ? [p.mainImage] : []),
      ...(Array.isArray(p.images) ? p.images : []),
      ...(Array.isArray(p.floorPlans) ? p.floorPlans : []),
    ]
    if (list.length === 0) return
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    for (let i = 0; i < list.length; i++) {
      const src = list[i]
      const dataUrl = typeof src === 'string' ? await toDataUrl(src) : await toDataUrl(src)
      await fitAddImage(doc, dataUrl)
      if (i < list.length - 1) doc.addPage()
    }
    doc.save(`${(p.adTitle || p.name || 'property').replace(/[\\/:*?\"<>|]/g,'_')}_media.pdf`)
  }
  const [planPreview, setPlanPreview] = useState(null)
  const [isPlanPreviewOpen, setIsPlanPreviewOpen] = useState(false)
  const openPlanPreview = (plan) => { setPlanPreview(plan); setIsPlanPreviewOpen(true) }
  const closePlanPreview = () => { setIsPlanPreviewOpen(false); setPlanPreview(null) }
  const printPlan = (plan) => {
    const w = window.open('', '_blank')
    if (!w) return
    const currencyFmt = (v) => new Intl.NumberFormat('en-EG', { maximumFractionDigits: 2 }).format(Number(v || 0))
    w.document.write(`
      <html><head><title>Payment Plan</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
        .actions { margin-top: 16px; }
      </style>
      </head><body>
      <h2>${isRTL ? 'معاينة خطة الدفع' : 'Payment Plan Preview'}</h2>
      <table>
        <tbody>
          <tr><th>${isRTL ? 'المقدم' : 'Down Payment'}</th><td>${plan.downPayment || '-' } ${String(plan.downPaymentType||'amount')==='percentage' ? '%' : ''}</td></tr>
          <tr><th>${isRTL ? 'نوع الحجز' : 'Reservation Type'}</th><td>${plan.reservationType || '-'}</td></tr>
          <tr><th>${isRTL ? 'دفعة الاستلام' : 'Receipt Amount'}</th><td>${currencyFmt(plan.receiptAmount)}</td></tr>
          <tr><th>${isRTL ? 'قيمة القسط' : 'Installment Amount'}</th><td>${currencyFmt(plan.installmentAmount)}</td></tr>
          <tr><th>${isRTL ? 'تكرار القسط' : 'Installment Frequency'}</th><td>${plan.installmentFrequency || '-'}</td></tr>
          <tr><th>${isRTL ? 'السنوات' : 'Years'}</th><td>${plan.years || '-'}</td></tr>
          <tr><th>${isRTL ? 'دفعة إضافية' : 'Extra Payment'}</th><td>${currencyFmt(plan.extraPayment)}</td></tr>
          <tr><th>${isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency'}</th><td>${plan.extraPaymentFrequency || '-'}</td></tr>
          <tr><th>${isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count'}</th><td>${plan.extraPaymentCount || '0'}</td></tr>
          <tr><th>${isRTL ? 'الاستلام' : 'Delivery'}</th><td>${plan.deliveryDate || '-'}</td></tr>
        </tbody>
      </table>
      <div class="actions">
        <button onclick="window.print()" style="padding:8px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">${isRTL ? 'طباعة' : 'Print'}</button>
      </div>
      </body></html>
    `)
    w.document.close()
  }
  const downloadPlanPdf = (plan, index, title='Property') => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`${isRTL ? 'خطة الدفع' : 'Payment Plan'} #${index+1} - ${title}`, 14, 18)
    const rows = [
      [isRTL ? 'المقدم' : 'Down Payment', `${plan.downPayment || '-'} ${String(plan.downPaymentType||'amount')==='percentage' ? '%' : ''}`],
      [isRTL ? 'نوع الحجز' : 'Reservation Type', plan.reservationType || '-'],
      [isRTL ? 'دفعة الاستلام' : 'Receipt Amount', String(plan.receiptAmount || '0')],
      [isRTL ? 'قيمة القسط' : 'Installment Amount', String(plan.installmentAmount || '0')],
      [isRTL ? 'تكرار القسط' : 'Installment Frequency', plan.installmentFrequency || '-'],
      [isRTL ? 'السنوات' : 'Years', String(plan.years || '-')],
      [isRTL ? 'دفعة إضافية' : 'Extra Payment', String(plan.extraPayment || '0')],
      [isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency', plan.extraPaymentFrequency || '-'],
      [isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count', String(plan.extraPaymentCount || '0')],
      [isRTL ? 'الاستلام' : 'Delivery', plan.deliveryDate || '-'],
    ]
    autoTable(doc, {
      head: [[isRTL ? 'الحقل' : 'Field', isRTL ? 'القيمة' : 'Value']],
      body: rows,
      startY: 24,
      styles: { fontSize: 10 }
    })
    doc.save(`payment-plan-${index+1}.pdf`)
  }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[210] bg-[var(--content-bg)] text-[var(--content-text)] w-full h-screen sm:w-[900px] sm:max-w-[92vw] sm:max-h-[88vh] sm:h-auto sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl font-bold truncate flex-1">{p.adTitle || p.name}</h2>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{p.status || '-'}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title={isRTL ? 'إغلاق' : 'Close'}><FaTimes /></button>
        </div>
        <div className="px-4 pt-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'justify-end' : 'justify-start'} overflow-x-auto`} dir={isRTL ? 'rtl' : 'ltr'}>
                {(isRTL ? [...tabs].slice().reverse() : tabs).map(t => (
                    <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-3 py-2 text-sm rounded-lg border whitespace-nowrap ${activeTab===t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-[var(--content-text)]'}`}>{t.label}</button>
                ))}
            </div>
        </div>
        <div className="p-4 min-h-[400px]">
          {activeTab === 'core' && (
            <div className="space-y-6">
              <SectionTitle>{isRTL ? 'المعلومات الأساسية' : 'Basic Info'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReadOnlyField label={isRTL ? 'عنوان الإعلان' : 'Ad Title'} value={p.adTitle || p.name} />
                  <ReadOnlyField label={isRTL ? 'عنوان الإعلان (عربي)' : 'Ad Title (Ar)'} value={p.adTitleAr} />
                  <ReadOnlyField label={isRTL ? 'المشروع' : 'Project'} value={p.project} />
                  <ReadOnlyField label={isRTL ? 'التصنيف' : 'Category'} value={p.category} />
                  <ReadOnlyField label={isRTL ? 'نوع العقار' : 'Property Type'} value={p.propertyType || p.type} />
                  <ReadOnlyField label={isRTL ? 'رقم الوحدة' : 'Unit Number'} value={p.unitNumber} />
                  <ReadOnlyField label={isRTL ? 'كود الوحدة' : 'Unit Code'} value={p.unitCode || p.unit} />
                  <ReadOnlyField label={isRTL ? 'المبنى' : 'Building'} value={p.building} />
                  <ReadOnlyField label={isRTL ? 'الغرض' : 'Purpose'} value={p.purpose} />
                  <ReadOnlyField label={isRTL ? 'الحالة' : 'Status'} value={p.status} />
                  <ReadOnlyField label={isRTL ? 'تاريخ الإنشاء' : 'Created Date'} value={p.createdDate} />
                  <ReadOnlyField label={isRTL ? 'تم الإنشاء بواسطة' : 'Created By'} value={p.createdBy} />
                  {p.purpose === 'Rent' && <ReadOnlyField label={isRTL ? 'قيمة الإيجار' : 'Rent Cost'} value={p.rentCost} />}
                  <ReadOnlyField label={isRTL ? 'سعر المتر' : 'Meter Price'} value={p.meterPrice} />
              </div>

              <SectionTitle>{isRTL ? 'المساحات' : 'Areas'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ReadOnlyField label={isRTL ? 'المساحة الكلية' : 'Total Area'} value={`${p.totalArea || p.area || 0} ${p.areaUnit || 'm²'}`} />
                  <ReadOnlyField label={isRTL ? 'مساحة المباني' : 'BUA'} value={p.bua} />
                  {p.hasExternalArea && (
                    <>
                      <ReadOnlyField label={isRTL ? 'المساحة الداخلية' : 'Internal Area'} value={p.internalArea} />
                      <ReadOnlyField label={isRTL ? 'المساحة الخارجية' : 'External Area'} value={p.externalArea} />
                    </>
                  )}
                  <ReadOnlyField label={isRTL ? 'سعر المتر الداخلي' : 'Internal Meter Price'} value={p.internalMeterPrice} />
                  <ReadOnlyField label={isRTL ? 'سعر المتر الخارجي' : 'External Meter Price'} value={p.externalMeterPrice} />
              </div>

              <SectionTitle>{isRTL ? 'تفاصيل الوحدة' : 'Unit Details'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ReadOnlyField label={isRTL ? 'غرف النوم' : 'Bedrooms'} value={p.bedrooms ?? p.rooms} />
                  <ReadOnlyField label={isRTL ? 'الحمامات' : 'Bathrooms'} value={p.bathrooms} />
                  <ReadOnlyField label={isRTL ? 'الدور' : 'Floor'} value={p.floor} />
                  <ReadOnlyField label={isRTL ? 'التشطيب' : 'Finishing'} value={p.finishing} />
                  <ReadOnlyField label={isRTL ? 'الإطلالة' : 'View'} value={p.view} />
                  <ReadOnlyField label={isRTL ? 'مصعد' : 'Elevator'} value={p.elevator ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')} />
              </div>
              
              <SectionTitle>{isRTL ? 'بيانات المالك' : 'Owner Info'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReadOnlyField label={isRTL ? 'اسم المالك' : 'Owner Name'} value={p.ownerName} />
                  <ReadOnlyField label={isRTL ? 'هاتف المالك' : 'Owner Mobile'} value={p.ownerMobile} />
              </div>
            </div>
          )}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <SectionTitle>{isRTL ? 'الوصف' : 'Description'}</SectionTitle>
              <div className="text-sm text-[var(--content-text)] whitespace-pre-wrap p-3 rounded border border-gray-200 dark:border-gray-700">
                {p.description}
              </div>
              {p.descriptionAr && (
                 <div className="text-sm text-[var(--content-text)] whitespace-pre-wrap p-3 rounded border border-gray-200 dark:border-gray-700 mt-2" dir="rtl">
                   {p.descriptionAr}
                 </div>
              )}
              <SectionTitle>{isRTL ? 'المواصفات' : 'Amenities'}</SectionTitle>
              {Array.isArray(p.amenities) && p.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {p.amenities.map((item, idx) => (
                    <div key={idx} className="p-2 rounded border border-gray-200 dark:border-gray-700 text-sm">{item}</div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد مواصفات' : 'No amenities'}</div>
              )}
            </div>
          )}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label">{isRTL ? 'اللوجو' : 'Logo'}</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-24 w-24 bg-transparent flex items-center justify-center">
                    {p.logo ? <img src={p.logo} alt="logo" className="w-full h-full object-contain p-2" /> : <FaImage className="text-2xl text-gray-300" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label">{isRTL ? 'الصورة الرئيسية' : 'Main Image'}</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-48 bg-transparent flex items-center justify-center">
                    {p.mainImage ? <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" /> : <FaImage className="text-4xl text-gray-300" />}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionTitle>{isRTL ? 'معرض الصور' : 'Gallery'}</SectionTitle>
                  <button className="btn btn-glass inline-flex items-center gap-2 text-xs" onClick={downloadImagesPdf} title={isRTL ? 'تنزيل PDF' : 'Download PDF'}>
                    <FaCloudDownloadAlt /> {isRTL ? 'تنزيل PDF' : 'Download PDF'}
                  </button>
                </div>
                {Array.isArray(p.images) && p.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {p.images.map((img, idx) => {
                      const src = typeof img === 'string' ? img : URL.createObjectURL(img)
                      return (
                        <button key={idx} className="rounded-lg overflow-hidden h-32 border border-gray-200 dark:border-gray-700 focus:outline-none" onClick={()=>openPreview(p.images, idx)} title={isRTL ? 'عرض' : 'View'}>
                          <img src={src} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--muted-text)]">{isRTL ? 'لا توجد صور' : 'No images'}</div>
                )}
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'المخططات' : 'Floor Plans'}</SectionTitle>
                {Array.isArray(p.floorPlans) && p.floorPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.floorPlans.map((item, idx) => {
                      const isFile = item instanceof File
                      const isPdf = isFile ? String(item.type || '').includes('pdf') : (typeof item === 'string' ? item.toLowerCase().endsWith('.pdf') : false)
                      if (isPdf) {
                        const href = isFile ? URL.createObjectURL(item) : String(item)
                        const name = isFile ? (item.name || `plan-${idx}.pdf`) : `plan-${idx}.pdf`
                        return (
                          <a key={idx} href={href} download={name} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm">
                            <FaPaperclip /> {isRTL ? 'تحميل مخطط PDF' : 'Download PDF Plan'}
                          </a>
                        )
                      }
                      const src = typeof item === 'string' ? item : URL.createObjectURL(item)
                      return (
                        <button key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none" onClick={()=>openPreview(p.floorPlans, idx)} title={isRTL ? 'عرض' : 'View'}>
                          <img src={src} alt={`floor-${idx}`} className="w-full h-auto object-contain" />
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--muted-text)] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{isRTL ? 'لا توجد مخططات' : 'No plans'}</div>
                )}
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'الملفات' : 'Documents'}</SectionTitle>
                {Array.isArray(p.documents) && p.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {p.documents.map((doc, idx) => {
                      const isFile = doc instanceof File
                      const href = isFile ? URL.createObjectURL(doc) : String(doc)
                      const name = isFile ? (doc.name || `document-${idx}.pdf`) : `document-${idx}.pdf`
                      return (
                        <a key={idx} href={href} download={name} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2"><FaPaperclip /> {name}</span>
                          <span className="btn btn-glass inline-flex items-center gap-2 text-xs"><FaCloudDownloadAlt /> {isRTL ? 'تنزيل' : 'Download'}</span>
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد ملفات' : 'No documents'}</div>
                )}
              </div>
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'روابط الفيديو' : 'Video Links'}</SectionTitle>
                {p.videoUrl || p.virtualTourUrl ? (
                  <div className="space-y-2">
                    {p.videoUrl && (
                      <div className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                        <a href={p.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><FaVideo /> {p.videoUrl}</a>
                      </div>
                    )}
                    {p.virtualTourUrl && (
                      <div className="p-3 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700">
                        <a href={p.virtualTourUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><FaVideo /> {p.virtualTourUrl}</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا يوجد فيديو' : 'No videos'}</div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'العنوان' : 'Address'}</SectionTitle>
              <ReadOnlyField label={isRTL ? 'العنوان' : 'Address'} value={p.address} />
              <ReadOnlyField label={isRTL ? 'العنوان (عربي)' : 'Address (Ar)'} value={p.addressAr} />
              <div className="grid grid-cols-2 gap-4">
                <ReadOnlyField label={isRTL ? 'المدينة' : 'City'} value={p.city} />
                <ReadOnlyField label={isRTL ? 'رابط الموقع' : 'Location URL'} value={p.locationUrl} />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-[var(--muted-text)]">{isRTL ? 'الأماكن المجاورة' : 'Nearby'}</label>
                 <div className="flex flex-wrap gap-2">
                    {Array.isArray(p.nearby) && p.nearby.map((n, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs">{n}</span>
                    ))}
                 </div>
              </div>
            </div>
          )}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <SectionTitle>{isRTL ? 'خطط السداد' : 'Payment Plans'}</SectionTitle>
                {Array.isArray(p.installmentPlans) && p.installmentPlans.length > 0 ? (
                  <div className="rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className=" dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="text-start p-3 min-w-[50px] font-medium text-[var(--muted-text)]">ID</th>
                           <th className="text-start p-3 min-w-[100px] font-medium text-[var(--muted-text)]">{isRTL ? 'المقدم' : 'Down Payment'}</th>
                           <th className="text-start p-3 min-w-[130px] font-medium text-[var(--muted-text)]">{isRTL ? 'مبلغ الحجز' : 'Reservation Amount'}</th>
                          <th className="text-start p-3 min-w-[140px] font-medium text-[var(--muted-text)]">{isRTL ? 'دفعة الاستلام' : 'Receipt Amount'}</th>
                          <th className="text-start p-3 min-w-[140px] font-medium text-[var(--muted-text)]">{isRTL ? 'قيمة القسط' : 'Installment Amount'}</th>
                          <th className="text-start p-3 min-w-[140px] font-medium text-[var(--muted-text)]">{isRTL ? 'تكرار القسط' : 'Installment Frequency'}</th>
                          <th className="text-start p-3 font-medium text-[var(--muted-text)]">{isRTL ? 'السنوات' : 'Years'}</th>
                          <th className="text-start p-3 min-w-[140px] font-medium text-[var(--muted-text)]">{isRTL ? 'دفعة إضافية' : 'Extra Payment'}</th>
                          <th className="text-start p-3 min-w-[160px] font-medium text-[var(--muted-text)]">{isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency'}</th>
                          <th className="text-start p-3 min-w-[160px] font-medium text-[var(--muted-text)]">{isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count'}</th>
                          <th className="text-start p-3 font-medium text-[var(--muted-text)]">{isRTL ? 'الاستلام' : 'Delivery'}</th>
                          <th className="text-start p-3 min-w-[140px] font-medium text-[var(--muted-text)]">{isRTL ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.installmentPlans.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700 transition-all duration-300 hover:bg-white/40 dark:hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-sm">
                            <td className="p-3 font-medium ">{i + 1}</td>
                            <td className="p-3">
                                <div className="font-semibold">
                                  {r.downPaymentType === 'percentage'
                                    ? `${r.downPayment}%`
                                    : new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(Number(r.downPayment || 0))
                                  }
                                </div>
                            </td>
                            <td className="p-3">
                              {new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(Number((r.reservationAmount ?? p.reservationAmount) || 0))}
                            </td>
                            <td className="p-3">
                              {new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(Number(r.receiptAmount || 0))}
                            </td>
                            <td className="p-3">
                                <div className="font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(Number(r.installmentAmount || 0))}</div>
                            </td>
                            <td className="p-3">{r.installmentFrequency || '-'}</td>
                            <td className="p-3">{r.years}</td>
                            <td className="p-3">
                              {new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(Number(r.extraPayment || 0))}
                            </td>
                            <td className="p-3">{r.extraPaymentFrequency || '-'}</td>
                            <td className="p-3">{r.extraPaymentCount || '0'}</td>
                            <td className="p-3">{r.deliveryDate}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openPlanPreview(r)} className="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm">{isRTL ? 'عرض' : 'View'}</button>
                                <button onClick={() => downloadPlanPdf(r, i, p.name || 'Property') } className="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none shadow-sm">{isRTL ? 'تحميل' : 'Download'}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--muted-text)] bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    {isRTL ? 'لا توجد خطط سداد متاحة' : 'No payment plans available'}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'cil' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'بيانات العميل' : 'CIL'}</SectionTitle>
              {p.cil ? (
                <div className="space-y-3">
                  <ReadOnlyField label={isRTL ? 'إلى' : 'To'} value={p.cil.to} />
                  <ReadOnlyField label={isRTL ? 'الموضوع' : 'Subject'} value={p.cil.subject} />
                  <div className="p-4 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 text-sm whitespace-pre-wrap">{p.cil.content || '-'}</div>
                  <ReadOnlyField label={isRTL ? 'التوقيع' : 'Signature'} value={p.cil.signature} />
                  {Array.isArray(p.cil.attachments) && p.cil.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {p.cil.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-blue-600"><FaPaperclip /><span>{typeof att === 'string' ? att : (att.name || 'Attachment')}</span></div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--muted-text)]">{isRTL ? 'لا توجد مرفقات' : 'No attachments'}</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--muted-text)]">{isRTL ? 'لا توجد بيانات' : 'No CIL data'}</div>
              )}
            </div>
          )}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <SectionTitle>{isRTL ? 'النشر والتوزيع' : 'Publish & Marketing'}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <ReadOnlyField label={isRTL ? 'الاسم' : 'Name'} value={p.contactName} />
                <ReadOnlyField label={isRTL ? 'البريد' : 'Email'} value={p.contactEmail} />
                <ReadOnlyField label={isRTL ? 'الهاتف' : 'Phone'} value={p.contactPhone} />
                <ReadOnlyField label={isRTL ? 'الحالة' : 'Status'} value={p.status} />
                <ReadOnlyField label={isRTL ? 'الحزمة التسويقية' : 'Marketing Package'} value={p.marketingPackage} />
              </div>
            </div>
          )}
        </div>
        {preview.index >= 0 && (
          <div className="absolute inset-0 z-[220] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={closePreview} />
            <div className="relative z-[230] max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3">
              <img src={preview.list[preview.index]} alt="preview" className="max-w-[90vw] max-h-[75vh] object-contain rounded-xl border border-gray-200 dark:border-gray-700" />
              <div className="flex items-center gap-2">
                <button aria-label="Prev" className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25" onClick={prevImg}>
                  <FaChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button aria-label="Next" className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white border border-white/30 hover:bg-white/25" onClick={nextImg}>
                  <FaChevronRight className="w-3.5 h-3.5" />
                </button>
                <button className="px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700" onClick={closePreview}>
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
        {isPlanPreviewOpen && planPreview && (
          <div className="absolute inset-0 z-[220] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={closePlanPreview} />
            <div className="relative z-[230] w-[90vw] max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-4 bg-[var(--content-bg)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{isRTL ? 'معاينة خطة الدفع' : 'Payment Plan Preview'}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => printPlan(planPreview)} className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none">{isRTL ? 'طباعة' : 'Print'}</button>
                  <button onClick={closePlanPreview} className="btn btn-sm bg-gray-500 hover:bg-gray-600 text-white border-none">{isRTL ? 'إغلاق' : 'Close'}</button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'المقدم' : 'Down Payment'}</td><td className="p-3">{planPreview.downPayment} {String(planPreview.downPaymentType||'amount')==='percentage' ? '%' : ''}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'نوع الحجز' : 'Reservation Type'}</td><td className="p-3">{planPreview.reservationType || '-'}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'دفعة الاستلام' : 'Receipt Amount'}</td><td className="p-3">{new Intl.NumberFormat('en-EG').format(Number(planPreview.receiptAmount||0))}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'قيمة القسط' : 'Installment Amount'}</td><td className="p-3">{new Intl.NumberFormat('en-EG').format(Number(planPreview.installmentAmount||0))}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'تكرار القسط' : 'Installment Frequency'}</td><td className="p-3">{planPreview.installmentFrequency || '-'}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'السنوات' : 'Years'}</td><td className="p-3">{planPreview.years || '-'}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'دفعة إضافية' : 'Extra Payment'}</td><td className="p-3">{new Intl.NumberFormat('en-EG').format(Number(planPreview.extraPayment||0))}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'تكرار الدفعة الإضافية' : 'Extra Payment Frequency'}</td><td className="p-3">{planPreview.extraPaymentFrequency || '-'}</td></tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700"><td className="p-3">{isRTL ? 'عدد الدفعات الإضافية' : 'Extra Payment Count'}</td><td className="p-3">{planPreview.extraPaymentCount || '0'}</td></tr>
                    <tr><td className="p-3">{isRTL ? 'الاستلام' : 'Delivery'}</td><td className="p-3">{planPreview.deliveryDate || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
