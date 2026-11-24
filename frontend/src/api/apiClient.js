/**
 * CampusConnect 공통 API 클라이언트
 *
 * 기본 API 경로: /api/v1
 *
 * 환경변수 VITE_API_BASE_URL 설정 예시:
 * VITE_API_BASE_URL=http://localhost:8080
 *
 * 서버 응답 규칙:
 * 성공: { "data": ... }
 * 실패: { "error": { "message": "..." } }
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const API_VERSION_PATH = '/api/v1'
const ACCESS_TOKEN_KEY = 'campuslink_access_token'

function getBaseUrl() {
  if (!API_BASE_URL) {
    return API_VERSION_PATH
  }

  if (API_BASE_URL.endsWith(API_VERSION_PATH)) {
    return API_BASE_URL
  }

  return `${API_BASE_URL}${API_VERSION_PATH}`
}

const BASE_URL = getBaseUrl()

/** 저장된 Access Token 가져오기 */
export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

/** 로그인 성공 후 Access Token 저장 */
export function setAccessToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('유효한 Access Token이 필요합니다.')
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    throw new Error('로그인 토큰을 브라우저에 저장하지 못했습니다.')
  }
}

/** 로그아웃 또는 인증 만료 시 Access Token 제거 */
export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('로그인 토큰 제거에 실패했습니다.', error)
  }
}

/** 요청 URL 생성 및 Query Parameter 처리 */
function createRequestUrl(path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${BASE_URL}${normalizedPath}`, window.location.origin)

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return

      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item))
        })
      } else {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

/** 서버 응답 파싱 */
async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  // 본문을 한 번만 읽어 JSON과 일반 문자열 응답을 모두 안전하게 처리한다.
  const text = await response.text()
  if (!text) return null

  const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
  const isJson = contentType.includes('application/json') || contentType.includes('+json')

  if (isJson) {
    try {
      return JSON.parse(text)
    } catch {
      // 일부 API(예: 찜 토글)는 JSON envelope가 아닌 문자열을 반환한다.
      // 서버가 JSON Content-Type을 지정했더라도 원문을 반환해 호출부가 처리할 수 있게 한다.
      return text
    }
  }

  return text
}

/** 서버 오류 메시지 추출 */
function getErrorMessage(payload, status) {
  // ResponseEntity<String>처럼 오류 메시지를 문자열로 직접 반환하는 응답 처리
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim()
  }

  const serverMessage = payload?.error?.message

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  return `요청 처리에 실패했습니다. (HTTP ${status})`
}

/**
 * 공통 HTTP 요청 함수
 *
 * 성공 시:
 * { data: ... } 응답의 data 내부 값 반환
 *
 * 실패 시:
 * error.message를 포함한 Error 발생
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    query,
    headers: customHeaders = {},
    auth = true,
    ...fetchOptions
  } = options

  const headers = new Headers(customHeaders)
  const token = auth ? getAccessToken() : null

  // JWT 자동 첨부
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let requestBody = body

  // JSON 데이터 처리
  if (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  // FormData는 브라우저가 Content-Type을 자동 설정
  if (body instanceof FormData) {
    headers.delete('Content-Type')
  }

  headers.set('Accept', 'application/json')

  let response

  try {
    response = await fetch(createRequestUrl(path, query), {
      ...fetchOptions,
      method,
      headers,
      body: requestBody,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        '서버에 연결할 수 없습니다. 네트워크 상태와 서버 주소를 확인해 주세요.',
        { cause: error },
      )
    }

    throw error
  }

  const payload = await parseResponse(response)

  // HTTP 오류 처리
  if (!response.ok) {
    const message = getErrorMessage(payload, response.status)

    if (response.status === 401) {
      clearAccessToken()

      window.dispatchEvent(
        new CustomEvent('campusconnect:unauthorized'),
      )
    }

    const error = new Error(message)
    error.status = response.status
    error.payload = payload

    throw error
  }

  // 백엔드 응답 { data: ... } 처리
  if (
    payload &&
    typeof payload === 'object' &&
    Object.hasOwn(payload, 'data')
  ) {
    return payload.data
  }

  return payload
}

/** HTTP Method별 편의 함수 */
export const api = {
  get(path, options = {}) {
    return request(path, {
      ...options,
      method: 'GET',
    })
  },

  post(path, body, options = {}) {
    return request(path, {
      ...options,
      method: 'POST',
      body,
    })
  },

  patch(path, body, options = {}) {
    return request(path, {
      ...options,
      method: 'PATCH',
      body,
    })
  },

  put(path, body, options = {}) {
    return request(path, {
      ...options,
      method: 'PUT',
      body,
    })
  },

  delete(path, options = {}) {
    return request(path, {
      ...options,
      method: 'DELETE',
    })
  },
}

export default api