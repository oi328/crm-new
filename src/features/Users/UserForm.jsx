import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@shared/context/ThemeProvider'
import SearchableSelect from '@shared/components/SearchableSelect';
import { DEPARTMENTS } from '../../data/orgStructure'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Upload, User, X, Eye, EyeOff, Check, AlertCircle, Loader2, Info, Settings, Bell, ChevronDown, ChevronUp, Pencil, Lock } from 'lucide-react';
import { 
  ROLES, 
  STATUSES, 
  PERMISSIONS, 
  REPORT_MODULES, 
  MOCK_MANAGERS, 
  PERM_LABELS_AR, 
  ROLE_HIERARCHY 
} from './constants';

const formatPermissionLabel = (label) => {
  if (!label) return '';
  // Handle camelCase: add space before capital letters
  const withSpaces = label.replace(/([A-Z])/g, ' $1').trim();
  // Capitalize first letter
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export default function UserManagementUserCreate({ onClose, onSuccess, user }) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate();
  const isEdit = !!user;

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    firstName: user?.fullName ? user.fullName.split(' ')[0] : '',
    lastName: user?.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: user?.phone || '',
    username: user?.username || '',
    password: '',
    birthDate: user?.birthDate || '',
    avatar: user?.avatarUrl || '',
    sendInvite: !isEdit,
    role: user?.role || '',
    directManager: user?.directManager || '',
    status: user?.status || 'Active',
    department: user?.department || '',
    branch: user?.branch || '',
    region: user?.region || '',
    area: user?.area || '',
    notifEmail: user?.notifEmail ?? true,
    notifSms: user?.notifSms ?? false,
  });
  const [customPerms, setCustomPerms] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'account' | 'notifications'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialForm, setInitialForm] = useState({ ...form });
  const [expandedGroups, setExpandedGroups] = useState(Object.keys(PERMISSIONS).reduce((acc, key) => ({...acc, [key]: true}), {}));

  const isCustomRole = useMemo(() => form.role === 'Custom', [form.role]);
  const showModulePerms = useMemo(() => isCustomRole || form.role === 'Sales Admin', [isCustomRole, form.role])
  const showGeoFields = useMemo(() => ['Sales Admin','Operation Manager','Branch Manager','Director'].includes(form.role), [form.role])

  const passwordStrength = useMemo(() => {
    const pwd = form.password || '';
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*]/.test(pwd)) score += 1;
    return score; // 0-3
  }, [form.password]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm) || Object.keys(customPerms).length > 0;
  }, [form, initialForm, customPerms]);

  useEffect(() => {
    if (form.role === 'Sales Admin') {
      setCustomPerms({
        Leads: ['addLead','importLeads'],
        Inventory: [],
        Marketing: ['showCampaigns', 'addLandingPages', 'exportReports'],
        Customers: ['convertFromLead', 'addCustomer', 'showModule'],
        Support: ['showModule'],
        Control: ['addRegions','addArea','addSource','userManagement','allowActionOnTeam','assignLeads','showReports','addDepartment']
      })
    } else if (form.role === 'Operation Manager') {
      setCustomPerms({
        Leads: ['addLead','importLeads','editInfo','editPhone'],
        Inventory: ['addProducts','addItems','addSuppliers','addWarehouse','showTransaction'],
        Marketing: [],
        Customers: ['editInfo','showModule'],
        Support: ['showModule','addTickets','sla','reports'],
        Control: ['allowActionOnTeam','showReports','addDepartment']
      })
    } else if (form.role === 'Branch Manager') {
      setCustomPerms({
        Leads: ['addLead','importLeads','editInfo'],
        Inventory: ['addProducts','addItems','addWarehouse','showTransaction'],
        Customers: ['addCustomer','editInfo','showModule'],
        Support: ['showModule'],
        Control: ['allowActionOnTeam','assignLeads','showReports']
      })
    } else if (form.role === 'Director') {
      setCustomPerms({
        Leads: ['addLead','importLeads','editInfo'],
        Inventory: [],
        Marketing: ['showCampaigns','addLandingPages','integrations','exportReports','showReports'],
        Customers: ['convertFromLead','addCustomer','editInfo','showModule'],
        Support: ['showModule'],
        Control: ['userManagement','assignLeads','exportLeads','showReports','multiAction','salesComment']
      })
    } else if (form.role === 'Sales Manager') {
      setCustomPerms({
        Leads: ['addLead','importLeads','editInfo'],
        Customers: ['convertFromLead','addCustomer','editInfo','showModule'],
        Control: ['assignLeads','showReports']
      })
    } else if (form.role === 'Team Leader') {
      setCustomPerms({
        Leads: ['addLead','importLeads'],
        Customers: ['editInfo','showModule'],
        Control: ['allowActionOnTeam','assignLeads']
      })
    } else if (form.role === 'Sales Person') {
      setCustomPerms({
        Leads: ['addLead','importLeads'],
        Customers: ['showModule']
      })
    } else if (form.role === 'Marketing Manager') {
      setCustomPerms({
        Marketing: ['showCampaigns','addLandingPages','integrations','exportReports','showReports']
      })
    } else if (form.role === 'Marketing Moderator') {
      setCustomPerms({
        Marketing: ['showCampaigns','showReports']
      })
    } else if (form.role === 'Customer Manager') {
      setCustomPerms({
        Customers: ['convertFromLead','addCustomer','editInfo','deleteCustomer','showModule'],
        Control: ['showReports']
      })
    } else if (form.role === 'Customer Team Leader') {
      setCustomPerms({
        Customers: ['editInfo','showModule']
      })
    } else if (form.role === 'Customer Agent') {
      setCustomPerms({
        Customers: ['showModule']
      })
    } else if (form.role === 'Support Manager') {
      setCustomPerms({
        Support: ['showModule','addTickets','sla','reports','exportReports','deleteTickets']
      })
    } else if (form.role === 'Support Team Leader') {
      setCustomPerms({
        Support: ['showModule','addTickets','sla','reports']
      })
    } else if (form.role === 'Support Agent') {
      setCustomPerms({
        Support: ['showModule','addTickets']
      })
    } else if (form.role === 'Custom') {
      setCustomPerms({})
    } else {
      setCustomPerms({})
    }
  }, [form.role])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePerm = (group, perm) => {
    setCustomPerms((prev) => {
      const groupSet = new Set(prev[group] || []);
      if (groupSet.has(perm)) groupSet.delete(perm);
      else groupSet.add(perm);
      return { ...prev, [group]: Array.from(groupSet) };
    });
  };

  const toggleAllPerms = (group, perms) => {
    setCustomPerms((prev) => {
      const currentPerms = prev[group] || [];
      const allSelected = perms.every(p => currentPerms.includes(p));
      
      return {
        ...prev,
        [group]: allSelected ? [] : [...perms]
      };
    });
  };

  const toggleGroupExpand = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const validate = () => {
    const e = {};
    if (!(form.fullName?.trim() || (form.firstName?.trim() && form.lastName?.trim()))) e.fullName = 'Full Name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (!form.username?.trim()) e.username = 'Username is required';
    if (!form.role?.trim()) e.role = 'Role is required';
    if (!isEdit && (form.password?.length || 0) < 8) e.password = 'Password must be at least 8 characters';
    if (isEdit && form.password && form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
       const firstErrorKey = Object.keys(errors)[0];
       const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
       if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
       return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Create new user object
      const newUser = {
        id: isEdit ? user.id : `u-${Date.now()}`,
        avatarUrl: form.avatar || '',
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        username: form.username,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
        team: 'Sales', // Default team as it's not in the form
        department: form.department || 'Sales',
        lastLogin: isEdit ? user.lastLogin : '-',
        createdAt: isEdit ? user.createdAt : new Date().toISOString().split('T')[0],
        devices: isEdit ? user.devices : ['Desktop'],
      };

      if (onSuccess) {
        onSuccess(newUser);
      }

      // Dispatch toast
      const evt = new CustomEvent('app:toast', { 
        detail: { 
            type: 'success', 
            message: isEdit 
                ? (isArabic ? 'تم تحديث بيانات المستخدم بنجاح' : 'User updated successfully') 
                : (isArabic ? 'تم إضافة المستخدم بنجاح' : 'User created successfully') 
        } 
      });
      window.dispatchEvent(evt);
      if (onClose) onClose();
      else navigate('/user-management/users');
    }, 1500);
  };

  const inputStyle = "input input-bordered w-full bg-[rgba(255,255,255,0.06)] border-base-content/10 focus:border-primary focus:bg-[rgba(255,255,255,0.1)] transition-all placeholder:text-base-content/30";

  return (
    <div className="card bg-base-100 shadow-xl w-full p-4 md:p-6 space-y-6 pb-5 h-full overflow-y-auto custom-scrollbar">
      
      {/* Header & Actions */}
      <div className="flex md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-content/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit 
                ? (isArabic ? 'تعديل بيانات المستخدم' : 'Edit User') 
                : (isArabic ? 'إضافة مستخدم جديد' : 'Add New User')
              }
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              {isEdit
                ? (isArabic ? 'تعديل تفاصيل المستخدم والصلاحيات' : 'Edit user details and permissions')
                : (isArabic ? 'أدخل تفاصيل المستخدم والبيانات الأساسية' : 'Enter user details and basic information')
              }
            </p>
          </div>
        </div>
 
      </div>

        <form onSubmit={onSubmit} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2 mb-6">
          <div className="inline-flex p-1 bg-[rgba(255,255,255,0.04)] rounded-xl border border-white/5 min-w-full md:min-w-0">
            <button 
              type="button" 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${activeTab==='info' ? 'bg-[rgba(59,130,246,0.25)] text-theme-text font-semibold shadow-sm' : 'text-theme-text font-normal hover:bg-[rgba(255,255,255,0.06)]'}`} 
              onClick={()=>setActiveTab('info')}
            >
              <Info size={18} />
              <span>{isArabic ? 'المعلومات' : 'Info'}</span>
            </button>
            <button 
              type="button" 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${activeTab==='account' ? 'bg-[rgba(59,130,246,0.25)] text-theme-text font-semibold shadow-sm' : 'text-theme-text font-normal hover:bg-[rgba(255,255,255,0.06)]'}`} 
              onClick={()=>setActiveTab('account')}
            >
              <Settings size={18} />
              <span>{isArabic ? 'إعدادات الحساب' : 'Account Setting'}</span>
            </button>
            <button 
              type="button" 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${activeTab==='notifications' ? 'bg-[rgba(59,130,246,0.25)] text-theme-text font-semibold shadow-sm' : 'text-theme-text font-normal hover:bg-[rgba(255,255,255,0.06)]'}`} 
              onClick={()=>setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>{isArabic ? 'الإشعارات' : 'Notifications'}</span>
            </button>
          </div>
        </div>

          {activeTab==='info' && (
          <div className="space-y-6">
            
            {/* Section: Basic Info */}
            <div className="glass-panel rounded-xl p-6 border border-base-content/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="card-title text-lg">{isArabic ? 'المعلومات الأساسية' : 'Basic Info'}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                
                {/* Row 1: Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">First Name <span className="text-[#FF6B6B]">*</span></span></label>
                    <input className={inputStyle} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="e.g. John" />
                  </div>
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Last Name <span className="text-[#FF6B6B]">*</span></span></label>
                    <input className={inputStyle} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="e.g. Doe" />
                  </div>
                </div>

                {/* Row 2: Username & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Username <span className="text-[#FF6B6B]">*</span></span></label>
                    <input 
                        className={inputStyle} 
                        value={form.username} 
                        onChange={(e) => updateField('username', e.target.value)} 
                        placeholder="johndoe" 
                    />
                    {errors.username && <div className="flex items-center gap-1 mt-1.5 text-[#FF6B6B] text-xs"><AlertCircle size={12}/> {errors.username}</div>}
                  </div>
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Email <span className="text-[#FF6B6B]">*</span></span></label>
                    <input 
                        type="email" 
                        className={inputStyle} 
                        value={form.email} 
                        onChange={(e) => updateField('email', e.target.value)} 
                        placeholder="john@example.com" 
                    />
                    {errors.email && <div className="flex items-center gap-1 mt-1.5 text-[#FF6B6B] text-xs"><AlertCircle size={12}/> {errors.email}</div>}
                  </div>
                </div>

                {/* Row 3: Phone & Birth Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Phone (Optional)</span></label>
                    <input className={inputStyle} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 234 567 890" />
                  </div>
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Birth Date (Optional)</span></label>
                    <div className="w-full relative">
                      <input 
                        type="date"
                        className={`${inputStyle} dark:[color-scheme:dark]`}
                        value={form.birthDate}
                        onChange={(e) => updateField('birthDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Section: Security */}
            <div className="glass-panel rounded-xl p-6 border border-base-content/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                <div className="w-1 h-6 bg-secondary rounded-full"></div>
                <h2 className="card-title text-lg">{isArabic ? 'الأمان' : 'Security'}</h2>
              </div>
              
              <div className="max-w-md">
                <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Password {!isEdit && <span className="text-[#FF6B6B]">*</span>}</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className={`${inputStyle} pr-10`} 
                    value={form.password} 
                    onChange={(e) => updateField('password', e.target.value)} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {form.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1 h-1 w-full bg-base-300 rounded-full overflow-hidden">
                      <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength > 0 ? (passwordStrength === 1 ? 'bg-error' : passwordStrength === 2 ? 'bg-warning' : 'bg-success') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength > 1 ? (passwordStrength === 2 ? 'bg-warning' : 'bg-success') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength > 2 ? 'bg-success' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex justify-between text-xs px-0.5 mt-1">
                      <span className={`transition-colors duration-300 ${passwordStrength === 1 ? 'text-error font-bold' : 'text-[#6b7280]'}`}>{isArabic ? 'ضعيف' : 'Weak'}</span>
                      <span className={`transition-colors duration-300 ${passwordStrength === 2 ? 'text-warning font-bold' : 'text-[#6b7280]'}`}>{isArabic ? 'متوسط' : 'Medium'}</span>
                      <span className={`transition-colors duration-300 ${passwordStrength >= 3 ? 'text-success font-bold' : 'text-[#6b7280]'}`}>{isArabic ? 'قوي' : 'Strong'}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-base-content/50 flex items-start gap-1.5 bg-base-200/50 p-2 rounded-lg">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>Minimum 8 characters, at least one number and one symbol recommended.</span>
                </div>

                {errors.password && <div className="flex items-center gap-1 mt-1.5 text-[#FF6B6B] text-xs"><AlertCircle size={12}/> {errors.password}</div>}
              </div>
            </div>

            {/* Section: Profile Photo */}
            <div className="glass-panel rounded-xl p-6 border border-base-content/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                <div className="w-1 h-6 bg-accent rounded-full"></div>
                <h2 className="card-title text-lg">{isArabic ? 'الصورة الشخصية' : 'Profile Photo'}</h2>
              </div>

              <div className="flex items-start gap-6">
                 <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 ${form.avatar ? 'border-primary' : 'border-dashed border-base-content/20'} flex items-center justify-center bg-base-200/50 shrink-0 relative group`}>
                    {form.avatar ? (
                      <>
                        <img src={form.avatar} alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <button type="button" className="btn btn-circle btn-xs btn-error" onClick={() => updateField('avatar', '')}>
                             <X size={14} />
                           </button>
                        </div>
                      </>
                    ) : (
                      <User className="text-base-content/20" size={40} />
                    )}
                 </div>
                 
                 <div className="flex-1 max-w-sm">
                    <label className="flex flex-col gap-3 cursor-pointer group">
                       <div className="flex items-center gap-3">
                         <div className="btn btn-outline btn-sm gap-2 group-hover:btn-primary transition-all">
                           <Upload size={14} />
                           {isArabic ? 'اختر ملف' : 'Choose File'}
                         </div>
                         <span className="text-sm text-base-content/50 group-hover:text-base-content/80 transition-colors">
                           {isArabic ? 'أو اسحب وأفلت هنا' : 'or Drag & Drop here'}
                         </span>
                       </div>
                       <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              const evt = new CustomEvent('app:toast', { detail: { type: 'error', message: 'File size must be less than 2MB' } });
                              window.dispatchEvent(evt);
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => updateField('avatar', reader.result);
                            reader.readAsDataURL(file);
                          }} />
                    </label>
                    <p className="text-xs text-base-content/40 mt-3">
                      JPG, PNG, GIF • Max 2MB
                    </p>
                 </div>
              </div>
            </div>

          </div>
          )}

          {activeTab==='account' && (
          <div className="glass-panel rounded-xl p-4">
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                <div className="w-1 h-6 bg-info rounded-full"></div>
                <h2 className="card-title text-lg">2. Account Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Role <span className="text-[#FF6B6B]">*</span></span></label>
                  <SearchableSelect
                    className="w-full"
                    options={ROLES}
                    value={form.role}
                    onChange={(val) => updateField('role', val)}
                    
                  />
                  {errors.role && <div className="flex items-center gap-1 mt-1.5 text-[#FF6B6B] text-xs"><AlertCircle size={12}/> {errors.role}</div>}
                </div>
                {ROLE_HIERARCHY[form.role] && (
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">{isArabic ? 'المدير المباشر (اختياري)' : 'Direct Manager (Optional)'}</span></label>
                    <SearchableSelect
                      className="w-full"
                      options={MOCK_MANAGERS
                        .filter(m => ROLE_HIERARCHY[form.role]?.includes(m.role))
                        .map(m => ({ value: m.id, label: `${m.name} (${m.role})` }))}
                      value={form.directManager}
                      onChange={(val) => updateField('directManager', val)}
                      placeholder={isArabic ? 'اختر المدير' : 'Select Manager'}
                    />
                  </div>
                )}
                <div>
                  <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Status <span className="text-[#FF6B6B]">*</span></span></label>
                  <SearchableSelect
                    className="w-full"
                    options={STATUSES}
                    value={form.status}
                    onChange={(val) => updateField('status', val)}
                    
                  />
                </div>
                <div>
                  <label className="label pt-0"><span className="label-text font-medium text-base-content/80">Department (Optional)</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))}
                    value={form.department}
                    onChange={(dept) => {
                      setForm(prev => ({ ...prev, department: dept }))
                    }}
                  />
                </div>
              </div>
              {showGeoFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">{isArabic ? 'الفرع (اختياري)' : 'Branch (Optional)'}</span></label>
                    <input className={inputStyle} value={form.branch} onChange={(e)=>updateField('branch', e.target.value)} />
                  </div>
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">{isArabic ? 'المنطقة (اختياري)' : 'Region (Optional)'}</span></label>
                    <input className={inputStyle} value={form.region} onChange={(e)=>updateField('region', e.target.value)} />
                  </div>
                  <div>
                    <label className="label pt-0"><span className="label-text font-medium text-base-content/80">{isArabic ? 'المربع/الحقل (اختياري)' : 'Area (Optional)'}</span></label>
                    <input className={inputStyle} value={form.area} onChange={(e)=>updateField('area', e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {activeTab==='account' && (
            <div className="glass-panel rounded-xl p-4">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                  <div className="w-1 h-6 bg-warning rounded-full"></div>
                  <h2 className="card-title text-lg">3. Permissions</h2>
                </div>
                <div className="flex flex-col gap-4 mt-3">
                  {Object.entries(PERMISSIONS)
                    .filter(([group]) => {
                      if (form.role === 'Team Leader') {
                        return !['Marketing', 'Support'].includes(group);
                      }
                      if (['Marketing Manager', 'Marketing Moderator'].includes(form.role)) {
                        return !['Customers', 'Support'].includes(group);
                      }
                      if (['Customer Manager', 'Customer Team Leader', 'Customer Agent'].includes(form.role)) {
                        return ['Customers', 'Inventory'].includes(group);
                      }
                      if (form.role === 'Sales Person') {
                        return !['Marketing', 'Support', 'Control'].includes(group);
                      }
                      if (['Support Manager', 'Support Team Leader', 'Support Agent'].includes(form.role)) {
                        return ['Customers', 'Support'].includes(group);
                      }
                      return true;
                    })
                    .map(([group, perms]) => {
                    const groupPerms = customPerms[group] || [];
                    const allSelected = perms.every(p => groupPerms.includes(p));
                    const isExpanded = expandedGroups[group];

                    return (
                    <div key={group} className="glass-panel rounded-lg overflow-hidden border border-base-content/5 bg-base-200/20">
                      <div 
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-base-content/5 transition-colors select-none"
                        onClick={() => toggleGroupExpand(group)}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-base-content/50">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <h3 className="font-medium">{isArabic ? (PERM_LABELS_AR.groups[group] || group) : group}</h3>
                          <span className="text-xs bg-base-content/10 px-2 py-0.5 rounded-full text-base-content/60">
                            {groupPerms.length} / {perms.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                           <label className="cursor-pointer flex items-center gap-2 select-none hover:bg-base-content/5 px-2 py-1 rounded transition-colors text-xs text-base-content/60">
                              <input 
                                type="checkbox" 
                                className="checkbox checkbox-xs checkbox-primary" 
                                checked={allSelected} 
                                onChange={() => toggleAllPerms(group, perms)} 
                              />
                              <span>{isArabic ? 'تحديد الكل' : 'Select All'}</span>
                            </label>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-base-content/5 bg-base-200/10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                            {perms.map((p) => {
                              const checked = groupPerms.includes(p);
                              return (
                                <label key={p} className="cursor-pointer flex items-center gap-3 select-none hover:bg-base-content/5 px-3 py-2.5 rounded-lg transition-colors border border-transparent hover:border-base-content/5 bg-base-100/50">
                                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={() => togglePerm(group, p)} />
                                  <span className="text-sm">{isArabic ? (PERM_LABELS_AR.actions[p] || p) : formatPermissionLabel(p)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )})}

                  {/* Reports Section */}
                  <div className="glass-panel rounded-lg overflow-hidden border border-base-content/5 bg-base-200/20">
                    <div 
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-base-content/5 transition-colors select-none"
                        onClick={() => toggleGroupExpand('Reports')}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-base-content/50">
                            {expandedGroups['Reports'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <h3 className="font-medium">{isArabic ? 'التقارير' : 'Reports'}</h3>
                        </div>
                    </div>
                    
                    {expandedGroups['Reports'] && (
                    <div className="p-0 border-t border-base-content/5">
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead>
                            <tr className="bg-base-content/5">
                              <th className="bg-transparent border-b border-base-content/10 py-3">{isArabic ? 'التقرير' : 'Report'}</th>
                              <th className="text-center bg-transparent border-b border-base-content/10 w-32">{isArabic ? 'عرض' : 'Show'}</th>
                              <th className="text-center bg-transparent border-b border-base-content/10 w-32">{isArabic ? 'تصدير' : 'Export'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {REPORT_MODULES.map((module, idx) => (
                              <tr key={module} className={`border-b border-base-content/5 transition-colors ${idx % 2 === 0 ? 'bg-base-200/30' : 'bg-transparent'} hover:bg-base-content/5`}>
                                <td className="font-medium py-3 px-4">{isArabic ? (PERM_LABELS_AR.report_modules[module] || module) : module}</td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={(customPerms['Reports'] || []).includes(`${module}_show`)}
                                    onChange={() => togglePerm('Reports', `${module}_show`)}
                                  />
                                </td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={(customPerms['Reports'] || []).includes(`${module}_export`)}
                                    onChange={() => togglePerm('Reports', `${module}_export`)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab==='notifications' && (
            <div className="glass-panel rounded-xl p-4">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                  <div className="w-1 h-6 bg-secondary rounded-full"></div>
                  <h2 className="card-title text-lg">3. Notifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input type="checkbox" className="toggle toggle-primary" checked={form.notifEmail} onChange={(e)=>updateField('notifEmail', e.target.checked)} />
                      <span className="label-text font-medium">Email Notifications</span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input type="checkbox" className="toggle toggle-primary" checked={form.notifSms} onChange={(e)=>updateField('notifSms', e.target.checked)} />
                      <span className="label-text font-medium">SMS Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-base-content/10">
            <button type="button" className="btn btn-ghost hover:bg-base-content/10" onClick={() => onClose ? onClose() : navigate('/user-management/users')}>Cancel</button>
            <button 
              type="submit" 
              className="btn btn-primary px-8"
              disabled={loading || !hasChanges}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
  );
}
