
import { Routes, Route, Navigate } from 'react-router'

import './App.css'

// 공통 컴포넌트
import Header from './components/common/Header.jsx'

// 로그인 상태 관리
import { useAuth } from './context/useAuth.js'

// 메인
import HomePage from './pages/HomePage.jsx'

// 인증
import SignupPage from './pages/auth/SignupPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'

// 마이페이지
import MyPage from './pages/mypage/MyPage.jsx'

// 중고책
import BooksPage from './pages/books/BooksPage.jsx'
import BookDetailPage from './pages/books/BookDetailPage.jsx'
import BookCreatePage from './pages/books/BookCreatePage.jsx'
import BookEditPage from './pages/books/BookEditPage.jsx'

// 프로젝트
import ProjectsPage from './pages/projects/ProjectsPage.jsx'
import ProjectDetailPage from './pages/projects/ProjectDetailPage.jsx'
import ProjectCreatePage from './pages/projects/ProjectCreatePage.jsx'
import ProjectEditPage from './pages/projects/ProjectEditPage.jsx'
import ProjectApplyPage from './pages/projects/ProjectApplyPage.jsx'
import ProjectApplicationsPage from './pages/projects/ProjectApplicationsPage.jsx'

// 채팅
import ChatsPage from './pages/chats/ChatsPage.jsx'
import ChatRoomPage from './pages/chats/ChatRoomPage.jsx'

// 거래 평가
import ReviewPage from './pages/reviews/ReviewPage.jsx'

// 알림

function App() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return <div className="app-loading">CampusConnect 연결 상태를 확인하고 있습니다...</div>
  }

  return (
    <div className="app">
      <Header
        user={user}
        onLogout={logout}
      />

      <Routes>
        {/* 메인 */}
        <Route path="/" element={<HomePage />} />

        {/* 회원가입 및 로그인 */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />

        {/* 중고책 */}
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/new" element={<BookCreatePage />} />
        <Route
          path="/books/:bookId/edit"
          element={<BookEditPage />}
        />
        <Route
          path="/books/:bookId"
          element={<BookDetailPage />}
        />

        {/* 프로젝트 모집 */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route
          path="/projects/new"
          element={<ProjectCreatePage />}
        />
        <Route
          path="/projects/:projectId/edit"
          element={<ProjectEditPage />}
        />
        <Route
          path="/projects/:projectId/apply"
          element={<ProjectApplyPage />}
        />
        <Route
          path="/projects/:projectId/applications"
          element={<ProjectApplicationsPage />}
        />
        <Route
          path="/projects/:projectId"
          element={<ProjectDetailPage />}
        />

        {/* 채팅 */}
        <Route path="/chats" element={<ChatsPage />} />
        <Route
          path="/chats/:chatId"
          element={<ChatRoomPage />}
        />

        {/* 거래 평가 */}
        <Route path="/books/:bookId/review" element={<ReviewPage />} />

        {/* 존재하지 않는 주소 */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </div>
  )
}

export default App
