
import { Routes, Route, Navigate } from 'react-router'

import './App.css'

// 공통 컴포넌트
import Header from './components/common/Header.jsx'

// 메인
import HomePage from './pages/HomePage.jsx'

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

function App() {
  return (
    <div className="app">
      {/* 모든 페이지 공통 헤더 */}
      <Header />

      <Routes>
        {/* 메인 */}
        <Route path="/" element={<HomePage />} />

        {/* 중고책 */}
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/new" element={<BookCreatePage />} />
        <Route path="/books/:bookId/edit" element={<BookEditPage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />

        {/* 프로젝트 모집 */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectCreatePage />} />
        <Route path="/projects/:projectId/edit" element={<ProjectEditPage />} />
        <Route
          path="/projects/:projectId/apply"
          element={<ProjectApplyPage />}
        />
        <Route
          path="/projects/:projectId/applications"
          element={<ProjectApplicationsPage />}
        />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

        {/* 존재하지 않는 주소 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
