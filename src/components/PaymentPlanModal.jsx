import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaFilePdf, FaFileCsv, FaSave, FaBuilding } from 'react-icons/fa';
import { useTheme } from '../shared/context/ThemeProvider';
import { PROJECT_PLANS } from '../data/projectPlans';

const PaymentPlanModal = ({ isOpen, onClose, onSave, lead }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isRTL = i18n.dir() === 'rtl';

  const [payment, setPayment] = useState({
    basePrice: lead?.estimatedValue || lead?.budget || '',
    downPct: '',
    installments: '',
    startDate: new Date().toISOString().slice(0, 10),
    frequency: 'monthly',
    graceMonths: '0',
    interestPct: ''
  });
  const [schedule, setSchedule] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Determine project plans
  const projectName = lead?.project || lead?.interestedProject || lead?.company; // Fallback strategy
  const availablePlans = (projectName && PROJECT_PLANS[projectName]) ? PROJECT_PLANS[projectName] : PROJECT_PLANS['default'];
  const displayProjectName = (projectName && PROJECT_PLANS[projectName]) ? projectName : (isRTL ? 'خطط عامة' : 'General Plans');

  const handlePlanSelect = (e) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    const plan = availablePlans.find(p => p.id === planId);
    if (plan) {
      setPayment(prev => ({
        ...prev,
        downPct: plan.downPct,
        installments: plan.installments,
        frequency: plan.frequency,
        graceMonths: plan.graceMonths || 0
      }));
    }
  };

  const setPayVal = (key) => (e) => setPayment(v => ({ ...v, [key]: e.target.value }));
  
  const addMonths = (dateStr, months) => {
    const d = new Date(dateStr || new Date());
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  };

  const generatePlan = () => {
    const base = Number(payment.basePrice) || 0;
    const dp = Math.max(0, Math.min(100, Number(payment.downPct) || 0));
    const n = Math.max(0, Math.floor(Number(payment.installments) || 0));
    const grace = Math.max(0, Math.floor(Number(payment.graceMonths) || 0));
    const start = payment.startDate || new Date().toISOString().slice(0, 10);
    const step = payment.frequency === 'quarterly' ? 3 : 1;
    
    const dpAmount = +(base * dp / 100).toFixed(2);
    const remain = +(base - dpAmount).toFixed(2);
    const each = n > 0 ? +(remain / n).toFixed(2) : 0;
    
    const rows = [];
    if (dpAmount > 0) rows.push({ no: 0, label: isRTL ? 'مقدم' : 'Down Payment', dueDate: start, amount: dpAmount });
    
    let curDate = addMonths(start, grace);
    for (let i = 1; i <= n; i++) {
      rows.push({ no: i, label: isRTL ? 'قسط' : 'Installment', dueDate: curDate, amount: each });
      curDate = addMonths(curDate, step);
    }
    
    const sum = rows.reduce((a, b) => a + (b.amount || 0), 0);
    const diff = +(base - sum).toFixed(2);
    if (Math.abs(diff) >= 0.01 && rows.length) {
      rows[rows.length - 1].amount = +(rows[rows.length - 1].amount + diff).toFixed(2);
    }
    setSchedule(rows);
  };

  const exportCsv = () => {
    const headers = ['No', 'Label', 'DueDate', 'Amount'];
    const csv = headers.join(',') + '\n' + schedule.map(r => [r.no, r.label, r.dueDate, r.amount].join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payment_plan.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      const head = [['No', 'Label', 'DueDate', 'Amount']];
      const body = schedule.map(r => [String(r.no), r.label, r.dueDate, String(r.amount)]);
      autoTable(doc, { head, body });
      doc.save('payment_plan.pdf');
    } catch (e) {
      console.error('PDF export failed', e);
      alert(isRTL ? 'فشل تصدير PDF' : 'PDF export failed');
    }
  };

  const handleSave = () => {
    if (onSave) onSave(schedule);
    onClose();
  };

  const total = schedule.reduce((a, b) => a + (b.amount || 0), 0);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all ${isLight ? 'bg-white text-gray-900' : 'bg-slate-900 text-white border border-slate-700'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'border-gray-100' : 'border-slate-800'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {isRTL ? 'خطة الدفع' : 'Payment Plan'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Project Plans Selector */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-900/20 border-blue-800'}`}>
            <div className="flex items-center gap-2 mb-3">
              <FaBuilding className="text-blue-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {isRTL ? `خطط ${displayProjectName}` : `${displayProjectName} Plans`}
              </h3>
            </div>
            <select 
              value={selectedPlanId} 
              onChange={handlePlanSelect}
              className={`w-full p-3 rounded-lg border outline-none transition-all ${isLight ? 'bg-white border-blue-200 focus:border-blue-500' : 'bg-slate-800 border-slate-600 focus:border-blue-500'}`}
            >
              <option value="">{isRTL ? '-- اختر خطة الدفع --' : '-- Select Payment Plan --'}</option>
              {availablePlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'السعر الإجمالي' : 'Base Price'}</label>
              <input type="number" className="input w-full" value={payment.basePrice} onChange={setPayVal('basePrice')} placeholder={isRTL ? 'EGP' : 'EGP'} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'المقدم (%)' : 'Down Payment (%)'}</label>
              <input type="number" className="input w-full" value={payment.downPct} onChange={setPayVal('downPct')} placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'عدد الأقساط' : 'Installments Count'}</label>
              <input type="number" className="input w-full" value={payment.installments} onChange={setPayVal('installments')} placeholder="12" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'تاريخ البداية' : 'Start Date'}</label>
              <input type="date" className="input w-full" value={payment.startDate} onChange={setPayVal('startDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'التكرار' : 'Frequency'}</label>
              <select className="input w-full" value={payment.frequency} onChange={setPayVal('frequency')}>
                <option value="monthly">{isRTL ? 'شهري' : 'Monthly'}</option>
                <option value="quarterly">{isRTL ? 'ربع سنوي' : 'Quarterly'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">{isRTL ? 'شهور سماح' : 'Grace Months'}</label>
              <input type="number" className="input w-full" value={payment.graceMonths} onChange={setPayVal('graceMonths')} placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary px-6" onClick={generatePlan}>
              {isRTL ? 'توليد الخطة' : 'Generate Plan'}
            </button>
          </div>

          {schedule.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`rounded-xl border p-4 mb-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-lg font-semibold">
                    {isRTL ? 'الإجمالي' : 'Total'}: <span className="text-emerald-500">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(total)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-outline gap-2" onClick={exportCsv} title="Export CSV">
                      <FaFileCsv /> CSV
                    </button>
                    <button className="btn btn-outline gap-2" onClick={exportPdf} title="Export PDF">
                      <FaFilePdf /> PDF
                    </button>
                    <button className="btn btn-primary gap-2" onClick={handleSave}>
                      <FaSave /> {isRTL ? 'حفظ الخطة' : 'Save Plan'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border overflow-hidden ${isLight ? 'border-gray-200' : 'border-slate-700'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isLight ? 'bg-gray-100' : 'bg-slate-800'}>
                      <tr>
                        <th className="text-start p-3">#</th>
                        <th className="text-start p-3">{isRTL ? 'النوع' : 'Label'}</th>
                        <th className="text-start p-3">{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                        <th className="text-start p-3">{isRTL ? 'القيمة' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {schedule.map((row, idx) => (
                        <tr key={idx} className={isLight ? 'hover:bg-gray-50' : 'hover:bg-slate-800/50'}>
                          <td className="p-3">{row.no === 0 ? '-' : row.no}</td>
                          <td className="p-3 font-medium">{row.label}</td>
                          <td className="p-3">{row.dueDate}</td>
                          <td className="p-3 font-mono">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentPlanModal;
