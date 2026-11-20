
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

import {
  getProjects,
  updateProject,
} from '../../data/projectStorage.js'

import './ProjectCreatePage.css'

const categories = [
  '개발',
  '디자인',
  '기획·창업',
  '스터디',
  '공모전',
  '기타',
]

const roleOptions = [
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

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDeadlineDays(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(`${deadline}T00:00:00`)

  return Math.max(
    0,
    Math.ceil(
      (deadlineDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    )
  )
}

function getDefaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function ProjectEditPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project] = useState(() =>
    getProjects().find(
      (item) => String(item.id) === projectId
    )
  )

  const [title, setTitle] = useState(project?.title || '')
  const [category, setCategory] = useState(project?.category || '개발')
  const [description, setDescription] = useState(
    project?.description || ''
  )

  const [duration, setDuration] = useState(
    project?.duration || ''
  )
  const [method, setMethod] = useState(
    project?.method || '온라인 / 오프라인'
  )
  const [location, setLocation] = useState(
    project?.location === '온라인' ? '' : project?.location || ''
  )
  const [activitySchedule, setActivitySchedule] = useState(
    project?.activitySchedule || ''
  )

  const [deadline, setDeadline] = useState(
    project?.deadlineDate || getDefaultDeadline()
  )

  const [recruitmentRoles, setRecruitmentRoles] = useState(() =>
    project
      ? project.roles.map((role) => ({ ...role }))
      : []
  )

  const [selectedRole, setSelectedRole] = useState('프론트엔드')
  const [roleCount, setRoleCount] = useState('1')
  const [roleDescription, setRoleDescription] = useState('')

  const [requirementsText, setRequirementsText] = useState(
    (project?.requirements || []).join('\n')
  )
  const [preferencesText, setPreferencesText] = useState(
    (project?.preferences || []).join('\n')
  )

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!project) {
    return (
      <main className="project-create-page">
        <h1>프로젝트를 찾을 수 없습니다.</h1>

        <Link to="/projects">
          프로젝트 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  // 기존 모집 역할 수정
  function handleRoleChange(index, field, value) {
    setRecruitmentRoles((previous) =>
      previous.map((role, roleIndex) => {
        if (roleIndex !== index) return role

        return {
          ...role,
          [field]: field === 'count'
            ? Number(value)
            : value,
        }
      })
    )
  }

  // 새로운 역할 추가
  function handleAddRole() {
    setError('')

    const count = Number(roleCount)

    if (!Number.isInteger(count) || count < 1 || count > 20) {
      setError('모집 인원은 1명 이상 20명 이하로 입력해 주세요.')
      return
    }

    const alreadyExists = recruitmentRoles.some(
      (role) => role.name === selectedRole
    )

    if (alreadyExists) {
      setError('이미 추가한 모집 역할입니다.')
      return
    }

    setRecruitmentRoles((previous) => [
      ...previous,
      {
        name: selectedRole,
        count,
        filled: 0,
        description: roleDescription.trim(),
      },
    ])

    setRoleCount('1')
    setRoleDescription('')
  }

  // 역할 삭제
  function handleRemoveRole(roleName) {
    setRecruitmentRoles((previous) =>
      previous.filter((role) => role.name !== roleName)
    )
  }

  // 프로젝트 수정
  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (title.trim().length < 2) {
      setError('프로젝트 제목을 2자 이상 입력해 주세요.')
      return
    }

    if (!description.trim()) {
      setError('프로젝트 소개를 입력해 주세요.')
      return
    }

    if (recruitmentRoles.length === 0) {
      setError('최소 한 개 이상의 모집 역할이 필요합니다.')
      return
    }

    const invalidRole = recruitmentRoles.find(
      (role) =>
        !Number.isInteger(Number(role.count)) ||
        role.count < 1 ||
        role.count < (role.filled || 0)
    )

    if (invalidRole) {
      setError(
        `${invalidRole.name}의 모집 인원은 현재 충원 인원보다 적을 수 없습니다.`
      )
      return
    }

    if (!duration.trim() || !activitySchedule.trim()) {
      setError('진행 기간과 활동 일정을 입력해 주세요.')
      return
    }

    if (method !== '온라인' && !location.trim()) {
      setError('오프라인 활동 장소를 입력해 주세요.')
      return
    }

    if (!deadline || deadline < getTodayDate()) {
      setError('모집 마감일은 오늘 이후로 설정해 주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const currentMembers = project.currentMembers || 1

      // 현재 충원 인원을 유지하면서 전체 모집 인원을 계산
      const remainingSlots = recruitmentRoles.reduce(
        (total, role) =>
          total + Number(role.count) - (role.filled || 0),
        0
      )

      const updatedProject = updateProject(project.id, {
        title: title.trim(),
        category,
        description: description.trim(),
        roles: recruitmentRoles.map((role) => ({
          ...role,
          count: Number(role.count),
        })),

        currentMembers,
        maxMembers: currentMembers + remainingSlots,

        duration: duration.trim(),
        method,
        location: method === '온라인' ? '온라인' : location.trim(),
        activitySchedule: activitySchedule.trim(),

        deadlineDate: deadline,
        deadlineDays: getDeadlineDays(deadline),

        requirements: requirementsText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),

        preferences: preferencesText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })

      navigate(`/projects/${updatedProject.id}`)
    } catch (submitError) {
      console.error(submitError)
      setError(
        submitError.message || '프로젝트 수정에 실패했습니다.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="project-create-page">
      <Link
        to={`/projects/${project.id}`}
        className="project-create-back"
      >
        <ArrowLeft size={17} />
        프로젝트 상세로
      </Link>

      <div className="project-create-heading">
        <span>CAMPUS PROJECT</span>
        <h1>프로젝트 모집글 수정</h1>
        <p>변경할 프로젝트 정보를 수정해 주세요.</p>
      </div>

      <form
        className="project-create-form"
        onSubmit={handleSubmit}
      >
        <section className="project-form-section">
          <h2>프로젝트 기본 정보</h2>

          <div className="project-form-field">
            <label htmlFor="edit-project-title">
              프로젝트 제목 *
            </label>

            <input
              id="edit-project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="project-form-field">
            <label htmlFor="edit-project-category">
              프로젝트 분야 *
            </label>

            <select
              id="edit-project-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="project-form-field">
            <label htmlFor="edit-project-description">
              프로젝트 소개 *
            </label>

            <textarea
              id="edit-project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              maxLength={2000}
              required
            />
          </div>
        </section>

        <section className="project-form-section">
          <h2>모집 역할 *</h2>

          <p className="project-form-description">
            기존 역할의 인원과 설명을 수정하거나 새로운 역할을 추가할 수 있습니다.
          </p>

          <div className="project-role-added">
            {recruitmentRoles.map((role, index) => (
              <div
                className="project-edit-role"
                key={role.name}
              >
                <div className="project-edit-role-heading">
                  <strong>{role.name}</strong>

                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role.name)}
                    disabled={(role.filled || 0) > 0}
                    title={
                      (role.filled || 0) > 0
                        ? '이미 충원된 역할은 삭제할 수 없습니다.'
                        : '역할 삭제'
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="project-form-field">
                  <label htmlFor={`edit-role-count-${index}`}>
                    모집 인원
                  </label>

                  <input
                    id={`edit-role-count-${index}`}
                    type="number"
                    min={Math.max(1, role.filled || 0)}
                    max="20"
                    value={role.count}
                    onChange={(event) =>
                      handleRoleChange(index, 'count', event.target.value)
                    }
                  />

                  <span className="project-form-help">
                    현재 충원: {role.filled || 0}명
                  </span>
                </div>

                <div className="project-form-field">
                  <label htmlFor={`edit-role-description-${index}`}>
                    역할 상세 설명
                  </label>

                  <input
                    id={`edit-role-description-${index}`}
                    value={role.description || ''}
                    onChange={(event) =>
                      handleRoleChange(
                        index,
                        'description',
                        event.target.value
                      )
                    }
                    maxLength={150}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="project-role-editor">
            <div className="project-form-field">
              <label htmlFor="add-role-name">새 역할</label>

              <select
                id="add-role-name"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="project-form-field">
              <label htmlFor="add-role-count">인원</label>

              <input
                id="add-role-count"
                type="number"
                min="1"
                max="20"
                value={roleCount}
                onChange={(event) => setRoleCount(event.target.value)}
              />
            </div>

            <div className="project-form-field">
              <label htmlFor="add-role-description">상세 설명</label>

              <input
                id="add-role-description"
                placeholder="역할 설명"
                value={roleDescription}
                onChange={(event) =>
                  setRoleDescription(event.target.value)
                }
              />
            </div>

            <button
              type="button"
              className="project-role-add-button"
              onClick={handleAddRole}
            >
              <Plus size={17} />
              역할 추가
            </button>
          </div>
        </section>

        <section className="project-form-section">
          <h2>활동 정보</h2>

          <div className="project-form-field">
            <label htmlFor="edit-duration">진행 기간 *</label>

            <input
              id="edit-duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
            />
          </div>

          <div className="project-form-field">
            <label>진행 방식 *</label>

            <div className="project-method-options">
              {['온라인', '오프라인', '온라인 / 오프라인'].map(
                (item) => (
                  <label
                    className={`project-method-option ${
                      method === item ? 'is-selected' : ''
                    }`}
                    key={item}
                  >
                    <input
                      type="radio"
                      name="edit-project-method"
                      value={item}
                      checked={method === item}
                      onChange={(event) => setMethod(event.target.value)}
                    />
                    {item}
                  </label>
                )
              )}
            </div>
          </div>

          {method !== '온라인' && (
            <div className="project-form-field">
              <label htmlFor="edit-location">활동 장소 *</label>

              <input
                id="edit-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
              />
            </div>
          )}

          <div className="project-form-field">
            <label htmlFor="edit-schedule">활동 일정 *</label>

            <input
              id="edit-schedule"
              value={activitySchedule}
              onChange={(event) =>
                setActivitySchedule(event.target.value)
              }
              required
            />
          </div>

          <div className="project-form-field">
            <label htmlFor="edit-deadline">모집 마감일 *</label>

            <input
              id="edit-deadline"
              type="date"
              min={getTodayDate()}
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </div>
        </section>

        <section className="project-form-section">
          <h2>지원 조건</h2>

          <div className="project-form-field">
            <label htmlFor="edit-requirements">필수 조건</label>

            <textarea
              id="edit-requirements"
              value={requirementsText}
              onChange={(event) =>
                setRequirementsText(event.target.value)
              }
              rows={4}
            />
          </div>

          <div className="project-form-field">
            <label htmlFor="edit-preferences">우대 사항</label>

            <textarea
              id="edit-preferences"
              value={preferencesText}
              onChange={(event) =>
                setPreferencesText(event.target.value)
              }
              rows={4}
            />
          </div>
        </section>

        {error && (
          <div className="project-form-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="project-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '수정 중...' : '수정 완료'}
        </button>

        <p className="project-form-notice">
          수정 내용은 현재 사용하는 브라우저에 저장됩니다.
        </p>
      </form>
    </main>
  )
}

export default ProjectEditPage
