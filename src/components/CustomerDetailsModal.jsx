import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaComments, FaHistory, FaPlus, FaEdit, FaTrash, FaFilter, FaSort, FaSearch, FaClock, FaHandshake, FaFileAlt, FaChartLine, FaInfoCircle, FaVideo, FaWhatsapp } from 'react-icons/fa';

const CustomerDetailsModal = ({ isOpen, onClose, customer }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState('details');
  const [actionFilter, setActionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      text: isArabic ? 'عميل مهم، يطلب منتجات بكميات كبيرة' : 'VIP Customer, requests products in bulk',
      author: isArabic ? 'أحمد علي' : 'Ahmed Ali',
      date: '2024-01-15',
      time: '10:30 AM'
    }
  ]);

  if (!isOpen || !customer) return null;

  // Handle adding new comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        text: newComment,
        author: isArabic ? 'المستخدم الحالي' : 'Current User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  // Sample actions data - Mock for now
  const customerActions = [
    {
      id: 1,
      type: 'call',
      title: isArabic ? 'مكالمة ترحيبية' : 'Welcome Call',
      description: isArabic ? 'مكالمة ترحيبية' : 'Welcome Call',
      date: '2024-01-15',
      time: '10:30 AM',
      user: isArabic ? 'أحمد علي' : 'Ahmed Ali',
      status: 'completed',
      priority: 'high',
      notes: isArabic ? 'العميل سعيد بالخدمة' : 'Customer is happy with service'
    }
  ];

  const getActionIcon = (type) => {
    switch (type) {
      case 'call': return <FaPhone className="text-blue-500" />;
      case 'email': return <FaEnvelope className="text-green-500" />;
      case 'meeting': return <FaUser className="text-purple-500" />;
      case 'follow_up': return <FaHistory className="text-orange-500" />;
      case 'proposal': return <FaHandshake className="text-indigo-500" />;
      case 'document': return <FaFileAlt className="text-gray-500" />;
      default: return <FaComments className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort actions
  const filteredAndSortedActions = customerActions
    .filter(action => {
      if (actionFilter === 'all') return true;
      return action.type === actionFilter;
    })
    .filter(action => {
      if (!searchTerm) return true;
      return action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             action.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
             action.user.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[85vh] h-auto overflow-y-auto transform transition-all duration-300 ease-out">
        {/* Modern Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 btn btn-sm btn-circle bg-white text-red-600 hover:bg-red-50 shadow-lg rtl:right-auto rtl:left-4"
          >
            <FaTimes size={18} />
          </button>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {customer.name}
                </h2>
                <p className="text-blue-100 text-sm font-medium">
                  {isArabic ? 'تفاصيل العميل' : 'Customer Details'}
                </p>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <span className="text-white text-sm font-medium">
                    {customer.type}
                  </span>
                </div>
                <div className="bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <span className="text-green-100 text-sm font-medium">
                    {customer.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Modern Tabs */}
        <div className="bg-gray-50/50 px-8 pt-6">
          <div className="flex space-x-1 rtl:space-x-reverse bg-gray-100 rounded-2xl p-1.5">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                activeTab === 'details'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 transform scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <FaUser className="text-sm" />
              <span>{isArabic ? 'تفاصيل العميل' : 'Client Details'}</span>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                activeTab === 'actions'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 transform scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <FaHistory className="text-sm" />
              <span>{isArabic ? `الأنشطة` : `Activities`}</span>
              <div className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full ml-2 rtl:ml-0 rtl:mr-2">
                {filteredAndSortedActions.length}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                activeTab === 'comments'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 transform scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <FaComments className="text-sm" />
              <span>{isArabic ? 'التعليقات' : 'Comments'}</span>
              <div className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full ml-2 rtl:ml-0 rtl:mr-2">
                {comments.length}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(85vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="bg-blue-500 p-2 rounded-xl mr-3">
                    <FaUser className="text-white text-sm" />
                  </div>
                  {isArabic ? 'المعلومات الأساسية' : 'Basic Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
                    <p className="text-gray-800 font-semibold text-lg">{customer.name || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</label>
                    <p className="text-gray-800 font-medium">{customer.phone || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                    <p className="text-gray-800 font-medium">{customer.email || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'الشركة' : 'Company'}</label>
                    <p className="text-gray-800 font-medium">{customer.companyName || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                   <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'الرقم الضريبي' : 'Tax Number'}</label>
                    <p className="text-gray-800 font-medium">{customer.taxNumber || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                   <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'مسؤول المبيعات' : 'Sales Rep'}</label>
                    <p className="text-gray-800 font-medium">{customer.assignedSalesRep || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="bg-purple-500 p-2 rounded-xl mr-3">
                    <FaMapMarkerAlt className="text-white text-sm" />
                  </div>
                  {isArabic ? 'العنوان' : 'Address'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'الدولة' : 'Country'}</label>
                    <p className="text-gray-800 font-medium">{customer.country || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                   <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'المدينة' : 'City'}</label>
                    <p className="text-gray-800 font-medium">{customer.city || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                   <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{isArabic ? 'العنوان' : 'Address Line'}</label>
                    <p className="text-gray-800 font-medium">{customer.addressLine || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
               <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="bg-yellow-500 p-2 rounded-xl mr-3">
                    <FaFileAlt className="text-white text-sm" />
                  </div>
                  {isArabic ? 'الملاحظات' : 'Notes'}
                </h3>
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-gray-800 font-medium whitespace-pre-wrap">{customer.notes || (isArabic ? 'لا توجد ملاحظات' : 'No notes')}</p>
                  </div>
              </div>

            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {filteredAndSortedActions.length > 0 ? (
                filteredAndSortedActions.map((action) => (
                  <div key={action.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
                     <div className="bg-gray-100 p-3 rounded-full">
                        {getActionIcon(action.type)}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800">{action.title}</h4>
                            <span className="text-xs text-gray-500">{action.date} {action.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{action.notes}</p>
                        <div className="flex gap-2 mt-2">
                             <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(action.status)}`}>
                                {action.status}
                             </span>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {isArabic ? 'لا توجد أنشطة' : 'No activities found'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder={isArabic ? 'أضف تعليق...' : 'Add a comment...'}
                  />
                  <button onClick={handleAddComment} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    {isArabic ? 'إضافة' : 'Add'}
                  </button>
               </div>
               <div className="space-y-4">
                  {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex justify-between mb-2">
                              <span className="font-bold text-gray-800">{comment.author}</span>
                              <span className="text-xs text-gray-500">{comment.date} {comment.time}</span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                      </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
