import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, BookOpen, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { chatsApi } from '../../api/chatsApi.js'
import { booksApi } from '../../api/booksApi.js'
import { projectsApi } from '../../api/projectsApi.js'
import './ChatRoomPage.css'

function timeLabel(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
function dayLabel(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}
function mapMessage(item) {
  return { ...item, id: item.messageId ?? item.id, content: item.message ?? item.content, createdAt: item.sendTime ?? item.createdAt }
}
function ChatRoomPage() {
  const { chatId } = useParams(); const { user, isLoggedIn, isLoading } = useAuth()
  const [chat, setChat] = useState(null); const [messages, setMessages] = useState([]); const [contextTitle, setContextTitle] = useState(''); const [contextPrice, setContextPrice] = useState(null)
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const messagesEndRef = useRef(null)

  const refresh = useCallback(async (markRead = false) => {
    const [room, items] = await Promise.all([chatsApi.get(chatId), chatsApi.messages(chatId, { size: 100 })])
    setChat(room)
    const normalized = items.map(mapMessage).sort((a, b) => Number(a.id) - Number(b.id))
    setMessages((previous) => {
      const combined = new Map(previous.map((m) => [String(m.id), m]))
      normalized.forEach((m) => combined.set(String(m.id), m))
      return [...combined.values()].sort((a, b) => Number(a.id) - Number(b.id))
    })
    if (markRead) await chatsApi.markRead(chatId)
    return room
  }, [chatId])

  useEffect(() => {
    if (!isLoggedIn) return
    let active = true
    async function load() {
      try {
        const room = await refresh(true)
        let title = room.contextType === 'BOOK' ? '중고책 거래' : '프로젝트 대화'
        let price = null
        try {
          if (room.contextType === 'BOOK') { const book = await booksApi.get(room.contextId); title = book?.title || title; price = book?.price ?? null }
          if (room.contextType === 'PROJECT') { const project = await projectsApi.get(room.contextId); title = project?.title || title }
        } catch { /* 채팅방 자체의 사용에는 영향이 없도록 제목 조회 실패를 무시 */ }
        if (active) { setContextTitle(title); setContextPrice(price); setError('') }
      } catch (e) { if (active) setError(e.message || '채팅방을 불러오지 못했습니다.') }
    }
    load()
    const timer = window.setInterval(() => { refresh(true).catch((e) => active && setError(e.message)) }, 2500)
    return () => { active = false; window.clearInterval(timer) }
  }, [isLoggedIn, refresh])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages.length])

  if (isLoading) return <main className="chat-room-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: `/chats/${chatId}` } }} />
  if (error && !chat) return <main className="chat-room-page"><div className="chat-room-empty"><MessageCircle size={42} /><h2>채팅방을 열지 못했습니다.</h2><p>{error}</p><Link to="/chats" className="chat-room-back-button">채팅 목록으로 돌아가기</Link></div></main>
  if (!chat) return <main className="chat-room-page">채팅방을 불러오는 중입니다...</main>

  async function handleSendMessage(event) {
    event.preventDefault(); const text = message.trim(); if (!text || busy) return
    try { setBusy(true); await chatsApi.send(chatId, text); setMessage(''); await refresh(true); setError('') }
    catch (e) { setError(e.message || '메시지를 전송하지 못했습니다.') }
    finally { setBusy(false) }
  }

  return <main className="chat-room-page"><section className="chat-room-container">
    <header className="chat-room-header"><Link to="/chats" className="chat-room-back" aria-label="채팅 목록"><ArrowLeft size={21} /></Link><div className="chat-room-user-avatar"><MessageCircle size={22} /></div><div className="chat-room-user-info"><strong>{chat.opponentName || '상대방'}</strong><span>CampusConnect 대화</span></div></header>
    <section className="chat-room-product"><div className="chat-room-product-icon">{chat.contextType === 'BOOK' ? <BookOpen size={20} /> : <MessageCircle size={20} />}</div><div className="chat-room-product-info"><span>{chat.contextType === 'BOOK' ? '중고책 거래 문의' : '프로젝트 대화'}</span><strong>{contextTitle || `게시글 #${chat.contextId}`}</strong></div>{contextPrice != null && <strong className="chat-room-product-price">{Number(contextPrice).toLocaleString('ko-KR')}원</strong>}</section>
    <section className="chat-room-messages">{messages.length === 0 ? <div className="chat-room-first-message"><div className="chat-room-first-icon"><MessageCircle size={25} /></div><strong>대화를 시작해 보세요.</strong><p>상품 또는 프로젝트 관련 내용을 상대방에게 전달할 수 있습니다.</p></div> : messages.map((item, index) => { const mine = Number(item.senderId) === Number(user.id); const previous = messages[index - 1]; const showDate = !previous || new Date(previous.createdAt).toDateString() !== new Date(item.createdAt).toDateString(); return <div key={item.id}>{showDate && <div className="chat-room-date">{dayLabel(item.createdAt)}</div>}<div className={`chat-message-row ${mine ? 'is-mine' : 'is-other'}`}>{!mine && <span className="chat-message-sender">{item.senderName || chat.opponentName}</span>}<div className="chat-message-content"><div className="chat-message-bubble">{item.content}</div><time>{timeLabel(item.createdAt)}</time></div></div></div> })}<div ref={messagesEndRef} /></section>
    <div className="chat-room-composer">{error && <p className="chat-room-error" role="alert">{error}</p>}<form onSubmit={handleSendMessage}><input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="메시지를 입력하세요." maxLength={1000} aria-label="메시지 입력" /><button type="submit" disabled={!message.trim() || busy} aria-label="메시지 전송"><Send size={19} /></button></form><p className="chat-room-composer-notice">메시지는 서버에 저장되며 약 2.5초 간격으로 새 메시지를 확인합니다.</p></div>
  </section></main>
}
export default ChatRoomPage
