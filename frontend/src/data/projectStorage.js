
import { sampleProjects } from './projects.js'

const STORAGE_KEY = 'campuslink_projects'

// 프로젝트 목록 불러오기
export function getProjects() {
  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY)

    if (!savedProjects) {
      return sampleProjects
    }

    const parsedProjects = JSON.parse(savedProjects)

    if (!Array.isArray(parsedProjects)) {
      return sampleProjects
    }

    return parsedProjects
  } catch (error) {
    console.error('프로젝트 목록을 불러오지 못했습니다.', error)
    return sampleProjects
  }
}

// 프로젝트 목록 저장
function saveProjects(projects) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects)
    )
  } catch (error) {
    console.error('프로젝트 저장에 실패했습니다.', error)
    throw new Error('프로젝트 정보를 저장하지 못했습니다.')
  }
}

// 프로젝트 등록
export function addProject(projectData) {
  const projects = getProjects()

  const newProject = {
    ...projectData,
    id: Date.now(),
    createdAt: new Date().toLocaleDateString('ko-KR'),
    createdOrder: Date.now(),
    status: '모집 중',
  }

  saveProjects([newProject, ...projects])

  return newProject
}

// 프로젝트 수정
export function updateProject(projectId, updatedData) {
  const projects = getProjects()

  const index = projects.findIndex(
    (project) => String(project.id) === String(projectId)
  )

  if (index === -1) {
    throw new Error('수정할 프로젝트를 찾을 수 없습니다.')
  }

  const updatedProject = {
    ...projects[index],
    ...updatedData,
    id: projects[index].id,
  }

  const updatedProjects = [...projects]
  updatedProjects[index] = updatedProject

  saveProjects(updatedProjects)

  return updatedProject
}

// 프로젝트 삭제
export function deleteProject(projectId) {
  const projects = getProjects()

  const updatedProjects = projects.filter(
    (project) => String(project.id) !== String(projectId)
  )

  if (projects.length === updatedProjects.length) {
    throw new Error('삭제할 프로젝트를 찾을 수 없습니다.')
  }

  saveProjects(updatedProjects)

  return true
}
