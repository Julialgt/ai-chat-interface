import { useEffect, useState } from 'react'
import ChatPage from './pages/ChatPage'

const THEME_KEY = 'app-theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    // ✅ HIER gebeurt het: theme op <html>
    document.documentElement.setAttribute('data-theme', theme)

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <ChatPage theme={theme} onToggleTheme={toggleTheme} />
}