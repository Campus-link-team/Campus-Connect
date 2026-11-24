import api from './apiClient.js'

export function mapProject(raw = {}) {
  const status = raw.recruitmentStatus || raw.status || 'RECRUITING'
  return {
    ...raw,
    id: Number(raw.id),
    description: raw.content || '',
    currentMembers: Number(raw.currentApplicantCount || 0),
    maxMembers: Number(raw.capacity || 0),
    status,
    statusLabel: status === 'RECRUITING' ? '모집 중' : status === 'CLOSED' ? '모집 마감' : status,
    authorId: raw.writerId == null ? null : Number(raw.writerId),
    authorName: raw.writerNickname || '',
    location: raw.location || '',
    deadline: raw.endDate || '',
  }
}

function mapList(value) {
  return Array.isArray(value) ? value.map(mapProject) : []
}

export const projectsApi = {
  async list({ category, status } = {}) {
    const result = await api.get('/projects', {
      query: { category, status: status || undefined },
    })
    return mapList(result)
  },
  async get(id) {
    const result = await api.get(`/projects/${Number(id)}`)
    return result ? mapProject(result) : null
  },
  async create(data) {
    // develop 브랜치의 현재 생성 DTO가 실제로 받는 필드만 전달합니다.
    return api.post('/projects', {
      title: String(data.title || '').trim(),
      content: String(data.content ?? data.description ?? '').trim(),
      capacity: Number(data.capacity ?? data.maxMembers),
      category: data.category,
      location: String(data.location || '').trim(),
    })
  },
  async update(id, data) {
    const payload = {
      title: String(data.title || '').trim(),
      content: String(data.content ?? data.description ?? '').trim(),
      capacity: Number(data.capacity ?? data.maxMembers),
      category: data.category,
      location: String(data.location || '').trim(),
    }
    await api.patch(`/projects/${Number(id)}`, payload)
    return this.get(id)
  },
  async remove(id) {
    return api.delete(`/projects/${Number(id)}`)
  },
  async close(id) {
    return api.patch(`/projects/${Number(id)}/close`, {})
  },
  async apply(id, { roleName, introduction }) {
    return api.post(`/projects/${Number(id)}/applications`, {
      roleName: String(roleName || '').trim(),
      introduction: String(introduction || '').trim(),
    })
  },
  async applications(id) {
    const result = await api.get(`/projects/${Number(id)}/applications`)
    return Array.isArray(result) ? result : []
  },
  async updateApplication(id, applicationId, status) {
    return api.patch(`/projects/${Number(id)}/applications/${Number(applicationId)}`, { status })
  },
  async cancelApplication(id, applicationId) {
    return api.delete(`/projects/${Number(id)}/applications/${Number(applicationId)}`)
  },
  async mine() {
    return mapList(await api.get('/users/me/projects'))
  },
  async myApplications() {
    const result = await api.get('/users/me/applications')
    return Array.isArray(result) ? result : []
  },
}
