
import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'

import {
  Mail,
  LockKeyhole,
  GraduationCap,
} from 'lucide-react'

import { useAuth } from '../../context/useAuth.js'

import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { login, isLoggedIn } = useAuth()

  const [email, setEmail] = useState(
    location.state?.registeredEmail || ''
  )

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미 로그인되어 있다면 메인 페이지로 이동
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  // 로그인 제출
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      await login(email, password)

      // 로그인을 요청했던 페이지가 있다면 해당 페이지로 이동
      const destination = location.state?.from?.pathname || '/'

      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(
        loginError.message || '로그인에 실패했습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">

        {/* 로그인 제목 */}
        <header className="login-header">
          <div className="login-logo">
            <GraduationCap size={30} />
          </div>

          <h1>CampusConnect 로그인</h1>

          <p>
            다시 만나서 반가워요!
            <br />
            계정에 로그인하고 새로운 연결을 시작해 보세요.
          </p>
        </header>

        {/* 로그인 폼 */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* 이메일 */}
          <div className="login-field">
            <label htmlFor="login-email">
              학교 이메일
            </label>

            <div className="login-input-wrap">
              <Mail size={18} />

              <input
                id="login-email"
                type="email"
                placeholder="school@university.ac.kr"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="login-field">
            <label htmlFor="login-password">
              비밀번호
            </label>

            <div className="login-input-wrap">
              <LockKeyhole size={18} />

              <input
                id="login-password"
                type="password"
                placeholder="비밀번호를 입력해 주세요."
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* 로그인 오류 */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

        </form>

        {/* 회원가입 이동 */}
        <div className="login-signup-link">
          아직 계정이 없으신가요?
          <Link to="/signup">회원가입</Link>
        </div>

      </div>
    </main>
  )
}

export default LoginPage
