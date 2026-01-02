import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSave, FaBuilding } from 'react-icons/fa';
import { useTheme } from '../shared/context/ThemeProvider';
import { projectsData } from '../data/projectsData';
import { getUnitsForProject } from '../data/unitsData';

const PaymentPlanModal = ({ isOpen, onClose, onSave, lead }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isRTL = i18n.dir() === 'rtl';

  const [formData, setFormData] = useState({
    projectName: lead?.project || '',
    unitNo: '',
    totalAmount: '',
    downPayment: '',
    receiptAmount: '',
    installmentAmount: '',
    noOfMonths: '',
    extraInstallments: '',
    garageAmount: '',
    maintenanceAmount: '',
    netAmount: ''
  });

  const [projectUnits, setProjectUnits] = useState([]);

  // Update project name if lead changes
  useEffect(() => {
    if (lead?.project) {
      setFormData(prev => ({ ...prev, projectName: lead.project }));
    }
  }, [lead]);

  // Update units list when project changes
  useEffect(() => {
    if (formData.projectName) {
      const units = getUnitsForProject(formData.projectName);
      setProjectUnits(units);
    } else {
      setProjectUnits([]);
    }
  }, [formData.projectName]);

  // Update total amount when unit changes
  useEffect(() => {
    if (formData.unitNo && projectUnits.length > 0) {
      const selectedUnit = projectUnits.find(u => u.unitNo === formData.unitNo);
      if (selectedUnit) {
        setFormData(prev => ({ ...prev, totalAmount: selectedUnit.price }));
      }
    }
  }, [formData.unitNo, projectUnits]);

  // Calculate Net Amount: Total + Garage + Maintenance
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0;
    const garage = parseFloat(formData.garageAmount) || 0;
    const maintenance = parseFloat(formData.maintenanceAmount) || 0;
    const net = total + garage + maintenance;
    
    // Only update if value changed to avoid infinite loops if we were formatting
    setFormData(prev => {
        if (prev.netAmount == net) return prev;
        return { ...prev, netAmount: net };
    });
  }, [formData.totalAmount, formData.garageAmount, formData.maintenanceAmount]);

  // Calculate Installment Amount: (Net - Down - Extra) / Months
  useEffect(() => {
    const net = parseFloat(formData.netAmount) || 0;
    const down = parseFloat(formData.downPayment) || 0;
    const extra = parseFloat(formData.extraInstallments) || 0;
    const months = parseFloat(formData.noOfMonths) || 0;

    if (months > 0) {
      const installment = (net - down - extra) / months;
      // Round to 2 decimal places
      const formattedInstallment = Math.round(installment * 100) / 100;
      
      setFormData(prev => {
          if (prev.installmentAmount == formattedInstallment) return prev;
          return { ...prev, installmentAmount: formattedInstallment };
      });
    }
  }, [formData.netAmount, formData.downPayment, formData.extraInstallments, formData.noOfMonths]);


  const handleChange = (key) => (e) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = `w-full p-3 rounded-lg border outline-none transition-all ${
    isLight 
      ? 'bg-white border-gray-300 focus:border-blue-500 text-gray-900' 
      : 'bg-slate-800 border-slate-600 focus:border-blue-500 text-white'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isLight ? 'text-gray-700' : 'text-gray-300'
  }`;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all ${isLight ? 'bg-white' : 'bg-slate-900 border border-slate-700'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'border-gray-100' : 'border-slate-800'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <FaBuilding className="text-blue-500" />
            {isRTL 
              ? (lead?.paymentPlan ? 'تعديل خطة الدفع' : 'إضافة خطة دفع') 
              : (lead?.paymentPlan ? 'Edit Payment Plan' : 'Add Payment Plan')}
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
          
          {/* Project & Unit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isRTL ? 'اسم المشروع' : 'Project Name'}</label>
              <select 
                className={inputClass} 
                value={formData.projectName} 
                onChange={handleChange('projectName')}
              >
                <option value="">{isRTL ? 'اختر المشروع' : 'Select Project'}</option>
                {projectsData.map((project, idx) => (
                  <option key={idx} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{isRTL ? 'رقم الوحدة' : 'Unit No.'}</label>
              <select 
                className={inputClass} 
                value={formData.unitNo} 
                onChange={handleChange('unitNo')}
                disabled={!formData.projectName}
              >
                <option value="">{isRTL ? 'اختر الوحدة' : 'Select Unit'}</option>
                {projectUnits.map((unit, idx) => (
                  <option key={idx} value={unit.unitNo}>
                    {unit.unitNo} - {unit.type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`h-px w-full ${isLight ? 'bg-gray-100' : 'bg-slate-800'}`}></div>

          {/* Financials */}
          <div className="space-y-4">
            {/* Total Amount */}
            <div>
              <label className={labelClass}>{isRTL ? 'السعر الإجمالي' : 'Total Amount'}</label>
              <input 
                type="number" 
                className={inputClass} 
                value={formData.totalAmount} 
                onChange={handleChange('totalAmount')}
                placeholder="0.00"
              />
            </div>

            {/* Down Payment & Receipt Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{isRTL ? 'المقدم' : 'Down Payment'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.downPayment} 
                  onChange={handleChange('downPayment')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>{isRTL ? 'قيمة الإيصال' : 'Receipt Amount'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.receiptAmount} 
                  onChange={handleChange('receiptAmount')}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Installments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className={labelClass}>{isRTL ? 'قيمة القسط' : 'Installment Amount'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.installmentAmount} 
                  onChange={handleChange('installmentAmount')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>{isRTL ? 'عدد الأشهر' : 'No. of Months'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.noOfMonths} 
                  onChange={handleChange('noOfMonths')}
                  placeholder="12"
                />
              </div>
            </div>

            {/* Extra Installments */}
            <div>
              <label className={labelClass}>{isRTL ? 'أقساط إضافية' : 'Extra Installments'}</label>
              <input 
                type="number" 
                className={inputClass} 
                value={formData.extraInstallments} 
                onChange={handleChange('extraInstallments')}
                placeholder="0.00"
              />
            </div>

            {/* Garage & Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{isRTL ? 'قيمة الجراج' : 'Garage Amount'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.garageAmount} 
                  onChange={handleChange('garageAmount')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>{isRTL ? 'قيمة الصيانة' : 'Maintenance Amount'}</label>
                <input 
                  type="number" 
                  className={inputClass} 
                  value={formData.maintenanceAmount} 
                  onChange={handleChange('maintenanceAmount')}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Net Amount */}
            <div>
              <label className={labelClass}>{isRTL ? 'الصافي' : 'Net Amount'}</label>
              <input 
                type="number" 
                className={inputClass} 
                value={formData.netAmount} 
                onChange={handleChange('netAmount')}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 gap-3">
            <button 
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSave />
              {isRTL ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentPlanModal;
