import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import './index.css'
import './styles/nova.css'
import './styles/company-setup.css'
import App from './App.jsx'
import { ThemeProvider } from '@shared/context/ThemeProvider'
import { AppStateProvider } from '@shared/context/AppStateProvider'
import { ToastProvider } from '@shared/context/ToastProvider'
import { ErrorBoundary } from '@shared/components/common/ErrorBoundary'
import { CompanySetupProvider } from './pages/settings/company-setup/store/CompanySetupContext.jsx'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { Chart as ChartJS, registerables } from 'chart.js'

// Register all Chart.js components/controllers globally to avoid runtime errors
ChartJS.register(...registerables)

// Apply Chart.js global defaults from saved system preferences
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const prefsRaw = window.localStorage.getItem('systemPrefs')
    if (prefsRaw) {
      const prefs = JSON.parse(prefsRaw)
      if (prefs) {
        // Rounded bars
        ChartJS.defaults.elements = ChartJS.defaults.elements || {}
        ChartJS.defaults.elements.bar = {
          ...(ChartJS.defaults.elements.bar || {}),
          borderRadius: prefs.chartsRounded ? 6 : 0,
        }
        // Stacked columns/bars by default
        ChartJS.defaults.scales = {
          ...(ChartJS.defaults.scales || {}),
          x: { ...(ChartJS.defaults.scales?.x || {}), stacked: !!prefs.chartsStacked },
          y: { ...(ChartJS.defaults.scales?.y || {}), stacked: !!prefs.chartsStacked },
        }
      }
    }
  }
} catch {}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <ToastProvider>
            <ThemeProvider>
              <AppStateProvider>
                <CompanySetupProvider>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                </CompanySetupProvider>
              </AppStateProvider>
            </ThemeProvider>
          </ToastProvider>
        </HashRouter>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
)
