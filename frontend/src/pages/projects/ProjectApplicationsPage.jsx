import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowLeft, MessageCircle, Check, X } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import { chatsApi } from '../../api/chatsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './ProjectApplicationsPage.css'

const statusLabel = { PENDING: '검토 중', APPROVED: '승인', REJECTED: '거절' }
function ProjectApplicationsPage() {
  const { projectId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [project, setProject] = useState(null); const [applications, setApplications] = useState([]); const [error, setError] = useState(''); const [busyId, setBusyId] = useState(null)
  async function load() {
    const [p, a] = await Promise.all([projectsApi.get(projectId), projectsApi.applications(projectId)])
    setProject(p); setApplications(a)
  }
  useEffect(() => { let active = true; Promise.all([projectsApi.get(projectId), projectsApi.applications(projectId)]).then(([p, a]) => { if (active) { setProject(p); setApplications(a) } }).catch((e) => active && setError(e.message || '지원자 목록을 불러오지 못했습니다.')); return () => { active = false } }, [projectId])
  if (isLoading) return <main className="project-applications-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: { pathname: `/projects/${projectId}/applications` } }} />
  if (error && !project) return <main className="project-applications-page"><div className="book-form-error">{error}</div><Link to="/projects">목록으로</Link></main>
  if (!project) return <main className="project-applications-page">지원자 정보를 불러오는 중입니다...</main>
  if (Number(project.writerId) !== Number(user?.id)) return <main className="project-applications-page"><p>작성자만 지원자를 관리할 수 있습니다.</p><Link to={`/projects/${projectId}`}>모집글로 돌아가기</Link></main>
  async function changeStatus(application, status) {
    if (status === 'REJECTED' && !window.confirm('이 지원을 거절하시겠습니까?')) return
    try { setBusyId(application.applicationId); await projectsApi.updateApplication(project.id, application.applicationId, status); await load(); setError('') }
    catch (e) { setError(e.message || '지원 상태를 변경하지 못했습니다.') }
    finally { setBusyId(null) }
  }
  async function startChat(application) {
    try { setBusyId(application.applicationId); const room = await chatsApi.createOrGet({ contextType: 'PROJECT', contextId: project.id, participantUserId: application.applicantId }); navigate(`/chats/${room.chatId ?? room.id}`) }
    catch (e) { setError(e.message || '채팅방을 열지 못했습니다.') }
    finally { setBusyId(null) }
  }
  return <main className="project-applications-page"><Link to={`/projects/${project.id}`} className="project-applications-back"><ArrowLeft size={17} /> 모집글 상세로</Link><header className="project-applications-heading"><span>APPLICATION MANAGEMENT</span><h1>지원자 관리</h1><p>{project.title}</p></header>
    <section className="project-applications-list"><div className="project-applications-summary"><strong>총 {applications.length}명</strong><span>승인 인원 {project.currentApplicantCount}/{project.capacity}명</span></div>
      {applications.length ? applications.map((application) => <article className="project-application-card" key={application.applicationId}><div className="project-application-header"><div><strong>{application.applicantNickname}</strong><span>{application.roleName}</span></div><span className={`project-application-status status-${String(application.status).toLowerCase()}`}>{statusLabel[application.status] || application.status}</span></div><p>{application.introduction}</p><small>{application.appliedAt ? new Date(application.appliedAt).toLocaleString('ko-KR') : ''}</small>
        <div className="project-application-actions"><button type="button" onClick={() => startChat(application)} disabled={busyId === application.applicationId}><MessageCircle size={15} /> 채팅</button>{application.status === 'PENDING' && <><button type="button" onClick={() => changeStatus(application, 'APPROVED')} disabled={busyId === application.applicationId}><Check size={15} /> 승인</button><button type="button" onClick={() => changeStatus(application, 'REJECTED')} disabled={busyId === application.applicationId}><X size={15} /> 거절</button></>}</div>
      </article>) : <div className="project-applications-empty">아직 지원자가 없습니다.</div>}
    </section>{error && <div className="book-form-error" role="alert">{error}</div>}</main>
}
export default ProjectApplicationsPage
