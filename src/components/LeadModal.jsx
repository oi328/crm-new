import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaBuilding, FaComments, FaEye, FaEdit, FaUsers, FaEllipsisH } from 'react-icons/fa';
import AddLeadModal from './AddLeadModal';
import EditLeadModal from './EditLeadModal';
import LeadDetailsModal from './LeadDetailsModal';
import AddActionModal from '@components/AddActionModal';

const LeadModal = ({ isOpen, onClose, lead, theme = 'light' }) => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  
  if (!isOpen || !lead) return null;

  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-white' : 'bg-gray-900';
  const textColor = isLight ? 'text-gray-800' : 'text-gray-100';
  const borderColor = isLight ? 'border-gray-200' : 'border-gray-700';
  const secondaryTextColor = isLight ? 'text-gray-600' : 'text-gray-400';

  const handleAddLead = (newLead) => {
    console.log('إضافة عميل جديد:', newLead);
    // يمكن إضافة منطق حفظ العميل الجديد هنا
  };

  const handleAddAction = (newAction) => {
    console.log('إضافة أكشن جديد:', newAction);
    // يمكن إضافة منطق حفظ الأكشن الجديد هنا
  };

  const handleEditLead = (updatedLead) => {
    console.log('تحديث بيانات العميل:', updatedLead);
    // يمكن إضافة منطق تحديث بيانات العميل هنا
  };

  const handleViewDetails = () => {
    console.log('عرض تفاصيل العميل والأكشنز:', lead);
    setShowDetailsModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div
        className={`relative w-full sm:w-[90%] sm:max-w-2xl max-h-[85vh] h-auto overflow-y-auto rounded-none sm:rounded-2xl border shadow-xl ${bgColor} ${borderColor} ${textColor}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <div className="flex items-center gap-3">
            <FaUser className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">{t('Lead Details')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={handleViewDetails}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${secondaryTextColor} hover:text-blue-600`}
              title="View"
            >
              <FaEye size={16} />
            </button>
            <button
              onClick={() => setShowAddActionModal(true)}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Add Action"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${secondaryTextColor} hover:text-green-600`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => console.log('Assign lead:', lead)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${secondaryTextColor} hover:text-purple-600`}
              title="Assign"
            >
              <FaUsers size={16} />
            </button>
            <button
              onClick={() => console.log('More options for lead:', lead)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${secondaryTextColor} hover:text-gray-600`}
              title="More Options"
            >
              <FaEllipsisH size={16} />
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${secondaryTextColor} hover:text-red-600 ml-2`}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaUser className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Full Name')}</label>
                  <p className="text-lg font-semibold">{lead.leadName || lead.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Mobile')}</label>
                  <p className="text-lg">{lead.mobile || lead.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Email')}</label>
                  <p className="text-lg">{lead.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaBuilding className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Company')}</label>
                  <p className="text-lg">{lead.company || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Location')}</label>
                  <p className="text-lg">{lead.location || lead.address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaCalendarAlt className={secondaryTextColor} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Stage Date')}</label>
                  <p className="text-lg">{lead.stageDate || lead.createdAt || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Category */}
          <div className={`p-4 rounded-lg border ${borderColor} ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Status')}</label>
                <p className="text-lg font-semibold text-blue-600">{lead.status || 'Active'}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Priority')}</label>
                <p className="text-lg">{lead.priority || 'Medium'}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Source')}</label>
                <p className="text-lg">{lead.source || 'Direct'}</p>
              </div>
            </div>
          </div>

          {/* Comments/Notes */}
          {(lead.lastComment || lead.notes || lead.comment) && (
            <div className={`p-4 rounded-lg border ${borderColor} ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <div className="flex items-start gap-3">
                <FaComments className={`${secondaryTextColor} mt-1`} size={16} />
                <div className="flex-1">
                  <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Notes')}</label>
                  <p className="text-base mt-1 leading-relaxed">
                    {lead.lastComment || lead.notes || lead.comment}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className={`p-4 rounded-lg border ${borderColor} ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            <h3 className="text-lg font-semibold mb-3">{t('Additional Information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Assigned To')}</label>
                <p className="text-base">{lead.assignedTo || 'N/A'}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Estimated Value')}</label>
                <p className="text-base">{lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div>
                <label className={`text-sm font-medium ${secondaryTextColor}`}>{t('Probability')}</label>
                <p className="text-base">{lead.probability !== undefined ? `${lead.probability}%` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions & Activities Section */}
          <div className={`p-4 rounded-lg border ${borderColor} ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaComments className="text-blue-600" />
                {t('Recent Activities')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddActionModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('Add Action')}
                </button>
                <button
                  onClick={handleViewDetails}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                >
                  <FaEye size={12} />
                  {t('View All')}
                </button>
              </div>
            </div>
            
            {/* Sample Recent Actions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FaPhone className="text-blue-600 dark:text-blue-400" size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{t('Phone Call')}</span>
                    <span className={`text-xs ${secondaryTextColor}`}>2024-01-20</span>
                  </div>
                  <p className={`text-sm mt-1 ${secondaryTextColor}`}>
                    {t('Follow-up call completed. Client interested in proposal.')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-green-600 dark:text-green-400" size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{t('Email Sent')}</span>
                    <span className={`text-xs ${secondaryTextColor}`}>2024-01-18</span>
                  </div>
                  <p className={`text-sm mt-1 ${secondaryTextColor}`}>
                    {t('Proposal document sent to client for review.')}
                  </p>
                </div>
              </div>
              
              <div className="text-center py-2">
                <button
                  onClick={handleViewDetails}
                  className={`text-sm ${secondaryTextColor} hover:text-blue-600 transition-colors`}
                >
                  {t('View all activities')} →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${borderColor}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${borderColor} ${secondaryTextColor} hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {t('Close')}
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              // يمكن إضافة منطق تحرير العميل المحتمل هنا
              console.log('Edit lead:', lead);
            }}
          >
            {t('Edit Lead')}
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddLead}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditLead}
        lead={lead}
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        lead={lead}
      />

      {/* Add Action Modal */}
      <AddActionModal
        isOpen={showAddActionModal}
        onClose={() => setShowAddActionModal(false)}
        onSave={handleAddAction}
        lead={lead}
      />
    </div>
  );
};

export default LeadModal;
