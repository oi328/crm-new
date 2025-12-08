import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaPhone, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

const EditLeadModal = ({ isOpen, onClose, onSave, lead }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    company: '',
    location: '',
    status: 'New',
    priority: 'Medium',
    source: 'Website',
    assignedTo: 'Unassigned',
    estimatedValue: '',
    probability: '50',
    notes: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        fullName: lead.fullName || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        company: lead.company || '',
        location: lead.location || '',
        status: lead.status || 'New',
        priority: lead.priority || 'Medium',
        source: lead.source || 'Website',
        assignedTo: lead.assignedTo || 'Unassigned',
        estimatedValue: lead.estimatedValue || '',
        probability: lead.probability || '50',
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedLead = {
      ...lead,
      ...formData,
      lastModified: new Date().toLocaleDateString('ar-EG')
    };
    onSave(updatedLead);
    onClose();
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white sm:rounded-lg shadow-xl w-full h-screen sm:max-w-4xl sm:max-h-[90vh] sm:h-auto sm:mx-4 mx-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            تحرير بيانات العميل المحتمل
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="إغلاق"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-1" />
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-1" />
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-1" />
                  الشركة
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم الشركة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-1" />
                  الموقع
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الموقع"
                />
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">تفاصيل العميل المحتمل</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New">جديد</option>
                  <option value="Contacted">تم التواصل</option>
                  <option value="Qualified">مؤهل</option>
                  <option value="Proposal">عرض</option>
                  <option value="Negotiation">تفاوض</option>
                  <option value="Closed Won">مغلق - فوز</option>
                  <option value="Closed Lost">مغلق - خسارة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">منخفضة</option>
                  <option value="Medium">متوسطة</option>
                  <option value="High">عالية</option>
                  <option value="Urgent">عاجلة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المصدر</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Website">الموقع الإلكتروني</option>
                  <option value="Social Media">وسائل التواصل الاجتماعي</option>
                  <option value="Referral">إحالة</option>
                  <option value="Cold Call">اتصال بارد</option>
                  <option value="Email Campaign">حملة بريد إلكتروني</option>
                  <option value="Event">حدث</option>
                  <option value="Other">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">معلومات إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مُعيَّن إلى</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unassigned">غير مُعيَّن</option>
                  <option value="Ahmed Ali">أحمد علي</option>
                  <option value="Sara Mohamed">سارة محمد</option>
                  <option value="Omar Hassan">عمر حسن</option>
                  <option value="Fatima Ibrahim">فاطمة إبراهيم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-1" />
                  القيمة المقدرة
                </label>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل القيمة المقدرة"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاحتمالية (%)</label>
                <input
                  type="number"
                  name="probability"
                  value={formData.probability}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الاحتمالية"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل أي ملاحظات إضافية..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaSave className="mr-2" />
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;