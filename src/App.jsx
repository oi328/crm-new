import { useTranslation } from 'react-i18next';
import { useEffect } from 'react'; // 1. استورد useEffect
import './App.css';
import AppRouter from '@router/index';

function App() {
  const { i18n } = useTranslation();

  // 2. هذا الـ effect سيقوم بتحديث الـ body
  useEffect(() => {
    // تطبيق الكلاسات العامة على <body>
    document.body.classList.add(
      'bg-gray-50',
      'dark:bg-gray-900',
      'transition-colors',
      'duration-300'
    );
  }, []); // [] تعني أن هذا الكود سيعمل مرة واحدة فقط عند تحميل المكون

  const directionClass = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // 3. أزل كلاسات الخلفية من هنا لتجنب التكرار
  return (
    <div className={`${directionClass} min-h-screen text-theme-text dark:text-gray-100`}>
      <AppRouter />
    </div>
  );
}

export default App;
