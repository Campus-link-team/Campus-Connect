
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'

import './index.css'
import App from './App.jsx'

// 발표용 빌드에서는 HashRouter 사용
// 일반 개발 환경에서는 기존 BrowserRouter 사용
const Router =
  import.meta.env.MODE === 'presentation'
    ? HashRouter
    : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
