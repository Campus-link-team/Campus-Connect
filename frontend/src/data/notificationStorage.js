
const STORAGE_KEY = 'campuslink_notifications'

// 사용자 식별 정보 비교
function isSameUser(a, b) {
  if (!a || !b) return false

  if (a.id && b.id) {
    return String(a.id) === String(b.id)
  }

  return Boolean(
    a.email &&
    b.email &&
    a.email.toLowerCase() === b.email.toLowerCase()
  )
}

// 전체 알림 불러오기
export function getNotifications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) return []

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('알림 목록을 불러오지 못했습니다.', error)
    return []
  }
}

// 알림 저장
function saveNotifications(notifications) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    )
  } catch (error) {
    console.error('알림 저장에 실패했습니다.', error)
    throw new Error('알림을 저장할 수 없습니다.', { cause: error })
  }
}

// 새로운 알림 생성
export function addNotification(notificationData) {
  const {
    recipient,
    actor,
    type,
    title,
    message,
    link = '/',
    relatedId = null,
  } = notificationData || {}

  if (!recipient || (!recipient.id && !recipient.email)) {
    throw new Error('알림을 받을 사용자 정보가 없습니다.')
  }

  if (!type || !title || !message) {
    throw new Error('알림 정보가 올바르지 않습니다.')
  }

  const notifications = getNotifications()

  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

    recipientId: String(recipient.id || ''),
    recipientEmail: recipient.email || '',

    actorId: String(actor?.id || ''),
    actorEmail: actor?.email || '',
    actorName: actor?.name || 'CampusConnect',

    type,
    title,
    message,
    link,
    relatedId,

    isRead: false,
    createdAt: new Date().toISOString(),
  }

  saveNotifications([notification, ...notifications])

  return notification
}

// 특정 사용자의 알림 목록
export function getNotificationsForUser(user) {
  if (!user) return []

  return getNotifications()
    .filter((notification) =>
      isSameUser(
        {
          id: notification.recipientId,
          email: notification.recipientEmail,
        },
        user
      )
    )
    .sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
}

// 특정 사용자의 읽지 않은 알림 개수
export function getUnreadNotificationCount(user) {
  if (!user) return 0

  return getNotificationsForUser(user)
    .filter((notification) => !notification.isRead)
    .length
}

// 알림 하나 읽음 처리
export function markNotificationAsRead(notificationId, user) {
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const notifications = getNotifications()

  const index = notifications.findIndex(
    (notification) =>
      String(notification.id) === String(notificationId)
  )

  if (index === -1) {
    throw new Error('알림을 찾을 수 없습니다.')
  }

  const notification = notifications[index]

  if (
    !isSameUser(
      {
        id: notification.recipientId,
        email: notification.recipientEmail,
      },
      user
    )
  ) {
    throw new Error('해당 알림에 접근할 권한이 없습니다.')
  }

  notifications[index] = {
    ...notification,
    isRead: true,
    readAt: new Date().toISOString(),
  }

  saveNotifications(notifications)

  return notifications[index]
}

// 모든 알림 읽음 처리
export function markAllNotificationsAsRead(user) {
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const notifications = getNotifications()
  const now = new Date().toISOString()

  const updatedNotifications = notifications.map((notification) => {
    const isRecipient = isSameUser(
      {
        id: notification.recipientId,
        email: notification.recipientEmail,
      },
      user
    )

    if (!isRecipient || notification.isRead) {
      return notification
    }

    return {
      ...notification,
      isRead: true,
      readAt: now,
    }
  })

  saveNotifications(updatedNotifications)

  return updatedNotifications
}

// 알림 삭제
export function deleteNotification(notificationId, user) {
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const notifications = getNotifications()

  const target = notifications.find(
    (notification) =>
      String(notification.id) === String(notificationId)
  )

  if (!target) {
    throw new Error('삭제할 알림을 찾을 수 없습니다.')
  }

  const isRecipient = isSameUser(
    {
      id: target.recipientId,
      email: target.recipientEmail,
    },
    user
  )

  if (!isRecipient) {
    throw new Error('해당 알림을 삭제할 권한이 없습니다.')
  }

  const updatedNotifications = notifications.filter(
    (notification) =>
      String(notification.id) !== String(notificationId)
  )

  saveNotifications(updatedNotifications)

  return true
}
