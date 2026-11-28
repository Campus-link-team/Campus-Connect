import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './ProjectCreatePage.css'

const categories = ['개발', '디자인', '기획·창업', '스터디', '공모전', '기타']
const todayString = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
function ProjectCreatePage() {
  const navigate = useNavigate(); const { isLoggedIn, isLoading } = useAuth()
  const [title, setTitle] = useState(''); const [category, setCategory] = useState('개발'); const [content, setContent] = useState(''); const [capacity, setCapacity] = useState('4'); const [location, setLocation] = useState(''); const [endDate, setEndDate] = useState(''); const [startDate, setStartDate] = useState(''); const today = todayString(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  if (isLoading) return <main className="project-create-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: { pathname: '/projects/new' } }} />
  async function handleSubmit(event) { event.preventDefault(); setError(''); if (!title.trim() || !content.trim()) return setError('제목과 모집 내용을 입력해 주세요.'); if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) return setError('모집 인원은 1명 이상이어야 합니다.'); if (!endDate) return setError('모집 마감일을 입력해 주세요.'); if (endDate < today) return setError('모집 마감일은 오늘 이후로 입력해 주세요.'); try { setBusy(true); await projectsApi.create({ title, category, content, capacity, location, startDate, endDate }); navigate('/projects', { replace: true }) } catch (e) { setError(e.message || '모집글 등록에 실패했습니다.') } finally { setBusy(false) } }
  return <main className="project-create-page"><Link to="/projects" className="project-create-back"><ArrowLeft size={17} /> 프로젝트 목록으로</Link><div className="project-create-heading"><span>CAMPUS PROJECT</span><h1>프로젝트 모집글 작성</h1><p>함께할 사람을 모집하기 위한 정보를 입력해 주세요.</p></div>
    <form className="project-create-form" onSubmit={handleSubmit}><section className="project-form-section"><h2>모집 정보</h2>
      <div className="project-form-field"><label htmlFor="project-title">프로젝트 제목 <span>*</span></label><input id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="프로젝트 제목을 입력해 주세요." required /></div>
      <div className="project-form-field"><label htmlFor="project-category">분야 <span>*</span></label><select id="project-category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div className="project-form-field"><label htmlFor="project-capacity">모집 인원 <span>*</span></label><input id="project-capacity" type="number" min="1" max="100" value={capacity} onChange={(e) => setCapacity(e.target.value)} required /></div>
      <div className="project-form-field"><label htmlFor="project-location">진행 장소</label><input id="project-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} placeholder="예: 온라인 / 삼육대학교" /></div>
      <div className="project-form-field"><label htmlFor="project-end-date">모집 마감일 <span>*</span></label><input id="project-end-date" type="date" min={today} value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
      <div className="project-form-field"><label htmlFor="project-start-date">활동 시작일</label><input id="project-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
    </section><section className="project-form-section"><h2>프로젝트 소개 <span>*</span></h2><textarea className="project-form-description" value={content} onChange={(e) => setContent(e.target.value)} rows={8} maxLength={5000} placeholder="프로젝트 목표, 진행 방식, 참여 조건 등을 작성해 주세요." required /><span className="project-form-count">{content.length}/5000</span></section>
      {error && <div className="book-form-error" role="alert">{error}</div>}<button className="project-form-submit" type="submit" disabled={busy}>{busy ? '등록 중...' : '모집글 등록하기'}</button>
    </form></main>
}
export default ProjectCreatePage
