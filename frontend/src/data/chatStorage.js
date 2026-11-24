
import { addNotification } from './notificationStorage.js'

const CHATS_KEY = 'campuslink_chats'

// 전체 채팅방 불러오기
export function getChats() {
  try {
    const savedChats = localStorage.getItem(CHATS_KEY)
    return savedChats ? JSON.parse(savedChats) : []
  } catch {
    return []
  }
}

// 채팅방 저장
function saveChats(chats) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}

// 사용자 또는 참여자의 고유 식별 키
function getParticipantKey(participant) {
  if (
    participant.id !== undefined &&
    participant.id !== null &&
    participant.id !== ''
  ) {
    return `id:${String(participant.id)}`
  }

  return `email:${String(participant.email || '').toLowerCase()}`
}

// 두 참여자가 같은 사용자인지 확인
function isSameParticipant(a, b) {
  if (!a || !b) return false

  if (a.id && b.id && String(a.id) === String(b.id)) {
    return true
  }

  return Boolean(
    a.email &&
    b.email &&
    a.email.toLowerCase() === b.email.toLowerCase()
  )
}

// 특정 사용자가 채팅방 참여자인지 확인
function findParticipant(chat, user) {
  return chat.participants?.find((participant) =>
    isSameParticipant(participant, user)
  )
}

// 중고책 채팅방 생성 또는 기존 채팅방 반환
export function getOrCreateBookChat(book, user) {
  if (!book || !user) {
    throw new Error('상품 정보 또는 사용자 정보가 없습니다.')
  }

  if (!user.id && !user.email) {
    throw new Error('로그인이 필요합니다.')
  }

  const seller = {
    id: book.sellerId ? String(book.sellerId) : '',
    email: book.sellerEmail || '',
    name: book.sellerName || '판매자',
  }

  if (!seller.id && !seller.email) {
    throw new Error('판매자 계정 정보가 연결되지 않은 상품입니다.')
  }

  if (isSameParticipant(user, seller)) {
    throw new Error('본인이 등록한 상품에는 채팅할 수 없습니다.')
  }

  const chats = getChats()

  // 동일 상품의 기존 채팅방 확인
  const existingChat = chats.find((chat) => {
    if (
      chat.type !== 'book' ||
      String(chat.bookId) !== String(book.id)
    ) {
      return false
    }

    const hasCurrentUser = chat.participants?.some((participant) =>
      isSameParticipant(participant, user)
    )

    const hasSeller = chat.participants?.some((participant) =>
      isSameParticipant(participant, seller)
    )

    return hasCurrentUser && hasSeller
  })

  if (existingChat) {
    return existingChat
  }

  const buyer = {
    id: String(user.id || ''),
    email: user.email || '',
    name: user.name || '구매자',
  }

  const chat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'book',
    bookId: book.id,
    bookTitle: book.title,
    bookPrice: book.price,
    participants: [buyer, seller],
    messages: [],
    unreadCounts: {
      [getParticipantKey(buyer)]: 0,
      [getParticipantKey(seller)]: 0,
    },
    lastMessage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  chats.push(chat)
  saveChats(chats)

  return chat
}

// 특정 채팅방 조회
export function getChatById(chatId) {
  return getChats().find((chat) => chat.id === chatId) || null
}

