
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, CheckCircle, Users } from 'lucide-react'

import { getProjects } from '../../data/projectStorage.js'
import { addApplication } from '../../data/projectApplicationStorage.js'

import './ProjectApplyPage.css'

function ProjectApplyPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const project = getProjects().find(
    (item) => String(item.id) === projectId
  )

  const [roleName, setRoleName] = useState('')
  const [applicantName, setApplicantName] = useState('테스트 지원자')
  const [department, setDepartment] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 아직 모집 중이고 인원이 남은 역할만 선택 가능
  const availableRoles = project
    ? project.roles.filter(
        (role) => (role.filled || 0) < role.count
      )
    : []

  // 프로젝트가 없는 경우
  if (!project) {
    return (
      <main className="project-apply-page">
        <div className="project-apply-empty">
          <h1>프로젝트를 찾을 수 없습니다.</h1>
          <Link to="/projects">프로젝트 목록으로 돌아가기</Link>
        </div>
      </main>
    )
  }

  const isRecruiting =
    project.status === '모집 중' &&
    availableRoles.length > 0

  // 지원서 제출
  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!applicantName.trim()) {
      setError('이름을 입력해 주세요.')
      return
    }

    if (!department.trim()) {
      setError('학과명을 입력해 주세요.')
      return
    }

    if (!roleName) {
      setError('지원할 역할을 선택해 주세요.')
      return
    }

    if (!introduction.trim()) {
      setError('지원 동기와 자기소개를 입력해 주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      addApplication({
        projectId: project.id,
        applicantId: 'test-user-1',
        applicantName: applicantName.trim(),
        applicantDepartment: department.trim(),
        roleName,
        introduction: introduction.trim(),
      })

      alert('프로젝트 참여 신청이 완료되었습니다.')

      navigate(`/projects/${project.id}`)
    } catch (submitError) {
      setError(
        submitError.message || '참여 신청에 실패했습니다.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="project-apply-page">
      <Link
        to={`/projects/${project.id}`}
        className="project-apply-back"
      >
        <ArrowLeft size={17} />
        프로젝트 상세로 돌아가기
      </Link>

      <div className="project-apply-heading">
        <span>CAMPUS PROJECT</span>
        <h1>프로젝트 참여 신청</h1>
        <p>
          지원 정보를 작성하고 프로젝트 참여를 신청해 보세요.
        </p>
      </div>

      {/* 신청할 프로젝트 */}
      <section className="project-apply-summary">
        <span className="project-apply-category">
          {project.category}
        </span>

        <h2>{project.title}</h2>

        <p>{project.description}</p>
      </section>

      {!isRecruiting ? (
        <section className="project-apply-closed">
          <h2>현재 신청할 수 있는 모집 역할이 없습니다.</h2>
          <p>모집이 종료되었거나 모든 역할의 인원이 충원되었습니다.</p>

          <Link to={`/projects/${project.id}`}>
            프로젝트 상세로 돌아가기
          </Link>
        </section>
      ) : (
        <form
          className="project-apply-form"
          onSubmit={handleSubmit}
        >
          {/* 지원자 정보 */}
          <section className="project-apply-section">
            <h2>지원자 정보</h2>

            <div className="project-apply-field">
              <label htmlFor="applicant-name">이름 *</label>

              <input
                id="applicant-name"
                type="text"
                value={applicantName}
                onChange={(event) =>
                  setApplicantName(event.target.value)
                }
                maxLength={30}
                required
              />
            </div>

            <div className="project-apply-field">
              <label htmlFor="applicant-department">학과명 *</label>

              <input
                id="applicant-department"
                type="text"
                placeholder="예: 컴퓨터공학부"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                maxLength={50}
                required
              />
            </div>
          </section>

          {/* 지원 역할 */}
          <section className="project-apply-section">
            <h2>지원 역할</h2>

            <p className="project-apply-description">
              현재 모집 중인 역할 중 하나를 선택해 주세요.
            </p>

            <div className="project-apply-role-list">
              {availableRoles.map((role) => {
                const remaining = role.count - (role.filled || 0)

                return (
                  <label
                    key={role.name}
                    className={`project-apply-role ${
                      roleName === role.name ? 'is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="application-role"
                      value={role.name}
                      checked={roleName === role.name}
                      onChange={(event) =>
                        setRoleName(event.target.value)
                      }
                    />

                    <div className="project-apply-role-info">
                      <strong>{role.name}</strong>

                      <span>
                        {role.description || '별도 설명 없음'}
                      </span>
                    </div>

                    <span className="project-apply-role-count">
                      <Users size={14} />
                      {remaining}명 모집
                    </span>
                  </label>
                )
              })}
            </div>
          </section>

          {/* 자기소개 및 지원 동기 */}
          <section className="project-apply-section">
            <h2>지원 내용</h2>

            <div className="project-apply-field">
              <label htmlFor="application-introduction">
                자기소개 및 지원 동기 *
              </label>

              <textarea
                id="application-introduction"
                rows={7}
                maxLength={1500}
                placeholder="본인의 경험과 프로젝트에 참여하고 싶은 이유를 작성해 주세요."
                value={introduction}
                onChange={(event) =>
                  setIntroduction(event.target.value)
                }
                required
              />

              <span className="project-apply-count">
                {introduction.length}/1500
              </span>
            </div>
          </section>

          {error && (
            <div className="project-apply-error" role="alert">
              {error}
            </div>
          )}

          <div className="project-apply-notice">
            <CheckCircle size={17} />
            <p>
              신청 후에는 작성자의 승인 여부에 따라 참여가 확정됩니다.
            </p>
          </div>

          <button
            type="submit"
            className="project-apply-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '신청 중...' : '참여 신청하기'}
          </button>

          <p className="project-apply-test-notice">
            현재는 테스트용 지원자 정보로 신청이 저장됩니다.
          </p>
        </form>
      )}
    </main>
  )
}

export default ProjectApplyPage
