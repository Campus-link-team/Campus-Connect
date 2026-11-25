import api from './apiClient.js'

export const BOOK_STATUS = {
  '판매 중': 'ON_SALE',
  '예약 중': 'RESERVED',
  '판매 완료': 'SOLD',
}

export const BOOK_STATUS_LABEL = Object.fromEntries(
  Object.entries(BOOK_STATUS).map(([label, value]) => [value, label]),
)

export function mapBook(raw = {}) {
  return {
    ...raw,
    id: Number(raw.id),
    category: raw.category,
    categoryLabel: raw.category === 'MAJOR' ? '전공' : raw.category === 'GENERAL' ? '교양' : raw.category,
    status: BOOK_STATUS_LABEL[raw.status] || raw.status || '판매 중',
    statusCode: raw.status,
    seller: raw.seller ? { ...raw.seller, name: raw.seller.nickname } : null,
    buyer: raw.buyer ? { ...raw.buyer, name: raw.buyer.nickname } : null,
    createdAt: raw.createdAt,
  }
}

function mapList(value) {
  return Array.isArray(value) ? value.map(mapBook) : []
}

export const booksApi = {
  async list({ category, status, keyword } = {}) {
    const params = {
      category,
      status: status && status !== '전체' ? (BOOK_STATUS[status] || status) : undefined,
      keyword,
    }
    return mapList(await api.get('/books', { query: params }))
  },
  async get(id) {
    const result = await api.get(`/books/${Number(id)}`)
    return result ? mapBook(result) : null
  },
  async create(data) {
    const payload = {
      title: String(data.title || '').trim(),
      author: String(data.author || '').trim(),
      price: Number(data.price),
      category: data.category,
      description: String(data.description || '').trim(),
      tradePlace: data.tradePlace?.trim() || null,
    }
    return mapBook(await api.post('/books', payload))
  },
  async update(id, data) {
    const payload = {
      title: String(data.title || '').trim(),
      author: String(data.author || '').trim(),
      price: Number(data.price),
      category: data.category,
      description: String(data.description || '').trim(),
      tradePlace: String(data.tradePlace ?? '').trim(),
    }
    return mapBook(await api.patch(`/books/${Number(id)}`, payload))
  },
  async updateStatus(id, status, buyerId) {
    const payload = {
      status: BOOK_STATUS[status] || status,
      ...(buyerId ? { buyerId: Number(buyerId) } : {}),
    }
    const result = await api.patch(`/books/${Number(id)}/status`, payload)
    return result ? mapBook(result) : this.get(id)
  },
  async remove(id) {
    return api.delete(`/books/${Number(id)}`)
  },
  async toggleFavorite(id) {
    await api.post(`/books/${Number(id)}/favorite`)
    const favorites = await this.favorites()
    return favorites.some((book) => Number(book.id) === Number(id))
  },
  async favorites() {
    return mapList(await api.get('/users/me/favorites'))
  },
  async mine() {
    return mapList(await api.get('/users/me/books'))
  },
  async chatPartners(id) {
    const result = await api.get(`/books/${Number(id)}/chat-partners`)
    return Array.isArray(result) ? result.map((item) => ({ ...item, userId: Number(item.userId) })) : []
  },
}
