import api from './apiClient.js'

export const chatsApi = {
  async list() {
    const result = await api.get('/chats')
    return Array.isArray(result) ? result : []
  },
  async get(id) {
    return api.get(`/chats/${Number(id)}`)
  },
  async createOrGet({ contextType, contextId, participantUserId }) {
    return api.post('/chats', {
      contextType,
      contextId: Number(contextId),
      participantUserId: Number(participantUserId),
    })
  },
  async messages(id, { cursor, size = 30 } = {}) {
    const result = await api.get(`/chats/${Number(id)}/messages`, { query: { cursor, size } })
    return Array.isArray(result) ? result : []
  },
  async send(id, message) {
    return api.post(`/chats/${Number(id)}/messages`, { message: String(message).trim() })
  },
  async markRead(id) {
    return api.post(`/chats/${Number(id)}/read`, {})
  },
}
