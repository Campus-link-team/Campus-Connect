import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './ProjectApplyPage.css'

function ProjectApplyPage() {
  const { projectId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [project, setProject] = useState(null); const [roleName, setRoleName] = useState(''); const [introduction, setIntroduction] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; projectsApi.get(projectId).then((p) => active && setProject(p)).catch((e) => active && setError(e.message)); return () => { active = false } }, [projectId])
  if (isLoading) return <main className="project-apply-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: `/projects/${projectId}/apply` } }} />
  if (error && !project) return <main className="project-apply-page"><div className="book-form-error">{error}</div><Link to="/projects">목록으로</Link></main>
  if (!project) return <main className="project-apply-page">모집글을 불러오는 중입니다...</main>
  if (Number(project.writerId) === Number(user.id)) return <main className="project-apply-page"><p>본인이 작성한 모집글에는 지원할 수 없습니다.</p><Link to={`/projects/${projectId}`}>상세로 돌아가기</Link></main>
  if (project.recruitmentStatus !== 'RECRUITING' || project.currentApplicantCount >= project.capacity) return <main className="project-apply-page"><p>현재 모집이 마감되었습니다.</p><Link to={`/projects/${projectId}`}>상세로 돌아가기</Link></main>
  async function handleSubmit(event) { event.preventDefault(); setError(''); if (!roleName.trim() || !introduction.trim()) return setError('희망 역할과 지원 메시지를 입력해 주세요.'); try { setBusy(true); await projectsApi.apply(project.id, { roleName, introduction }); navigate(`/projects/${project.id}`, { replace: true }) } catch (e) { setError(e.message || '지원에 실패했습니다.') } finally { setBusy(false) } }
  return <main className="project-apply-page"><Link to={`/projects/${project.id}`} className="project-apply-back"><ArrowLeft size={17} /> 모집글 상세로</Link><header className="project-apply-heading"><span>PROJECT APPLICATION</span><h1>프로젝트 지원</h1><p>{project.title}</p></header>
    <form className="project-apply-form" onSubmit={handleSubmit}><div className="project-apply-summary"><CheckCircle size={19} /><div><strong>{project.category}</strong><span>{project.currentApplicantCount}/{project.capacity}명 승인</span></div></div>
      <div className="project-form-field"><label htmlFor="apply-role">희망 역할 <span>*</span></label><input id="apply-role" value={roleName} onChange={(e) => setRoleName(e.target.value)} maxLength={50} placeholder="예: 프론트엔드 개발" required /></div>
      <div className="project-form-field"><label htmlFor="apply-introduction">지원 메시지 <span>*</span></label><textarea id="apply-introduction" value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={7} maxLength={1000} placeholder="참여 동기와 관련 경험을 작성해 주세요." required /></div>
      {error && <div className="book-form-error" role="alert">{error}</div>}<button type="submit" className="project-apply-submit" disabled={busy}>{busy ? '지원 중...' : '지원하기'}</button></form></main>
}
export default ProjectApplyPage
