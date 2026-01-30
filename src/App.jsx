import { useTranslation } from 'react-i18next';
import './App.css';
import AppRouter from '@router/index';

function App() {
  const { i18n } = useTranslation();

  const directionClass = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`${directionClass} min-h-screen text-theme-text dark:text-gray-100`}>
      <AppRouter />
    </div>
  );
}

export default App;
