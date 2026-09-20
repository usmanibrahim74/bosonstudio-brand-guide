import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Theme: saved choice wins, otherwise follow the system. Runs before first render.
const savedTheme = (() => { try { return localStorage.getItem('boson-theme') } catch { return null } })()
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
document.documentElement.dataset.theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : prefersLight ? 'light' : 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
