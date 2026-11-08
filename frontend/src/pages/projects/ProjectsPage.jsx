
import { useState } from 'react'
import { Link } from 'react-router'
import {
  Search,
  Plus,
  Users,
  CalendarDays,
  MapPin,
} from 'lucide-react'

import { getProjects } from '../../data/projectStorage.js'
import './ProjectsPage.css'

const categories = [
  '전체',
  '개발',
  '디자인',
  '기획·창업',
  '스터디',
  '공모전',
  '기타',
]

const roles = [
  '전체 역할',
  '프론트엔드',
  '백엔드',
  '풀스택',
  '앱 개발',
  '게임 개발',
  'UI/UX 디자인',
  '그래픽 디자인',
  '기획자',
  'PM',
  '데이터·AI',
  '마케팅·콘텐츠',
  '스터디원',
  '기타',
]

function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [selectedRole, setSelectedRole] = useState('전체 역할')
  const [sort, setSort] = useState('latest')

  const [projects] = useState(() => getProjects())

  // 검색 및 필터링
  const filteredProjects = projects
    .filter((project) => {
      const keyword = search.trim().toLowerCase()

      const matchesSearch =
        project.title.toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword)

      const matchesCategory =
        category === '전체' || project.category === category

      const matchesRole =
        selectedRole === '전체 역할' ||
        project.roles.some(
          (role) => role.name === selectedRole
        )

      return matchesSearch && matchesCategory && matchesRole
    })
    .sort((a, b) => {
      if (sort === 'deadline') {
        return a.deadlineDays - b.deadlineDays
      }

      return (b.createdOrder || 0) - (a.createdOrder || 0)
    })

  return (
    <main className="projects-page">
      {/* 페이지 제목 */}
      <section className="projects-heading">
        <div>
          <span className="projects-eyebrow">
            CAMPUS PROJECT
          </span>

          <h1>프로젝트 모집</h1>

          <p>
            함께 성장할 팀원을 찾고 새로운 프로젝트를 시작해 보세요.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="projects-register-button"
        >
          <Plus size={18} />
          모집글 작성
        </Link>
      </section>

      {/* 검색 */}
      <section className="projects-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="프로젝트명 또는 키워드를 검색하세요."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {/* 프로젝트 분야 */}
      <section className="projects-filter-section">
        <h2>프로젝트 분야</h2>

        <div className="projects-category-list">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`projects-category-button ${
                category === item ? 'is-selected' : ''
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* 역할 필터 및 정렬 */}
      <section className="projects-toolbar">
        <div className="projects-role-filter">
          <label htmlFor="project-role">모집 역할</label>

          <select
            id="project-role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
          >
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <select
          className="projects-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="프로젝트 정렬 방식"
        >
          <option value="latest">최신 등록순</option>
          <option value="deadline">마감 임박순</option>
        </select>
      </section>

      {/* 프로젝트 목록 */}
      <section className="projects-list">
        <div className="projects-list-heading">
          <h2>모집 중인 프로젝트</h2>
          <span>총 {filteredProjects.length}개</span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <Link
                to={`/projects/${project.id}`}
                className="project-card"
                key={project.id}
              >
                <div className="project-card-header">
                  <span className="project-category">
                    {project.category}
                  </span>

                  <span className="project-status">
                    {project.status || '모집 중'}
                  </span>
                </div>

                <h3>{project.title}</h3>

                <p className="project-description">
                  {project.description}
                </p>

                <div className="project-roles">
                  {project.roles.map((role) => (
                    <span
                      className="project-role-tag"
                      key={role.name}
                    >
                      {role.name} {role.count}명
                    </span>
                  ))}
                </div>

                <div className="project-card-info">
                  <span>
                    <Users size={15} />
                    {project.currentMembers}/{project.maxMembers}명
                  </span>

                  <span>
                    <MapPin size={15} />
                    {project.method}
                  </span>
                </div>

                <div className="project-card-footer">
                  <span>
                    <CalendarDays size={14} />
                    마감 D-{project.deadlineDays}
                  </span>

                  <strong>자세히 보기 →</strong>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="projects-empty">
            검색 조건에 맞는 프로젝트가 없습니다.
          </div>
        )}
      </section>
    </main>
  )
}

export default ProjectsPage
