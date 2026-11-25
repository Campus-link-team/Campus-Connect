
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import {
  Bell,
  MessageCircle,
  ClipboardList,
  ShoppingBag,
  Star,
  CheckCheck,
  Trash2,
  ChevronRight,
} from 'lucide-react'

import { useAuth } from '../../context/useAuth.js'

import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../data/notificationStorage.js'

import './NotificationsPage.css'

function getNotificationIcon(type) {
  switch (type) {
    case 'chat':
      return MessageCircle
    case 'project_application':
    case 'project_approved':
    case 'project_rejected':
      return ClipboardList
    case 'transaction_completed':
      return ShoppingBag
    case 'review_received':
      return Star
    default:
      return Bell
  }
}

function formatNotificationDate(dateValue) {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NotificationsPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()

  const [notifications, setNotifications] = useState(() =>
    user ? getNotificationsForUser(user) : []
  )

  const unreadCount = getUnreadNotificationCount(user)

  if (!isLoggedIn || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: '/notifications' } }}
      />
    )
  }

  // 특정 알림 읽음 처리 후 관련 페이지로 이동
  function handleNotificationClick(notification) {
    try {
      if (!notification.isRead) {
        markNotificationAsRead(notification.id, user)

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        )
      }

      navigate(notification.link || '/')
    } catch (error) {
      console.error('알림 처리에 실패했습니다.', error)
      alert(error.message)
    }
  }

  // 전체 알림 읽음 처리
  function handleMarkAllAsRead() {
    try {
      markAllNotificationsAsRead(user)

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )
    } catch (error) {
      alert(error.message)
    }
  }

  // 알림 삭제
  function handleDelete(notificationId) {
    try {
      deleteNotification(notificationId, user)

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.id !== notificationId
        )
      )
    } catch (error) {
      alert(error.message)
    }
  }

  const Icon = Bell

  return (
    <main className="notifications-page">
      <div className="notifications-container">

        {/* 페이지 제목 */}
        <header className="notifications-header">
          <div>
            <span className="notifications-eyebrow">
              CAMPUSCONNECT NOTIFICATIONS
            </span>

            <h1>알림</h1>

            <p>
              프로젝트, 채팅, 거래에 관한 새로운 소식을 확인하세요.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-read-all"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={16} />
              모두 읽음
            </button>
          )}
        </header>

        {/* 알림 통계 */}
        <section className="notifications-summary">
          <div>
            <span>전체 알림</span>
            <strong>{notifications.length}</strong>
          </div>

          <div>
            <span>읽지 않은 알림</span>
            <strong>{unreadCount}</strong>
          </div>
        </section>

        {/* 알림 목록 */}
        <section className="notifications-list-section">
          <div className="notifications-list-heading">
            <h2>최근 알림</h2>
            <span>최신순</span>
          </div>

          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <Icon size={34} />
              </div>

              <h3>아직 알림이 없습니다.</h3>

              <p>
                새로운 채팅, 프로젝트 지원, 거래 소식이
                이곳에 표시됩니다.
              </p>

              <Link to="/">
                홈으로 돌아가기
              </Link>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(
                  notification.type
                )

                return (
                  <article
                    className={`notification-item ${
                      notification.isRead ? 'is-read' : 'is-unread'
                    }`}
                    key={notification.id}
                  >
                    <button
                      type="button"
                      className="notification-main"
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                    >
                      <div className="notification-icon">
                        <NotificationIcon size={21} />
                      </div>

                      <div className="notification-content">
                        <div className="notification-title-row">
                          <strong>{notification.title}</strong>

                          {!notification.isRead && (
                            <span className="notification-new">
                              NEW
                            </span>
                          )}
                        </div>

                        <p>{notification.message}</p>

                        <time>
                          {formatNotificationDate(notification.createdAt)}
                        </time>
                      </div>

                      <ChevronRight
                        className="notification-arrow"
                        size={18}
                      />
                    </button>

                    <button
                      type="button"
                      className="notification-delete"
                      onClick={() =>
                        handleDelete(notification.id)
                      }
                      aria-label="알림 삭제"
                      title="알림 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <p className="notifications-notice">
          현재 알림은 테스트용 브라우저 저장 방식으로 동작합니다.
          실제 서비스에서는 서버의 알림 데이터를 연동해야 합니다.
        </p>

      </div>
    </main>
  )
}

export default NotificationsPage