// 특정 사용자의 채팅방 목록
export function getChatsForUser(user) {
  if (!user) return []

  return getChats()
    .filter((chat) => findParticipant(chat, user))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

// 특정 채팅방 메시지 조회
export function getMessages(chatId) {
  const chat = getChatById(chatId)
  return chat?.messages || []
}

// 메시지 전송
export function sendMessage(chatId, user, content) {
  const messageContent = String(content || '').trim()

  if (!messageContent) {
    throw new Error('메시지를 입력해 주세요.')
  }

  const chats = getChats()
  const chatIndex = chats.findIndex((item) => item.id === chatId)

  if (chatIndex === -1) {
    throw new Error('채팅방을 찾을 수 없습니다.')
  }

  const chat = chats[chatIndex]
  const sender = findParticipant(chat, user)

  if (!sender) {
    throw new Error('이 채팅방에 참여할 권한이 없습니다.')
  }

  const senderKey = getParticipantKey(sender)

  const message = {
    id: `message_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    chatId,
    senderId: user.id ? String(user.id) : '',
    senderName: user.name || '사용자',
    content: messageContent,
    createdAt: new Date().toISOString(),
    readBy: [senderKey],
  }

  chat.messages = [...(chat.messages || []), message]
  chat.lastMessage = messageContent
  chat.updatedAt = message.createdAt
  chat.unreadCounts = chat.unreadCounts || {}

  // 발신자는 읽음 상태, 상대방은 읽지 않은 메시지로 처리
  chat.participants.forEach((participant) => {
    const participantKey = getParticipantKey(participant)

    if (participantKey === senderKey) {
      chat.unreadCounts[participantKey] = 0
    } else {
      chat.unreadCounts[participantKey] =
        (chat.unreadCounts[participantKey] || 0) + 1
    }
  })

  chats[chatIndex] = chat
  saveChats(chats)

  // 상대방에게 새 메시지 알림 생성
  chat.participants.forEach((participant) => {
    if (isSameParticipant(participant, sender)) return

    try {
      addNotification({
        recipient: participant,
        actor: user,
        type: 'chat',
        title: '새 메시지가 도착했습니다.',
        message: `${user.name || '사용자'}님이 메시지를 보냈습니다.`,
        link: `/chats/${chat.id}`,
        relatedId: chat.id,
      })
    } catch (error) {
      // 알림 저장 실패가 메시지 전송 자체를 막지 않도록 처리
      console.error('채팅 알림 생성에 실패했습니다.', error)
    }
  })

  return message
}

// 채팅방 읽음 처리
export function markChatAsRead(chatId, user) {
  const chats = getChats()
  const chatIndex = chats.findIndex((item) => item.id === chatId)

  if (chatIndex === -1) return null

  const chat = chats[chatIndex]
  const participant = findParticipant(chat, user)

  if (!participant) return null

  const participantKey = getParticipantKey(participant)

  chat.unreadCounts = chat.unreadCounts || {}
  chat.unreadCounts[participantKey] = 0

  chat.messages = (chat.messages || []).map((message) => ({
    ...message,
    readBy: message.senderId === String(user.id)
      ? message.readBy || []
      : [...new Set([...(message.readBy || []), participantKey])],
  }))

  chats[chatIndex] = chat
  saveChats(chats)

  return chat
}

// 읽지 않은 메시지 총개수
export function getUnreadChatCount(user) {
  if (!user) return 0

  return getChats().reduce((total, chat) => {
    const participant = findParticipant(chat, user)

    if (!participant) return total

    const key = getParticipantKey(participant)
    return total + (chat.unreadCounts?.[key] || 0)
  }, 0)
}

// 프로젝트 채팅방 생성 또는 기존 채팅방 반환
export function getOrCreateProjectChat(project, user, otherParticipant) {
  if (!project || !user || !otherParticipant) {
    throw new Error('프로젝트 또는 사용자 정보가 없습니다.')
  }

  if (
    (!user.id && !user.email) ||
    (!otherParticipant.id && !otherParticipant.email)
  ) {
    throw new Error('참여자 계정 정보가 없습니다.')
  }

  if (isSameParticipant(user, otherParticipant)) {
    throw new Error('본인과는 채팅할 수 없습니다.')
  }

  const chats = getChats()

  // 동일 프로젝트의 동일한 두 사용자 간 기존 채팅방 확인
  const existingChat = chats.find((chat) => {
    if (
      chat.type !== 'project' ||
      String(chat.projectId) !== String(project.id)
    ) {
      return false
    }

    const hasCurrentUser = chat.participants?.some((participant) =>
      isSameParticipant(participant, user)
    )

    const hasOtherUser = chat.participants?.some((participant) =>
      isSameParticipant(participant, otherParticipant)
    )

    return hasCurrentUser && hasOtherUser
  })

  if (existingChat) {
    return existingChat
  }

  const currentParticipant = {
    id: String(user.id || ''),
    email: user.email || '',
    name: user.name || '사용자',
  }

  const other = {
    id: String(otherParticipant.id || ''),
    email: otherParticipant.email || '',
    name: otherParticipant.name || '참여자',
  }

  const chat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'project',
    projectId: project.id,
    projectTitle: project.title || '프로젝트',
    participants: [currentParticipant, other],
    messages: [],
    unreadCounts: {
      [getParticipantKey(currentParticipant)]: 0,
      [getParticipantKey(other)]: 0,
    },
    lastMessage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  chats.push(chat)
  saveChats(chats)

  return chat
}
