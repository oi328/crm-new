import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/context/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { useStages } from '../hooks/useStages';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const COUNTRY_CODES = [
  // الدول العربية في المقدمة
  { iso2: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { iso2: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { iso2: 'AE', nameAr: 'الإمارات', nameEn: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { iso2: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { iso2: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { iso2: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { iso2: 'OM', nameAr: 'عُمان', nameEn: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { iso2: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { iso2: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { iso2: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dialCode: '+963', flag: '🇸🇾' },
  { iso2: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
  { iso2: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dialCode: '+970', flag: '🇵🇸' },
  { iso2: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { iso2: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dialCode: '+213', flag: '🇩🇿' },
  { iso2: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
  { iso2: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dialCode: '+218', flag: '🇱🇾' },
  { iso2: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dialCode: '+249', flag: '🇸🇩' },
  { iso2: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', dialCode: '+252', flag: '🇸🇴' },
  { iso2: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', dialCode: '+253', flag: '🇩🇯' },
  { iso2: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', dialCode: '+269', flag: '🇰🇲' },
  { iso2: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', dialCode: '+222', flag: '🇲🇷' },
  { iso2: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dialCode: '+967', flag: '🇾🇪' },
  
  // باقي الدول
  { iso2: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { iso2: 'CA', nameAr: 'كندا', nameEn: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { iso2: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { iso2: 'FR', nameAr: 'فرنسا', nameEn: 'France', dialCode: '+33', flag: '🇫🇷' },
  { iso2: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { iso2: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { iso2: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { iso2: 'JP', nameAr: 'اليابان', nameEn: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { iso2: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { iso2: 'CN', nameAr: 'الصين', nameEn: 'China', dialCode: '+86', flag: '🇨🇳' },
  { iso2: 'IN', nameAr: 'الهند', nameEn: 'India', dialCode: '+91', flag: '🇮🇳' },
  { iso2: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { iso2: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { iso2: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { iso2: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { iso2: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { iso2: 'SG', nameAr: 'سنغافورة', nameEn: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { iso2: 'TH', nameAr: 'تايلاند', nameEn: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { iso2: 'VN', nameAr: 'فيتنام', nameEn: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { iso2: 'IR', nameAr: 'إيران', nameEn: 'Iran', dialCode: '+98', flag: '🇮🇷' },
  { iso2: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { iso2: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { iso2: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine', dialCode: '+380', flag: '🇺🇦' },
  { iso2: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { iso2: 'NZ', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { iso2: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { iso2: 'MX', nameAr: 'المكسيك', nameEn: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { iso2: 'AR', nameAr: 'الأرجنتين', nameEn: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { iso2: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { iso2: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { iso2: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { iso2: 'ET', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { iso2: 'IL', nameAr: 'إسرائيل', nameEn: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { iso2: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { iso2: 'NO', nameAr: 'النرويج', nameEn: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { iso2: 'DK', nameAr: 'الدنمارك', nameEn: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { iso2: 'FI', nameAr: 'فنلندا', nameEn: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { iso2: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { iso2: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { iso2: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { iso2: 'AT', nameAr: 'النمسا', nameEn: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { iso2: 'PT', nameAr: 'البرتغال', nameEn: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { iso2: 'GR', nameAr: 'اليونان', nameEn: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { iso2: 'PL', nameAr: 'بولندا', nameEn: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { iso2: 'CZ', nameAr: 'التشيك', nameEn: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { iso2: 'HU', nameAr: 'المجر', nameEn: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
];

export const AddNewLead = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [project, setProject] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('');
  const [tags, setTags] = useState('');
  const [expectedRevenue, setExpectedRevenue] = useState('');
  const [mobileNumbers, setMobileNumbers] = useState([{ code: '+20', number: '' }]);
  
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const { stages, statuses } = useStages();
  const [assignedTo, setAssignedTo] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('medium');
  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);

  const [extraLeads, setExtraLeads] = useState([]);

  const addExtraLead = () => {
    setExtraLeads((prev) => [
      ...prev,
      {
        name: '',
        source: '',
        project: '',
        company: '',
        type: '',
        tags: '',
        expectedRevenue: '',
        mobileNumbers: [{ code: mobileNumbers[0]?.code || '+20', number: '' }],
        email: '',
        assignedTo: '',
        stage: '',
        status: '',
        priority: 'medium',
        note: '',
        collapsed: false,
      },
    ]);
  };

  const updateExtraLeadField = (idx, field, value) => {
    setExtraLeads((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  // إضافة/تحديث أرقام الموبايل لليدز الإضافية
  const addExtraLeadNumber = (idx) => {
    setExtraLeads((prev) =>
      prev.map((l, i) =>
        i === idx
          ? {
              ...l,
              mobileNumbers: [
                ...(l.mobileNumbers || [{ code: '+20', number: '' }]),
                { code: l.mobileNumbers?.[0]?.code || '+20', number: '' },
              ],
}
          : l
      )
    );
  };

  const updateExtraLeadNumber = (idx, nIdx, field, value) => {
    setExtraLeads((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        const arr = l.mobileNumbers || [{ code: '+20', number: '' }];
        const updated = arr.map((n, j) => (j === nIdx ? { ...n, [field]: value } : n));
        return { ...l, mobileNumbers: updated };
      })
    );
  };

  const toggleExtraLeadCollapse = (idx) => {
    setExtraLeads((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, collapsed: !l.collapsed } : l))
    );
  };

  const deleteExtraLead = (idx) => {
    setExtraLeads((prev) => prev.filter((_, i) => i !== idx));
  };

  const addMobileNumber = () => {
    setMobileNumbers(prev => [...prev, { code: prev[0]?.code || '+20', number: '' }]);
  };

  const updateMobileNumber = (idx, field, value) => {
    setMobileNumbers(prev => prev.map((n, i) => (i === idx ? { ...n, [field]: value } : n)));
  };

  const formTone = isLight ? 'bg-white border-gray-200' : 'bg-blue-900/40 border-blue-800';
  const labelTone = isLight ? 'text-gray-700' : 'text-gray-200';
  const inputTone = isLight
    ? 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-gray-900/50 border-gray-700 text-white focus:ring-blue-400 focus:border-blue-400';

  const isPrimaryValid =
    name.trim().length > 0 &&
    source.trim().length > 0 &&
    project.trim().length > 0 &&
    String(expectedRevenue).trim().length > 0 &&
    mobileNumbers.length > 0 &&
    mobileNumbers.every((n) => n.number.trim().length > 0) &&
    email.trim().length > 0 &&
    assignedTo.trim().length > 0 &&
    stage !== '' &&
    status !== '';

  const isLeadValid = (l) =>
    (l.name || '').trim().length > 0 &&
    (l.source || '').trim().length > 0 &&
    (l.project || '').trim().length > 0 &&
    String(l.expectedRevenue || '').trim().length > 0 &&
    Array.isArray(l.mobileNumbers) &&
    l.mobileNumbers.length > 0 &&
    l.mobileNumbers.every((n) => (n.number || '').trim().length > 0) &&
    (l.email || '').trim().length > 0 &&
    (l.assignedTo || '').trim().length > 0 &&
    (l.stage || '') !== '' &&
    (l.status || '') !== '';

  const isFormValid = isPrimaryValid && extraLeads.every(isLeadValid);

  // مكوّن اختيار كود الدولة مع العلم فقط
  const CountryCodeSelect = ({ value, onChange }) => {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-20 rounded-md border px-2 py-2 ${inputTone}`}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.iso2 + c.dialCode} value={c.dialCode}>
            {c.flag} {c.dialCode}
          </option>
        ))}
      </select>
    );
  };

  // حفظ البيانات إلى localStorage وإطلاق حدث التحديث
  const handleSave = () => {
    const nameTrimmed = name.trim();
    const missing = [];

    if (!nameTrimmed) missing.push(i18n.language === 'ar' ? 'الاسم' : t('Name'));
    if (!source.trim()) missing.push(i18n.language === 'ar' ? 'المصدر' : t('Source'));
    if (!project.trim()) missing.push(i18n.language === 'ar' ? 'المشروع' : t('Project'));
    if (!expectedRevenue.trim()) missing.push(i18n.language === 'ar' ? 'الإيراد المتوقع' : t('Expected Revenue'));
    if (!mobileNumbers.length || !mobileNumbers.every((n) => n.number.trim())) missing.push(i18n.language === 'ar' ? 'رقم الموبايل' : t('Mobile'));
    if (!email.trim()) missing.push(i18n.language === 'ar' ? 'البريد الإلكتروني' : t('Email'));
    if (!assignedTo.trim()) missing.push(i18n.language === 'ar' ? 'المسؤول' : t('Sales'));
    if (!stage) missing.push(i18n.language === 'ar' ? 'المرحلة' : t('Stage'));
    if (!status) missing.push(i18n.language === 'ar' ? 'الحالة' : t('Status'));

    if (missing.length > 0) {
      alert(
        i18n.language === 'ar'
          ? `من فضلك املأ كل الحقول (ما عدا النوتس):\n- ${missing.join('\n- ')}`
          : `Please fill all fields (except notes):\n- ${missing.join('\n- ')}`
      );
      return;
    }

    // التحقق من الليدز الإضافية
    const invalidExtrasIndices = extraLeads
      .map((l, i) => (!isLeadValid(l) ? i + 1 : null))
      .filter(Boolean);
    if (invalidExtrasIndices.length) {
      alert(
        i18n.language === 'ar'
          ? `هناك ليدز إضافية غير مكتملة: ${invalidExtrasIndices.join(', ')}\nمن فضلك املأ كل الحقول (ما عدا النوتس).`
          : `Some additional leads are incomplete: ${invalidExtrasIndices.join(', ')}\nPlease fill all required fields (except notes).`
      );
      return;
    }

    const now = new Date().toISOString();

    const newLead = {
      id: Date.now(),
      name: nameTrimmed,
      email: email.trim() || '',
      phone: mobileNumbers
        .filter((m) => m.number.trim())
        .map((m) => `${m.code} ${m.number}`)
        .join(' / '),
      company: company.trim() || project.trim() || '',
      type: type || ((company.trim() || project.trim()) ? 'Company' : 'Individual'),
      tags: tags.trim() || '',
      stage: stage,
      status: status,
      priority: priority,
      source: source,
      assignedTo: assignedTo.trim() || '',
      createdAt: now,
      lastContact: now,
      notes: note.trim() || '',
      estimatedValue: expectedRevenue,
      probability: 0,
    };

    // تحديث حفظ الهاتف لليدز الإضافية ليشمل عدة أرقام
    const extraLeadsSaved = extraLeads.map((l, idx) => ({
      id: Date.now() + idx + 1,
      name: (l.name || '').trim(),
      email: (l.email || '').trim(),
      phone: (Array.isArray(l.mobileNumbers) ? l.mobileNumbers : [])
        .filter((m) => (m.number || '').trim())
        .map((m) => `${m.code} ${m.number}`)
        .join(' / '),
      company: (l.company || l.project || '').trim(),
      type: l.type || ((l.company || l.project) ? 'Company' : 'Individual'),
      tags: (l.tags || '').trim(),
      stage: l.stage || '',
      status: l.status || '',
      priority: l.priority || 'medium',
      source: l.source || '',
      assignedTo: (l.assignedTo || '').trim(),
      createdAt: now,
      lastContact: now,
      notes: (l.note || '').trim(),
      estimatedValue: l.expectedRevenue || '',
      probability: 0,
    }));

    const existing = JSON.parse(localStorage.getItem('leadsData') || '[]');
    const updated = [newLead, ...extraLeadsSaved, ...existing];
    localStorage.setItem('leadsData', JSON.stringify(updated));

    window.dispatchEvent(new Event('leadsDataUpdated'));
    alert(i18n.language === 'ar' ? 'تم إضافة العميل بنجاح' : t('Lead added successfully'));
    navigate('/leads');
  };

  return (
    <div className={`p-6 pb-24 bg-[var(--content-bg)] text-[var(--content-text)]`}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Add New Lead')}</h1>

      <div className={`p-4 md:p-6 rounded-lg border ${formTone}`}>
              {/* Two-column layout */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{i18n.language === 'ar' ? 'العميل الرئيسي' : t('Primary Lead')}</h2>
                <button
                  type="button"
                  onClick={() => setPrimaryCollapsed(!primaryCollapsed)}
                  className={`p-2 rounded-md ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-200'} hover:opacity-90`}
                  aria-label={i18n.language === 'ar' ? (primaryCollapsed ? 'فتح' : 'طي') : (primaryCollapsed ? t('Expand') : t('Collapse'))}
                >
                  {primaryCollapsed ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
                </button>
              </div>
              {!primaryCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Enter name')}
                    />
                  </div>

                  {/* Source (select) */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Source')}</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                    >
                      <option value="">{t('Select')}</option>
                      <option value="social-media">Facebook</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="email-campaign">Campaign</option>
                    </select>
                  </div>

                  {/* Project */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Project')}</label>
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Project name')}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Type')}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                    >
                      <option value="">{t('Select')}</option>
                      <option value="Company">{t('Company')}</option>
                      <option value="Individual">{t('Individual')}</option>
                    </select>
                  </div>

                  {/* Company */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Company')}</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Company')}
                    />
                  </div>

                  {/* Expected Revenue */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Expected Revenue')}</label>
                    <input
                      type="number"
                      value={expectedRevenue}
                      onChange={(e) => setExpectedRevenue(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Amount')}
                    />
                  </div>

                  {/* Stage */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Stage')}</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                    >
                      <option value="">{t('Select')}</option>
                      {stages.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.icon} {i18n.language === 'ar' ? (s.nameAr || s.name) : s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Priority')}</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                    >
                      <option value="low">{t('Low')}</option>
                      <option value="medium">{t('Medium')}</option>
                      <option value="high">{t('High')}</option>
                    </select>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Mobile: country code select + main input + plus button */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Mobile')}</label>
                    <div className="flex items-center gap-3">
                      <CountryCodeSelect
                        value={mobileNumbers[0]?.code}
                        onChange={(val) => updateMobileNumber(0, 'code', val)}
                      />
                      <input
                        type="tel"
                        value={mobileNumbers[0]?.number}
                        onChange={(e) => updateMobileNumber(0, 'number', e.target.value)}
                        className={`flex-1 rounded-md border px-3 py-2 ${inputTone}`}
                        placeholder={t('Mobile number')}
                      />
                      <button
                        type="button"
                        onClick={addMobileNumber}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-md border ${isLight ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700'}`}
                        aria-label={t('Add another number')}
                        title={t('Add another number')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    {/* Extra mobile numbers */}
                    {mobileNumbers.slice(1).map((m, idx) => (
                      <div key={idx} className="mt-2 flex items-center gap-3">
                        <CountryCodeSelect
                          value={m.code}
                          onChange={(val) => updateMobileNumber(idx + 1, 'code', val)}
                        />
                        <input
                          type="tel"
                          value={m.number}
                          onChange={(e) => updateMobileNumber(idx + 1, 'number', e.target.value)}
                          className={`flex-1 rounded-md border px-3 py-2 ${inputTone}`}
                          placeholder={t('Another mobile number')}
                        />
                      </div>
                    ))}
                  </div>


                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Email address')}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Tags')}</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={i18n.language === 'ar' ? 'افصل بين العلامات بفواصل' : 'Comma-separated tags'}
                    />
                  </div>

                  {/* Sales (Assigned To) */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Sales')}</label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Assigned to')}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Status')}</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                    >
                      <option value="">{t('Select')}</option>
                      {statuses.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.icon} {i18n.language === 'ar' ? (s.nameAr || s.name) : s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Last Comment')}</label>
                    <textarea
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 ${inputTone}`}
                      placeholder={t('Write notes here')}
                    />
                  </div>
                </div>
              </div>
              )}

              <div className="mt-6">
                {extraLeads.map((l, i) => (
                  <div key={i} className={`mt-3 rounded-lg border p-4 ${formTone}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {l.name?.trim() ? l.name : (i18n.language === 'ar' ? `ليد #${i + 1}` : `Lead #${i + 1}`)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExtraLeadCollapse(i)}
                          className={`p-2 rounded-md ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-200'} hover:opacity-90`}
                          aria-label={i18n.language === 'ar' ? (l.collapsed ? 'فتح' : 'طي') : (l.collapsed ? t('Expand') : t('Collapse'))}
                          title={i18n.language === 'ar' ? (l.collapsed ? 'فتح' : 'طي') : (l.collapsed ? t('Expand') : t('Collapse'))}
                        >
                          {l.collapsed ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExtraLead(i)}
                          className={`px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700`}
                        >
                          {i18n.language === 'ar' ? 'مسح' : t('Delete')}
                        </button>
                      </div>
                    </div>
                    {!l.collapsed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Name')}</label>
                          <input type="text" value={l.name} onChange={(e) => updateExtraLeadField(i, 'name', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Source')}</label>
                          <select value={l.source} onChange={(e) => updateExtraLeadField(i, 'source', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`}>
                            <option value="">{t('Select')}</option>
                            <option value="social-media">Facebook</option>
                            <option value="website">Website</option>
                            <option value="referral">Referral</option>
                            <option value="email-campaign">Campaign</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Project')}</label>
                          <input type="text" value={l.project} onChange={(e) => updateExtraLeadField(i, 'project', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Type')}</label>
                          <select value={l.type || ''} onChange={(e) => updateExtraLeadField(i, 'type', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`}>
                            <option value="">{t('Select')}</option>
                            <option value="Company">{t('Company')}</option>
                            <option value="Individual">{t('Individual')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Company')}</label>
                          <input type="text" value={l.company || ''} onChange={(e) => updateExtraLeadField(i, 'company', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Expected Revenue')}</label>
                          <input type="number" value={l.expectedRevenue} onChange={(e) => updateExtraLeadField(i, 'expectedRevenue', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Mobile')}</label>
                          <div className="flex items-center gap-3">
                            <CountryCodeSelect value={l.mobileNumbers?.[0]?.code || '+20'} onChange={(val) => updateExtraLeadNumber(i, 0, 'code', val)} />
                            <input type="tel" value={l.mobileNumbers?.[0]?.number || ''} onChange={(e) => updateExtraLeadNumber(i, 0, 'number', e.target.value)} className={`flex-1 rounded-md border px-3 py-2 ${inputTone}`} />
                            <button type="button" onClick={() => addExtraLeadNumber(i)} className={`inline-flex items-center justify-center px-3 py-2 rounded-md border ${isLight ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700'}`} aria-label={t('Add another number')} title={t('Add another number')}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          {(l.mobileNumbers || []).slice(1).map((m, idx) => (
                            <div key={idx} className="mt-2 flex items-center gap-3">
                              <CountryCodeSelect value={m.code} onChange={(val) => updateExtraLeadNumber(i, idx + 1, 'code', val)} />
                              <input type="tel" value={m.number} onChange={(e) => updateExtraLeadNumber(i, idx + 1, 'number', e.target.value)} className={`flex-1 rounded-md border px-3 py-2 ${inputTone}`} />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Email')}</label>
                          <input type="email" value={l.email} onChange={(e) => updateExtraLeadField(i, 'email', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Tags')}</label>
                          <input type="text" value={l.tags || ''} onChange={(e) => updateExtraLeadField(i, 'tags', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Sales')}</label>
                          <input type="text" value={l.assignedTo} onChange={(e) => updateExtraLeadField(i, 'assignedTo', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Stage')}</label>
                          <select value={l.stage} onChange={(e) => updateExtraLeadField(i, 'stage', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`}>
                            <option value="">{t('Select')}</option>
                            {stages.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.icon} {i18n.language === 'ar' ? (s.nameAr || s.name) : s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Priority')}</label>
                          <select value={l.priority} onChange={(e) => updateExtraLeadField(i, 'priority', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`}>
                            <option value="low">{t('Low')}</option>
                            <option value="medium">{t('Medium')}</option>
                            <option value="high">{t('High')}</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Status')}</label>
                          <select value={l.status} onChange={(e) => updateExtraLeadField(i, 'status', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`}>
                            <option value="">{t('Select')}</option>
                            {statuses.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.icon} {i18n.language === 'ar' ? (s.nameAr || s.name) : s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium mb-1 ${labelTone}`}>{t('Last Comment')}</label>
                          <textarea rows={3} value={l.note} onChange={(e) => updateExtraLeadField(i, 'note', e.target.value)} className={`w-full rounded-md border px-3 py-2 ${inputTone}`} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              </div>



      </div>

      <div className={`sticky bottom-0 left-0 right-0 z-50 border-t-2 ${isLight ? 'bg-white border-gray-300 shadow-2xl' : 'bg-gray-900 border-gray-600 shadow-2xl'} backdrop-blur-md mt-6`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-bold ${isLight ? 'text-purple-700' : 'text-cyan-300'}`}>
              {i18n.language === 'ar' ? 'ليدز إضافية' : t('Additional Leads')}
            </h2>
            <button
              type="button"
              onClick={addExtraLead}
              className={`inline-flex items-center justify-center p-2 rounded-md border-2 transition-all duration-200 ${isLight ? 'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100 hover:border-blue-500' : 'bg-gray-800 border-gray-600 text-blue-300 hover:bg-gray-700 hover:border-gray-500'} hover:opacity-95 hover:shadow-lg active:scale-95`}
              aria-label={i18n.language === 'ar' ? 'إضافة ليد' : t('Add Lead')}
              title={i18n.language === 'ar' ? 'إضافة ليد' : t('Add Lead')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="inline-flex w-fit">
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-md font-bold transition-all duration-150 ease-out transform disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:opacity-95 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-lg hover:shadow-xl ${isLight ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-2 border-green-500' : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border-2 border-emerald-600'}`}
            >
              {i18n.language === 'ar' ? 'تأكيد الإضافة' : t('Confirm Add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewLead;
