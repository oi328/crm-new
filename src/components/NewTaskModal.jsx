import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// نافذة إنشاء مهمة جديدة - تدعم الدارك/لايت عبر متغيرات CSS المستخدمة في المشروع
export default function NewTaskModal({ isOpen, onClose, onSave }) {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salesman, setSalesman] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [taskType, setTaskType] = useState('Follow-up');
  const [createdBy, setCreatedBy] = useState('Admin');
  const [relatedType, setRelatedType] = useState('');
  const [relatedRef, setRelatedRef] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [reminderBefore, setReminderBefore] = useState('');
  const [recurring, setRecurring] = useState('none');

  const salesmen = useMemo(() => [
    'Ibrahim', 'Ahmed M', 'Semik L', 'Casad', 'Admin'
  ], []);
  const assignees = useMemo(() => [
    'Team A', 'Team B', 'Support', 'Sales', 'Admin', 'Ibrahim', 'Ahmed'
  ], []);
  const relatedModules = useMemo(() => [
    'Lead', 'Deal', 'Contact', 'Opportunity', 'Ticket', 'Project'
  ], []);
  const taskTypes = useMemo(() => [
    'Call', 'Meeting', 'Email', 'Follow-up', 'Internal', 'Delivery', 'Support'
  ], []);
  const reminderOptions = useMemo(() => [
    { value: '', label: isArabic ? 'بدون' : 'None' },
    { value: '5m', label: isArabic ? 'قبل 5 دقائق' : '5 minutes before' },
    { value: '15m', label: isArabic ? 'قبل 15 دقيقة' : '15 minutes before' },
    { value: '1h', label: isArabic ? 'قبل ساعة' : '1 hour before' },
    { value: '1d', label: isArabic ? 'قبل يوم' : '1 day before' }
  ], [isArabic]);
  const recurringOptions = useMemo(() => [
    { value: 'none', label: isArabic ? 'بدون' : 'None' },
    { value: 'daily', label: isArabic ? 'يومي' : 'Daily' },
    { value: 'weekly', label: isArabic ? 'أسبوعي' : 'Weekly' },
    { value: 'monthly', label: isArabic ? 'شهري' : 'Monthly' }
  ], [isArabic]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      setError(isArabic ? 'العنوان مطلوب' : 'Title is required');
      return;
    }
    // نمرر due لضمان الربط مع الجدول وتفاصيل المهمة، ونحتفظ بـ endDate للتوافق
    const payload = {
      title: title.trim(),
      description: description.trim(),
      salesman,
      assignedTo,
      due: endDate,
      endDate,
      startDate,
      priority,
      attachment,
      taskType,
      createdBy,
      relatedType,
      relatedRef,
      tags: tagsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      progress,
      reminderBefore,
      recurring,
    };
    onSave?.(payload);
    // إعادة تعيين الحقول بعد الحفظ
    setTitle(''); setDescription(''); setSalesman(''); setAssignedTo(''); setEndDate(''); setStartDate(''); setPriority('medium'); setAttachment(null); setTaskType('Follow-up'); setCreatedBy('Admin'); setRelatedType(''); setRelatedRef(''); setTagsInput(''); setProgress(0); setReminderBefore(''); setRecurring('none'); setError('');
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setAttachment(null); return; }
    const url = URL.createObjectURL(file);
    setAttachment({ name: file.name, size: file.size, type: file.type, url });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full sm:w-[90%] sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto bg-[var(--content-bg)] text-[var(--content-text)] border shadow-xl rounded-none sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{isArabic ? 'مهمة جديدة' : 'New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--table-row-hover)]" aria-label={isArabic ? 'إغلاق' : 'Close'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'العنوان' : 'Title'}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArabic ? 'العنوان' : 'Title'}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'الوصف' : 'Description'}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isArabic ? 'الوصف' : 'Description'}
              className="w-full min-h-28 px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] resize-y"
            />
          </div>

        {/* Salesman */}
        <div className="space-y-1">
          <label className="text-sm opacity-80">{isArabic ? 'اختر المندوب' : 'Select sales'}</label>
          <div className="relative">
            <select
              value={salesman}
              onChange={(e) => setSalesman(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
            >
              <option value="">{isArabic ? 'اختر مندوباً' : 'Select a salesman'}</option>
              {salesmen.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Assigned To */}
        <div className="space-y-1">
          <label className="text-sm opacity-80">{isArabic ? 'مسند إلى' : 'Assigned To'}</label>
          <div className="relative">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
            >
              <option value="">{isArabic ? 'اختر شخص/فريق' : 'Select person/team'}</option>
              {assignees.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'الأولوية' : 'Priority'}</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
              >
                <option value="low">{isArabic ? 'منخفضة' : 'Low'}</option>
                <option value="medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
                <option value="high">{isArabic ? 'عالية' : 'High'}</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

        {/* Start date */}
        <div className="space-y-1">
          <label className="text-sm opacity-80">{isArabic ? 'تاريخ البداية' : 'Start date'}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
          />
        </div>

        {/* Due date */}
        <div className="space-y-1">
          <label className="text-sm opacity-80">{isArabic ? 'تاريخ الاستحقاق' : 'Due date'}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
          />
        </div>

          {/* Attached File */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'ملف مرفق' : 'Attached File'}</label>
            <input
              type="file"
              onChange={onFileChange}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
            />
            {attachment ? (
              <div className="mt-2 flex items-center justify-between text-xs bg-[var(--dropdown-bg)] border rounded-md px-3 py-2">
                <div className="flex items-center gap-2 truncate">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M21.44 11.05l-9.9 9.9a5.5 5.5 0 01-7.78-7.78l9.9-9.9a3.5 3.5 0 015 5l-9.2 9.2a1.5 1.5 0 01-2.12-2.12l8.49-8.49" />
                  </svg>
                  <a href={attachment.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                    {attachment.name}
                  </a>
                </div>
                <button type="button" onClick={() => setAttachment(null)} className="px-2 py-1 rounded-md border bg-[var(--table-row-hover)]">
                  {isArabic ? 'إزالة' : 'Remove'}
                </button>
              </div>
            ) : null}
          </div>

          {/* Task Type */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'نوع المهمة' : 'Task type'}</label>
            <div className="relative">
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
              >
                {taskTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Related To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm opacity-80">{isArabic ? 'مرتبط بـ' : 'Related to'}</label>
              <div className="relative">
                <select
                  value={relatedType}
                  onChange={(e) => setRelatedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
                >
                  <option value="">{isArabic ? 'اختر الكيان' : 'Select entity'}</option>
                  {relatedModules.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm opacity-80">{isArabic ? 'مرجع/رقم' : 'Reference/ID'}</label>
              <input
                value={relatedRef}
                onChange={(e) => setRelatedRef(e.target.value)}
                placeholder={isArabic ? 'مثال: LEAD-102' : 'e.g., LEAD-102'}
                className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
              />
            </div>
          </div>

          {/* Created By */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'أنشئت بواسطة' : 'Created by'}</label>
            <input
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'وسوم/تصنيفات' : 'Tags/Labels'}</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={isArabic ? 'افصل بين الوسوم بفواصل' : 'Comma-separated tags'}
              className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)]"
            />
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'نسبة الإنجاز' : 'Progress %'}</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12 text-right">{progress}%</span>
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'تذكير' : 'Reminder'}</label>
            <div className="relative">
              <select
                value={reminderBefore}
                onChange={(e) => setReminderBefore(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
              >
                {reminderOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-1">
            <label className="text-sm opacity-80">{isArabic ? 'تكرار المهمة' : 'Recurring'}</label>
            <div className="relative">
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] appearance-none pr-8"
              >
                {recurringOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm">
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm">
            {isArabic ? 'مهمة جديدة' : 'New Task'}
          </button>
        </div>
      </div>
    </div>
  );
}