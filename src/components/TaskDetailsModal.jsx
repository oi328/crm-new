import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TaskDetailsModal({ isOpen, onClose, task }) {
  const { i18n } = useTranslation();
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar');

  if (!isOpen || !task) return null;

  const labels = {
    title: isArabic ? 'العنوان' : 'Title',
    description: isArabic ? 'الوصف' : 'Description',
    assigned: isArabic ? 'المسند' : 'Assigned',
    status: isArabic ? 'الحالة' : 'Status',
    due: isArabic ? 'تاريخ الاستحقاق' : 'Due',
    start: isArabic ? 'تاريخ البداية' : 'Start',
    salesman: isArabic ? 'المندوب' : 'Salesman',
    priority: isArabic ? 'الأولوية' : 'Priority',
    attachment: isArabic ? 'ملف مرفق' : 'Attached File',
    createdBy: isArabic ? 'أنشئت بواسطة' : 'Created By',
    taskType: isArabic ? 'نوع المهمة' : 'Task Type',
    relatedTo: isArabic ? 'مرتبط بـ' : 'Related To',
    reference: isArabic ? 'مرجع/رقم' : 'Reference',
    tags: isArabic ? 'وسوم' : 'Tags',
    progress: isArabic ? 'نسبة الإنجاز' : 'Progress %',
    reminder: isArabic ? 'تذكير' : 'Reminder',
    recurring: isArabic ? 'تكرار' : 'Recurring',
    details: isArabic ? 'تفاصيل المهمة' : 'Task Details',
    close: isArabic ? 'إغلاق' : 'Close'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full h-screen sm:w-[90%] sm:max-w-2xl sm:max-h-[90vh] sm:h-auto bg-[var(--content-bg)] text-[var(--content-text)] border shadow-xl rounded-none sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b sticky top-0 bg-[var(--content-bg)] z-10">
          <h2 className="text-xl font-semibold">{labels.details}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--table-row-hover)]" aria-label={labels.close}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3">
          <div>
            <div className="text-xs opacity-70">{labels.title}</div>
            <div className="text-base font-medium">{task.name}</div>
          </div>

          <div>
            <div className="text-xs opacity-70">{labels.description}</div>
            <div className="text-sm whitespace-pre-wrap">{task.sub || (isArabic ? '—' : '—')}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs opacity-70">{labels.assigned}</div>
              <div className="text-sm">{task.assignee || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.salesman}</div>
              <div className="text-sm">{task.salesman || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.status}</div>
              <div className="text-sm">{task.status || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.priority}</div>
              <div className="text-sm">{task.priority || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.due}</div>
              <div className="text-sm">{task.due || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.start}</div>
              <div className="text-sm">{task.startDate || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.createdBy}</div>
              <div className="text-sm">{task.createdBy || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.taskType}</div>
              <div className="text-sm">{task.taskType || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.relatedTo}</div>
              <div className="text-sm">{task.relatedType || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.reference}</div>
              <div className="text-sm">{task.relatedRef || '—'}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs opacity-70">{labels.tags}</div>
              <div className="text-sm">{(task.tags && task.tags.length > 0) ? task.tags.join(', ') : '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.progress}</div>
              <div className="text-sm">{typeof task.progress === 'number' ? `${task.progress}%` : '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.reminder}</div>
              <div className="text-sm">{task.reminderBefore || '—'}</div>
            </div>
            <div>
              <div className="text-xs opacity-70">{labels.recurring}</div>
              <div className="text-sm">{task.recurring || '—'}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs opacity-70">{labels.attachment}</div>
              {task.attachment ? (
                <div className="mt-1 inline-flex items-center gap-2 px-2 py-1 rounded-md border bg-[var(--dropdown-bg)] text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M21.44 11.05l-9.9 9.9a5.5 5.5 0 01-7.78-7.78l9.9-9.9a3.5 3.5 0 015 5l-9.2 9.2a1.5 1.5 0 01-2.12-2.12l8.49-8.49" />
                  </svg>
                  <a href={task.attachment.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {task.attachment.name}
                  </a>
                </div>
              ) : (
                <div className="text-sm">—</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t bg-[var(--content-bg)]">
          <button onClick={onClose} className="px-4 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm">
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}