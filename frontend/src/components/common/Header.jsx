import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { LogOut, UserRound, MessageCircle } from 'lucide-react'
import { chatsApi } from '../../api/chatsApi.js'
import './Header.css'

function Header({ user = null, onLogout }) {
  const navigate = useNavigate()
  const [unreadChatState, setUnreadChatState] = useState({ userId: null, count: 0 })
  const userId = user?.id ?? null
  const unreadChatCount =
    userId !== null && String(unreadChatState.userId) === String(userId)
      ? unreadChatState.count
      : 0

  useEffect(() => {
    if (userId === null) return undefined

    let active = true
    const refresh = () => {
      chatsApi.list()
        .then((items) => {
          if (!active) return
          const count = items.reduce(
            (sum, item) => sum + Number(item.unreadCount || 0),
            0,
          )
          setUnreadChatState({ userId, count })
        })
        .catch(() => {})
    }

    refresh()
    const timer = window.setInterval(refresh, 10000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [userId])
  function handleLogout() { onLogout?.(); navigate('/', { replace: true }) }
  return <header className="site-header"><div className="site-header__inner">
    <Link to="/" className="site-header__logo"><span className="site-header__logo-mark">C</span><span>Campus<span className="site-header__logo-green">Connect</span></span></Link>
    <nav className="site-header__nav"><NavLink to="/books" className={({ isActive }) => `site-header__nav-link ${isActive ? 'is-active' : ''}`}>중고책</NavLink><NavLink to="/projects" className={({ isActive }) => `site-header__nav-link ${isActive ? 'is-active' : ''}`}>프로젝트 모집</NavLink>
      {user && <NavLink to="/chats" className={({ isActive }) => `site-header__nav-link site-header__chat-link ${isActive ? 'is-active' : ''}`}><MessageCircle size={16} /> 채팅{unreadChatCount > 0 && <span className="site-header__chat-badge">{unreadChatCount > 99 ? '99+' : unreadChatCount}</span>}</NavLink>}
    </nav>
    <div className="site-header__actions">{user ? <><span className="site-header__user-name"><UserRound size={17} /> {user.nickname || user.name}</span><Link to="/mypage" className="site-header__mypage">마이페이지</Link><button type="button" className="site-header__logout" onClick={handleLogout}><LogOut size={16} /> 로그아웃</button></> : <><Link to="/login" className="site-header__login">로그인</Link><Link to="/signup" className="site-header__signup">회원가입</Link></>}</div>
  </div></header>
}
export default Header
