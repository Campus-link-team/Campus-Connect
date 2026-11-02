
import './App.css'

function App() {
  return (
    <div className="app">
      {/* 상단 헤더 */}
      <header className="header">
        <a className="logo" href="/">
          <span className="logo-mark">C</span>
          <span>Campus<span className="logo-green">Link</span></span>
        </a>

        <nav className="nav">
          <a href="#books">중고책</a>
          <a href="#projects">프로젝트 모집</a>
        </nav>

        <div className="header-actions">
          <a className="login-link" href="#login">로그인</a>
          <a className="signup-button" href="#signup">회원가입</a>
        </div>
      </header>

      <main>
        {/* 메인 소개 영역 */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">대학생을 위한 연결 플랫폼</span>

            <h1>
              캠퍼스에서, 필요한 책과
              <br />
              함께할 사람을 찾아보세요.
            </h1>

            <p>
              중고 도서 거래부터 프로젝트 팀원 모집까지
              <br />
              한 곳에서 편리하게, CampusLink.
            </p>

            <div className="hero-buttons">
              <a className="button button-green" href="#books">
                중고책 둘러보기
              </a>
              <a className="button button-blue" href="#projects">
                프로젝트 모집 보기
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="CampusLink 서비스 안내">
            <div className="visual-card visual-card-back">
              <span className="visual-icon">📚</span>
              <strong>필요한 책을 찾고</strong>
              <span>합리적인 가격으로 거래하세요.</span>
            </div>
            <div className="visual-card visual-card-front">
              <span className="visual-icon">👥</span>
              <strong>함께할 팀원을 만나고</strong>
              <span>새로운 프로젝트를 시작하세요.</span>
            </div>
            <div className="visual-decoration">C</div>
          </div>
        </section>

        {/* 서비스 소개 카드 */}
        <section className="service-section">
          <div className="service-card" id="books">
            <div className="service-icon green-icon">▤</div>
            <h2>중고 도서 거래</h2>
            <p>
              교내 중고 책을 검색하고
              <br />
              판매자와 편리하게 거래해 보세요.
            </p>
          </div>

          <div className="service-card" id="projects">
            <div className="service-icon blue-icon">♧</div>
            <h2>프로젝트 모집</h2>
            <p>
              스터디, 동아리, 팀원 등
              <br />
              함께할 사람을 찾아보세요.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon green-icon">✓</div>
            <h2>간편한 교내 거래</h2>
            <p>
              교내 기반 플랫폼으로
              <br />
              더욱 편리하게 이용하세요.
            </p>
          </div>
        </section>

        {/* 하단 안내 */}
        <section className="bottom-banner">
          <div>
            <h2>캠퍼스 생활을 더 편리하게</h2>
            <p>CampusLink에서 필요한 연결을 시작해 보세요.</p>
          </div>
          <span className="banner-mark">CampusLink</span>
        </section>
      </main>

      <footer className="footer">
        <span>CampusLink</span>
        <span>대학생을 위한 중고 도서 거래 & 프로젝트 모집 플랫폼</span>
      </footer>
    </div>
  )
}

export default App
