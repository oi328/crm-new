import { useTranslation } from 'react-i18next'
import './App.css'
import AppRouter from '@router/index'

function App() {
  const { i18n } = useTranslation()

  return (
    <div className={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <AppRouter />
    </div>
  )
}

export default App
