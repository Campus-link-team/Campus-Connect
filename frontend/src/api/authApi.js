import api, { setAccessToken, clearAccessToken, getAccessToken } from './apiClient.js'

const AUTH = '/auth'

export const authApi = {
  async sendEmailCode(email) {
    return api.post(`${AUTH}/email/send-code`, { email: email.trim().toLowerCase() }, { auth: false })
  },
  async verifyEmailCode(email, code) {
    return api.post(`${AUTH}/email/verify`, { email: email.trim().toLowerCase(), code: String(code).trim() }, { auth: false })
  },
  async checkNickname(nickname) {
    return api.get(`${AUTH}/nickname/check`, { query: { nickname: nickname.trim() }, auth: false })
  },
  async signup({ email, password, nickname, department }) {
    return api.post(`${AUTH}/signup`, {
      email: email.trim().toLowerCase(),
      password,
      nickname: nickname.trim(),
      ...(department?.trim() ? { department: department.trim() } : {}),
    }, { auth: false })
  },
  async login(email, password) {
    const result = await api.post(`${AUTH}/login`, {
      email: email.trim().toLowerCase(),
      password,
    }, { auth: false })
    if (!result?.accessToken) throw new Error('로그인 응답에 Access Token이 없습니다.')
    setAccessToken(result.accessToken)
    try {
      return await this.me()
    } catch (error) {
      clearAccessToken()
      throw error
    }
  },
  async me() {
    return api.get('/users/me')
  },
  hasSession() {
    return Boolean(getAccessToken())
  },
  logout() {
    clearAccessToken()
  },
}
