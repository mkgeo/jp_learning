import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import path from 'path-browserify'

// Global polyfills for Kuromoji, Zlibjs & Path in browser environment
if (typeof window !== 'undefined') {
  window.global = window;
  window.Zlib = window.Zlib || {};
  window.path = window.path || path;
}

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
