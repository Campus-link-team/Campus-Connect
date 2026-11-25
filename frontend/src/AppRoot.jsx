import { StrictMode } from 'react'
import { BrowserRouter, HashRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'

// 발표용 빌드에서는 HashRouter, 일반 개발 환경에서는 BrowserRouter를 사용한다.
const Router = import.meta.env.MODE === 'presentation' ? HashRouter : BrowserRouter

export default function AppRoot() {
  return (
    <StrictMode>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </StrictMode>
  )
}
