import React from 'react';
import { FaUndo, FaTrashAlt, FaTimes, FaEye } from 'react-icons/fa';

const RecycleActionsModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onRestore, 
  onPermanentDelete, 
  onView,
  position = { x: 0, y: 0 },
  theme = 'light', 
  isArabic = false 
}) => {
  if (!isOpen || !lead) return null;

  const isDark = theme === 'dark';
  
  const modalBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const actions = [
    {
      id: 'view',
      title: isArabic ? 'عرض التفاصيل' : 'View Details',
      icon: FaEye,
      color: 'text-blue-600',
      onClick: () => {
        onView(lead);
        onClose();
      }
    },
    {
      id: 'restore',
      title: isArabic ? 'استعادة' : 'Restore',
      icon: FaUndo,
      color: 'text-green-600',
      onClick: () => {
        onRestore(lead.id);
        onClose();
      }
    },
    {
      id: 'delete',
      title: isArabic ? 'حذف نهائي' : 'Permanent Delete',
      icon: FaTrashAlt,
      color: 'text-red-600',
      onClick: () => {
        onPermanentDelete(lead.id);
        onClose();
      }
    }
  ];

  // Calculate position to ensure dropdown stays within viewport
  const dropdownStyle = {
    position: 'fixed',
    left: `${Math.min(position.x, window.innerWidth - 320)}px`,
    top: `${Math.min(position.y + 10, window.innerHeight - 400)}px`,
    zIndex: 1000
  };

  return (
    <>
      {/* Invisible overlay to close dropdown when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div 
        className={`${modalBg} rounded-lg shadow-xl border ${borderColor} w-80 max-w-sm`}
        style={dropdownStyle}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
          <h3 className={`text-lg font-semibold ${textColor}`}>
            {isArabic ? 'الإجراءات المتاحة' : 'Available Actions'}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${hoverBg} ${textColor}`}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Lead Info */}
        <div className={`p-4 border-b ${borderColor}`}>
          <div className={`text-sm ${textColor}`}>
            <div className="font-medium">{lead.name}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`w-full flex items-center gap-3 p-3 rounded-lg ${hoverBg} transition-colors duration-200`}
            >
              <action.icon className={`${action.color} text-lg`} />
              <span className={`${textColor} font-medium`}>
                {action.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default RecycleActionsModal;