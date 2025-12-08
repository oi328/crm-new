import React, { createContext, useContext, useEffect, useState } from 'react'
import { palette, fonts } from '../../theme.js'

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} })

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      // Prefer theme from system preferences
      const prefsRaw = localStorage.getItem('systemPrefs')
      if (prefsRaw) {
        const prefs = JSON.parse(prefsRaw)
        if (prefs && (prefs.theme === 'light' || prefs.theme === 'dark')) {
          return prefs.theme
        }
      }
      const saved = localStorage.getItem('theme')
      return saved === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    try {
      localStorage.setItem('theme', theme)
      // Keep system preferences in sync with theme changes
      const prefsRaw = localStorage.getItem('systemPrefs')
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {}
      prefs.theme = theme
      localStorage.setItem('systemPrefs', JSON.stringify(prefs))
    } catch {}
  }, [theme])

  // On mount, apply density and direction from system preferences
  useEffect(() => {
    try {
      const prefsRaw = localStorage.getItem('systemPrefs')
      if (prefsRaw) {
        const prefs = JSON.parse(prefsRaw)
        const root = document.documentElement
        if (prefs && prefs.density) {
          root.classList.remove('density-compact', 'density-comfortable', 'density-default')
          const cls = `density-${prefs.density}`
          root.classList.add(cls)
        }
        if (prefs && prefs.direction) {
          document.dir = prefs.direction === 'rtl' ? 'rtl' : 'ltr'
        }
      }
    } catch {}
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, palette, fonts }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
