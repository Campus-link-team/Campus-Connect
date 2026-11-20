
import { Link, NavLink } from 'react-router'
import { LogOut, UserRound } from 'lucide-react'
import './Header.css'

function Header({ user = null, onLogout }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* 로고 */}
        <Link to="/" className="site-header__logo">
          <span className="site-header__logo-mark">C</span>
          <span>
            Campus<span className="site-header__logo-green">Link</span>
          </span>
        </Link>

        {/* 주요 메뉴 */}
        <nav className="site-header__nav">
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `site-header__nav-link ${isActive ? 'is-active' : ''}`
            }
          >
            중고책
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `site-header__nav-link ${isActive ? 'is-active' : ''}`
            }
          >
            프로젝트 모집
          </NavLink>
        </nav>

        {/* 로그인 여부에 따른 메뉴 */}
        <div className="site-header__actions">
          {user ? (
            <>
              <span className="site-header__user-name">
                <UserRound size={17} />
                {user.name}
              </span>

              <Link
                to="/mypage"
                className="site-header__mypage"
              >
                마이페이지
              </Link>

              <button
                type="button"
                className="site-header__logout"
                onClick={onLogout}
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-header__login">
                로그인
              </Link>

              <Link to="/signup" className="site-header__signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
