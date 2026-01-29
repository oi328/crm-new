import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeProvider';
import { FaUser, FaTimes, FaCog, FaPlus, FaEdit, FaCheckCircle, FaClock, FaSearch, FaFilter, FaSortAmountDown, FaList, FaCalendarAlt, FaPhone, FaEnvelope, FaTrash, FaEye, FaEllipsisV, FaWhatsapp, FaVideo, FaComments, FaMapMarkerAlt, FaDollarSign, FaUserCheck, FaChevronDown, FaFileAlt, FaDownload, FaPaperclip } from 'react-icons/fa';
import AddActionModal from '@components/AddActionModal';
import EditLeadModal from '@components/EditLeadModal';
import PaymentPlanModal from '@components/PaymentPlanModal';

import CreateRequestModal from '@components/CreateRequestModal';
import { useStages } from '@hooks/useStages';
import { saveRequest as saveRealEstateRequest } from '../../data/realEstateRequests';
import { saveRequest as saveInventoryRequest } from '../../data/inventoryRequests';

const EnhancedLeadDetailsModal = ({ lead, isOpen, onClose, isArabic = false, theme: propTheme = 'light', assignees = [], onAssign, onUpdateLead }) => {
  const { theme: contextTheme } = useTheme();
  const theme = contextTheme || propTheme;
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedActions, setSelectedActions] = useState([]);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [actionType, setActionType] = useState('call');
  const [commFilter, setCommFilter] = useState('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeChannel, setComposeChannel] = useState('whatsapp');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeText, setComposeText] = useState('');
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [assignStep, setAssignStep] = useState('teams');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [checkInHistory, setCheckInHistory] = useState([]);

  // Sample data for demonstration
  const leadData = {
    name: lead?.fullName || lead?.leadName || lead?.name || 'النوه صان',
    phone: lead?.mobile || lead?.phone || '+966512345698',
    email: lead?.email || 'lead28@example.com',
    company: lead?.company || 'النصري الطحان عكي الحداور',
    location: lead?.location || 'Not specified',
    source: lead?.source || 'referral',
    createdDate: lead?.createdDate || 'Not specified',
    status: lead?.status || 'qualified',
    priority: lead?.priority || 'high',
    stage: lead?.stage || (isArabic ? 'جديد' : 'New'),
    createdBy: lead?.createdBy || 'Not specified',
    salesPerson: (() => {
      const s = String(lead?.stage || '').toLowerCase();
      const isNew = s.includes('new') || s.includes('جديد') || s.includes('نيوليد');
      return isNew ? '-' : (lead?.assignedTo || lead?.salesPerson || 'Not specified');
    })()
  };

  useEffect(() => {
    // Load Check-In History from localStorage and filter for this lead
    try {
      const allReports = JSON.parse(localStorage.getItem('checkInReports') || '[]');
      const leadReports = allReports.filter(report => 
        (report.leadId && report.leadId === lead?.id) || 
        (report.customerName && (report.customerName === leadData.name || report.customerName === lead?.name))
      ).sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
      
      setCheckInHistory(leadReports);
    } catch (e) {
      console.error('Error loading check-in history', e);
    }
  }, [lead, leadData.name]);

  const filteredCheckInHistory = checkInHistory.filter(item => {
    if (!historyDateFilter) return true;
    const itemDate = new Date(item.checkInDate).toISOString().split('T')[0];
    return itemDate === historyDateFilter;
  }).sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));

  // Mock Teams Data
  const TEAMS_DATA = {
    'Sales Team A': ['Ahmed Ali', 'Sara Noor'],
    'Sales Team B': ['Ibrahim'],
    'Marketing': ['Dina', 'Elias']
  };

  const headerMenuRef = useRef(null);
  const headerMenuBtnRef = useRef(null);
  const assignMenuRef = useRef(null);
  const assignMenuBtnRef = useRef(null);
  const { stages } = useStages();

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Header Menu
      if (showHeaderMenu) {
        const menuEl = headerMenuRef.current;
        const btnEl = headerMenuBtnRef.current;
        if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
          setShowHeaderMenu(false);
        }
      }
      // Assign Menu
      if (showAssignMenu) {
        const menuEl = assignMenuRef.current;
        const btnEl = assignMenuBtnRef.current;
        if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
          setShowAssignMenu(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showHeaderMenu, showAssignMenu]);
  const demoActions = [
    {
      id: 1,
      type: 'call',
      title: isArabic ? 'مكالمة هاتفية مع العميل' : 'Phone call with client',
      description: isArabic ? 'مناقشة تفاصيل المشروع والمتطلبات الأساسية' : 'Discuss project details and basic requirements',
      date: '2024-01-15',
      time: '10:30',
      status: 'completed',
      priority: 'high',
      assignee: isArabic ? 'أحمد محمد' : 'Ahmed Mohamed',
      duration: isArabic ? '25 دقيقة' : '25 min',
      demo: true
    },
    {
      id: 2,
      type: 'email',
      title: isArabic ? 'إرسال عرض سعر' : 'Send quotation',
      description: isArabic ? 'إرسال عرض سعر مفصل للمشروع المطلوب' : 'Send detailed quotation for requested project',
      date: '2024-01-14',
      time: '14:15',
      status: 'completed',
      priority: 'medium',
      assignee: isArabic ? 'سارة أحمد' : 'Sara Ahmed',
      duration: null,
      demo: true
    },
    {
      id: 3,
      type: 'meeting',
      title: isArabic ? 'اجتماع مع فريق المبيعات' : 'Meeting with sales team',
      description: isArabic ? 'مراجعة استراتيجية التعامل مع العميل' : 'Review client handling strategy',
      date: '2024-01-16',
      time: '11:00',
      status: 'scheduled',
      priority: 'high',
      assignee: isArabic ? 'محمد علي' : 'Mohamed Ali',
      duration: isArabic ? '60 دقيقة' : '60 min',
      demo: true
    },
    {
      id: 4,
      type: 'note',
      title: isArabic ? 'ملاحظات المتابعة' : 'Follow-up notes',
      description: isArabic ? 'تسجيل ملاحظات حول اهتمام العميل بالمنتج' : 'Record notes about client interest',
      date: '2024-01-13',
      time: '16:45',
      status: 'completed',
      priority: 'low',
      assignee: isArabic ? 'فاطمة حسن' : 'Fatma Hassan',
      duration: null,
      demo: true
    },
    {
      id: 5,
      type: 'task',
      title: isArabic ? 'إعداد العرض التقديمي' : 'Prepare presentation',
      description: isArabic ? 'تحضير عرض تقديمي شامل للعميل' : 'Prepare comprehensive client presentation',
      date: '2024-01-17',
      time: '09:00',
      status: 'pending',
      priority: 'medium',
      assignee: isArabic ? 'خالد أحمد' : 'Khaled Ahmed',
      duration: isArabic ? '120 دقيقة' : '120 min',
      demo: true
    }
  ];
  const [paymentPlan, setPaymentPlan] = useState(lead?.paymentPlan || null);

  useEffect(() => {
    setPaymentPlan(lead?.paymentPlan || null);
  }, [lead]);

  const [actions, setActions] = useState(lead?.actions || []);
  React.useEffect(() => {
    setActions(lead?.actions || []);
  }, [lead]);

  if (!isOpen) return null;

  // Handle adding new action
  const handleAddAction = (newAction) => {
    console.log('إضافة إجراء جديد:', newAction);

    // Save reservation data if applicable
    if (newAction.nextAction === 'reservation') {
       console.log('Processing Reservation. Raw Action:', newAction);

       // Intelligent Type Detection to resolve potential mismatches
       let effectiveType = newAction.reservationType;
       // If item is present (and it's not a project), force general
       if (newAction.reservationItem && newAction.reservationItem !== '') {
           effectiveType = 'general';
       }
       // If project is present (and it's not general item), force project
       if (newAction.reservationProject && newAction.reservationProject !== '') {
           effectiveType = 'project';
       }

       console.log('Effective Reservation Type:', effectiveType);

       if (effectiveType === 'project') {
          const realEstateRequest = {
              id: Date.now(),
              customer: leadData.name,
              project: newAction.reservationProject,
              unit: newAction.reservationUnit,
              amount: newAction.reservationAmount,
              status: 'Pending',
              type: 'Booking',
              date: new Date().toISOString().split('T')[0],
              notes: newAction.reservationNotes,
              phone: leadData.phone
          };
          console.log('Saving to Real Estate:', realEstateRequest);
          saveRealEstateRequest(realEstateRequest);
          const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم حفظ طلب المشروع' : 'Project Request Saved' } });
          window.dispatchEvent(evt);
       } else if (effectiveType === 'general') {
          let requestType = 'Purchase Order';
          if (newAction.reservationCategory === 'service') requestType = 'Inquiry';
          if (newAction.reservationCategory === 'subscription') requestType = 'Subscription';

          const inventoryRequest = {
              id: `REQ-${Date.now()}`,
              customer: leadData.name,
              item: newAction.reservationItem || 'Unspecified Item',
              amount: Number(newAction.reservationAmount) || 0,
              type: requestType,
              status: 'Pending',
              date: new Date().toISOString().split('T')[0],
              notes: newAction.reservationNotes || '',
              phone: leadData.phone
          };

          try {
              console.log('Saving inventory request:', inventoryRequest);
              saveInventoryRequest(inventoryRequest);
              // Dispatch event to ensure RequestsPage updates
              window.dispatchEvent(new Event('inventory-requests-updated'));

              const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم حفظ طلب المخزون' : 'Inventory Request Saved' } });
              window.dispatchEvent(evt);
          } catch (error) {
              console.error('Error saving inventory request:', error);
              const evt = new CustomEvent('app:toast', { detail: { type: 'error', message: isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error saving request' } });
              window.dispatchEvent(evt);
          }
       }
    }

    // Update Lead Stage if nextAction corresponds to a stage
    if (newAction.nextAction) {
      let newStage = null;
      // Helper to normalize string
      const norm = (str) => String(str || '').toLowerCase().trim();
      
      let matchedStageObj = null;

      // 1. Try to match by type (most robust, works with renamed stages)
      const typeMatches = (Array.isArray(stages) ? stages : []).filter(s => s.type === newAction.nextAction);
      
      if (typeMatches.length > 0) {
         if (newAction.nextAction === 'follow_up') {
             // Priority 1: Exact "Follow Up" or "Pending" match by name
             const priorityMatch = typeMatches.find(s => {
                 const n = norm(s.name);
                 const nAr = norm(s.nameAr);
                 return n === 'follow up' || n === 'follow-up' || n === 'pending' ||
                        nAr === 'متابعة' || nAr === 'قيد الانتظار';
             });

             if (priorityMatch) {
                 matchedStageObj = priorityMatch;
             } else {
                 // Priority 2: Anything that is NOT "No Answer"
                 const notNoAnswer = typeMatches.find(s => {
                     const n = norm(s.name);
                     const nAr = norm(s.nameAr);
                     return !n.includes('no answer') && !nAr.includes('لا رد') && !n.includes('phone off');
                 });
                 matchedStageObj = notNoAnswer;
             }
         } else {
             matchedStageObj = typeMatches[0];
         }
      }

      // 2. If no type match, fall back to Name matching
      if (!matchedStageObj) {
          const normalizedNextAction = String(newAction.nextAction).replace(/_/g, ' ').toLowerCase();

          // Expanded map to cover more cases and exact default stage names
          const actionToStageMap = {
            'reservation': ['reservation', 'booking', 'won', 'closed', 'حجز', 'مباع'],
            'closing_deals': ['closing deal', 'closing', 'deal', 'won', 'closed', 'إغلاق', 'صفقة'],
            'rent': ['rent', 'leased', 'won', 'إيجار', 'مؤجر'],
            'cancel': ['cancelation', 'cancellation', 'cancelled', 'lost', 'archive', 'cold calls', 'إلغاء', 'خسارة', 'مكالمات باردة'],
            'meeting': ['meeting', 'negotiation', 'pending', 'اجتماع', 'تفاوض'],
            'proposal': ['proposal', 'quote', 'negotiation', 'pending', 'عرض سعر', 'عرض'],
            'follow_up': ['follow up', 'follow-up', 'pending', 'متابعة', 'قيد الانتظار']
          };

          let candidates = actionToStageMap[newAction.nextAction] || [];
          if (!candidates.includes(normalizedNextAction)) {
              candidates = [normalizedNextAction, ...candidates];
          }

          for (const candidate of candidates) {
            const match = (Array.isArray(stages) ? stages : []).find(s => {
              const sName = norm(typeof s === 'string' ? s : s.name);
              const sNameAr = norm(s.nameAr);
              
              // 1. Exact match
              if (sName === candidate || sNameAr === candidate) return true;
              
              // 2. Partial match (if candidate is significant length)
              if (candidate.length > 3 && (sName.includes(candidate) || (sNameAr && sNameAr.includes(candidate)))) return true;
              
              return false;
            });
            
            if (match) {
              matchedStageObj = typeof match === 'string' ? { name: match } : match;
              break;
            }
          }
      }

      if (matchedStageObj) {
          newStage = matchedStageObj.name;
      }

      // If a valid new stage is found and it's different, update everything
      const updatedLead = { ...lead };
      let hasChanges = false;
      const stageToUse = newStage || (lead ? lead.stage : '');

      if (newStage && lead && newStage !== lead.stage) {
        updatedLead.stage = newStage;
        hasChanges = true;
      }

      // Add action to lead history for persistence
      const actionEntry = {
          ...newAction,
          id: Date.now(),
          date: newAction.date || new Date().toISOString().split('T')[0],
          time: newAction.time || new Date().toTimeString().slice(0, 5),
          stageAtCreation: stageToUse,
          description: newAction.description || newAction.notes || '',
          assignee: newAction.assignedTo || newAction.assignee || lead?.assignedTo || lead?.salesPerson || 'غير محدد'
      };

      if (lead) {
          if (!updatedLead.actions) updatedLead.actions = [];
          
          updatedLead.actions = [actionEntry, ...updatedLead.actions];
          updatedLead.lastAction = actionEntry;
          updatedLead.lastContact = new Date().toISOString();
          
          // Also update notes if description is present
          if (newAction.description || newAction.notes) {
              updatedLead.notes = newAction.description || newAction.notes;
          }
          hasChanges = true;
      }

      // Update local state immediately with the new action containing stageAtCreation
      setActions(prev => [actionEntry, ...prev]);

      if (hasChanges) {
        // Update parent
        if (onUpdateLead) {
          onUpdateLead(updatedLead);
        }
        
        // Update LocalStorage (Global Source of Truth)
        try {
          const storedLeads = JSON.parse(localStorage.getItem('leadsData') || '[]');
          const leadIndex = storedLeads.findIndex(l => l.id === lead.id);
          if (leadIndex >= 0) {
            storedLeads[leadIndex] = updatedLead;
            localStorage.setItem('leadsData', JSON.stringify(storedLeads));
            // Dispatch event for other components (like LeadsPage) to refresh
            window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
          }
        } catch (e) {
          console.error('Failed to update lead stage in storage', e);
        }
      }
    } else {
        // Even if stage doesn't change, we should persist the action
         const updatedLead = { ...lead };
         if (!updatedLead.actions) updatedLead.actions = [];
         const actionEntry = {
              ...newAction,
              id: Date.now(),
              date: new Date().toISOString(),
              stageAtCreation: lead ? lead.stage : '',
              assignee: newAction.assignedTo || newAction.assignee || 'غير محدد'
          };
          updatedLead.actions = [actionEntry, ...updatedLead.actions];
          updatedLead.lastAction = actionEntry;
          updatedLead.lastContact = new Date().toISOString();
           if (newAction.description || newAction.notes) {
              updatedLead.notes = newAction.description || newAction.notes;
          }
          
          // Update local state immediately
          setActions(prev => [actionEntry, ...prev]);
          
          if (onUpdateLead) {
            onUpdateLead(updatedLead);
          }
          
           // Update LocalStorage
            try {
              const storedLeads = JSON.parse(localStorage.getItem('leadsData') || '[]');
              const leadIndex = storedLeads.findIndex(l => l.id === lead.id);
              if (leadIndex >= 0) {
                storedLeads[leadIndex] = updatedLead;
                localStorage.setItem('leadsData', JSON.stringify(storedLeads));
                window.dispatchEvent(new CustomEvent('leadsDataUpdated'));
              }
            } catch (e) {
              console.error('Failed to update lead action in storage', e);
            }
    }

    setShowAddActionModal(false);
  };

  const getStageStyle = (stageName) => {
    const currentStageValue = String(stageName || '').toLowerCase();
    const matchedStage = (Array.isArray(stages) ? stages : []).find((s) => {
      const name = typeof s === 'string' ? s : s?.name;
      const nameAr = typeof s === 'string' ? '' : s?.nameAr;
      return String(name || '').toLowerCase() === currentStageValue || String(nameAr || '').toLowerCase() === currentStageValue;
    });
    
    const style = matchedStage ? (
      (typeof matchedStage !== 'string' && typeof matchedStage.color === 'string')
        ? (matchedStage.color.trim().startsWith('#')
            ? { backgroundColor: matchedStage.color }
            : { background: `var(--stage-${matchedStage.color}-swatch, ${matchedStage.color})` }
          )
        : {}
    ) : {};
    
    const className = `px-3 py-1 text-white text-sm rounded-full font-medium${matchedStage ? '' : ' bg-blue-500'}`;
    
    return { style, className };
  };

  const { style: stageColorStyle, className: stageBadgeClass } = getStageStyle(leadData.stage);
  const activities = [
    {
      id: 1,
      text: 'الشهر هكذا لم نتمكن الحصان إبن علي',
      date: '15-01-2024',
      status: 'completed',
      icon: 'check'
    },
    {
      id: 2,
      text: 'الشهر هكذا لم نتمكن الحصان إبن علي',
      date: '15-01-2024',
      status: 'completed',
      icon: 'check'
    },
    {
      id: 3,
      text: 'الشهر هكذا لم نتمكن الحصان إبن علي',
      date: '15-01-2024',
      status: 'scheduled',
      icon: 'clock'
    }
  ];

  // تمت إزالة بيانات العينة؛ ستُدار الإجراءات من خلال الحالة actions المُحدّثة عبر AddActionModal

  // Filter and sort actions
  const filteredActions = actions
    .filter(action => {
      const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           action.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || action.status === filterStatus;
      const matchesType = filterType === 'all' || action.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(`${a.date}T${(a.time || '00:00')}`);
          const dateB = new Date(`${b.date}T${(b.time || '00:00')}`);
          return dateB - dateA;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Action statistics
  const actionStats = {
    total: actions.length,
    completed: actions.filter(a => a.status === 'completed').length,
    pending: actions.filter(a => a.status === 'pending').length,
    scheduled: actions.filter(a => a.status === 'scheduled').length
  };

  // Helper functions
  const getActionIcon = (type) => {
    switch (type) {
      case 'call': return <FaPhone className="text-blue-400" />;
      case 'email': return <FaEnvelope className="text-green-400" />;
      case 'meeting': return <FaCalendarAlt className="text-purple-400" />;
      case 'note': return <FaEdit className="text-yellow-400" />;
      case 'task': return <FaList className="text-orange-400" />;
      default: return <FaCog className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-orange-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-green-400 border-green-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (String(type).toLowerCase()) {
      case 'call': return 'text-blue-400 border-blue-400';
      case 'email': return 'text-yellow-400 border-yellow-400';
      case 'meeting': return 'text-purple-400 border-purple-400';
      case 'task': return 'text-orange-400 border-orange-400';
      case 'note': return 'text-slate-300 border-slate-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeLabel = (type) => {
    switch (String(type).toLowerCase()) {
      case 'call': return isArabic ? 'مكالمة' : 'Call';
      case 'email': return isArabic ? 'بريد' : 'Email';
      case 'meeting': return isArabic ? 'اجتماع' : 'Meeting';
      case 'task': return isArabic ? 'مهمة' : 'Task';
      case 'note': return isArabic ? 'ملاحظة' : 'Note';
      default: return isArabic ? 'غير محدد' : 'Unknown';
    }
  };

  const toggleActionSelection = (actionId) => {
    setSelectedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'all-actions', label: 'All Actions' },
    { id: 'communication', label: 'Communication' }
  ];

  // Determine if currently checked in (latest record has no checkOutDate)
  const latestCheckIn = checkInHistory.length > 0 ? checkInHistory[0] : null;
  const isCheckedIn = latestCheckIn && !latestCheckIn.checkOutDate;

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert(isArabic ? 'المتصفح لا يدعم تحديد الموقع' : 'Geolocation is not supported by your browser');
      return;
    }

    const toastEvent = new CustomEvent('app:toast', { 
      detail: { 
        type: 'info', 
        message: isArabic ? 'جاري تحديد الموقع...' : 'Getting location...' 
      } 
    });
    window.dispatchEvent(toastEvent);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const allReports = JSON.parse(localStorage.getItem('checkInReports') || '[]');
        
        if (isCheckedIn) {
          // Perform Check-Out
          const updatedReports = allReports.map(report => {
            if (report.id === latestCheckIn.id) {
              return {
                ...report,
                checkOutDate: new Date().toISOString(),
                checkOutLocation: {
                  lat: latitude,
                  lng: longitude,
                  address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                },
                status: 'completed'
              };
            }
            return report;
          });
          
          localStorage.setItem('checkInReports', JSON.stringify(updatedReports));
          
          // Update local state
          setCheckInHistory(prev => prev.map(item => {
            if (item.id === latestCheckIn.id) {
              return {
                 ...item,
                 checkOutDate: new Date().toISOString(),
                 checkOutLocation: {
                    lat: latitude,
                    lng: longitude,
                    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                 },
                 status: 'completed'
              };
            }
            return item;
          }));

          const successEvent = new CustomEvent('app:toast', { 
            detail: { 
              type: 'success', 
              message: isArabic ? 'تم تسجيل الانصراف بنجاح' : 'Check-Out recorded successfully' 
            } 
          });
          window.dispatchEvent(successEvent);

        } else {
          // Perform Check-In
          const newCheckIn = {
            id: Date.now(),
            type: 'lead',
            leadId: lead?.id,
            customerName: leadData.name,
            salesPerson: lead?.assignedTo || leadData?.salesPerson || (isArabic ? 'غير محدد' : 'Unassigned'),
            checkInDate: new Date().toISOString(),
            checkOutDate: null, // Explicitly null
            location: {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            },
            status: 'pending' // Initial status
          };
  
          const updatedReports = [...allReports, newCheckIn];
          localStorage.setItem('checkInReports', JSON.stringify(updatedReports));
  
          // Update local state
          setCheckInHistory(prev => [newCheckIn, ...prev]);
  
          const successEvent = new CustomEvent('app:toast', { 
            detail: { 
              type: 'success', 
              message: isArabic ? 'تم تسجيل الحضور بنجاح' : 'Check-In recorded successfully' 
            } 
          });
          window.dispatchEvent(successEvent);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = isArabic ? 'فشل تحديد الموقع' : 'Failed to get location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = isArabic ? 'تم رفض إذن الموقع. يرجى تفعيل الموقع من إعدادات المتصفح.' : 'Location permission denied. Please enable location in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = isArabic ? 'معلومات الموقع غير متوفرة.' : 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = isArabic ? 'انتهت مهلة طلب الموقع.' : 'The request to get user location timed out.';
            break;
          default:
            errorMessage = isArabic ? 'حدث خطأ غير معروف أثناء تحديد الموقع.' : 'An unknown error occurred getting location.';
            break;
        }

        const errorEvent = new CustomEvent('app:toast', { 
          detail: { 
            type: 'error', 
            message: errorMessage
          } 
        });
        window.dispatchEvent(errorEvent);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const isLight = theme === 'light';
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-0">
      <div className={`${isLight ? 'bg-white/70 backdrop-blur-md text-slate-800' : 'bg-slate-800 text-white'} w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[85vh] h-auto sm:rounded-3xl overflow-y-auto shadow-2xl p-2 sm:p-4`}>
        {/* Header */}
        <div className={`${isLight ? 'bg-white/60 border-gray-200' : 'bg-slate-800 border-slate-700'} p-2 sm:p-4 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              {/* Profile Picture */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <FaUser className="text-xl sm:text-2xl text-slate-300" />
              </div>
              
              {/* Lead Info */}
              <div className="flex-1">
                <h2 className={`text-base sm:text-lg font-semibold mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{leadData.name}</h2>
                <p className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs mb-0.5`}>{leadData.phone}</p>
                <p className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-[10px] sm:text-xs`}>{leadData.email}</p>
              </div>
            </div>
            
              {/* Actions Section */}
            <div className="flex flex-col items-end space-y-2 sm:space-y-3">
              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-1 sm:gap-2 w-auto relative">
                {/* Removed Check-In Button from here */}
                {/* Removed preview toggle button */}
                {/* Add Action (icon-only) */}
                {!showAddActionModal && (
                  <button
                    onClick={() => setShowAddActionModal(true)}
                    aria-label={isArabic ? 'إضافة إجراء' : 'Add Action'}
                    title={isArabic ? 'إضافة إجراء' : 'Add Action'}
                    className="btn-icon bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                )}
                {/* Assign (icon-only) */}
                <button
                  ref={assignMenuBtnRef}
                  onClick={() => setShowAssignMenu(prev => !prev)}
                  aria-label={isArabic ? 'تعيين' : 'Assign'}
                  title={isArabic ? 'تعيين' : 'Assign'}
                  className="btn-icon relative"
                >
                  <FaUserCheck className="text-sm" />
                </button>
                {showAssignMenu && (
                  <div 
                    ref={assignMenuRef}
                    className={`${isLight ? 'bg-white/90 backdrop-blur-md border border-gray-200 text-slate-800' : 'bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white'} absolute right-0 top-10 z-50 rounded-xl shadow-xl min-w-[200px] p-2`}
                  >
                    <div className="text-xs font-semibold px-3 py-2 text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      {assignStep === 'members' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignStep('teams');
                            setSelectedTeam(null);
                          }}
                          className="hover:text-blue-600"
                        >
                          {isArabic ? '←' : '←'}
                        </button>
                      )}
                      {assignStep === 'teams' 
                        ? (isArabic ? 'اختر الفريق' : 'Select Team')
                        : (isArabic ? 'اختر الموظف' : 'Select Person')
                      }
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {assignStep === 'teams' ? (
                        Object.keys(TEAMS_DATA).map((team) => (
                          <button
                            key={team}
                            onClick={() => {
                              setSelectedTeam(team);
                              setAssignStep('members');
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-black/5 text-sm"
                          >
                            <span className="truncate">{team}</span>
                            <span className="text-xs text-gray-400">
                              ({TEAMS_DATA[team].length})
                            </span>
                          </button>
                        ))
                      ) : (
                        TEAMS_DATA[selectedTeam] && TEAMS_DATA[selectedTeam].length > 0 ? (
                          TEAMS_DATA[selectedTeam].map((assignee) => (
                            <button
                              key={assignee}
                              onClick={() => {
                                if (onAssign) onAssign(assignee);
                                setShowAssignMenu(false);
                                setAssignStep('teams');
                                setSelectedTeam(null);
                              }}
                              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-black/5 text-sm ${leadData.salesPerson === assignee ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}`}
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                                {assignee.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate">{assignee}</span>
                              {leadData.salesPerson === assignee && <FaCheckCircle className="ml-auto text-xs" />}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 italic">
                            {isArabic ? 'لا يوجد موظفين' : 'No sales persons found'}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {/* Edit Lead (icon-only) */}
                <button
                  onClick={() => setShowEditLeadModal(true)}
                  aria-label={isArabic ? 'تعديل' : 'Edit'}
                  title={isArabic ? 'تعديل' : 'Edit'}
                  className="btn-icon"
                >
                  <FaEdit className="text-sm" />
                </button>
                {/* Kebab Menu (three vertical dots) */}
                <button
                  ref={headerMenuBtnRef}
                  onClick={() => setShowHeaderMenu(prev => !prev)}
                  aria-label={isArabic ? 'المزيد' : 'More'}
                  title={isArabic ? 'المزيد' : 'More'}
                  className="btn-icon"
                >
                  <FaEllipsisV className="text-sm" />
                </button>
                {/* Dropdown Menu */}
                {showHeaderMenu && (
                  <div ref={headerMenuRef} className={`${isLight ? 'bg-white/70 backdrop-blur-md border border-gray-200 text-slate-800' : 'bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white'} absolute right-12 top-10 z-50 rounded-xl shadow-xl min-w-[180px] p-2`}>
                    
                    <button onClick={() => { setShowHeaderMenu(false); handleCheckIn(); }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-black/5">
                      {isCheckedIn ? <FaCheckCircle className="text-red-500" /> : <FaMapMarkerAlt className="text-blue-500" />}
                      <span className="text-sm font-medium">
                        {isCheckedIn 
                          ? (isArabic ? 'تسجيل انصراف' : 'Check-Out')
                          : (isArabic ? 'تسجيل حضور' : 'Check-In')}
                      </span>
                    </button>

                    <button onClick={() => { setShowHeaderMenu(false); setShowPaymentPlanModal(true); }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-black/5">
                      <FaDollarSign className="text-emerald-500" />
                      <span className="text-sm font-medium">
                        {isArabic 
                          ? (paymentPlan ? 'تعديل خطة الدفع' : 'إضافة خطة دفع') 
                          : (paymentPlan ? 'Edit Payment Plan' : 'Add Payment Plan')}
                      </span>
                    </button>

                    <button onClick={() => {
                                setShowHeaderMenu(false);
                                const ok = window.confirm(isArabic ? 'هل تريد تحويل العميل إلى عميل فعلي؟' : 'Convert this lead to a customer?');
                                if (ok) {
                                  const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم التحويل إلى عميل' : 'Converted to customer' } });
                                  window.dispatchEvent(evt);
                                }
                              }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-black/5">
                      <FaUserCheck className="text-yellow-500" />
                      <span className="text-sm font-medium">{isArabic ? 'تحويل إلى عميل' : 'Convert to Customer'}</span>
                    </button>
                  </div>
                )}
                {/* Close (X) - stays far right */}
                <button 
                  onClick={onClose}
                  aria-label={isArabic ? 'إغلاق' : 'Close'}
                  className="btn-icon"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="w-full h-px"></div>
              
              {/* Status Badges Row */}
              <div className="flex flex-wrap justify-end gap-1 sm:gap-6 rtl:space-x-reverse">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500 text-white text-[10px] sm:text-sm rounded-full font-medium">
                  qualified
                </span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-sm rounded-full font-medium">
                  high
                </span>
                <span className={`${stageBadgeClass} text-[10px] sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1`} style={stageColorStyle}>
                  {leadData.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Lead Modal */}
        <EditLeadModal
          isOpen={showEditLeadModal}
          onClose={() => setShowEditLeadModal(false)}
          onSave={(updatedLead) => { /* يمكن ربط الحفظ لاحقًا */ }}
          lead={lead}
        />

        {showAddActionModal && (
          <div className="px-0 sm:px-0">
            <AddActionModal
              isOpen={showAddActionModal}
              onClose={() => setShowAddActionModal(false)}
              onSave={handleAddAction}
              lead={lead}
              inline={true}
              initialType={actionType}
            />
          </div>
        )}

        <PaymentPlanModal
          isOpen={showPaymentPlanModal}
          onClose={() => setShowPaymentPlanModal(false)}
          onSave={(plan) => {
             const updatedLead = { ...lead, paymentPlan: plan };
             setPaymentPlan(plan);
             if (onUpdateLead) onUpdateLead(updatedLead);
             const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم حفظ خطة الدفع' : 'Payment plan saved' } });
             window.dispatchEvent(evt);
          }}
          lead={lead}
        />

        

        <CreateRequestModal
          open={showCreateRequestModal}
          onClose={() => setShowCreateRequestModal(false)}
          onSave={(payload) => {
            const evt = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم إرسال الطلب بنجاح' : 'Request sent successfully', source: 'lead' } });
            window.dispatchEvent(evt);
          }}
          initial={{ customerName: leadData.name || '', assignedTo: leadData.salesPerson || '' }}
          isRTL={isArabic}
        />

        {/* Tabs */}
        <div className={`${isLight ? 'bg-white/60 border-gray-200' : 'bg-slate-800 border-slate-700'} px-0 sm:px-6 border-b ${showAddActionModal ? 'hidden' : ''}`}>
          <div className="flex justify-between w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-sm font-medium border-b-2 transition-all duration-200 text-center ${
                  activeTab === tab.id
                    ? `${isLight ? 'border-emerald-500 text-slate-900 bg-emerald-50 rounded-t-lg shadow-lg shadow-emerald-200/50 font-semibold' : 'border-emerald-400 text-white bg-emerald-500/20 rounded-t-lg shadow-lg shadow-emerald-500/10 font-semibold'}`
                    : `${isLight ? 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700/30'}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-2 sm:p-6 ${isLight ? 'bg-white/70' : 'bg-slate-800'} ${showAddActionModal ? 'hidden' : ''}`}>
          {activeTab === 'overview' && (
            <div className="space-y-3 sm:space-y-8">
              {/* Two Column: Current Status (left) and Lead Information (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8">
                {/* Left: Current Status */}
                <div>
                  <h3 className={`${isLight ? 'text-black border-gray-300' : 'text-white border-slate-700'} font-semibold mb-3 border-b pb-2 text-left`}>Current Status</h3>
                  <div className="flex justify-around sm:justify-start items-center gap-2 sm:gap-16 mb-4 sm:mb-6">
                    {/* Stat 1 - Dark circle with 3 and "Total Actions" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-full mb-1 sm:mb-2 bg-[conic-gradient(#34d399_0_12%,_#334155_12%)]">
                        <div className={`absolute inset-2 rounded-full flex items-center justify-center ${isLight ? 'bg-white border border-gray-300' : 'bg-slate-700 border border-slate-600'}`}>
                          <span className={`text-base sm:text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>3</span>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Actions</span>
                    </div>
                    
                    {/* Stat 2 - Green circle with 2 and "Completed" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-full mb-1 sm:mb-2 bg-[conic-gradient(#10b981_0_100%)]">
                        <div className={`absolute inset-2 rounded-full flex items-center justify-center ${isLight ? 'bg-white border border-emerald-300' : 'bg-slate-700 border border-emerald-400'}`}>
                          <span className={`text-base sm:text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>2</span>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Completed</span>
                    </div>
                    
                    {/* Stat 3 - Orange circle with 1 and "Pending" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-full mb-1 sm:mb-2 bg-[conic-gradient(#f59e0b_0_100%)]">
                        <div className={`absolute inset-2 rounded-full flex items-center justify-center ${isLight ? 'bg-white border border-orange-300' : 'bg-slate-700 border border-orange-400'}`}>
                          <span className={`text-base sm:text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>1</span>
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Pending</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3 mt-4 sm:mt-6">
                    <h4 className={`${isLight ? 'text-black border-gray-300' : 'text-white border-slate-700'} font-semibold mb-2 sm:mb-3 border-b pb-2`}>Quick Actions</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 rtl:flex-row-reverse">
                      <button 
                        onClick={() => setShowAddActionModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 flex-grow sm:flex-grow-0"
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-400 flex items-center justify-center">
                          <FaPlus className="text-[10px] sm:text-xs" />
                        </span>
                        <span className="text-xs sm:text-sm whitespace-nowrap">+ Add New Action</span>
                      </button>
                      <button 
                        onClick={() => setShowAttachmentsModal(true)}
                        className={`${isLight ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 flex-grow sm:flex-grow-0`}
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-400 flex items-center justify-center">
                          <FaPaperclip className="text-[10px] sm:text-xs" />
                        </span>
                        <span className="text-xs sm:text-sm whitespace-nowrap">{isArabic ? 'المرفقات' : 'Attachments'}</span>
                      </button>
                      <button 
                        onClick={() => {
                          const ok = window.confirm(isArabic ? 'هل تريد تحويل العميل إلى عميل فعلي؟' : 'Convert this lead to a customer?');
                          if (ok) {
                            console.log(isArabic ? 'تم التحويل إلى عميل' : 'Converted to customer');
                          }
                        }}
                        className={`${isLight ? 'bg-white text-slate-700 border border-gray-300 hover:bg-slate-100' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'} py-1.5 sm:py-2 px-3 sm:px-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 flex-grow sm:flex-grow-0`}
                      >
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-yellow-600 flex items-center justify-center">
                          <FaUserCheck className="text-[10px] sm:text-xs text-white" />
                        </span>
                        <span className="text-xs sm:text-sm whitespace-nowrap">{isArabic ? 'تحويل لعميل' : 'To Customer'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Lead Information */}
                <div className="space-y-2 sm:space-y-4">
                  <h3 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-4 border-b pb-2 ${isLight ? 'text-black border-gray-300' : 'text-white border-slate-700'}`}>Lead Information</h3>
                  <div className={`space-y-2 sm:space-y-4 p-2 sm:p-4 rounded-lg ${isLight ? 'bg-white border border-gray-200' : 'bg-slate-700'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Company:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm font-medium text-right`}>{leadData.company}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Location:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm`}>{leadData.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Source:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm`}>{leadData.source}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Created By:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm`}>{leadData.createdBy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Sales Person:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm`}>{leadData.salesPerson}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>Created Date:</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} text-xs sm:text-sm`}>{leadData.createdDate}</span>
                    </div>
                  </div>


                </div>
              </div>

              {/* Payment Plan Information */}
              {paymentPlan && (
                <>
                  <h3 className={`text-base sm:text-lg font-semibold mb-2 sm:mb-4 mt-4 sm:mt-6 border-b pb-2 ${isLight ? 'text-black border-gray-300' : 'text-white border-slate-700'}`}>
                    {isArabic ? 'خطة الدفع' : 'Payment Plan'}
                  </h3>
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 p-3 sm:p-6 rounded-lg ${isLight ? 'bg-white border border-gray-200' : 'bg-slate-700'}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'المشروع:' : 'Project:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.projectName || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'رقم الوحدة:' : 'Unit No:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.unitNo || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'سعر الوحدة:' : 'Unit Price:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.totalAmount ? Number(paymentPlan.totalAmount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'الجراج:' : 'Garage:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.garageAmount ? Number(paymentPlan.garageAmount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'الصيانة:' : 'Maintenance:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.maintenanceAmount ? Number(paymentPlan.maintenanceAmount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'صافي المبلغ:' : 'Net Amount:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-bold text-sm sm:text-lg`}>{paymentPlan.netAmount ? Number(paymentPlan.netAmount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'المقدم:' : 'Down Payment:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.downPayment ? Number(paymentPlan.downPayment).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'أقساط إضافية:' : 'Extra Installments:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.extraInstallments ? Number(paymentPlan.extraInstallments).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'قيمة القسط:' : 'Installment:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.installmentAmount ? Number(paymentPlan.installmentAmount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-xs sm:text-sm`}>{isArabic ? 'عدد الأشهر:' : 'Months:'}</span>
                      <span className={`${isLight ? 'text-black' : 'text-white'} font-medium text-sm sm:text-lg`}>{paymentPlan.noOfMonths || '0'}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Check-In History Table */}
              <div className="mt-4 sm:mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-base sm:text-lg font-semibold ${isLight ? 'text-black border-gray-300' : 'text-white border-slate-700'}`}>
                    {isArabic ? 'سجل الزيارات' : 'Check-In History'}
                  </h3>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => {
                          if (window.confirm(isArabic ? 'هل أنت متأكد من مسح جميع سجلات الزيارة؟' : 'Are you sure you want to clear all check-in history?')) {
                            localStorage.removeItem('checkInReports');
                            setCheckInHistory([]);
                            const toast = new CustomEvent('app:toast', { detail: { type: 'success', message: isArabic ? 'تم مسح السجل بنجاح' : 'History cleared successfully' } });
                            window.dispatchEvent(toast);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={isArabic ? 'مسح السجل' : 'Clear History'}
                     >
                       <FaTrash />
                     </button>
                     <span className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{isArabic ? 'تاريخ:' : 'Date:'}</span>
                     <input
                       type="date"
                       value={historyDateFilter}
                       onChange={(e) => setHistoryDateFilter(e.target.value)}
                       className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg border focus:outline-none ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-slate-600 border-slate-500 text-white'}`}
                     />
                  </div>
                </div>
                
                <div className={`overflow-x-auto rounded-lg border ${isLight ? 'border-gray-200' : 'border-slate-600'}`}>
                  <table className={`w-full text-xs sm:text-sm text-left ${isArabic ? 'text-right' : ''} ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    <thead className={`text-[10px] sm:text-xs uppercase ${isLight ? 'bg-gray-50 text-slate-700' : 'bg-slate-700 text-slate-300'}`}>
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'الموظف' : 'Sales Person'}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'وقت الحضور' : 'Check-In Time'}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'وقت الانصراف' : 'Check-Out Time'}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'موقع الحضور' : 'Check-In Location'}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'موقع الانصراف' : 'Check-Out Location'}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">{isArabic ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {filteredCheckInHistory.length > 0 ? (
                        filteredCheckInHistory.map((item) => (
                          <tr key={item.id} className={`${isLight ? 'bg-white hover:bg-gray-50' : 'bg-slate-800 hover:bg-slate-700'}`}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium whitespace-nowrap dark:text-white">
                              {item.salesPerson || '-'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span>{new Date(item.checkInDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                                <span className="text-[10px] sm:text-xs text-gray-500">{new Date(item.checkInDate).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              {item.checkOutDate ? (
                                <div className="flex flex-col">
                                  <span>{new Date(item.checkOutDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                                  <span className="text-[10px] sm:text-xs text-gray-500">{new Date(item.checkOutDate).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  <span className="truncate max-w-[100px] sm:max-w-[150px]" title={item.location?.address || `${item.location?.lat}, ${item.location?.lng}`}>
                                    {item.location?.address || (item.location?.lat ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}` : '-')}
                                  </span>
                                  {item.location && (item.location.lat || item.location.address) && (
                                     <button
                                       onClick={() => {
                                          const url = item.location.lat && item.location.lng 
                                            ? `https://www.google.com/maps/search/?api=1&query=${item.location.lat},${item.location.lng}`
                                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location.address)}`;
                                          window.open(url, '_blank');
                                       }}
                                       className="px-2 py-1 text-[10px] sm:text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                       title={isArabic ? 'عرض موقع الحضور' : 'Preview Check-In Location'}
                                     >
                                        <FaMapMarkerAlt />
                                        {isArabic ? 'عرض' : 'Preview'}
                                     </button>
                                  )}
                               </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  <span className="truncate max-w-[100px] sm:max-w-[150px]" title={item.checkOutLocation?.address || `${item.checkOutLocation?.lat}, ${item.checkOutLocation?.lng}`}>
                                    {item.checkOutLocation?.address || (item.checkOutLocation?.lat ? `${item.checkOutLocation.lat.toFixed(4)}, ${item.checkOutLocation.lng.toFixed(4)}` : '-')}
                                  </span>
                                  {item.checkOutLocation && (item.checkOutLocation.lat || item.checkOutLocation.address) && (
                                     <button
                                       onClick={() => {
                                          const url = item.checkOutLocation.lat && item.checkOutLocation.lng 
                                            ? `https://www.google.com/maps/search/?api=1&query=${item.checkOutLocation.lat},${item.checkOutLocation.lng}`
                                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.checkOutLocation.address)}`;
                                          window.open(url, '_blank');
                                       }}
                                       className="px-2 py-1 text-[10px] sm:text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                                       title={isArabic ? 'عرض موقع الانصراف' : 'Preview Check-Out Location'}
                                     >
                                        <FaMapMarkerAlt />
                                        {isArabic ? 'عرض' : 'Preview'}
                                     </button>
                                  )}
                               </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${
                                item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status === 'pending' 
                                  ? (isArabic ? 'تشيك ان' : 'Check-In') 
                                  : item.status === 'completed' 
                                    ? (isArabic ? 'تشيك اوت' : 'Check-Out')
                                    : (item.status || '-')
                                }
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            {isArabic ? 'لا توجد سجلات زيارة' : 'No check-in history found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          )}
          
          {/* Other tab contents */}
          {activeTab === 'all-actions' && (
            <div className="space-y-6">
              {/* Type cards: All Actions / Calls Done / Messages / Meetings */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <button
                  onClick={() => { setFilterType('all'); setFilterStatus('all'); }}
                  className={`${isLight ? 'bg-white border border-gray-200 hover:bg-slate-100' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'} p-5 rounded-xl text-center transition-colors`}
                >
                  <div className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>{actions.length}</div>
                  <div className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-sm`}>{isArabic ? 'كل الإجراءات' : 'All Actions'}</div>
                </button>
                <button
                  onClick={() => { setFilterType('call'); setFilterStatus('completed'); }}
                  className={`${isLight ? 'bg-white border border-green-300 hover:bg-slate-100' : 'bg-slate-700 border border-green-600 hover:bg-slate-600'} p-5 rounded-xl text-center transition-colors`}
                >
                  <div className="text-2xl font-bold text-green-400">{actions.filter(a => a.type === 'call' && a.status === 'completed').length}</div>
                  <div className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-sm`}>{isArabic ? 'مكالمات مكتملة' : 'Calls Done'}</div>
                </button>
                <button
                  onClick={() => { setFilterType('email'); setFilterStatus('all'); }}
                  className={`${isLight ? 'bg-white border border-blue-300 hover:bg-slate-100' : 'bg-slate-700 border border-blue-600 hover:bg-slate-600'} p-5 rounded-xl text-center transition-colors`}
                >
                  <div className="text-2xl font-bold text-blue-400">{actions.filter(a => a.type === 'email').length}</div>
                  <div className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-sm`}>{isArabic ? 'الرسائل' : 'Messages'}</div>
                </button>
                <button
                  onClick={() => { setFilterType('meeting'); setFilterStatus('all'); }}
                  className={`${isLight ? 'bg-white border border-purple-300 hover:bg-slate-100' : 'bg-slate-700 border border-purple-600 hover:bg-slate-600'} p-5 rounded-xl text-center transition-colors`}
                >
                  <div className="text-2xl font-bold text-purple-400">{actions.filter(a => a.type === 'meeting').length}</div>
                  <div className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-sm`}>{isArabic ? 'الاجتماعات' : 'Meetings'}</div>
                </button>
              </div>

              {/* Simple header with Add button */}
              <div className="flex items-center justify-between mb-2">
                <h3 className={`${isLight ? 'text-black' : 'text-white'} font-semibold`}>{isArabic ? 'الإجراءات' : 'Actions'}</h3>
                <button 
                  onClick={() => setShowAddActionModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  {isArabic ? 'إضافة إجراء جديد' : 'Add New Action'}
                </button>
              </div>

              {/* Search and Filters (Status & Type) */}
              <div className={`${isLight ? 'bg-white border border-gray-200' : 'bg-slate-700'} p-4 rounded-lg space-y-3 mb-2`}>
                <div className="flex flex-row gap-3 items-center">
                  <div className="flex-1 relative w-full">
                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder={isArabic ? 'البحث في الإجراءات...' : 'Search actions...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg placeholder-slate-400 focus:outline-none ${isLight ? 'bg-white border border-gray-300 text-black focus:border-emerald-500' : 'bg-slate-600 border border-slate-500 text-white focus:border-emerald-400'}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className={`rounded-lg px-3 py-2 text-sm focus:outline-none ${isLight ? 'bg-white border border-gray-300 text-black focus:border-emerald-500' : 'bg-slate-600 border border-slate-500 text-white focus:border-emerald-400'}`}
                    >
                      <option value="all">{isArabic ? 'جميع الأنواع' : 'All types'}</option>
                      <option value="call">{isArabic ? 'مكالمة' : 'Call'}</option>
                      <option value="email">{isArabic ? 'بريد' : 'Email'}</option>
                      <option value="meeting">{isArabic ? 'اجتماع' : 'Meeting'}</option>
                      <option value="task">{isArabic ? 'مهمة' : 'Task'}</option>
                      <option value="note">{isArabic ? 'ملاحظة' : 'Note'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {filteredActions.length === 0 ? (
                /* Empty State */
                <div className={`text-center py-12 rounded-lg ${isLight ? 'bg-white border border-gray-200' : 'bg-slate-700'}`}>
                  <FaList className={`mx-auto text-4xl mb-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isLight ? 'text-black' : 'text-slate-300'}`}>لا توجد إجراءات</h3>
                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} mb-4`}>
                      {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                        ? 'لم يتم العثور على إجراءات تطابق البحث أو الفلتر المحدد'
                        : 'لم يتم إنشاء أي إجراءات بعد'
                      }
                    </p>
                    <button 
                      onClick={() => setShowAddActionModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FaPlus className="inline mr-2" />
                      إضافة أول إجراء
                    </button>
                  </div>
                ) : (
                  <div className={`rounded-xl overflow-hidden ${isLight ? 'bg-white border border-gray-200 divide-y divide-gray-300' : 'border border-slate-600 divide-y divide-slate-600'}`}>
                    {filteredActions.map((action) => (
                      <div
                        key={action.id}
                        className={`flex items-start gap-4 p-4 transition-colors ${isLight ? 'bg-white hover:bg-slate-50' : 'bg-slate-700 hover:bg-slate-600'} ${selectedActions.includes(action.id) ? (isLight ? 'bg-emerald-50' : 'bg-emerald-500/5') : ''}`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-200' : 'bg-slate-600'}`}>
                          {getActionIcon(action.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`${isArabic ? 'text-right' : ''}`}>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 min-w-0">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'اسم العميل:' : 'Lead Name:'}</span>
                                <span className={`${isLight ? 'text-black' : 'text-white'} font-semibold max-w-[220px] break-words`}>{leadData.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'المرحلة:' : 'Stage:'}</span>
                                {(() => {
                                  const actionStage = action.stageAtCreation || leadData.stage;
                                  const { style, className } = getStageStyle(actionStage);
                                  return <span className={className} style={style}>{actionStage}</span>;
                                })()}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'الأولوية:' : 'Priority:'}</span>
                                <span className={`px-2 py-1 rounded border text-xs ${getPriorityColor(action.priority)}`}>{isArabic ? (action.priority === 'high' ? 'عالية' : action.priority === 'medium' ? 'متوسطة' : 'منخفضة') : (action.priority === 'high' ? 'High' : action.priority === 'medium' ? 'Medium' : 'Low')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'نوع الإجراء:' : 'Action Type:'}</span>
                                <span className={`px-2 py-1 rounded border text-xs ${getTypeColor(action.type)}`}>{getTypeLabel(action.type)}</span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'مسؤول المبيعات:' : 'Sales Person:'}</span>
                                <span className={`${isLight ? 'text-slate-800' : 'text-slate-300'} max-w-[200px] break-words`}>
                                  {(() => {
                                    const candidates = [action.assignee, action.user, leadData.salesPerson, lead?.assignedTo];
                                    const valid = candidates.find(c => c && c !== 'غير محدد' && c !== 'Not specified' && c !== '-');
                                    return valid || (isArabic ? 'غير محدد' : 'Not specified');
                                  })()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs`}>{isArabic ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                                <span className={`${isLight ? 'text-slate-800' : 'text-slate-300'} whitespace-nowrap`}>
                                  {(() => {
                                    const datePart = (action.date || '').includes('T') ? action.date.split('T')[0] : action.date;
                                    return `${datePart} ${action.time || ''}`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 w-full">
                              <div className={`${isLight ? 'text-slate-600' : 'text-slate-400'} text-xs mb-1`}>{isArabic ? 'التعليق:' : 'Comment:'}</div>
                              <div className={`${isLight ? 'text-black' : 'text-slate-300'} text-sm break-words whitespace-pre-line`}>{action.description || action.notes}</div>
                            </div>
                          </div>
                        </div>
                        {/* Removed trailing preview/edit buttons */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="bg-blue-500 p-2 rounded-xl mr-3">
                      <FaComments className="text-white text-sm" />
                    </div>
                    {isArabic ? 'التواصل مع العميل' : 'Client Communication'}
                    <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                  </h3>
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <FaFilter />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions (ordered: Call / WhatsApp / Email / Google Meet) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button 
                  onClick={() => { const raw = lead?.phone || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`tel:${digits}`, '_blank'); }}
                  className={`${isLight ? 'bg-white/70 backdrop-blur-md text-slate-800 border border-gray-200 hover:bg-white/80' : 'bg-slate-800/70 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800/80'} flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <FaPhone className="text-2xl mb-2" style={{ color: '#2563EB' }} />
                  <span className="text-sm font-medium">{isArabic ? 'مكالمة' : 'Call'}</span>
                </button>
                <button 
                  onClick={() => { const raw = lead?.phone || ''; const digits = String(raw).replace(/[^0-9]/g, ''); if (digits) window.open(`https://wa.me/${digits}`, '_blank'); }}
                  className={`${isLight ? 'bg-white/70 backdrop-blur-md text-slate-800 border border-gray-200 hover:bg-white/80' : 'bg-slate-800/70 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800/80'} flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <FaWhatsapp className="text-2xl mb-2" style={{ color: '#25D366' }} />
                  <span className="text-sm font-medium">{isArabic ? 'واتساب' : 'WhatsApp'}</span>
                </button>
                <button 
                  onClick={() => { if (lead?.email) window.open(`mailto:${lead.email}`, '_blank'); }}
                  className={`${isLight ? 'bg-white/70 backdrop-blur-md text-slate-800 border border-gray-200 hover:bg-white/80' : 'bg-slate-800/70 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800/80'} flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <FaEnvelope className="text-2xl mb-2" style={{ color: '#FFA726' }} />
                  <span className="text-sm font-medium">{isArabic ? 'بريد إلكتروني' : 'Email'}</span>
                </button>
                <button 
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  className={`${isLight ? 'bg-white/70 backdrop-blur-md text-slate-800 border border-gray-200 hover:bg-white/80' : 'bg-slate-800/70 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800/80'} flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <img alt="Google Meet" className="w-6 h-6 mb-2" src={"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><rect x='2' y='4' width='12' height='16' rx='3' fill='%23ffffff'/><rect x='2' y='4' width='12' height='4' rx='2' fill='%234285F4'/><rect x='2' y='4' width='4' height='16' rx='2' fill='%2334A853'/><rect x='10' y='4' width='4' height='16' rx='2' fill='%23FBBC05'/><rect x='2' y='16' width='12' height='4' rx='2' fill='%23EA4335'/><polygon points='14,9 22,5 22,19 14,15' fill='%2334A853'/></svg>"} />
                  <span className="text-sm font-medium">Google Meet</span>
                </button>
              </div>

              {/* Filters */}
              <div className={`${isLight ? 'bg-white rounded-xl p-4 border border-gray-100 shadow-sm' : 'bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-sm'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-medium ${isLight ? 'text-gray-600' : 'text-white'}`}>{isArabic ? 'فلترة:' : 'Filter:'}</span>
                  <button onClick={() => setCommFilter('all')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='all' ? (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/30 text-white border border-blue-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    {isArabic ? 'الكل' : 'All'}
                  </button>
                  <button onClick={() => setCommFilter('whatsapp')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='whatsapp' ? (isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/30 text-white border border-green-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    WhatsApp
                  </button>
                  <button onClick={() => setCommFilter('email')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='email' ? (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/30 text-white border border-blue-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    Email
                  </button>
                  <button onClick={() => setCommFilter('meet')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='meet' ? (isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/30 text-white border border-emerald-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    Google Meet
                  </button>
                  <button onClick={() => setCommFilter('calls')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='calls' ? (isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/30 text-white border border-purple-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    {isArabic ? 'مكالمات' : 'Calls'}
                  </button>
                  <button onClick={() => setCommFilter('unread')} className={`px-3 py-1 rounded-full text-xs transition-colors ${commFilter==='unread' ? (isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/30 text-white border border-red-500') : (isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-slate-800/60 text-white border border-slate-700 hover:bg-slate-800/80')}`}>
                    {isArabic ? 'غير مقروء' : 'Unread'}
                  </button>
                </div>
              </div>

              {/* Communication Feed */}
              <div className={`${isLight ? 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm' : 'bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-lg font-medium ${isLight ? 'text-black' : 'text-white'}`}>{isArabic ? 'سجل التواصل' : 'Communication Timeline'}</h4>
                  <button 
                    onClick={() => setShowCompose(prev => !prev)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <FaPlus className="text-sm" />
                    <span className="text-sm">{isArabic ? 'إضافة رسالة' : 'Add Message'}</span>
                  </button>
                </div>
                {showCompose && (
                  <div className={`${isLight ? 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6' : 'bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-sm mb-6'}`}>
                    <h4 className={`text-lg font-medium mb-4 ${isLight ? 'text-black' : 'text-white'}`}>{isArabic ? 'إرسال رسالة جديدة' : 'Compose New Message'}</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-white'}`}>{isArabic ? 'القناة' : 'Channel'}</label>
                          <div className="relative">
                            <select 
                              value={composeChannel}
                              onChange={(e) => setComposeChannel(e.target.value)}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLight ? 'border-gray-300' : 'bg-slate-800/70 text-white border-slate-700'}`}
                            >
                              <option value="whatsapp">{isArabic ? 'واتساب' : 'WhatsApp'}</option>
                              <option value="email">{isArabic ? 'بريد إلكتروني' : 'Email'}</option>
                              <option value="meet">{isArabic ? 'جوجل ميت' : 'Google Meet'}</option>
                              <option value="call">{isArabic ? 'مكالمات' : 'Calls'}</option>
                            </select>
                            <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-500' : 'text-white/70'}`} />
                          </div>
                        </div>
                        {composeChannel !== 'whatsapp' && (
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-white'}`}>{isArabic ? 'القالب' : 'Template'}</label>
                          <div className="relative">
                            <select className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLight ? 'border-gray-300' : 'bg-slate-800/70 text-white border-slate-700'}`}>
                              <option>{isArabic ? 'رسالة مخصصة' : 'Custom Message'}</option>
                              <option>{isArabic ? 'متابعة عرض سعر' : 'Quote Follow-up'}</option>
                              <option>{isArabic ? 'تأكيد موعد' : 'Appointment Confirmation'}</option>
                              <option>{isArabic ? 'طلب مستندات' : 'Document Request'}</option>
                              <option>{isArabic ? 'شكر بعد مكالمة' : 'Post-call Thank You'}</option>
                            </select>
                            <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-500' : 'text-white/70'}`} />
                          </div>
                        </div>
                        )}
                      </div>
                      {composeChannel === 'email' && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-white'}`}>{isArabic ? 'الموضوع (للإيميل)' : 'Subject (for Email)'}</label>
                        <input type="text" placeholder={isArabic ? 'موضوع الرسالة...' : 'Message subject...'} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLight ? 'border-gray-300' : 'bg-slate-800/70 text-white border-slate-700 placeholder-slate-300'}`} />
                      </div>
                      )}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-white'}`}>{isArabic ? 'نص الرسالة' : 'Message Content'}</label>
                        <textarea rows="4" placeholder={isArabic ? 'اكتب رسالتك هنا... يمكنك استخدام {الاسم} و {رقم_العرض} كمتغيرات ديناميكية' : 'Type your message here... You can use {name} and {quote_number} as dynamic variables'} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLight ? 'border-gray-300' : 'bg-slate-800/70 text-white border-slate-700 placeholder-slate-300'}`}></textarea>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-white'}`}>{isArabic ? 'جدولة الإرسال' : 'Schedule Send'}</span>
                          </label>
                          <input type="datetime-local" className={`px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLight ? 'border-gray-300' : 'bg-slate-800/70 text-white border-slate-700'}`} />
                        </div>
                        <div className="flex space-x-2">
                          <button className={`px-4 py-2 rounded-lg transition-colors ${isLight ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-slate-800/70 text-white border border-slate-700 hover:bg-slate-800/80'}`}>
                            {isArabic ? 'حفظ كمسودة' : 'Save Draft'}
                          </button>
                          <button onClick={() => setShowCompose(false)} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            {isArabic ? 'إرسال' : 'Send'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* WhatsApp Message */}
                  {(commFilter === 'all' || commFilter === 'whatsapp' || commFilter === 'unread') && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaWhatsapp className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className={`font-semibold ${isLight ? 'text-black' : 'text-gray-800'}`}>{lead?.name || (isArabic ? 'محمد علي' : 'Mohamed Ali')}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'رسالة واتساب • وارد' : 'WhatsApp Message • Incoming'}</p>
                          </div>
                        </div>
                        <p className={`text-sm ${isLight ? 'text-black' : 'text-gray-700'} bg-white p-3 rounded-lg shadow-sm`}>
                          {isArabic ? 'مرحباً، شكراً لك على العرض المرسل. هل يمكننا تحديد موعد لاجتماع لمناقشة تفاصيل المشروع والأسعار؟' : 'Hello, thank you for the proposal. Can we schedule a meeting to discuss the project details and pricing?'}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button className="text-xs text-blue-500 hover:underline">{isArabic ? 'رد' : 'Reply'}</button>
                          <button className="text-xs text-gray-500 hover:underline">{isArabic ? 'نسخ' : 'Copy'}</button>
                          <button className="text-xs text-purple-500 hover:underline">{isArabic ? 'إنشاء متابعة' : 'Create Follow-up'}</button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 text-center">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full mb-1">10:30 AM</div>
                        <div className="w-3 h-3 bg-green-500 rounded-full mx-auto animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {/* Email */}
                  {(commFilter === 'all' || commFilter === 'email') && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaEnvelope className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className={`font-semibold ${isLight ? 'text-black' : 'text-gray-800'}`}>{isArabic ? 'أنت' : 'You'}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'بريد إلكتروني • صادر' : 'Email • Outgoing'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <h6 className={`font-medium mb-1 ${isLight ? 'text-black' : 'text-gray-800'}`}>{isArabic ? 'الموضوع: العرض المالي المحدث' : 'Subject: Updated Financial Proposal'}</h6>
                          <p className={`text-sm ${isLight ? 'text-black' : 'text-gray-700'}`}>
                            {isArabic ? 'تم إرسال العرض المالي المحدث مع التعديلات المطلوبة. يرجى المراجعة والرد في أقرب وقت ممكن. مرفق: عرض_سعر_محدث.pdf' : 'Updated financial proposal sent with requested modifications. Please review and respond at your earliest convenience. Attachment: updated_quote.pdf'}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                          <button className="text-xs text-blue-500 hover:underline">{isArabic ? 'إعادة إرسال' : 'Resend'}</button>
                          <button className="text-xs text-gray-500 hover:underline">{isArabic ? 'نسخ' : 'Copy'}</button>
                          <button className="text-xs text-green-500 hover:underline">{isArabic ? 'تم التسليم' : 'Delivered'}</button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 text-center">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full mb-1">9:15 AM</div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {/* Phone Call */}
                  {(commFilter === 'all' || commFilter === 'calls') && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaPhone className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className={`font-semibold ${isLight ? 'text-black' : 'text-gray-800'}`}>{isArabic ? 'مكالمة هاتفية' : 'Phone Call'}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'مكالمة صادرة • 15 دقيقة' : 'Outgoing Call • 15 minutes'}</p>
                          </div>
                        </div>
                        <p className={`text-sm ${isLight ? 'text-black' : 'text-gray-700'} bg-white p-3 rounded-lg shadow-sm`}>
                          {isArabic ? 'مكالمة ناجحة مع العميل. تم مناقشة جميع النقاط المهمة وتوضيح تفاصيل المشروع. العميل مهتم ويريد المضي قدماً.' : 'Successful call with client. Discussed all important points and clarified project details. Client is interested and wants to proceed.'}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button className="text-xs text-purple-500 hover:underline">{isArabic ? 'إعادة اتصال' : 'Call Again'}</button>
                          <button className="text-xs text-gray-500 hover:underline">{isArabic ? 'إضافة ملاحظة' : 'Add Note'}</button>
                          <button className="text-xs text-green-500 hover:underline">{isArabic ? 'جدولة متابعة' : 'Schedule Follow-up'}</button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 text-center">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-full mb-1">Yesterday</div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {/* Video Meeting */}
                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-l-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaVideo className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">{isArabic ? 'اجتماع Google Meet' : 'Google Meet Session'}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'اجتماع فيديو • 45 دقيقة' : 'Video Meeting • 45 minutes'}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                          {isArabic ? 'اجتماع فيديو ناجح - عرض شامل للمشروع مع العميل وفريقه. تم توضيح جميع التفاصيل التقنية والمالية. سيتم الرد خلال 3 أيام.' : 'Successful video meeting - Comprehensive project presentation to client and their team. All technical and financial details clarified. Response expected within 3 days.'}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button className="text-xs text-red-500 hover:underline">{isArabic ? 'جدولة اجتماع جديد' : 'Schedule New Meeting'}</button>
                          <button className="text-xs text-gray-500 hover:underline">{isArabic ? 'مشاركة التسجيل' : 'Share Recording'}</button>
                          <button className="text-xs text-blue-500 hover:underline">{isArabic ? 'إرسال ملخص' : 'Send Summary'}</button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 text-center">
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full mb-1">2 days ago</div>
                        <div className="w-3 h-3 bg-red-500 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compose Panel moved near Add Message button */}

              {/* Quick Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">{isArabic ? 'أفضل قناة استجابة' : 'Best Response Channel'}</h5>
                  <p className="text-2xl font-bold text-green-600">WhatsApp</p>
                  <p className="text-sm text-green-600">{isArabic ? '85% نسبة الرد' : '85% Response Rate'}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">{isArabic ? 'زمن الرد المتوسط' : 'Avg Response Time'}</h5>
                  <p className="text-2xl font-bold text-blue-600">2.5h</p>
                  <p className="text-sm text-blue-600">{isArabic ? 'تحسن بنسبة 15%' : '15% Improvement'}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-2">{isArabic ? 'نشاط هذا الأسبوع' : 'This Week Activity'}</h5>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-purple-600">{isArabic ? 'تفاعل جديد' : 'New Interactions'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'all-actions' && activeTab !== 'communication' && (
            <div className="text-center py-12">
              <p className="text-slate-400">Content for {activeTab} tab will be implemented here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Action Modal - inline بدل overlay */}
      {false && showAddActionModal && (
        <div className="mt-6">
          <AddActionModal
            isOpen={showAddActionModal}
            onClose={() => setShowAddActionModal(false)}
            onSave={handleAddAction}
            lead={lead}
            inline={true}
          />
        </div>
      )}

      {/* Attachments Modal */}
      {showAttachmentsModal && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'} rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200`}>
            <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-gray-200' : 'border-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FaFileAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{isArabic ? 'مرفقات العميل' : 'Client Attachments'}</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'عرض وتحميل المستندات' : 'View and download documents'}</p>
                </div>
              </div>
              <button onClick={() => setShowAttachmentsModal(false)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-slate-700 text-slate-400'}`}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {actions.filter(a => a.proposalAttachment || a.rentAttachment).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}>
                    <FaFileAlt className={`text-4xl ${isLight ? 'text-slate-300' : 'text-slate-500'}`} />
                  </div>
                  <h4 className={`text-lg font-medium mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{isArabic ? 'لا توجد مرفقات' : 'No attachments found'}</h4>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{isArabic ? 'لم يتم تحميل أي ملفات لهذا العميل بعد' : 'No files have been uploaded for this lead yet'}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {actions.filter(a => a.proposalAttachment || a.rentAttachment).map((action, idx) => {
                     const att = action.proposalAttachment || action.rentAttachment;
                     // Handle both File objects (legacy/unsaved) and stored objects
                     const name = att.name || 'Attachment';
                     const date = new Date(action.date).toLocaleDateString();
                     const type = action.type;
                     const size = att.size ? `${(att.size / 1024).toFixed(1)} KB` : '';
                     
                     return (
                       <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${isLight ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-slate-700/30 border-slate-600 hover:border-blue-500/50'}`}>
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-600 text-slate-300'}`}>
                             {/* Icon based on extension could go here */}
                             <FaFileAlt className="text-xl" />
                           </div>
                           <div>
                             <p className={`font-semibold text-sm mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{name}</p>
                             <div className="flex items-center gap-2 text-xs text-gray-500">
                               <span className={`px-2 py-0.5 rounded-full ${isLight ? 'bg-gray-100' : 'bg-slate-600'}`}>{type}</span>
                               <span>• {date}</span>
                               {size && <span>• {size}</span>}
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                            {att.data && (
                                <>
                                  <button 
                                    onClick={() => {
                                      const win = window.open();
                                      if (win) {
                                        win.document.write('<iframe src="' + att.data + '" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>');
                                      }
                                    }}
                                    className="px-4 py-2 text-sm font-medium bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-slate-500/20"
                                  >
                                    <FaEye className="text-xs" /> 
                                    <span className="hidden sm:inline">{isArabic ? 'عرض' : 'View'}</span>
                                  </button>
                                  <a 
                                    href={att.data} 
                                    download={name}
                                    className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-blue-500/20"
                                  >
                                    <FaDownload className="text-xs" /> 
                                    <span className="hidden sm:inline">{isArabic ? 'تحميل' : 'Download'}</span>
                                  </a>
                                </>
                            )}
                         </div>
                       </div>
                     );
                  })}
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t ${isLight ? 'bg-gray-50 border-gray-200 rounded-b-xl' : 'bg-slate-800 border-slate-700 rounded-b-xl'}`}>
                <p className={`text-xs text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isArabic ? 'يمكنك إضافة مرفقات جديدة عبر "إضافة أكشن جديد"' : 'You can add new attachments via "Add New Action"'}
                </p>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>,
    document.body
  );
};

export default EnhancedLeadDetailsModal;