import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef, useEffect } from 'react';
import { FaWhatsapp, FaEnvelope, FaEye, FaPhone, FaPlus } from 'react-icons/fa';
import { SiGooglemeet } from 'react-icons/si';
import AddActionModal from '@components/AddActionModal';
import { useTheme } from '@shared/context/ThemeProvider';
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal';
import LeadHoverTooltip from '@components/LeadHoverTooltip';

export const DelayLeads = ({ dateFrom, dateTo, selectedEmployee, stageFilter }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const MEET_ICON_URL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><rect x='2' y='4' width='12' height='16' rx='3' fill='%23ffffff'/><rect x='2' y='4' width='12' height='4' rx='2' fill='%234285F4'/><rect x='2' y='4' width='4' height='16' rx='2' fill='%2334A853'/><rect x='10' y='4' width='4' height='16' rx='2' fill='%23FBBC05'/><rect x='2' y='16' width='12' height='4' rx='2' fill='%23EA4335'/><polygon points='14,9 22,5 22,19 14,15' fill='%2334A853'/></svg>"
  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { height: 6px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; border-radius: 9999px; }
    .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #1d4ed8; }
  `
  const ICON_CSS = `
    .icon-whatsapp { color: #25D366; }
    .icon-call { color: #007AFF; }
    .icon-email { color: #FFA726; }
    .icon-preview { color: #616161; }
    .icon-googlemeet { color: #00897B; }
    .btn-preview { background-color: #eeeeee; color: #1f2937; }
    .btn-preview:hover { background-color: #e0e0e0; }
    .btn-addaction { background-color: #2563EB; color: #ffffff; }
    .btn-addaction:hover { background-color: #1D4ED8; }
  `
  const STORAGE_KEY = 'userActionsByDate'
  const loadActions = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
  }
  const saveActions = (obj) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)) } catch {}
  }
  const [showAddActionModal, setShowAddActionModal] = useState(false)
  const handleSaveAction = (action) => {
    try {
      const map = loadActions()
      const key = action?.date || new Date().toISOString().slice(0,10)
      const label = (action?.title || '').trim() || (action?.notes ? String(action.notes).slice(0,60) : `${action?.type || 'action'}`)
      map[key] = [ ...(map[key] || []), label ]
      saveActions(map)
    } finally {
      setShowAddActionModal(false)
    }
  }
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Tooltip state (click-based)
  const [hoveredLead, setHoveredLead] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const activeRowRef = useRef(null);

  useEffect(() => {
    if (showLeadModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return () => { document.body.style.overflow = prev; };
    }
  }, [showLeadModal]);

  // Load all leads from localStorage (shared with Leads page)
  const allLeadsFromStorage = useMemo(() => {
    try {
      const saved = localStorage.getItem('leadsData');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const arr = Array.isArray(parsed) ? parsed : [];
      if (selectedEmployee) {
        return arr.filter(l => (l.assignedTo || l.employee || '').trim() === selectedEmployee)
      }
      return arr;
    } catch (e) {
      console.warn('Failed to parse leadsData from localStorage in DelayLeads.', e?.message);
      return [];
    }
  }, [selectedEmployee]);

  // Mock delayed leads for dashboard preview when storage is empty
  const MOCK_LEADS = [
    {
      id: 'DL-1001',
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '0501234567',
      company: 'Alpha Co',
      status: 'new',
      priority: 'high',
      source: 'Website',
      createdAt: new Date(Date.now() - 15*24*3600*1000).toISOString(), // 15 days ago
      lastContact: new Date(Date.now() - 9*24*3600*1000).toISOString(), // 9 days ago
      notes: 'اجتماع مؤجل؛ يحتاج متابعة',
    },
    {
      id: 'DL-1002',
      name: 'Sara Mohamed',
      email: 'sara@example.com',
      phone: '0559876543',
      company: 'Beta Ltd',
      status: 'in-progress',
      priority: 'medium',
      source: 'Facebook Ads',
      createdAt: new Date(Date.now() - 21*24*3600*1000).toISOString(),
      lastContact: new Date(Date.now() - 12*24*3600*1000).toISOString(),
      notes: 'لا يرد؛ حاولنا الاتصال أول مرة',
    },
    {
      id: 'DL-1003',
      name: 'Hassan Youssef',
      email: 'hassan@example.com',
      phone: '0563332211',
      company: 'Gamma Inc',
      status: 'qualified',
      priority: 'low',
      source: 'Referral',
      createdAt: new Date(Date.now() - 30*24*3600*1000).toISOString(),
      lastContact: new Date(Date.now() - 20*24*3600*1000).toISOString(),
      notes: 'إعادة جدولة الاجتماع الأسبوع القادم',
    },
  ];

  // Use storage if available; otherwise show mock preview data
  const allLeads = allLeadsFromStorage.length > 0 ? allLeadsFromStorage : MOCK_LEADS;

  // Load stage names from Settings (localStorage: crmStages)
  const stageNames = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crmStages') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        return saved
          .map((s) => (typeof s === 'string' ? s : s?.name))
          .filter(Boolean);
      }
      return ['new', 'qualified', 'in-progress', 'converted', 'lost'];
    } catch (e) {
      return ['new', 'qualified', 'in-progress', 'converted', 'lost'];
    }
  }, []);

  const delayThresholdDays = 7; // عدد الأيام قبل اعتبار الليد متأخرًا

  const deriveDelayCategory = (lead) => {
    const notes = (lead?.notes || '').toLowerCase();
    if (notes.includes('meeting') || notes.includes('اجتماع')) return 'followUpAfterMeeting';
    if (notes.includes('reschedule') || notes.includes('إعادة')) return 'rescheduleMeeting';
    if (notes.includes('no answer') || notes.includes('لا يرد')) return 'noAnswer1stCall';
    return 'followUp';
  };

  const isDelayedLead = (lead) => {
    const activeStatuses = ['new', 'qualified', 'in-progress'];
    if (!activeStatuses.includes(lead?.status)) return false;
    const lastActionStr = lead?.lastContact || lead?.createdAt;
    const lastAction = new Date(lastActionStr);
    if (isNaN(lastAction)) return false;
    const now = new Date();
    const diffDays = Math.floor((now - lastAction) / (1000 * 60 * 60 * 24));
    return diffDays > delayThresholdDays;
  };

  // Project delayed leads into the UI shape used by this component
  const delayLeads = useMemo(() => {
    const delayed = allLeads.filter(isDelayedLead);
    return delayed.map((l) => ({
      // keep original fields for tooltip actions
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      status: l.status,
      priority: l.priority,
      source: l.source,
      createdAt: l.createdAt,
      lastContact: l.lastContact,
      notes: l.notes,
      // fields used by DelayLeads table rendering
      leadName: l.name,
      mobile: l.phone ? `(${String(l.phone).slice(0, 3)}*****)` : '',
      actionDate: l.lastContact || l.createdAt,
      lastComment: l.notes || '',
      category: deriveDelayCategory(l),
    }));
  }, [allLeads]);

  const formatDateSafe = (iso) => {
    try {
      const d = new Date(iso)
      return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
    } catch {
      return iso || ''
    }
  }

  const renderStageBadge = (status) => {
    const s = String(status || '').toLowerCase()
    const label = s === 'new' ? t('New')
      : s === 'qualified' ? t('Qualified')
      : s === 'in-progress' ? t('In Progress')
      : s === 'converted' ? t('Converted')
      : s === 'lost' ? t('Lost')
      : (status || '-')

    if (isLight) {
      const map = s === 'new' ? 'new'
        : s === 'qualified' ? 'qualified'
        : s === 'in-progress' ? 'in-progress'
        : s === 'converted' ? 'converted'
        : s === 'lost' ? 'lost'
        : 'new'
      return <span className={`stage-badge ${map}`}>{label}</span>
    }

    const cls = s === 'new' ? 'dark:bg-blue-900/30 dark:text-blue-200'
      : s === 'qualified' ? 'dark:bg-emerald-900/30 dark:text-emerald-200'
      : s === 'in-progress' ? 'dark:bg-amber-900/30 dark:text-amber-200'
      : s === 'converted' ? 'dark:bg-purple-900/30 dark:text-purple-200'
      : s === 'lost' ? 'dark:bg-red-900/30 dark:text-red-200'
      : 'dark:bg-gray-900/30 dark:text-gray-200'
    return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${cls}`}>{label}</span>
  }

  // Helper: parse and compare dates safely
  const inDateRange = (leadDateStr) => {
    // If no range provided, include all
    if (!dateFrom && !dateTo) return true;
    const d = new Date(leadDateStr);
    if (isNaN(d)) return true; // If parsing fails, don't exclude
    // Normalize time for inclusive comparison
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (day < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(0, 0, 0, 0);
      if (day > to) return false;
    }
    return true;
  };

  // Calculate counts per stage within the selected date range
  const stageCounts = useMemo(() => {
    const init = Object.fromEntries(stageNames.map((n) => [n, 0]));
    const ranged = delayLeads.filter((lead) => inDateRange(lead.stageDate));
    ranged.forEach((lead) => {
      const statusKey = String(lead?.status || '').toLowerCase();
      const matched = stageNames.find((n) => String(n).toLowerCase() === statusKey);
      if (matched) init[matched] = (init[matched] || 0) + 1;
    });
    return init;
  }, [delayLeads, dateFrom, dateTo, stageNames]);

  // Filter leads based on selected stage and date range, with fallback data when empty
  const filteredLeads = useMemo(() => {
    const ranged = delayLeads.filter((lead) => inDateRange(lead.actionDate));
    const matchesStage = (lead) => {
      const s = String(selectedFilter || '').toLowerCase();
      if (!s) return true;
      const status = String(lead?.status || '').toLowerCase();
      const category = String(lead?.category || '').toLowerCase();
      const source = String(lead?.source || '').toLowerCase();
      if (s === 'new') return status === 'new';
      if (s === 'pending') return status === 'in-progress' || status === 'pending';
      if (s === 'followup') return category.includes('followup') || status === 'follow-up';
      if (s === 'coldcalls') return source === 'cold-call' || source === 'direct' || source === 'coldcalls';
      if (s === 'duplicate') return String(lead?.duplicateStatus || lead?.isDuplicate || '').toLowerCase() === 'duplicate' || lead?.isDuplicate === true;
      return true;
    };
    const primary = ranged.filter(matchesStage);
    if (primary.length > 0) return primary;
    const fallbackDelayLeads = MOCK_LEADS.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      status: l.status,
      priority: l.priority,
      source: l.source,
      createdAt: l.createdAt,
      lastContact: l.lastContact,
      notes: l.notes,
      leadName: l.name,
      mobile: l.phone ? `(${String(l.phone).slice(0, 3)}*****)` : '',
      actionDate: l.lastContact || l.createdAt,
      lastComment: l.notes || '',
      category: deriveDelayCategory(l),
    }));
    const rangedFallback = fallbackDelayLeads.filter((lead) => inDateRange(lead.actionDate));
    return rangedFallback.filter(matchesStage);
  }, [delayLeads, selectedFilter, dateFrom, dateTo]);
  
  // Determine if we need to show scrollbar (when leads > 5)
  const showScroll = filteredLeads.length > 5;

  // Background colors matching the sidebar
  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-gray-100' : 'bg-gray-900';
  const textColor = isLight ? 'text-gray-800' : 'text-gray-100';

  // Click handler to show tooltip anchored above the clicked row/card
  const handleRowClick = (lead, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    activeRowRef.current = event.currentTarget;
    setHoveredLead(lead);
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowTooltip(true);
  };

  // Click-away to hide tooltip when clicking any other element
  useEffect(() => {
    const handleDocumentMouseDown = (e) => {
      if (!showTooltip) return;
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      if (activeRowRef.current && activeRowRef.current.contains(e.target)) return;
      setShowTooltip(false);
      setHoveredLead(null);
      activeRowRef.current = null;
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [showTooltip]);

  return (
    <div className={`p-4 ${bgColor} h-full overflow-auto rounded-lg shadow-md border ${isLight ? 'border-gray-200' : 'border-gray-700'} ${textColor}`}>

      <div className="hidden">
        {(() => {
          // Build filter buttons from Settings stages with counts
          const filterButtons = stageNames.map((name) => ({
            key: name,
            label: name,
            count: stageCounts[name] || 0,
          }));

          return (
            <>
              {/* Show first 2 buttons */}
              {filterButtons.slice(0, 2).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${selectedFilter === filter.key ? 'bg-blue-600 text-white' : isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{filter.label}</span>
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}

              {/* Show More button after the second button */}
              {!showAllFilters && filterButtons.length > 2 && (
                <button
                  onClick={() => setShowAllFilters(true)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded border-2 border-dashed ${isLight ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-blue-600 bg-blue-900/20 text-blue-400'}`}
                >
                  <span className="hidden sm:inline">{t('Show More')} ({filterButtons.length - 2})</span>
                  <span className="sm:hidden">+{filterButtons.length - 2}</span>
                </button>
              )}

              {/* Show remaining buttons when expanded */}
              {showAllFilters && filterButtons.slice(2).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${selectedFilter === filter.key ? 'bg-blue-600 text-white' : isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span>{filter.label}</span>
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}

              {selectedFilter && (
                <button
                  onClick={() => setSelectedFilter(null)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded ${isLight ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {t('Show All')}
                </button>
              )}

              {showAllFilters && (
                <button
                  onClick={() => setShowAllFilters(false)}
                  className={`px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-sm rounded border-2 border-dashed ${isLight ? 'border-gray-300 bg-gray-50 text-gray-600' : 'border-gray-600 bg-gray-800 text-gray-400'}`}
                >
                  <span className="hidden sm:inline">{t('Show Less')}</span>
                  <span className="sm:hidden">−</span>
                </button>
              )}
            </>
          );
        })()}
      </div>
      
      {/* Table container with conditional max height and scrolling */}
      <style>{SCROLLBAR_CSS}</style>
      <style>{ICON_CSS}</style>
      <div className={`overflow-x-auto scrollbar-thin-blue ${showScroll ? 'max-h-80 overflow-y-auto' : ''}`}>
        <div className="sm:hidden">
          {/* Mobile card layout */}
          {filteredLeads.map((lead, index) => (
            <div
              key={index}
              className={`p-3 mb-2 rounded-lg border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} cursor-default`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-sm">{lead.leadName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{lead.mobile}</div>
                  <div className="mt-1">{renderStageBadge(lead.status)}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDateSafe(lead.actionDate)}</div>
              </div>
              <div className="text-sm mb-3">{lead.lastComment}</div>
              <div className="flex items-center justify-end gap-2 flex-nowrap">
                <button
                  title={t('Preview')}
                  onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowLeadModal(true); }}
                  className={`inline-flex items-center justify-center ${isLight ? 'text-gray-700 hover:text-blue-500' : 'text-indigo-300 hover:text-indigo-400'}`}
                >
                  <FaEye size={16} className={`${isLight ? 'text-gray-700' : 'text-indigo-300'}`} />
                </button>
                <button
                  title={t('Add Action')}
                  onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowAddActionModal(true) }}
                  className={`inline-flex items-center justify-center ${isLight ? 'text-gray-700 hover:text-blue-500' : 'text-emerald-300 hover:text-emerald-400'}`}
                >
                  <FaPlus size={16} className={`${isLight ? 'text-gray-700' : 'text-emerald-300'}`} />
                </button>
                <button
                  title={t('Call')}
                  onClick={(e) => { e.stopPropagation(); const raw = lead.phone || lead.mobile || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`tel:${digits}`); }}
                  className={`inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-500`}
                >
                  <FaPhone size={16} className="icon-call" />
                </button>
                <button
                  title="WhatsApp"
                  onClick={(e) => { e.stopPropagation(); const raw = lead.phone || lead.mobile || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`https://wa.me/${digits}`); }}
                  className={`inline-flex items-center justify-center text-green-600 dark:text-green-400 hover:text-green-500`}
                >
                  <FaWhatsapp size={16} className="icon-whatsapp" />
                </button>
                <button
                  title={t('Email')}
                  onClick={(e) => { e.stopPropagation(); if (lead.email) window.open(`mailto:${lead.email}`); }}
                  className={`inline-flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-blue-500`}
                >
                  <FaEnvelope size={16} className="icon-email" />
                </button>
                <button
                  title="Google Meet"
                  onClick={(e) => { e.stopPropagation(); window.open('https://meet.google.com/', '_blank'); }}
                  className={`inline-flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-blue-500`}
                >
                  <SiGooglemeet size={16} className="icon-googlemeet" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="hidden sm:block">
          {/* Desktop table layout */}
          <table dir={i18n.dir() === 'rtl' ? 'rtl' : 'ltr'} className={`delay-table w-full min-w-max text-sm ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}>
            <thead className={`text-xs uppercase`}>
              <tr>
                <th scope="col" className="px-6 py-3">{t('Lead Name')}</th>
                <th scope="col" className={`px-6 py-3 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{t('Mobile')}</th>
                <th scope="col" className={`px-6 py-3 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{t('Actions')}</th>
                <th scope="col" className={`px-6 py-3 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{t('Stage')}</th>
                <th scope="col" className={`px-6 py-3 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{t('Last Comment')}</th>
                <th scope="col" className={`px-6 py-3 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{t('Action Date')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr
                  key={index}
                  className={`border-b ${isLight ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-gray-800 border-gray-700 dark:hover:bg-blue-900/25 dark:hover:shadow-md dark:hover:shadow-black/40'}`}
                >
                  <td className="px-6 py-4 cell-divider">{lead.leadName}</td>
                  <td className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} cell-divider ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{lead.mobile}</td>
                  <td className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} cell-divider ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-2 flex-nowrap">
                      <button
                        title={t('Preview')}
                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowLeadModal(true); }}
                        className={`inline-flex items-center justify-center ${isLight ? 'text-gray-700 hover:text-blue-500' : 'text-indigo-300 hover:text-indigo-400'}`}
                      >
                        <FaEye size={16} className={`${isLight ? 'text-gray-700' : 'text-indigo-300'}`} />
                      </button>
                      <button
                        title={t('Add Action')}
                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowAddActionModal(true) }}
                        className={`inline-flex items-center justify-center ${isLight ? 'text-gray-700 hover:text-blue-500' : 'text-emerald-300 hover:text-emerald-400'}`}
                      >
                        <FaPlus size={16} className={`${isLight ? 'text-gray-700' : 'text-emerald-300'}`} />
                      </button>
                      <button
                        title={t('Call')}
                        onClick={(e) => { e.stopPropagation(); const raw = lead.phone || lead.mobile || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`tel:${digits}`); }}
                        className={`inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-500`}
                      >
                        <FaPhone size={16} className="icon-call" />
                      </button>
                      <button
                        title="WhatsApp"
                        onClick={(e) => { e.stopPropagation(); const raw = lead.phone || lead.mobile || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`https://wa.me/${digits}`); }}
                        className={`inline-flex items-center justify-center text-green-600 dark:text-green-400 hover:text-green-500`}
                      >
                        <FaWhatsapp size={16} className="icon-whatsapp" />
                      </button>
                      <button
                        title={t('Email')}
                        onClick={(e) => { e.stopPropagation(); if (lead.email) window.open(`mailto:${lead.email}`); }}
                        className={`inline-flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-blue-500`}
                      >
                        <FaEnvelope size={16} className="icon-email" />
                      </button>
                      <button
                        title="Google Meet"
                        onClick={(e) => { e.stopPropagation(); window.open('https://meet.google.com/', '_blank'); }}
                        className={`inline-flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-blue-500`}
                      >
                        <SiGooglemeet size={16} className="icon-googlemeet" />
                      </button>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} cell-divider ${isLight ? 'stage-cell' : ''} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{renderStageBadge(lead.status)}</td>
                  <td className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{lead.lastComment}</td>
                  <td className={`px-6 py-4 ${i18n.dir() === 'rtl' ? 'border-r' : 'border-l'} ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>{formatDateSafe(lead.actionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Lead Details Modal (same as Lead Management page) */}
      {showLeadModal && (
        <EnhancedLeadDetailsModal
          isOpen={showLeadModal}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          isArabic={i18n.language === 'ar'}
          theme={theme}
        />
      )}

      {showAddActionModal && (
        <AddActionModal
          isOpen={true}
          onClose={() => setShowAddActionModal(false)}
          onSave={handleSaveAction}
          lead={selectedLead}
        />
      )}
    </div>
  );
};
