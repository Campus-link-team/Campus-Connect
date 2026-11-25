import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, Users, MapPin } from 'lucide-react'
import { projectsApi } from '../../api/projectsApi.js'
import './ProjectsPage.css'

const categories = ['전체', '개발', '디자인', '기획·창업', '스터디', '공모전', '기타']
function ProjectsPage() {
  const [category, setCategory] = useState('전체')
  const [projects, setProjects] = useState([])
  const [loadState, setLoadState] = useState({ requestKey: null, error: '' })
  const requestKey = category
  const loading = loadState.requestKey !== requestKey
  const error = loadState.requestKey === requestKey ? loadState.error : ''

  useEffect(() => {
    let active = true

    async function loadProjects() {
      let requestError = ''

      try {
        const result = await projectsApi.list({
          category: category === '전체' ? undefined : category,
          status: 'RECRUITING',
        })
        if (active) setProjects(result)
      } catch (e) {
        requestError = e.message || '프로젝트 목록을 불러오지 못했습니다.'
      } finally {
        if (active) setLoadState({ requestKey, error: requestError })
      }
    }

    loadProjects()
    return () => { active = false }
  }, [category, requestKey])
  const list = [...projects].sort((a, b) => b.id - a.id)
  return <main className="projects-page">
    <section className="projects-heading"><div><span className="projects-eyebrow">CAMPUS PROJECT</span><h1>프로젝트 모집</h1><p>함께 성장할 팀원을 찾고 새로운 프로젝트를 시작해 보세요.</p></div><Link to="/projects/new" className="projects-register-button"><Plus size={18} /> 모집글 작성</Link></section>
    <section className="projects-filter-section"><h2>프로젝트 분야</h2><div className="projects-category-list">{categories.map((item) => <button type="button" key={item} className={`projects-category-button ${category === item ? 'is-selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div></section>
    <section className="projects-list"><div className="projects-list-heading"><h2>모집 중인 프로젝트</h2><span>총 {list.length}개</span></div>
      {error && <div className="book-form-error">{error}</div>}
      {loading ? <div className="projects-empty">프로젝트를 불러오는 중입니다...</div> : list.length ? <div className="projects-grid">{list.map((project) => <Link to={`/projects/${project.id}`} className="project-card" key={project.id}>
        <div className="project-card-header"><span className="project-category">{project.category}</span><span className="project-status">{project.statusLabel}</span></div>
        <h3>{project.title}</h3><p className="project-description">{project.description}</p>
        <div className="project-card-info"><span><Users size={15} /> {project.currentMembers}/{project.maxMembers}명</span><span><MapPin size={15} /> {project.location || '장소 협의'}</span></div>
        <div className="project-card-footer"><span>{project.endDate ? `종료일 ${project.endDate}` : '일정 협의'}</span><strong>자세히 보기 →</strong></div>
      </Link>)}</div> : <div className="projects-empty">모집 중인 프로젝트가 없습니다.</div>}
    </section>
  </main>
}
export default ProjectsPage
