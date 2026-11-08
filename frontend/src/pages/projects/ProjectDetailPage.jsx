
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Users,
  CalendarDays,
  MapPin,
  Clock,
  UserRound,
  CheckCircle,
  BriefcaseBusiness,
  Pencil,
  Trash2,
  ClipboardList,
} from 'lucide-react'

import {
  getProjects,
  updateProject,
  deleteProject,
} from '../../data/projectStorage.js'

import './ProjectDetailPage.css'

const projectStatuses = [
  '모집 중',
  '모집 완료',
  '모집 마감',
]

function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(() =>
    getProjects().find(
      (item) => String(item.id) === projectId
    )
  )

  const [error, setError] = useState('')

  // 프로젝트가 존재하는지 확인
  if (!project) {
    return (
      <main className="project-detail-page">
        <div className="project-detail-empty">
          <BriefcaseBusiness size={48} />

          <h2>프로젝트를 찾을 수 없습니다.</h2>

          <p>삭제되었거나 존재하지 않는 모집글입니다.</p>

          <Link to="/projects" className="project-detail-back">
            <ArrowLeft size={17} />
            프로젝트 목록으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  const currentMembers = project.currentMembers || 0
  const maxMembers = project.maxMembers || 0

  const progress = maxMembers > 0
    ? Math.min((currentMembers / maxMembers) * 100, 100)
    : 0

  // 모집 상태 확인
  const recruitmentClosed = project.status !== '모집 중'

  // 모집 가능한 역할이 남아 있는지 확인
  const hasAvailableRole = (project.roles || []).some(
    (role) => (role.filled || 0) < role.count
  )

  // 실제 참여 신청 가능 여부
  const canApply = !recruitmentClosed && hasAvailableRole

  // 모집 상태 변경
  function handleStatusChange(event) {
    const newStatus = event.target.value

    try {
      const updatedProject = updateProject(project.id, {
        status: newStatus,
      })

      setProject(updatedProject)
      setError('')
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  // 프로젝트 삭제
  function handleDelete() {
    const confirmed = window.confirm(
      '정말 이 프로젝트 모집글을 삭제하시겠습니까?\n삭제한 모집글은 복구할 수 없습니다.'
    )

    if (!confirmed) return

    try {
      deleteProject(project.id)
      alert('프로젝트 모집글이 삭제되었습니다.')
      navigate('/projects')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <main className="project-detail-page">

      {/* 목록으로 돌아가기 */}
      <Link to="/projects" className="project-detail-back">
        <ArrowLeft size={17} />
        프로젝트 목록
      </Link>

      {/* 프로젝트 제목 */}
      <section className="project-detail-header">
        <div className="project-detail-header-top">
          <span className="project-detail-category">
            {project.category}
          </span>

          <span
            className={`project-detail-status ${
              recruitmentClosed ? 'is-closed' : ''
            }`}
          >
            {project.status || '모집 중'}
          </span>
        </div>

        <h1>{project.title}</h1>

        <p>{project.description}</p>

        <div className="project-detail-author">
          <div className="project-detail-avatar">
            <UserRound size={21} />
          </div>

          <div>
            <strong>{project.authorName || '작성자'}</strong>
            <span>
              {project.authorDepartment || '소속 정보 미등록'}
            </span>
          </div>

          <span className="project-detail-created">
            등록일 {project.createdAt}
          </span>
        </div>
      </section>

      <div className="project-detail-content">

        <div className="project-detail-main">

          {/* 기본 정보 */}
          <section className="project-detail-section">
            <h2>프로젝트 기본 정보</h2>

            <div className="project-info-grid">

              <div className="project-info-item">
                <Clock size={19} />

                <div>
                  <span>진행 기간</span>
                  <strong>
                    {project.duration || '협의 가능'}
                  </strong>
                </div>
              </div>

              <div className="project-info-item">
                <MapPin size={19} />

                <div>
                  <span>진행 방식</span>
                  <strong>{project.method}</strong>
                </div>
              </div>

              <div className="project-info-item">
                <CalendarDays size={19} />

                <div>
                  <span>활동 일정</span>
                  <strong>
                    {project.activitySchedule || '협의 가능'}
                  </strong>
                </div>
              </div>

              <div className="project-info-item">
                <Users size={19} />

                <div>
                  <span>모집 인원</span>
                  <strong>
                    {currentMembers}/{maxMembers}명
                  </strong>
                </div>
              </div>

            </div>

            {project.method !== '온라인' && (
              <div className="project-location">
                <MapPin size={16} />
                활동 장소: {project.location || '장소 협의'}
              </div>
            )}
          </section>

          {/* 모집 역할 */}
          <section className="project-detail-section">
            <h2>모집 역할</h2>

            <p className="project-section-description">
              프로젝트에 필요한 역할과 모집 인원을 확인해 주세요.
            </p>

            <div className="project-detail-roles">
              {(project.roles || []).map((role) => {
                const filled = role.filled || 0
                const isRoleClosed = filled >= role.count

                return (
                  <div
                    className="project-detail-role"
                    key={role.name}
                  >
                    <div className="project-detail-role-header">
                      <strong>{role.name}</strong>

                      <span className={isRoleClosed ? 'is-filled' : ''}>
                        {isRoleClosed ? '모집 완료' : '모집 중'}
                      </span>
                    </div>

                    <p>
                      {role.description || '상세 설명이 없습니다.'}
                    </p>

                    <div className="project-detail-role-footer">
                      <span>모집 인원 {role.count}명</span>

                      <strong>
                        {filled}/{role.count}명 충원
                      </strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 프로젝트 소개 */}
          <section className="project-detail-section">
            <h2>프로젝트 소개</h2>

            <div className="project-detail-text">
              {project.description}
            </div>
          </section>

          {/* 지원 조건 */}
          <section className="project-detail-section">
            <h2>지원 조건</h2>

            <h3>필수 조건</h3>

            <ul className="project-requirements">
              {(project.requirements || []).map((item, index) => (
                <li key={index}>
                  <CheckCircle size={16} />
                  {item}
                </li>
              ))}
            </ul>

            <h3>우대 사항</h3>

            <ul className="project-requirements">
              {(project.preferences || []).map((item, index) => (
                <li key={index}>
                  <CheckCircle size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* 오른쪽 모집 현황 */}
        <aside className="project-detail-sidebar">

          <div className="project-recruitment-card">
            <h2>모집 현황</h2>

            <div className="project-recruitment-count">
              <strong>{currentMembers}</strong>
              <span> / {maxMembers}명</span>
            </div>

            <div className="project-progress">
              <div style={{ width: `${progress}%` }} />
            </div>

            <p>
              현재 {currentMembers}명이 함께하고 있습니다.
            </p>

            <div className="project-deadline">
              <CalendarDays size={17} />
              <span>마감까지</span>

              <strong>
                {project.deadlineDays >= 0
                  ? `D-${project.deadlineDays}`
                  : '마감'}
              </strong>
            </div>

            {/* 참여 신청 버튼 */}
            {canApply ? (
              <Link
                to={`/projects/${project.id}/apply`}
                className="project-apply-button"
              >
                프로젝트 참여 신청
              </Link>
            ) : (
              <button
                type="button"
                className="project-apply-button"
                disabled
              >
                모집이 종료되었습니다.
              </button>
            )}

            <span className="project-apply-notice">
              신청 후 작성자의 승인 여부에 따라 참여가 확정됩니다.
            </span>
          </div>

          <div className="project-author-card">
            <h3>모집 작성자</h3>

            <div className="project-author-profile">
              <div className="project-detail-avatar">
                <UserRound size={20} />
              </div>

              <div>
                <strong>{project.authorName || '작성자'}</strong>
                <span>
                  {project.authorDepartment || '소속 미등록'}
                </span>
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* 프로젝트 관리 */}
      <section className="project-management">

        <div className="project-management-heading">
          <div>
            <h2>모집글 관리</h2>
            <p>
              프로젝트 정보와 모집 상태를 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="project-management-status">
          <label htmlFor="project-status">
            모집 상태 변경
          </label>

          <select
            id="project-status"
            value={project.status || '모집 중'}
            onChange={handleStatusChange}
          >
            {projectStatuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="project-management-error" role="alert">
            {error}
          </p>
        )}

        <div className="project-management-actions">

          {/* 지원자 관리 버튼 */}
          <Link
            to={`/projects/${project.id}/applications`}
            className="project-edit-button"
          >
            <ClipboardList size={16} />
            지원자 관리
          </Link>

          {/* 모집글 수정 */}
          <Link
            to={`/projects/${project.id}/edit`}
            className="project-edit-button"
          >
            <Pencil size={16} />
            모집글 수정
          </Link>

          {/* 모집글 삭제 */}
          <button
            type="button"
            className="project-delete-button"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            모집글 삭제
          </button>

        </div>

        <p className="project-management-notice">
          현재는 테스트용 관리 기능입니다. 실제 서비스에서는 모집글 작성자만
          지원자 목록을 확인하고 수정 및 삭제할 수 있도록 인증을 적용할 예정입니다.
        </p>

      </section>
    </main>
  )
}

export default ProjectDetailPage
