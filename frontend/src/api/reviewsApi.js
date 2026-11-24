import api from './apiClient.js'

export const reviewsApi = {
  async create(bookId, { rating, comment }) {
    return api.post(`/books/${Number(bookId)}/reviews`, {
      rating: Number(rating),
      comment: String(comment || '').trim(),
    })
  },
  async getForBook(bookId) {
    return api.get(`/books/${Number(bookId)}/reviews`)
  },
  async getForUser(userId) {
    const result = await api.get(`/users/${Number(userId)}/reviews`)
    return Array.isArray(result) ? result : []
  },
}
