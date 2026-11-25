import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { MessageCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { chatsApi } from '../../api/chatsApi.js'
import './ChatsPage.css'

function formatChatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
}
function ChatsPage() {
  const { isLoggedIn, isLoading } = useAuth()
  const [chats, setChats] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!isLoggedIn) return
    let active = true
    const load = () => chatsApi.list().then((list) => { if (active) { setChats(list); setError('') } }).catch((e) => active && setError(e.message || '채팅 목록을 불러오지 못했습니다.')).finally(() => active && setLoading(false))
    load(); const timer = window.setInterval(load, 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isLoggedIn])
  if (isLoading) return <main className="chats-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: { pathname: '/chats' } }} />
  const unreadCount = chats.reduce((sum, chat) => sum + Number(chat.unreadCount || 0), 0)
  return <main className="chats-page"><section className="chats-page-header"><div><span className="chats-page-eyebrow">CAMPUSCONNECT MESSAGE</span><h1>채팅</h1><p>판매자 및 프로젝트 참여자와 대화할 수 있습니다.</p></div>{unreadCount > 0 && <div className="chats-unread-summary">읽지 않은 메시지 <strong>{unreadCount}</strong></div>}</section>
    <section className="chats-list"><div className="chats-list-heading"><h2>내 채팅방</h2><span>{chats.length}개</span></div>
      {error && <p className="chat-room-error" role="alert">{error}</p>}
      {loading ? <div className="chats-empty">채팅 목록을 불러오는 중입니다...</div> : chats.length === 0 ? <div className="chats-empty"><div className="chats-empty-icon"><MessageCircle size={34} /></div><h3>아직 채팅 내역이 없습니다.</h3><p>중고책 판매자에게 문의하거나 프로젝트 참여자와 대화를 시작해 보세요.</p><div className="chats-empty-actions"><Link to="/books" className="chats-empty-button">중고책 둘러보기</Link><Link to="/projects" className="chats-empty-button secondary">프로젝트 둘러보기</Link></div></div> : <div className="chats-list-items">
        {chats.map((chat) => <Link to={`/chats/${chat.chatId}`} className="chat-list-item" key={chat.chatId}><div className="chat-list-avatar"><MessageCircle size={23} /></div><div className="chat-list-content"><div className="chat-list-top"><strong>{chat.opponentName || '상대방'}</strong><time>{formatChatDate(chat.lastMessageTime)}</time></div><div className="chat-list-middle"><span className="chat-list-product">{chat.contextType === 'BOOK' ? <BookOpen size={13} /> : <MessageCircle size={13} />}{chat.contextType === 'BOOK' ? '중고책 거래' : '프로젝트 대화'} · #{chat.contextId}</span></div><div className="chat-list-bottom"><p>{chat.lastMessage || '대화를 시작해 보세요.'}</p>{Number(chat.unreadCount) > 0 && <span className="chat-unread-badge">{chat.unreadCount}</span>}</div></div></Link>)}
      </div>}
    </section></main>
}
export default ChatsPage
