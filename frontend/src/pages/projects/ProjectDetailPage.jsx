import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Users, MapPin, MessageCircle, Pencil, Trash2, LockKeyhole } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import { chatsApi } from '../../api/chatsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './ProjectDetailPage.css'

function ProjectDetailPage() {
  const { projectId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [project, setProject] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; projectsApi.get(projectId).then((p) => { if (active) setProject(p) }).catch((e) => active && setError(e.message || '모집글을 불러오지 못했습니다.')); return () => { active = false } }, [projectId])
  if (isLoading) return <main className="project-detail-page">로그인 정보를 확인하고 있습니다...</main>
  if (error && !project) return <main className="project-detail-page"><div className="book-form-error">{error}</div><Link to="/projects">목록으로</Link></main>
  if (!project) return <main className="project-detail-page">모집글을 불러오는 중입니다...</main>
  const isOwner = Boolean(user && Number(project.writerId) === Number(user.id))
  const closed = project.recruitmentStatus !== 'RECRUITING'
  const full = Number(project.currentApplicantCount) >= Number(project.capacity)
  async function handleChat() {
    if (!isLoggedIn) return navigate('/login', { state: { from: { pathname: `/projects/${projectId}` } } })
    if (isOwner) return setError('본인이 작성한 모집글에는 채팅을 시작할 수 없습니다.')
    try { setBusy(true); const room = await chatsApi.createOrGet({ contextType: 'PROJECT', contextId: project.id, participantUserId: project.writerId }); navigate(`/chats/${room.chatId ?? room.id}`) }
    catch (e) { setError(e.message || '채팅방을 열지 못했습니다.') } finally { setBusy(false) }
  }
  async function handleClose() {
    if (!window.confirm('모집을 마감하시겠습니까?')) return
    try { setBusy(true); await projectsApi.close(project.id); setProject(await projectsApi.get(project.id)) }
    catch (e) { setError(e.message || '모집을 마감하지 못했습니다.') } finally { setBusy(false) }
  }
  async function handleDelete() {
    if (!window.confirm('모집글을 삭제하시겠습니까?')) return
    try { setBusy(true); await projectsApi.remove(project.id); navigate('/projects') }
    catch (e) { setError(e.message || '모집글을 삭제하지 못했습니다.') } finally { setBusy(false) }
  }
  return <main className="project-detail-page">
    <Link to="/projects" className="project-detail-back"><ArrowLeft size={17} /> 프로젝트 목록으로</Link>
    <section className="project-detail-header"><div className="project-detail-header-top"><span className="project-detail-category">{project.category}</span><span className={`project-detail-status ${closed ? 'is-closed' : ''}`}>{project.statusLabel}</span></div>
      <h1>{project.title}</h1><p>{project.content || project.description}</p>
      <div className="project-detail-author"><div className="project-detail-avatar">{(project.writerNickname || 'U').slice(0, 1)}</div><div><strong>{project.writerNickname || '작성자'}</strong><span>모집글 작성자</span></div><span className="project-detail-created">게시글 #{project.id}</span></div>
    </section>
    <div className="project-detail-content"><section className="project-detail-main">
      <div className="project-detail-section"><h2>프로젝트 정보</h2><div className="project-detail-info-list"><p><Users size={17} /> 모집 인원: {project.capacity}명 (승인 {project.currentApplicantCount}명)</p><p><MapPin size={17} /> 진행 장소: {project.location || '협의'}</p>{project.startDate && <p>시작일: {project.startDate}</p>}{project.endDate && <p>종료일: {project.endDate}</p>}</div></div>
    </section><aside className="project-detail-sidebar"><div className="project-detail-summary"><span>현재 승인 인원</span><strong>{project.currentApplicantCount} / {project.capacity}명</strong><div className="project-progress"><span style={{ width: `${Math.min(100, project.capacity ? project.currentApplicantCount / project.capacity * 100 : 0)}%` }} /></div></div>
      {isOwner ? <div className="project-detail-owner-actions"><Link to={`/projects/${project.id}/applications`} className="project-detail-apply-button">지원자 관리</Link><Link to={`/projects/${project.id}/edit`} className="project-detail-edit-button"><Pencil size={16} /> 모집글 수정</Link>{!closed && !full && <button type="button" onClick={handleClose} disabled={busy}><LockKeyhole size={16} /> 모집 마감</button>}<button type="button" onClick={handleDelete} disabled={busy} className="project-detail-delete-button"><Trash2 size={16} /> 모집글 삭제</button></div> : <div className="project-detail-owner-actions">{!closed && !full && <Link to={`/projects/${project.id}/apply`} className="project-detail-apply-button">지원하기</Link>}<button type="button" onClick={handleChat} disabled={busy}><MessageCircle size={16} /> 작성자에게 문의</button></div>}
      {full && !closed && <p>모집 인원이 모두 승인되었습니다.</p>}{error && <div className="book-form-error" role="alert">{error}</div>}
    </aside></div>
  </main>
}
export default ProjectDetailPage
