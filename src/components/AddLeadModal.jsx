import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaTrash, FaPhone, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const AddLeadModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();

  const makeEmptyRow = () => ({
    name: '',
    phone: '',
    email: '',
    company: '',
    status: 'new',
    priority: 'medium',
    source: 'direct',
    notes: '',
    assignedTo: '',
    estimatedValue: ''
  });

  const [rows, setRows] = useState([makeEmptyRow()]);
  const [stageOptions, setStageOptions] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('crmStages') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        const names = saved.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
        setStageOptions(names);
      } else {
        setStageOptions(['new', 'qualified', 'in-progress', 'converted', 'lost']);
      }
    } catch (e) {
      setStageOptions(['new', 'qualified', 'in-progress', 'converted', 'lost']);
    }
  }, [isOpen]);

  const handleCellChange = (index, field, value) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows(prev => [...prev, makeEmptyRow()]);
  const removeRow = (index) => setRows(prev => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const prepared = rows
      .filter(r => (r.name?.trim() || r.phone?.trim() || r.email?.trim()))
      .map((r, idx) => ({
        id: Date.now() + idx,
        name: r.name?.trim() || '',
        email: r.email?.trim() || '',
        phone: r.phone?.trim() || '',
        company: r.company?.trim() || '',
        status: r.status || 'new',
        priority: r.priority || 'medium',
        source: r.source || 'direct',
        assignedTo: r.assignedTo?.trim() || 'Unassigned',
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        estimatedValue: isNaN(parseFloat(r.estimatedValue)) ? 0 : parseFloat(r.estimatedValue),
        notes: r.notes?.trim() || ''
      }));
    if (prepared.length === 0) {
      onClose && onClose();
      return;
    }
    onSave && onSave(prepared);
    onClose && onClose();
    setRows([makeEmptyRow(), makeEmptyRow(), makeEmptyRow()]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white sm:rounded-2xl shadow-2xl border border-gray-200 w-full h-screen sm:max-w-[1100px] sm:max-h-[90vh] sm:h-auto sm:overflow-hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={t('Close')}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Grid-like Form */}
        <div className="p-6">
          <div className="overflow-x-auto dribbble-card">
            <table className="add-lead-table min-w-[1300px] w-full table-auto text-sm md:text-base text-gray-900">
              <thead className="thead-soft sticky top-0">
                <tr>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Lead')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Contact')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Source')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Project')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Sales')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Last Comment')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Stage')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Expected Revenue')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Priority')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">{t('Status')}</th>
                  <th className="px-3 py-2 border-b text-right whitespace-nowrap">#</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                        placeholder={t('Lead Name')}
                        className="input-soft w-full placeholder:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-500" />
                          <input
                            type="text"
                            value={row.phone}
                            onChange={(e) => handleCellChange(idx, 'phone', e.target.value)}
                            placeholder={t('Phone')}
                            className="input-soft w-full placeholder:text-gray-400"
                          />
                          <FaWhatsapp className="text-green-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-500" />
                          <input
                            type="email"
                            value={row.email}
                            onChange={(e) => handleCellChange(idx, 'email', e.target.value)}
                            placeholder={t('Email')}
                            className="input-soft w-full placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <select
                        value={row.source}
                        onChange={(e) => handleCellChange(idx, 'source', e.target.value)}
                        className="select-soft w-full"
                      >
                        <option value="website">{t('Website')}</option>
                        <option value="social-media">{t('Social Media')}</option>
                        <option value="referral">{t('Referral')}</option>
                        <option value="email-campaign">{t('Email Campaign')}</option>
                        <option value="direct">{t('Direct')}</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <input
                        type="text"
                        value={row.company}
                        onChange={(e) => handleCellChange(idx, 'company', e.target.value)}
                        placeholder={t('Project')}
                        className="input-soft w-full placeholder:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <input
                        type="text"
                        value={row.assignedTo}
                        onChange={(e) => handleCellChange(idx, 'assignedTo', e.target.value)}
                        placeholder={t('Sales')}
                        className="input-soft w-full placeholder:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-2 border-t align-top">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleCellChange(idx, 'notes', e.target.value)}
                        placeholder={t('Last Comment')}
                        className="input-soft w-full placeholder:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <select
                        value={row.status}
                        onChange={(e) => handleCellChange(idx, 'status', e.target.value)}
                        className="select-soft w-full"
                      >
                        {stageOptions.map((opt) => (
                          <option key={opt} value={opt}>{t(opt)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.estimatedValue}
                        onChange={(e) => handleCellChange(idx, 'estimatedValue', e.target.value)}
                        placeholder={t('Expected Revenue')}
                        className="input-soft w-full placeholder:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <select
                        value={row.priority}
                        onChange={(e) => handleCellChange(idx, 'priority', e.target.value)}
                        className="select-soft w-full"
                      >
                        <option value="low">{t('Low')}</option>
                        <option value="medium">{t('Medium')}</option>
                        <option value="high">{t('High')}</option>
                        <option value="urgent">{t('Urgent')}</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 border-t align-top whitespace-nowrap">
                      <select
                        value={row.status}
                        disabled
                        className="select-soft w-full bg-gray-100 text-gray-700"
                      >
                        {stageOptions.map((opt) => (
                          <option key={opt} value={opt}>{t(opt)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 border-t text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title={t('Delete Row')}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 !bg-green-600 !hover:bg-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('Add Row')}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('Save Leads')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;