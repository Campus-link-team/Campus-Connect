
import { getProjects, updateProject } from './projectStorage.js'

const STORAGE_KEY = 'campuslink_project_applications'

// 지원 내역 불러오기
export function getApplications() {
  try {
    const savedApplications = localStorage.getItem(STORAGE_KEY)

    if (!savedApplications) {
      return []
    }

    const parsedApplications = JSON.parse(savedApplications)

    if (!Array.isArray(parsedApplications)) {
      return []
    }

    return parsedApplications
  } catch (error) {
    console.error('지원 내역을 불러오지 못했습니다.', error)
    return []
  }
}

// 특정 프로젝트의 지원자 목록 조회
export function getProjectApplications(projectId) {
  return getApplications().filter(
    (application) =>
      String(application.projectId) === String(projectId)
  )
}

// 프로젝트 참여 신청
export function addApplication(applicationData) {
  const applications = getApplications()
  const projects = getProjects()

  const project = projects.find(
    (item) => String(item.id) === String(applicationData.projectId)
  )

  if (!project) {
    throw new Error('프로젝트를 찾을 수 없습니다.')
  }

  if (project.status !== '모집 중') {
    throw new Error('현재 모집 중인 프로젝트가 아닙니다.')
  }

  const selectedRole = project.roles.find(
    (role) => role.name === applicationData.roleName
  )

  if (!selectedRole) {
    throw new Error('선택한 모집 역할을 찾을 수 없습니다.')
  }

  const filledCount = selectedRole.filled || 0

  if (filledCount >= selectedRole.count) {
    throw new Error('해당 역할은 모집이 완료되었습니다.')
  }

  const applicantId = applicationData.applicantId || 'test-user-1'

  // 동일 사용자의 중복 신청 방지
  const existingApplication = applications.find(
    (application) =>
      String(application.projectId) === String(applicationData.projectId) &&
      application.applicantId === applicantId &&
      application.status !== '거절'
  )

  if (existingApplication) {
    throw new Error('이미 이 프로젝트에 신청한 내역이 있습니다.')
  }

  const newApplication = {
    id: Date.now(),
    projectId: project.id,
    applicantId,
    applicantName: applicationData.applicantName || '테스트 지원자',
    applicantDepartment:
      applicationData.applicantDepartment || '소속 정보 미등록',
    roleName: applicationData.roleName,
    introduction: applicationData.introduction.trim(),
    status: '지원 대기',
    createdAt: new Date().toLocaleDateString('ko-KR'),
    createdOrder: Date.now(),
  }

  const updatedApplications = [
    ...applications,
    newApplication,
  ]

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedApplications)
    )

    return newApplication
  } catch (error) {
    console.error('지원 내역 저장에 실패했습니다.', error)
    throw new Error('지원 정보를 저장하지 못했습니다.')
  }
}

// 지원 승인 또는 거절
export function updateApplicationStatus(applicationId, newStatus) {
  if (!['승인', '거절'].includes(newStatus)) {
    throw new Error('올바르지 않은 지원 상태입니다.')
  }

  const applications = getApplications()

  const applicationIndex = applications.findIndex(
    (application) =>
      String(application.id) === String(applicationId)
  )

  if (applicationIndex === -1) {
    throw new Error('지원 내역을 찾을 수 없습니다.')
  }

  const application = applications[applicationIndex]

  if (application.status !== '지원 대기') {
    throw new Error('이미 처리된 지원 내역입니다.')
  }

  // 거절은 프로젝트 인원에 영향을 주지 않음
  if (newStatus === '거절') {
    const updatedApplications = [...applications]

    updatedApplications[applicationIndex] = {
      ...application,
      status: '거절',
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedApplications)
      )

      return updatedApplications[applicationIndex]
    } catch (error) {
      console.error('지원 상태 저장에 실패했습니다.', error)
      throw new Error('지원 상태를 저장하지 못했습니다.')
    }
  }

  // 승인 처리
  const projects = getProjects()

  const project = projects.find(
    (item) =>
      String(item.id) === String(application.projectId)
  )

  if (!project) {
    throw new Error('프로젝트를 찾을 수 없습니다.')
  }

  if (project.status !== '모집 중') {
    throw new Error('현재 모집 중인 프로젝트가 아닙니다.')
  }

  const selectedRole = project.roles.find(
    (role) => role.name === application.roleName
  )

  if (!selectedRole) {
    throw new Error('지원한 역할을 찾을 수 없습니다.')
  }

  const filledCount = selectedRole.filled || 0

  if (filledCount >= selectedRole.count) {
    throw new Error('해당 역할의 모집 인원이 모두 충원되었습니다.')
  }

  // 승인된 역할의 충원 인원 증가
  const updatedRoles = project.roles.map((role) => {
    if (role.name !== application.roleName) {
      return role
    }

    return {
      ...role,
      filled: (role.filled || 0) + 1,
    }
  })

  const currentMembers = (project.currentMembers || 0) + 1

  // 모든 역할의 인원이 충원되었는지 확인
  const allRolesFilled = updatedRoles.every(
    (role) => (role.filled || 0) >= role.count
  )

  // 프로젝트 정보 먼저 저장
  updateProject(project.id, {
    roles: updatedRoles,
    currentMembers,
    status: allRolesFilled ? '모집 완료' : '모집 중',
  })

  // 지원 상태 저장
  const updatedApplications = [...applications]

  updatedApplications[applicationIndex] = {
    ...application,
    status: '승인',
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedApplications)
    )

    return updatedApplications[applicationIndex]
  } catch (error) {
    console.error('지원 상태 저장에 실패했습니다.', error)
    throw new Error('지원 상태를 저장하지 못했습니다.')
  }
}
