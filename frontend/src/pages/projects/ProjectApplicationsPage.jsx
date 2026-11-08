
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Users,
  UserRound,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

import { getProjects } from '../../data/projectStorage.js'
import {
  getProjectApplications,
  updateApplicationStatus,
} from '../../data/projectApplicationStorage.js'

import './ProjectApplicationsPage.css'

function ProjectApplicationsPage() {
  const { projectId } = useParams()

  const [project, setProject] = useState(() =>
    getProjects().find(
      (item) => String(item.id) === String(projectId)
    )
  )

  const [applications, setApplications] = useState(() =>
    getProjectApplications(projectId).sort(
      (a, b) => (b.createdOrder || 0) - (a.createdOrder || 0)
    )
  )

  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  // 프로젝트가 존재하지 않는 경우
  if (!project) {
    return (
      <main className="project-applications-page">
        <div className="project-applications-empty">
          <h1>프로젝트를 찾을 수 없습니다.</h1>
          <Link to="/projects">프로젝트 목록으로 돌아가기</Link>
        </div>
      </main>
    )
  }

  const pendingCount = applications.filter(
    (application) => application.status === '지원 대기'
  ).length

  const approvedCount = applications.filter(
    (application) => application.status === '승인'
  ).length

  const rejectedCount = applications.filter(
    (application) => application.status === '거절'
  ).length

  // 지원 승인 또는 거절
  function handleStatusChange(application, newStatus) {
    const actionText = newStatus === '승인' ? '승인' : '거절'

    const confirmed = window.confirm(
      `${application.applicantName}님의 신청을 ${actionText}하시겠습니까?`
    )

    if (!confirmed) return

    try {
      setProcessingId(application.id)
      setError('')

      const updatedApplication = updateApplicationStatus(
        application.id,
        newStatus
      )

      // 지원 내역 갱신
      setApplications((previousApplications) =>
        previousApplications.map((item) =>
          String(item.id) === String(application.id)
            ? updatedApplication
            : item
        )
      )

      // 승인된 인원과 모집 상태 갱신
      const updatedProject = getProjects().find(
        (item) => String(item.id) === String(projectId)
      )

      if (updatedProject) {
        setProject(updatedProject)
      }
    } catch (statusError) {
      setError(
        statusError.message || '지원 상태 변경에 실패했습니다.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="project-applications-page">

      {/* 프로젝트 상세로 돌아가기 */}
      <Link
        to={`/projects/${project.id}`}
        className="project-applications-back"
      >
        <ArrowLeft size={17} />
        프로젝트 상세로 돌아가기
      </Link>

      {/* 페이지 제목 */}
      <header className="project-applications-header">
        <span>PROJECT MANAGEMENT</span>
        <h1>지원자 관리</h1>
        <p>
          프로젝트에 참여 신청한 학생들을 확인하고 승인 여부를 결정할 수 있습니다.
        </p>
      </header>

      {/* 프로젝트 정보 */}
      <section className="project-applications-summary">
        <div>
          <span className="project-applications-category">
            {project.category}
          </span>

          <h2>{project.title}</h2>

          <p>{project.description}</p>
        </div>

        <Link to={`/projects/${project.id}`}>
          모집글 보기
        </Link>
      </section>

      {/* 지원 현황 */}
      <section className="project-applications-stats">
        <div className="project-applications-stat">
          <Users size={19} />
          <span>전체 신청</span>
          <strong>{applications.length}명</strong>
        </div>

        <div className="project-applications-stat is-pending">
          <Clock size={19} />
          <span>승인 대기</span>
          <strong>{pendingCount}명</strong>
        </div>

        <div className="project-applications-stat is-approved">
          <CheckCircle size={19} />
          <span>승인</span>
          <strong>{approvedCount}명</strong>
        </div>

        <div className="project-applications-stat is-rejected">
          <XCircle size={19} />
          <span>거절</span>
          <strong>{rejectedCount}명</strong>
        </div>
      </section>

      {/* 현재 모집 인원 */}
      <section className="project-applications-member-status">
        <div>
          <span>현재 프로젝트 참여 인원</span>
          <strong>
            {project.currentMembers || 0} / {project.maxMembers || 0}명
          </strong>
        </div>

        <div className="project-applications-role-status">
          {(project.roles || []).map((role) => (
            <div key={role.name}>
              <span>{role.name}</span>
              <strong>
                {role.filled || 0}/{role.count}명
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* 오류 안내 */}
      {error && (
        <div className="project-applications-error" role="alert">
          {error}
        </div>
      )}

      {/* 지원자 목록 */}
      <section className="project-applications-list-section">
        <div className="project-applications-list-heading">
          <h2>지원자 목록</h2>
          <span>{applications.length}건</span>
        </div>

        {applications.length === 0 ? (
          <div className="project-applications-empty">
            <Users size={36} />
            <h3>아직 신청자가 없습니다.</h3>
            <p>새로운 학생이 프로젝트에 신청하면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="project-applications-list">
            {applications.map((application) => {
              const isPending = application.status === '지원 대기'
              const isProcessing = processingId === application.id

              return (
                <article
                  className="project-application-card"
                  key={application.id}
                >
                  <div className="project-application-card-header">
                    <div className="project-application-profile">
                      <div className="project-application-avatar">
                        <UserRound size={22} />
                      </div>

                      <div>
                        <strong>{application.applicantName}</strong>
                        <span>
                          {application.applicantDepartment || '소속 정보 미등록'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`project-application-status ${
                        application.status === '승인'
                          ? 'is-approved'
                          : application.status === '거절'
                            ? 'is-rejected'
                            : 'is-pending'
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="project-application-role">
                    지원 역할
                    <strong>{application.roleName}</strong>
                  </div>

                  <div className="project-application-introduction">
                    <h3>자기소개 및 지원 동기</h3>
                    <p>{application.introduction}</p>
                  </div>

                  <div className="project-application-footer">
                    <span>
                      신청일 {application.createdAt || '날짜 정보 없음'}
                    </span>

                    {isPending && (
                      <div className="project-application-actions">
                        <button
                          type="button"
                          className="project-application-reject"
                          onClick={() =>
                            handleStatusChange(application, '거절')
                          }
                          disabled={isProcessing}
                        >
                          거절
                        </button>

                        <button
                          type="button"
                          className="project-application-approve"
                          onClick={() =>
                            handleStatusChange(application, '승인')
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing ? '처리 중...' : '승인'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <p className="project-applications-notice">
        현재는 테스트용 관리 기능입니다. 실제 서비스에서는 프로젝트 작성자만
        지원자 목록을 확인하고 승인 또는 거절할 수 있도록 권한을 적용할 예정입니다.
      </p>

    </main>
  )
}

export default ProjectApplicationsPage
