import React from 'react'
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaTag, FaBuilding, FaMapMarkerAlt, FaIdCard, FaLayerGroup, FaLaptop, FaMobileAlt, FaDesktop } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../shared/context/ThemeProvider'

const UserPreviewModal = ({ isOpen, onClose, user }) => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isRTL = i18n.language === 'ar'
  
  if (!isOpen || !user) return null

  const inputClass = `w-full px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border outline-none transition-all cursor-default text-xs md:text-sm font-medium ${
    isDark 
      ? 'bg-gray-800/50 border-gray-700/50 text-gray-100' 
      : 'bg-gray-50/50 border-gray-200/60 text-gray-800'
  }`

  const labelClass = `block text-[10px] md:text-xs font-semibold mb-1 md:mb-1.5 text-theme-text opacity-60 uppercase tracking-wider`
  const sectionTitleClass = `text-sm md:text-lg font-bold flex items-center gap-2 text-theme-text mb-2 md:mb-4 pb-1.5 md:pb-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`

  const getDeviceIcon = (device) => {
    const name = (typeof device === 'string' ? device : (device.type || device.name))?.toLowerCase() || '';
    if (name.includes('mobile') || name.includes('phone') || name.includes('android') || name.includes('ios')) {
      return <FaMobileAlt className="w-3 h-3 md:w-4 md:h-4" />;
    }
    return <FaDesktop className="w-3 h-3 md:w-4 md:h-4" />;
  };

  return (
    <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={`card relative w-full max-w-3xl max-h-[95vh] md:max-h-[85vh] overflow-hidden rounded-xl md:rounded-3xl shadow-2xl flex flex-col transform transition-all ${isDark ? 'bg-gray-900 ring-1 ring-white/10' : 'bg-white ring-1 ring-black/5'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-3 md:px-8 md:py-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'} bg-opacity-50`}>
          <div className="flex items-center gap-2 md:gap-4">
             <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <FaUser size={16} className="md:w-6 md:h-6" />
             </div>
             <div>
                <h2 className="text-base md:text-xl font-bold text-theme-text">{user.fullName || (isRTL ? 'مستخدم' : 'User')}</h2>
                <p className="text-[10px] md:text-sm opacity-60 text-theme-text">{user.role || '-'}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-xs md:btn-sm btn-circle btn-ghost text-theme-text opacity-70 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <FaTimes size={16} className="md:w-5 md:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-8 custom-scrollbar">
          
          {/* Section 1: Personal Information */}
          <section>
             <h3 className={sectionTitleClass}>
                <span className="text-blue-500"><FaIdCard /></span>
                {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div>
                  <label className={labelClass}>{isRTL ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <div className="relative group">
                    <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaUser className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <input type="text" value={user.fullName || ''} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{isRTL ? 'اسم المستخدم' : 'Username'}</label>
                  <div className="relative group">
                    <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaTag className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <input type="text" value={user.username || ''} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <div className="relative group">
                    <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaPhone className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <input type="text" value={user.phone || ''} readOnly dir="ltr" className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="relative group">
                    <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaEnvelope className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <input type="text" value={user.email || ''} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>
             </div>
          </section>

          {/* Section 2: Work Details */}
          <section>
             <h3 className={sectionTitleClass}>
                <span className="text-purple-500"><FaBuilding /></span>
                {isRTL ? 'بيانات العمل' : 'Work Details'}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                <div className="md:col-span-1">
                  <label className={labelClass}>{isRTL ? 'القسم' : 'Department'}</label>
                  <div className="relative group">
                     <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaLayerGroup className="w-3 h-3 md:w-4 md:h-4" />
                     </div>
                     <input type="text" value={user.department || '-'} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>{isRTL ? 'الفرع' : 'Branch'}</label>
                  <div className="relative group">
                     <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaBuilding className="w-3 h-3 md:w-4 md:h-4" />
                     </div>
                     <input type="text" value={user.branch || '-'} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>

                 <div>
                  <label className={labelClass}>{isRTL ? 'المنطقة' : 'Region'}</label>
                  <div className="relative group">
                     <div className={`absolute ${isRTL ? 'right-2 md:right-3' : 'left-2 md:left-3'} top-2 md:top-3 text-theme-text opacity-40 group-hover:opacity-70 transition-opacity`}>
                        <FaMapMarkerAlt className="w-3 h-3 md:w-4 md:h-4" />
                     </div>
                     <input type="text" value={user.region || '-'} readOnly className={`${inputClass} ${isRTL ? 'pr-8 md:pr-10' : 'pl-8 md:pl-10'}`} />
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>{isRTL ? 'الحالة' : 'Status'}</label>
                  <div className={`w-full px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border flex items-center gap-2 md:gap-3 ${
                    user.status === 'Active' 
                        ? (isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700')
                        : (isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
                  }`}>
                    <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                    <span className="text-xs md:text-sm font-medium">{user.status || 'Inactive'}</span>
                  </div>
                </div>
             </div>
          </section>

           {/* Section 3: Session Info */}
           <section>
              <h3 className={sectionTitleClass}>
                 <span className="text-orange-500"><FaLaptop /></span>
                 {isRTL ? 'معلومات الجلسة' : 'Session Info'}
              </h3>
              <div>
                <label className={labelClass}>{isRTL ? 'الأجهزة التي تم تسجيل الدخول بها' : 'Logged-in Devices'}</label>
                <div className="flex gap-2 md:gap-3 flex-wrap mt-2">
                  {user.devices && user.devices.length > 0 ? (
                    user.devices.map((device, idx) => (
                      <div key={idx} className={`
                        pl-2 pr-3 py-1.5 md:pl-3 md:pr-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium flex items-center gap-2 md:gap-3 transition-all
                        ${isDark 
                            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm'}
                      `}>
                        <div className={`p-1 md:p-1.5 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                            {getDeviceIcon(device)}
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-tight text-[10px] md:text-sm">{typeof device === 'string' ? device : device.name}</span>
                            {typeof device !== 'string' && device.ip && (
                                <span className={`text-[9px] md:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {device.ip}
                                </span>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-dashed w-full text-center ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                        <span className="text-xs md:text-sm">{isRTL ? 'لا توجد أجهزة نشطة حالياً' : 'No active devices found'}</span>
                    </div>
                  )}
                </div>
             </div>
           </section>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-3 py-3 md:px-8 md:py-5 border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm md:btn-md px-4 md:px-6 bg-blue dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-theme-text border-none rounded-lg md:rounded-xl font-medium transition-colors text-xs md:text-base"
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserPreviewModal
