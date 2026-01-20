import React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaExclamationTriangle, FaArrowRight, FaBan, FaCheck, FaUserShield, FaHistory, FaWhatsapp, FaTimes, FaClone, FaBuilding, FaChartLine, FaComments, FaTag, FaLayerGroup } from 'react-icons/fa'
import { useTheme } from '../shared/context/ThemeProvider'

const CompareLeadsModal = ({ isOpen, onClose, duplicateLead, originalLead, onResolve }) => {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isRtl = i18n.language === 'ar'

  if (!isOpen) return null

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate time difference
  const timeDiff = originalLead && duplicateLead 
    ? Math.abs(new Date(duplicateLead.createdAt) - new Date(originalLead.createdAt))
    : 0
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

  const renderLeadDetails = (lead, isDuplicate = false) => {
    if (!lead) return null;

    const fields = [
        { key: 'name', label: t('Name'), icon: <FaUser />, value: lead.name || lead.fullName },
        { key: 'phone', label: t('Phone'), icon: <FaPhone />, value: lead.phone || lead.mobile },
        { key: 'email', label: t('Email'), icon: <FaEnvelope />, value: lead.email },
        { key: 'company', label: t('Company'), icon: <FaBuilding />, value: lead.company },
        { key: 'project', label: t('Project'), icon: <FaBuilding />, value: lead.project },
        { key: 'source', label: t('Source'), icon: <FaWhatsapp />, value: lead.source },
        { key: 'stage', label: t('Stage'), icon: <FaLayerGroup />, value: lead.stage },
        { key: 'status', label: t('Status'), icon: <FaCheck />, value: lead.status },
        { key: 'priority', label: t('Priority'), icon: <FaExclamationTriangle />, value: lead.priority },
        { key: 'createdAt', label: t('Creation Date'), icon: <FaCalendarAlt />, value: formatDate(lead.createdAt) },
        { key: 'lastContact', label: t('Last Interaction'), icon: <FaHistory />, value: formatDate(lead.lastContact) },
        { key: 'notes', label: t('Notes'), icon: <FaComments />, value: lead.notes || lead.description, fullWidth: true },
    ];

    return (
        <div className="space-y-3">
            {fields.map((field, index) => {
                if (!field.value && field.key !== 'notes') return null; // Skip empty fields, but maybe show empty notes? or skip too.
                
                return (
                    <div key={index} className={`p-3 rounded-xl border transition-colors flex items-start gap-3 
                        ${isDuplicate 
                            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20' 
                            : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600/50 hover:border-blue-200 dark:hover:border-blue-900/50'
                        } ${field.fullWidth ? 'col-span-1' : ''}`}>
                        
                        <div className={`mt-1 ${isDuplicate ? 'text-red-400' : 'text-slate-400'}`}>
                            {field.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium block mb-0.5">
                                {field.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`block text-sm font-semibold text-slate-900 dark:text-white break-words whitespace-pre-wrap`}>
                                    {field.value || '-'}
                                </span>
                                {isDuplicate && field.key === 'createdAt' && daysDiff > 0 && (
                                    <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded font-medium">
                                        +{daysDiff}d
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div 
        className={`${!isDark ? 'bg-white/70 backdrop-blur-md text-slate-800' : 'bg-slate-800 text-white'} w-full sm:max-w-5xl max-h-[85vh] h-auto sm:rounded-3xl overflow-hidden shadow-2xl border flex flex-col ${!isDark ? 'border-gray-200' : 'border-slate-700'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header - Aligned with Project Identity */}
        <div className={`${!isDark ? 'bg-white/60 border-gray-200' : 'bg-slate-800 border-slate-700'} p-3 sm:p-4 border-b flex justify-between items-center shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`${isDark ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-600'} p-2.5 rounded-xl`}>
              <FaClone size={20} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Resolve Duplicate Lead')}</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('Compare and resolve conflict between two records')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Divider Icon (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} p-2 rounded-full shadow-lg border text-slate-400`}>
                {isRtl ? <FaArrowRight size={16} className="rotate-180" /> : <FaArrowRight size={16} />}
              </div>
            </div>

            {/* Left Card: Original Owner (Primary/Blue Theme) */}
            <div className={`${isDark ? 'bg-slate-700/40 border-blue-500/20' : 'bg-white/60 border-blue-200'} rounded-xl shadow-sm border overflow-hidden flex flex-col h-full relative group hover:shadow-md transition-shadow duration-300`}>
              {/* Badge */}
              <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
                <span className={`${isDark ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'} text-xs font-semibold px-2.5 py-1 rounded-full border`}>
                  {t('Original Record')}
                </span>
              </div>

              <div className="p-6 flex-1">
                {/* Sales Rep Profile */}
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className={`${isDark ? 'bg-slate-600/50 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-white'} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 shadow-sm`}>
                    {originalLead?.assignedTo?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{originalLead?.assignedTo || t('Unassigned')}</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                       <FaUserShield className="text-blue-500" size={12} /> {t('Senior Sales Agent')}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                {renderLeadDetails(originalLead)}
              </div>
            </div>

            {/* Right Card: New Sales Rep (Warning/Red Theme) */}
            <div className={`${isDark ? 'bg-slate-700/40 border-red-500/20' : 'bg-white/60 border-red-200'} rounded-xl shadow-sm border overflow-hidden flex flex-col h-full relative group hover:shadow-md transition-shadow duration-300`}>
               {/* Badge */}
               <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
                <span className={`${isDark ? 'bg-red-900/40 text-red-300 border-red-800' : 'bg-red-100 text-red-700 border-red-200'} text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1`}>
                  <FaExclamationTriangle size={10} />
                  {t('Duplicate')}
                </span>
              </div>

              <div className="p-6 flex-1">
                {/* Sales Rep Profile */}
                <div className="flex items-center gap-4 mb-6 mt-2">
                  <div className={`${isDark ? 'bg-slate-600/50 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-white'} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 shadow-sm`}>
                    {duplicateLead?.assignedTo?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{duplicateLead?.assignedTo || t('Unassigned')}</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1`}>
                       <FaUser className="text-red-500" size={12} /> {t('Sales Agent')}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                {renderLeadDetails(duplicateLead, true)}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions - Standardized Buttons */}
        <div className={`${!isDark ? 'bg-white/60 border-gray-200' : 'bg-slate-800 border-slate-700'} p-3 sm:p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 shrink-0`}>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} hidden md:block`}>
            {t('Choose an action to resolve this conflict.')}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button 
              onClick={() => onResolve('warn')}
              className={`${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} flex-1 md:flex-none px-5 py-2.5 rounded-lg border font-medium transition-colors text-sm`}
            >
              {t('Warn Agent')}
            </button>
            <button 
              onClick={() => onResolve('transfer')}
              className={`${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} flex-1 md:flex-none px-5 py-2.5 rounded-lg font-medium transition-colors text-sm`}
            >
              {t('Transfer Ownership')}
            </button>
            <button 
              onClick={() => onResolve('keep_original')}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
            >
              <FaCheck size={14} />
              {t('Keep Original')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CompareLeadsModal