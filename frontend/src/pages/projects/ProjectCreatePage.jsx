
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

import { addProject } from '../../data/projectStorage.js'
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

// 기본 마감일: 오늘부터 7일 뒤
function getDefaultDeadline() {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 마감일까지 남은 날짜 계산
function calculateDeadlineDays(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(`${deadline}T00:00:00`)

  return Math.max(
    0,
    Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
  )
}

function ProjectCreatePage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('개발')
  const [description, setDescription] = useState('')

  const [duration, setDuration] = useState('')
  const [method, setMethod] = useState('온라인 / 오프라인')
  const [location, setLocation] = useState('')
  const [activitySchedule, setActivitySchedule] = useState('')

  const [deadline, setDeadline] = useState(getDefaultDeadline())

  const [selectedRole, setSelectedRole] = useState('프론트엔드')
  const [roleCount, setRoleCount] = useState('1')
  const [roleDescription, setRoleDescription] = useState('')

  const [recruitmentRoles, setRecruitmentRoles] = useState([])

  const [requirementsText, setRequirementsText] = useState('')
  const [preferencesText, setPreferencesText] = useState('')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 모집 역할 추가
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

  // 모집 역할 삭제
  function handleRemoveRole(roleName) {
    setRecruitmentRoles((previous) =>
      previous.filter((role) => role.name !== roleName)
    )
  }

  // 프로젝트 등록
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
      setError('최소 한 개 이상의 모집 역할을 추가해 주세요.')
      return
    }

    if (!duration.trim()) {
      setError('프로젝트 진행 기간을 입력해 주세요.')
      return
    }

    if (!activitySchedule.trim()) {
      setError('활동 일정을 입력해 주세요.')
      return
    }

    if (method !== '온라인' && !location.trim()) {
      setError('오프라인 활동 장소를 입력해 주세요.')
      return
    }

    if (!deadline) {
      setError('모집 마감일을 선택해 주세요.')
      return
    }

    if (deadline < getTodayDate()) {
      setError('모집 마감일은 오늘 이후로 설정해 주세요.')
      return
    }

    const totalRecruitmentCount = recruitmentRoles.reduce(
      (total, role) => total + role.count,
      0
    )

    const newProjectData = {
      title: title.trim(),
      category,
      description: description.trim(),

      roles: recruitmentRoles,

      // 작성자도 최초 팀원으로 계산
      currentMembers: 1,
      maxMembers: totalRecruitmentCount + 1,

      duration: duration.trim(),
      method,
      location: method === '온라인' ? '온라인' : location.trim(),
      activitySchedule: activitySchedule.trim(),

      deadlineDate: deadline,
      deadlineDays: calculateDeadlineDays(deadline),

      authorName: '테스트 작성자',
      authorDepartment: '소속 정보 미등록',

      requirements: requirementsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),

      preferences: preferencesText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    try {
      setIsSubmitting(true)

      const newProject = addProject(newProjectData)

      navigate(`/projects/${newProject.id}`)
    } catch (submitError) {
      console.error(submitError)
      setError(
        submitError.message || '프로젝트 등록에 실패했습니다.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="project-create-page">
      <Link to="/projects" className="project-create-back">
        <ArrowLeft size={17} />
        프로젝트 목록으로
      </Link>

      <div className="project-create-heading">
        <span>CAMPUS PROJECT</span>
        <h1>프로젝트 모집글 작성</h1>
        <p>
          함께할 팀원을 찾기 위해 프로젝트 정보를 입력해 주세요.
        </p>
      </div>

      <form
        className="project-create-form"
        onSubmit={handleSubmit}
      >
        {/* 프로젝트 기본 정보 */}
        <section className="project-form-section">
          <h2>프로젝트 기본 정보</h2>

          <div className="project-form-field">
            <label htmlFor="project-title">
              프로젝트 제목 <span>*</span>
            </label>

            <input
              id="project-title"
              type="text"
              placeholder="예: 대학생 커뮤니티 웹 서비스 개발"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="project-form-field">
            <label htmlFor="project-category">
              프로젝트 분야 <span>*</span>
            </label>

            <select
              id="project-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              {categories.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="project-form-field">
            <label htmlFor="project-description">
              프로젝트 소개 <span>*</span>
            </label>

            <textarea
              id="project-description"
              placeholder="프로젝트의 목적, 진행 내용, 목표 등을 자세히 작성해 주세요."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              maxLength={2000}
              required
            />

            <span className="project-form-count">
              {description.length}/2000
            </span>
          </div>
        </section>

        {/* 모집 역할 */}
        <section className="project-form-section">
          <h2>모집 역할 <span>*</span></h2>

          <p className="project-form-description">
            필요한 역할을 선택하고 모집 인원을 설정해 주세요.
          </p>

          <div className="project-role-editor">
            <div className="project-form-field">
              <label htmlFor="recruitment-role">
                모집 역할
              </label>

              <select
                id="recruitment-role"
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
              <label htmlFor="recruitment-count">
                모집 인원
              </label>

              <input
                id="recruitment-count"
                type="number"
                min="1"
                max="20"
                step="1"
                value={roleCount}
                onChange={(event) => setRoleCount(event.target.value)}
              />
            </div>

            <div className="project-form-field">
              <label htmlFor="recruitment-description">
                역할 상세 설명
              </label>

              <input
                id="recruitment-description"
                type="text"
                placeholder="예: React 개발 경험자 우대"
                value={roleDescription}
                onChange={(event) => setRoleDescription(event.target.value)}
                maxLength={150}
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

          <div className="project-role-added">
            <h3>추가된 모집 역할 ({recruitmentRoles.length})</h3>

            {recruitmentRoles.length > 0 ? (
              recruitmentRoles.map((role) => (
                <div
                  className="project-role-added-item"
                  key={role.name}
                >
                  <div>
                    <strong>{role.name}</strong>
                    <span>{role.count}명 모집</span>

                    {role.description && (
                      <p>{role.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role.name)}
                    aria-label={`${role.name} 삭제`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))
            ) : (
              <p className="project-role-empty">
                아직 추가된 모집 역할이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* 활동 정보 */}
        <section className="project-form-section">
          <h2>활동 정보</h2>

          <div className="project-form-field">
            <label htmlFor="project-duration">
              진행 기간 <span>*</span>
            </label>

            <input
              id="project-duration"
              type="text"
              placeholder="예: 약 3개월"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="project-form-field">
            <label>진행 방식 <span>*</span></label>

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
                      name="project-method"
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
              <label htmlFor="project-location">
                활동 장소 <span>*</span>
              </label>

              <input
                id="project-location"
                type="text"
                placeholder="예: 삼육대학교 교내 또는 장소 협의"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="project-form-field">
            <label htmlFor="project-schedule">
              활동 일정 <span>*</span>
            </label>

            <input
              id="project-schedule"
              type="text"
              placeholder="예: 주 1~2회 팀 회의"
              value={activitySchedule}
              onChange={(event) => setActivitySchedule(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="project-form-field">
            <label htmlFor="project-deadline">
              모집 마감일 <span>*</span>
            </label>

            <input
              id="project-deadline"
              type="date"
              value={deadline}
              min={getTodayDate()}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </div>
        </section>

        {/* 지원 조건 */}
        <section className="project-form-section">
          <h2>지원 조건</h2>

          <div className="project-form-field">
            <label htmlFor="project-requirements">
              필수 조건
            </label>

            <textarea
              id="project-requirements"
              placeholder={'한 줄에 하나씩 작성해 주세요.\n정기적인 팀 회의 참여 가능자\n맡은 역할에 책임감이 있는 분'}
              value={requirementsText}
              onChange={(event) => setRequirementsText(event.target.value)}
              rows={4}
              maxLength={1000}
            />

            <span className="project-form-help">
              줄바꿈을 기준으로 각각의 조건이 등록됩니다.
            </span>
          </div>

          <div className="project-form-field">
            <label htmlFor="project-preferences">
              우대 사항
            </label>

            <textarea
              id="project-preferences"
              placeholder={'한 줄에 하나씩 작성해 주세요.\n관련 프로젝트 경험자\n협업 도구 사용 경험자'}
              value={preferencesText}
              onChange={(event) => setPreferencesText(event.target.value)}
              rows={4}
              maxLength={1000}
            />

            <span className="project-form-help">
              우대 사항은 선택 입력 항목입니다.
            </span>
          </div>
        </section>

        {/* 등록 오류 */}
        {error && (
          <div className="project-form-error" role="alert">
            {error}
          </div>
        )}

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="project-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '모집글 등록하기'}
        </button>

        <p className="project-form-notice">
          현재는 테스트용으로 이 브라우저에 프로젝트 정보가 저장됩니다.
        </p>
      </form>
    </main>
  )
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default ProjectCreatePage
