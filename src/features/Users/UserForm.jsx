import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@shared/layouts/Layout';
import SearchableSelect from '@shared/components/SearchableSelect';
import { DEPARTMENTS } from '../../data/orgStructure'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

const roles = [
  'Sales Admin',
  'Operation Manager',
  'Branch Manager',
  'Director',
  'Sales Manager',
  'Team Leader',
  'Sales Person',
  'Marketing Manager',
  'Marketing Moderator',
  'Customer Manager',
  'Customer Team Leader',
  'Customer Agent',
  'Support Manager',
  'Support Team Leader',
  'Support Agent',
  'Custom',
];
const statuses = ['Active', 'Inactive', 'Suspended'];
// teams pulled dynamically based on selected department via orgStructure

const PERMISSIONS = {
  Leads: ['addLead','importLeads','addInputs','showCreator','editInfo','editPhone'],
  Inventory: ['addProducts','addItems','addSuppliers','addWarehouse','showTransaction','addProject','addUnits'],
  Marketing: ['showCampaigns', 'addLandingPages', 'integrations', 'exportReports', 'showReports'],
  Customers: ['convertFromLead', 'addCustomer', 'editInfo', 'deleteCustomer', 'showModule'],
  Support: ['showModule','addTickets','sla','editInfo','exportReports','convertFromCustomer','convertFromLead','reports','deleteTickets'],
  Control: ['addRegions','addArea','addStage','addSource','userManagement','multiAction','salesComment','allowActionOnTeam','assignLeads','importLeads','exportLeads','showReports','addDepartment','editConfigurationSettings'],
};
const PERM_LABELS_AR = {
  groups: {
    Leads: 'الليدز',
    Inventory: 'المخزون',
    Marketing: 'التسويق',
    Customers: 'العملاء',
    Support: 'الدعم',
    Control: 'التحكم',
  },
  actions: {
    view: 'عرض',
    create: 'إنشاء',
    assign: 'تعيين',
    addLead: 'إضافة ليد',
    addInputs: 'إضافة إدخالات',
    showCreator: 'عرض المنشئ',
    editPhone: 'تعديل الهاتف',
    showCampaigns: 'عرض الحملات',
    addLandingPages: 'إضافة صفحات هبوط',
    integrations: 'التكاملات',
    exportReports: 'تصدير التقارير',
    showReports: 'عرض التقارير',
    convertFromLead: 'تحويل من ليد',
    addCustomer: 'إضافة عميل',
    editInfo: 'تعديل البيانات',
    deleteCustomer: 'حذف العميل',
    showModule: 'عرض الموديول',
    addTickets: 'إضافة تذاكر',
    sla: 'اتفاقية مستوى الخدمة',
    convertFromCustomer: 'تحويل من عميل',
    reports: 'التقارير',
    deleteTickets: 'حذف التذاكر',
    addRegions: 'إضافة مناطق',
    addArea: 'إضافة منطقة',
    addStage: 'إضافة مرحلة',
    addSource: 'إضافة مصدر',
    userManagement: 'إدارة المستخدمين',
    multiAction: 'أكشنات متعددة',
    salesComment: 'تعليق مبيعات',
    allowActionOnTeam: 'السماح بالأكشن على الفريق',
    assignLeads: 'تعيين ليدز',
    importLeads: 'استيراد ليدز',
    exportLeads: 'تصدير ليدز',
    addDepartment: 'إضافة قسم',
    editConfigurationSettings: 'تعديل إعدادات الكونفيجوريشن',
    addProducts: 'إضافة منتجات',
    addItems: 'إضافة عناصر',
    addSuppliers: 'إضافة موردين',
    addWarehouse: 'إضافة مخزن',
    showTransaction: 'عرض الحركات',
    addProject: 'إضافة مشروع',
    addUnits: 'إضافة وحدات',
  }
}

