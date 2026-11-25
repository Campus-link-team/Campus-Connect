
const USERS_KEY = 'campuslink_users'
const CURRENT_USER_KEY = 'campuslink_current_user'

// 저장된 회원 목록 불러오기
export function getUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_KEY)

    if (!savedUsers) {
      return []
    }

    const users = JSON.parse(savedUsers)

    return Array.isArray(users) ? users : []
  } catch (error) {
    console.error('회원 정보를 불러오지 못했습니다.', error)
    return []
  }
}

// 현재 로그인한 사용자 정보 불러오기
export function getCurrentUser() {
  try {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY)

    if (!savedUser) {
      return null
    }

    return JSON.parse(savedUser)
  } catch (error) {
    console.error('로그인 정보를 불러오지 못했습니다.', error)
    return null
  }
}

// 비밀번호 해시 생성
// 실제 서비스에서는 서버에서 bcrypt 또는 Argon2 등을 사용해야 함
async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      '보안 비밀번호 저장을 지원하지 않는 환경입니다. localhost 또는 HTTPS에서 실행해 주세요.'
    )
  }

  const encodedPassword = new TextEncoder().encode(password)

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encodedPassword
  )

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// 민감한 정보가 제외된 사용자 객체 반환
function createPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  }
}

// 회원가입
export async function registerUser(userData) {
  const users = getUsers()

  const name = userData.name.trim()
  const email = userData.email.trim().toLowerCase()
  const department = userData.department.trim()
  const password = userData.password

  if (!name || !email || !department || !password) {
    throw new Error('모든 필수 정보를 입력해 주세요.')
  }

  if (!userData.emailVerified) {
    throw new Error('학교 이메일 인증을 완료해 주세요.')
  }

  if (password.length < 8) {
    throw new Error('비밀번호는 8자 이상 입력해 주세요.')
  }

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email
  )

  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  const passwordHash = await hashPassword(password)

  const newUser = {
    id: Date.now(),
    name,
    email,
    department,
    passwordHash,
    emailVerified: true,
    createdAt: new Date().toLocaleDateString('ko-KR'),
  }

  try {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([...users, newUser])
    )

    return createPublicUser(newUser)
  } catch (error) {
    console.error('회원가입 정보 저장에 실패했습니다.', error)
    throw new Error('회원 정보를 저장하지 못했습니다.', { cause: error })
  }
}

// 로그인
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase()

  const user = getUsers().find(
    (item) => item.email.toLowerCase() === normalizedEmail
  )

  if (!user) {
    throw new Error('이메일 또는 비밀번호를 확인해 주세요.')
  }

  const passwordHash = await hashPassword(password)

  if (user.passwordHash !== passwordHash) {
    throw new Error('이메일 또는 비밀번호를 확인해 주세요.')
  }

  if (!user.emailVerified) {
    throw new Error('학교 이메일 인증이 완료되지 않은 계정입니다.')
  }

  return createPublicUser(user)
}

// 로그인 상태 저장
export function saveCurrentUser(user) {
  try {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(createPublicUser(user))
    )
  } catch (error) {
    console.error('로그인 상태 저장에 실패했습니다.', error)
    throw new Error('로그인 상태를 저장하지 못했습니다.', { cause: error })
  }
}

// 로그아웃
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}
