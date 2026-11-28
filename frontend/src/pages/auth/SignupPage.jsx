import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { UserRound, Mail, LockKeyhole, GraduationCap, CheckCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { authApi } from '../../api/authApi.js'
import './SignupPage.css'

function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [nickname, setNickname] = useState('')
  const [department, setDepartment] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  function resetEmailVerification(nextEmail) {
    setEmail(nextEmail)
    setCode('')
    setMockCode('')
    setVerificationSent(false)
    setEmailVerified(false)
    setError('')
    setSuccess('')
  }

  async function handleSendCode() {
    setError('')
    const normalized = email.trim().toLowerCase()
    if (!/^[^\s@]+@syu\.ac\.kr$/i.test(normalized)) {
      setError('삼육대학교 학교 이메일(@syu.ac.kr)을 입력해 주세요.')
      return
    }
    try {
      setBusy(true)
      const result = await authApi.sendEmailCode(normalized)
      setVerificationSent(true)
      setEmailVerified(false)
      setMockCode(result?.mockCode ? String(result.mockCode) : '')
      setSuccess('인증번호를 발송했습니다. 이메일을 확인해 주세요.')
    } catch (e) {
      setError(e.message || '인증번호 발송에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyCode() {
    setError('')
    if (!verificationSent) return setError('먼저 인증번호를 발송해 주세요.')
    if (!/^\d{6}$/.test(code.trim())) return setError('인증번호 6자리를 입력해 주세요.')
    try {
      setBusy(true)
      const result = await authApi.verifyEmailCode(email, code)
      if (!result?.verified) throw new Error('이메일 인증에 실패했습니다.')
      setEmailVerified(true)
      setSuccess('학교 이메일 인증이 완료되었습니다.')
    } catch (e) {
      setEmailVerified(false)
      setError(e.message || '인증번호를 확인하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCheckNickname() {
    setError('')
    if (nickname.trim().length < 2) return setError('닉네임은 2자 이상 입력해 주세요.')
    try {
      setBusy(true)
      const result = await authApi.checkNickname(nickname)
      if (!result?.available) {
        setNicknameChecked(false)
        setError('이미 사용 중인 닉네임입니다.')
        return
      }
      setNicknameChecked(true)
      setSuccess('사용할 수 있는 닉네임입니다.')
    } catch (e) {
      setNicknameChecked(false)
      setError(e.message || '닉네임을 확인하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!emailVerified) return setError('학교 이메일 인증을 먼저 완료해 주세요.')
    if (!nicknameChecked) return setError('닉네임 중복 확인을 먼저 진행해 주세요.')
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(password)) {
      return setError('비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.')
    }
    if (password !== confirmPassword) return setError('비밀번호 확인이 일치하지 않습니다.')
    try {
      setBusy(true)
      await register({ email, password, nickname, department })
      navigate('/login', { state: { registeredEmail: email.trim().toLowerCase() } })
    } catch (e) {
      setError(e.message || '회원가입에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-container">
        <header className="signup-header">
          <div className="signup-logo"><GraduationCap size={30} /></div>
          <h1>CampusConnect 회원가입</h1>
          <p>삼육대학교 이메일로 인증하고 가입할 수 있습니다.</p>
        </header>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-field">
            <label htmlFor="signup-nickname">닉네임</label>
            <div className="signup-email-row">
              <div className="signup-input-wrap">
                <UserRound size={18} />
                <input id="signup-nickname" value={nickname} onChange={(e) => { setNickname(e.target.value); setNicknameChecked(false); setError('') }} maxLength={15} placeholder="사용할 닉네임" required />
              </div>
              <button type="button" className="signup-verify-send" onClick={handleCheckNickname} disabled={busy || !nickname.trim()}>중복 확인</button>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-department">학과 (선택)</label>
            <div className="signup-input-wrap">
              <GraduationCap size={18} />
              <input
                id="signup-department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={50}
                placeholder="예: 컴퓨터공학과"
                autoComplete="organization-title"
              />
            </div>
            <small className="signup-field-hint">입력하지 않아도 가입할 수 있습니다. (최대 50자)</small>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-email">학교 이메일</label>
            <div className="signup-email-row">
              <div className="signup-input-wrap">
                <Mail size={18} />
                <input id="signup-email" type="email" value={email} onChange={(e) => resetEmailVerification(e.target.value)} placeholder="student@syu.ac.kr" required />
              </div>
              <button type="button" className="signup-verify-send" onClick={handleSendCode} disabled={busy || emailVerified}>인증번호 발송</button>
            </div>
            {verificationSent && !emailVerified && (
              <div className="signup-verification">
                {mockCode && <p>개발 테스트 인증번호: <strong>{mockCode}</strong></p>}
                <div className="signup-verification-row">
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="인증번호 6자리" />
                  <button type="button" onClick={handleVerifyCode} disabled={busy}>확인</button>
                </div>
              </div>
            )}
            {emailVerified && <div className="signup-email-verified"><CheckCircle size={15} /> 이메일 인증이 완료되었습니다.</div>}
          </div>

          <div className="signup-field">
            <label htmlFor="signup-password">비밀번호</label>
            <div className="signup-input-wrap"><LockKeyhole size={18} /><input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="영문·숫자·특수문자 포함 8~20자" required /></div>
          </div>
          <div className="signup-field">
            <label htmlFor="signup-confirm-password">비밀번호 확인</label>
            <div className="signup-input-wrap"><ShieldCheck size={18} /><input id="signup-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="비밀번호를 다시 입력해 주세요." required /></div>
          </div>

          {error && <div className="signup-message is-error" role="alert">{error}</div>}
          {success && <div className="signup-message is-success" role="status">{success}</div>}
          <button type="submit" className="signup-submit" disabled={busy}>{busy ? '처리 중...' : '회원가입'}</button>
          <p className="signup-test-notice">이메일 인증과 닉네임 중복 확인은 서버에서 처리됩니다.</p>
        </form>
        <div className="signup-login-link">이미 계정이 있으신가요? <Link to="/login">로그인</Link></div>
      </div>
    </main>
  )
}

export default SignupPage