export default function UserManagementUserCreate() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    birthDate: '',
    avatar: '',
    sendInvite: true,
    role: '',
    status: 'Active',
    department: '',
    branch: '',
    region: '',
    area: '',
    notifEmail: true,
    notifSms: false,
  });
  const [customPerms, setCustomPerms] = useState({});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'account' | 'notifications'

  const isCustomRole = useMemo(() => form.role === 'Custom', [form.role]);
  const showModulePerms = useMemo(() => isCustomRole || form.role === 'Sales Admin', [isCustomRole, form.role])
  const showGeoFields = useMemo(() => ['Sales Admin','Operation Manager','Branch Manager','Director'].includes(form.role), [form.role])

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
        Support: ['showModule','addTickets','sla','reports','exportReports','deleteTickets'],
        Control: ['showReports']
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

  const validate = () => {
    const e = {};
    if (!(form.fullName?.trim() || (form.firstName?.trim() && form.lastName?.trim()))) e.fullName = 'Full Name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (!form.username?.trim()) e.username = 'Username is required';
    if (!form.role?.trim()) e.role = 'Role is required';
    if ((form.password?.length || 0) < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { 
      ...form, 
      fullName: form.fullName?.trim() || `${form.firstName || ''} ${form.lastName || ''}`.trim(),
      permissions: customPerms 
    };
    console.log('Create User payload', payload);
    alert('User created (mock). Returning to Users list.');
    navigate('/user-management/users');
  };

  return (
    <Layout title="User Management — Add New User">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">Add New User</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="glass-panel rounded-xl p-2 mb-2">
            <div className="flex items-center gap-2">
              <button type="button" className={`btn btn-ghost ${activeTab==='info' ? 'btn-active' : ''}`} onClick={()=>setActiveTab('info')}>{isArabic ? 'المعلومات' : 'Info'}</button>
              <button type="button" className={`btn btn-ghost ${activeTab==='account' ? 'btn-active' : ''}`} onClick={()=>setActiveTab('account')}>{isArabic ? 'إعدادات الحساب' : 'Account Setting'}</button>
              <button type="button" className={`btn btn-ghost ${activeTab==='notifications' ? 'btn-active' : ''}`} onClick={()=>setActiveTab('notifications')}>{isArabic ? 'الإشعارات' : 'Notifications'}</button>
            </div>
          </div>

          {activeTab==='info' && (
          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">1. Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="label"><span className="label-text">Full Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                  {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">First Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="label"><span className="label-text">Last Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                </div>
                <div>
                  <label className="label"><span className="label-text">Email</span></label>
                  <input type="email" className="input input-bordered w-full bg-transparent" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Phone (Optional)</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label"><span className="label-text">Username</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.username} onChange={(e) => updateField('username', e.target.value)} />
                  {errors.username && <p className="text-error text-sm mt-1">{errors.username}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Birth Date (Optional)</span></label>
                  <div className="flex items-center gap-2">
                    <input type="date" className="input input-bordered w-full bg-transparent" value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} />
                    <button type="button" className="btn btn-ghost btn-square" onClick={()=>{}} aria-label="Calendar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label"><span className="label-text">Profile Photo (Optional)</span></label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-base-200 overflow-hidden">
                      {form.avatar ? <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" /> : null}
                    </div>
                    <label className="btn btn-ghost cursor-pointer">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => updateField('avatar', reader.result);
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label"><span className="label-text">Password</span></label>
                  <input type="password" className="input input-bordered w-full bg-transparent" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
                  {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab==='account' && (
          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">2. Account Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="label"><span className="label-text">Role *</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={roles}
                    value={form.role}
                    onChange={(val) => updateField('role', val)}
                    
                  />
                  {errors.role && <p className="text-error text-sm mt-1">{errors.role}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Status *</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={statuses}
                    value={form.status}
                    onChange={(val) => updateField('status', val)}
                    
                  />
                </div>
                <div>
                  <label className="label"><span className="label-text">Department (Optional)</span></label>
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
                    <label className="label"><span className="label-text">{isArabic ? 'الفرع (اختياري)' : 'Branch (Optional)'}</span></label>
                    <input className="input input-bordered w-full bg-transparent" value={form.branch} onChange={(e)=>updateField('branch', e.target.value)} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text">{isArabic ? 'المنطقة (اختياري)' : 'Region (Optional)'}</span></label>
                    <input className="input input-bordered w-full bg-transparent" value={form.region} onChange={(e)=>updateField('region', e.target.value)} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text">{isArabic ? 'المربع/الحقل (اختياري)' : 'Area (Optional)'}</span></label>
                    <input className="input input-bordered w-full bg-transparent" value={form.area} onChange={(e)=>updateField('area', e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {activeTab==='account' && (
            <div className="glass-panel rounded-xl p-4">
              <div>
                <h2 className="card-title">3. Permissions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {Object.entries(PERMISSIONS).map(([group, perms]) => (
                    <div key={group} className="glass-panel rounded-lg p-3">
                      <h3 className="font-medium mb-2">{isArabic ? (PERM_LABELS_AR.groups[group] || group) : group}</h3>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => {
                          const checked = (customPerms[group] || []).includes(p);
                          return (
                            <label key={p} className="cursor-pointer flex items-center gap-2">
                              <input type="checkbox" className="checkbox" checked={checked} onChange={() => togglePerm(group, p)} />
                              <span>{isArabic ? (PERM_LABELS_AR.actions[p] || p) : p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab==='notifications' && (
            <div className="glass-panel rounded-xl p-4">
              <div>
                <h2 className="card-title">3. Notifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Email Notifications</span>
                      <input type="checkbox" className="toggle" checked={form.notifEmail} onChange={(e)=>updateField('notifEmail', e.target.checked)} />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">SMS Notifications</span>
                      <input type="checkbox" className="toggle" checked={form.notifSms} onChange={(e)=>updateField('notifSms', e.target.checked)} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => navigate('/user-management/users')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
