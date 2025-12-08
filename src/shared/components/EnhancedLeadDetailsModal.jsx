import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaUser, FaTimes, FaCog, FaPlus, FaEdit, FaCheckCircle, FaClock, FaSearch, FaFilter, FaSortAmountDown, FaList, FaCalendarAlt, FaPhone, FaEnvelope, FaTrash, FaEye, FaEllipsisV, FaWhatsapp, FaVideo, FaComments, FaMapMarkerAlt, FaDollarSign, FaUserCheck } from 'react-icons/fa';
import AddActionModal from '@components/AddActionModal';
import EditLeadModal from '@components/EditLeadModal';
import { useStages } from '@hooks/useStages';

const EnhancedLeadDetailsModal = ({ lead, isOpen, onClose, isArabic = false, theme = 'light' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedActions, setSelectedActions] = useState([]);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [actions, setActions] = useState([
    {
      id: 1,
      type: 'call',
      title: 'مكالمة هاتفية مع العميل',
      description: 'مناقشة تفاصيل المشروع والمتطلبات الأساسية',
      date: '2024-01-15',
      time: '10:30',
      status: 'completed',
      priority: 'high',
      assignee: 'أحمد محمد',
      duration: '25 دقيقة'
    },
    {
      id: 2,
      type: 'email',
      title: 'إرسال عرض سعر',
      description: 'إرسال عرض سعر مفصل للمشروع المطلوب',
      date: '2024-01-14',
      time: '14:15',
      status: 'completed',
      priority: 'medium',
      assignee: 'سارة أحمد',
      duration: null
    },
    {
      id: 3,
      type: 'meeting',
      title: 'اجتماع مع فريق المبيعات',
      description: 'مراجعة استراتيجية التعامل مع العميل',
      date: '2024-01-16',
      time: '11:00',
      status: 'scheduled',
      priority: 'high',
      assignee: 'محمد علي',
      duration: '60 دقيقة'
    },
    {
      id: 4,
      type: 'note',
      title: 'ملاحظات المتابعة',
      description: 'تسجيل ملاحظات حول اهتمام العميل بالمنتج',
      date: '2024-01-13',
      time: '16:45',
      status: 'completed',
      priority: 'low',
      assignee: 'فاطمة حسن',
      duration: null
    },
    {
      id: 5,
      type: 'task',
      title: 'إعداد العرض التقديمي',
      description: 'تحضير عرض تقديمي شامل للعميل',
      date: '2024-01-17',
      time: '09:00',
      status: 'pending',
      priority: 'medium',
      assignee: 'خالد أحمد',
      duration: '120 دقيقة'
    }
  ]);

  if (!isOpen) return null;

  // Handle adding new action
  const handleAddAction = (newAction) => {
    console.log('إضافة إجراء جديد:', newAction);
    setActions(prev => [
      {
        ...newAction,
        assignee: newAction.assignedTo || newAction.assignee || 'غير محدد'
      },
      ...prev
    ]);
    setShowAddActionModal(false);
  };

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
    stage: lead?.stage || (isArabic ? 'جديد' : 'New')
  };

  const { stages } = useStages();
  const currentStageValue = String(leadData.stage || '').toLowerCase();
  const matchedStage = (Array.isArray(stages) ? stages : []).find((s) => {
    const name = typeof s === 'string' ? s : s?.name;
    const nameAr = typeof s === 'string' ? '' : s?.nameAr;
    return String(name || '').toLowerCase() === currentStageValue || String(nameAr || '').toLowerCase() === currentStageValue;
  });
  const stageColorStyle = matchedStage ? (
    (typeof matchedStage !== 'string' && typeof matchedStage.color === 'string')
      ? (matchedStage.color.trim().startsWith('#')
          ? { backgroundColor: matchedStage.color }
          : { background: `var(--stage-${matchedStage.color}-swatch, ${matchedStage.color})` }
        )
      : {}
  ) : {};
  const stageBadgeClass = `px-3 py-1 text-white text-sm rounded-full font-medium${matchedStage ? '' : ' bg-blue-500'}`;
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
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
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

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-0">
      <div className="bg-slate-800 text-white w-full sm:max-w-5xl max-h-[85vh] h-auto sm:rounded-3xl overflow-y-auto shadow-2xl p-3 sm:p-4">
        {/* Header */}
        <div className="bg-slate-800 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Profile Picture */}
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
                <FaUser className="text-2xl text-slate-300" />
              </div>
              
              {/* Lead Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">{leadData.name}</h2>
                <p className="text-slate-300 text-sm mb-1">{leadData.phone}</p>
                <p className="text-slate-400 text-sm">{leadData.email}</p>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="flex flex-col items-end space-y-3">
              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-4 w-[180px] sm:w-[210px]">
                {showAddActionModal && (
                  <button
                    onClick={() => setShowAddActionModal(false)}
                    title={isArabic ? 'الرجوع للمعاينة' : 'Back to Preview'}
                    className="btn-icon"
                  >
                    <FaEye className="text-sm" />
                  </button>
                )}
                {/* Add Action (icon-only) */}
                {!showAddActionModal && (
                  <button
                    onClick={() => setShowAddActionModal(true)}
                    aria-label={isArabic ? 'إضافة إجراء' : 'Add Action'}
                    title={isArabic ? 'إضافة إجراء' : 'Add Action'}
                    className="btn-icon"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                )}
                {/* Assign (icon-only) */}
                <button
                  onClick={() => {}}
                  aria-label={isArabic ? 'تعيين' : 'Assign'}
                  title={isArabic ? 'تعيين' : 'Assign'}
                  className="btn-icon"
                >
                  <FaUserCheck className="text-sm" />
                </button>
                {/* Edit Lead (icon-only) */}
                <button
                  onClick={() => setShowEditLeadModal(true)}
                  aria-label={isArabic ? 'تعديل العميل' : 'Edit Lead'}
                  title={isArabic ? 'تعديل العميل' : 'Edit Lead'}
                  className="btn-icon"
                >
                  <FaEdit className="text-sm" />
                </button>
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
              <div className="flex space-x-6 rtl:space-x-reverse">
                <span className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-full font-medium">
                  qualified
                </span>
                <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full font-medium">
                  high
                </span>
                <span className={stageBadgeClass} style={stageColorStyle}>
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
          <div className="px-6">
            <AddActionModal
              isOpen={showAddActionModal}
              onClose={() => setShowAddActionModal(false)}
              onSave={handleAddAction}
              lead={lead}
              inline={true}
            />
          </div>
        )}

        {/* Tabs */}
        <div className={`bg-slate-800 px-6 border-b border-slate-700 ${showAddActionModal ? 'hidden' : ''}`}>
          <div className="flex justify-between w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-all duration-200 text-center ${
                  activeTab === tab.id
                    ? 'border-emerald-400 text-white bg-emerald-500/20 rounded-t-lg shadow-lg shadow-emerald-500/10 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 bg-slate-800 ${showAddActionModal ? 'hidden' : ''}`}>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Two Column: Current Status (left) and Lead Information (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Current Status */}
                <div>
                  <h3 className="text-white font-semibold mb-3 border-b border-slate-700 pb-2 text-left">Current Status</h3>
                  <div className="flex justify-start items-center gap-16 mb-6">
                    {/* Stat 1 - Dark circle with 3 and "Total Actions" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 rounded-full mb-2 bg-[conic-gradient(#34d399_0_12%,_#334155_12%)]">
                        <div className="absolute inset-2 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">3</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Total Actions</span>
                    </div>
                    
                    {/* Stat 2 - Green circle with 2 and "Completed" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 rounded-full mb-2 bg-[conic-gradient(#10b981_0_100%)]">
                        <div className="absolute inset-2 rounded-full bg-slate-700 border border-emerald-400 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">2</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Completed</span>
                    </div>
                    
                    {/* Stat 3 - Orange circle with 1 and "Pending" label */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 rounded-full mb-2 bg-[conic-gradient(#f59e0b_0_100%)]">
                        <div className="absolute inset-2 rounded-full bg-slate-700 border border-orange-400 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">1</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Pending</span>
                    </div>
                  </div>
                </div>

                {/* Right: Lead Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Lead Information</h3>
                  <div className="space-y-4 bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Company:</span>
                      <span className="text-white text-sm font-medium text-right">{leadData.company}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Location:</span>
                      <span className="text-white text-sm">{leadData.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Source:</span>
                      <span className="text-white text-sm">{leadData.source}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Created Date:</span>
                      <span className="text-white text-sm">{leadData.createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions below */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold mb-3 border-b border-slate-700 pb-2">Quick Actions</h4>
                  <div className="flex items-center justify-between gap-4 rtl:flex-row-reverse">
                    <button 
                      onClick={() => setShowAddActionModal(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-5 rounded-full font-medium transition-colors flex items-center justify-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                        <FaPlus className="text-xs" />
                      </span>
                      <span>+ Add New Action</span>
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 px-5 rounded-full font-medium transition-colors flex items-center justify-center gap-3 border border-slate-600">
                      <span className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                        <FaEdit className="text-xs" />
                      </span>
                      <span>Edit Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tab contents */}
          {activeTab === 'all-actions' && (
            <div className="space-y-6">
              {/* Summary counters styled like overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-700 p-5 rounded-xl text-center border border-slate-600">
                  <div className="text-2xl font-bold text-white">{actionStats.total}</div>
                  <div className="text-sm text-slate-400">إجمالي الإجراءات</div>
                </div>
                <div className="bg-slate-700 p-5 rounded-xl text-center border border-slate-600">
                  <div className="text-2xl font-bold text-green-400">{actionStats.completed}</div>
                  <div className="text-sm text-slate-400">مكتملة</div>
                </div>
                <div className="bg-slate-700 p-5 rounded-xl text-center border border-slate-600">
                  <div className="text-2xl font-bold text-orange-400">{actionStats.pending}</div>
                  <div className="text-sm text-slate-400">معلقة</div>
                </div>
                <div className="bg-slate-700 p-5 rounded-xl text-center border border-slate-600">
                  <div className="text-2xl font-bold text-blue-400">{actionStats.scheduled}</div>
                  <div className="text-sm text-slate-400">مجدولة</div>
                </div>
              </div>

              {/* Simple header with Add button */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Actions</h3>
                <button 
                  onClick={() => setShowAddActionModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  إضافة إجراء جديد
                </button>
              </div>

              {/* Search and Filters (Status & Type) */}
              <div className="bg-slate-700 p-4 rounded-lg space-y-3 mb-2">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="flex-1 relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="البحث في الإجراءات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFilter className="text-slate-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="completed">مكتملة</option>
                      <option value="pending">معلقة</option>
                      <option value="scheduled">مجدولة</option>
                    </select>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                    >
                      <option value="all">جميع الأنواع</option>
                      <option value="call">مكالمة</option>
                      <option value="email">بريد</option>
                      <option value="meeting">اجتماع</option>
                      <option value="task">مهمة</option>
                      <option value="note">ملاحظة</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {filteredActions.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12 bg-slate-700 rounded-lg">
                    <FaList className="mx-auto text-4xl text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">لا توجد إجراءات</h3>
                    <p className="text-slate-400 mb-4">
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
                  /* Actions List redesigned closer to overview */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActions.map((action) => (
                      <div
                        key={action.id}
                        className={`bg-slate-700 border border-slate-600 rounded-xl p-5 transition-all hover:bg-slate-600 ${
                          selectedActions.includes(action.id) 
                            ? 'border-emerald-400 bg-emerald-500/5' 
                            : 'border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Action Icon styled like overview */}
                          <div className="flex-shrink-0 w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
                            {getActionIcon(action.type)}
                          </div>

                          {/* Action Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">{action.title}</h4>
                                <p className="text-slate-400 text-sm mb-2">{action.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                  <span>📅 {action.date}</span>
                                  <span>🕐 {action.time}</span>
                                  <span>👤 {action.assignee}</span>
                                  {action.duration && <span>⏱️ {action.duration}</span>}
                                </div>
                              </div>

                              {/* Status and Priority */}
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(action.status)}`}>
                                  {action.status === 'completed' && 'مكتمل'}
                                  {action.status === 'pending' && 'معلق'}
                                  {action.status === 'scheduled' && 'مجدول'}
                                </span>
                                <span className={`px-2 py-1 rounded border text-xs ${getPriorityColor(action.priority)}`}>
                                  {action.priority === 'high' && 'عالية'}
                                  {action.priority === 'medium' && 'متوسطة'}
                                  {action.priority === 'low' && 'منخفضة'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Quick Actions minimal */}
                          <div className="flex items-center gap-1">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors">
                              <FaEye />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors">
                              <FaEdit />
                            </button>
                          </div>
                        </div>
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
                      <FaSearch />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <FaFilter />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <button 
                  onClick={() => window.open(`https://wa.me/${lead?.phone}`, '_blank')}
                  className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaWhatsapp className="text-2xl mb-2" />
                  <span className="text-sm font-medium">{isArabic ? 'واتساب' : 'WhatsApp'}</span>
                </button>
                <button 
                  onClick={() => window.open(`mailto:${lead?.email}`, '_blank')}
                  className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaEnvelope className="text-2xl mb-2" />
                  <span className="text-sm font-medium">{isArabic ? 'بريد إلكتروني' : 'Email'}</span>
                </button>
                <button 
                  onClick={() => window.open(`tel:${lead?.phone}`, '_blank')}
                  className="flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaPhone className="text-2xl mb-2" />
                  <span className="text-sm font-medium">{isArabic ? 'مكالمة' : 'Call'}</span>
                </button>
                <button 
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaVideo className="text-2xl mb-2" />
                  <span className="text-sm font-medium">{isArabic ? 'Google Meet' : 'Google Meet'}</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">{isArabic ? 'فلترة:' : 'Filter:'}</span>
                    <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200 transition-colors">
                      {isArabic ? 'الكل' : 'All'}
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      WhatsApp
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      Email
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      {isArabic ? 'مكالمات' : 'Calls'}
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors">
                      {isArabic ? 'غير مقروء' : 'Unread'}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder={isArabic ? 'البحث في المحادثات...' : 'Search conversations...'}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Communication Feed */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium text-gray-700">{isArabic ? 'سجل التواصل' : 'Communication Timeline'}</h4>
                  <button 
                    onClick={() => alert(isArabic ? 'سيتم إضافة رسالة جديدة' : 'New message will be added')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <FaPlus className="text-sm" />
                    <span className="text-sm">{isArabic ? 'إضافة رسالة' : 'Add Message'}</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* WhatsApp Message */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaWhatsapp className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">{lead?.name || (isArabic ? 'محمد علي' : 'Mohamed Ali')}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'رسالة واتساب • وارد' : 'WhatsApp Message • Incoming'}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
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
                  
                  {/* Email */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaEnvelope className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">{isArabic ? 'أنت' : 'You'}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'بريد إلكتروني • صادر' : 'Email • Outgoing'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <h6 className="font-medium text-gray-800 mb-1">{isArabic ? 'الموضوع: العرض المالي المحدث' : 'Subject: Updated Financial Proposal'}</h6>
                          <p className="text-sm text-gray-700">
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
                  
                  {/* Phone Call */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <FaPhone className="text-white text-sm" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">{isArabic ? 'مكالمة هاتفية' : 'Phone Call'}</h5>
                            <p className="text-xs text-gray-500">{isArabic ? 'مكالمة صادرة • 15 دقيقة' : 'Outgoing Call • 15 minutes'}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
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

              {/* Compose Panel */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-medium text-gray-700 mb-4">{isArabic ? 'إرسال رسالة جديدة' : 'Compose New Message'}</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? 'القناة' : 'Channel'}</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>WhatsApp</option>
                        <option>Email</option>
                        <option>SMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? 'القالب' : 'Template'}</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>{isArabic ? 'رسالة مخصصة' : 'Custom Message'}</option>
                        <option>{isArabic ? 'متابعة عرض سعر' : 'Quote Follow-up'}</option>
                        <option>{isArabic ? 'تأكيد موعد' : 'Appointment Confirmation'}</option>
                        <option>{isArabic ? 'طلب مستندات' : 'Document Request'}</option>
                        <option>{isArabic ? 'شكر بعد مكالمة' : 'Post-call Thank You'}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? 'الموضوع (للإيميل)' : 'Subject (for Email)'}</label>
                    <input 
                      type="text" 
                      placeholder={isArabic ? 'موضوع الرسالة...' : 'Message subject...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{isArabic ? 'نص الرسالة' : 'Message Content'}</label>
                    <textarea 
                      rows="4"
                      placeholder={isArabic ? 'اكتب رسالتك هنا... يمكنك استخدام {الاسم} و {رقم_العرض} كمتغيرات ديناميكية' : 'Type your message here... You can use {name} and {quote_number} as dynamic variables'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-600">{isArabic ? 'جدولة الإرسال' : 'Schedule Send'}</span>
                      </label>
                      <input 
                        type="datetime-local" 
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        {isArabic ? 'حفظ كمسودة' : 'Save Draft'}
                      </button>
                      <button 
                        onClick={() => alert(isArabic ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {isArabic ? 'إرسال' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

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
    </div>,
    document.body
  );
};

export default EnhancedLeadDetailsModal;
