import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './ProjectCreatePage.css'

const categories = ['개발', '디자인', '기획·창업', '스터디', '공모전', '기타']
function ProjectEditPage() {
  const { projectId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [project, setProject] = useState(null); const [title, setTitle] = useState(''); const [category, setCategory] = useState('개발'); const [content, setContent] = useState(''); const [capacity, setCapacity] = useState(''); const [location, setLocation] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; projectsApi.get(projectId).then((p) => { if (!active) return; setProject(p); setTitle(p.title || ''); setCategory(p.category || '개발'); setContent(p.content || p.description || ''); setCapacity(String(p.capacity || p.maxMembers || '')); setLocation(p.location || '') }).catch((e) => active && setError(e.message)); return () => { active = false } }, [projectId])
  if (isLoading) return <main className="project-create-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: { pathname: `/projects/${projectId}/edit` } }} />
  if (error && !project) return <main className="project-create-page"><div className="book-form-error">{error}</div><Link to="/projects">목록으로</Link></main>
  if (!project) return <main className="project-create-page">모집글을 불러오는 중입니다...</main>
  if (Number(project.writerId) !== Number(user?.id)) return <main className="project-create-page"><div className="book-form-error">작성자만 모집글을 수정할 수 있습니다.</div><Link to={`/projects/${projectId}`}>모집글로 돌아가기</Link></main>
  async function handleSubmit(event) { event.preventDefault(); setError(''); if (!title.trim() || !content.trim() || Number(capacity) < 1) return setError('필수 항목을 확인해 주세요.'); try { setBusy(true); await projectsApi.update(projectId, { title, category, content, capacity, location }); navigate(`/projects/${projectId}`) } catch (e) { setError(e.message || '수정에 실패했습니다.') } finally { setBusy(false) } }
  return <main className="project-create-page"><Link to={`/projects/${projectId}`} className="project-create-back"><ArrowLeft size={17} /> 모집글 상세로</Link><div className="project-create-heading"><span>CAMPUS PROJECT</span><h1>모집글 수정</h1><p>프로젝트 정보를 수정합니다.</p></div>
    <form className="project-create-form" onSubmit={handleSubmit}><section className="project-form-section"><h2>모집 정보</h2>
      <div className="project-form-field"><label htmlFor="project-title">프로젝트 제목</label><input id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required /></div>
      <div className="project-form-field"><label htmlFor="project-category">분야</label><select id="project-category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div className="project-form-field"><label htmlFor="project-capacity">모집 인원</label><input id="project-capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required /></div>
      <div className="project-form-field"><label htmlFor="project-location">진행 장소</label><input id="project-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} /></div>
    </section><section className="project-form-section"><h2>프로젝트 소개</h2><textarea className="project-form-description" value={content} onChange={(e) => setContent(e.target.value)} rows={8} maxLength={5000} required /></section>
      {error && <div className="book-form-error" role="alert">{error}</div>}<button className="project-form-submit" type="submit" disabled={busy}>{busy ? '저장 중...' : '수정 내용 저장'}</button></form></main>
}
export default ProjectEditPage
