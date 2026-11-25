import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { UserRound, BookOpen, FolderKanban, Heart, ClipboardList, GraduationCap, ChevronRight, CalendarDays, MessageCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { api } from '../../api/apiClient.js'
import { booksApi } from '../../api/booksApi.js'
import { projectsApi } from '../../api/projectsApi.js'
import { reviewsApi } from '../../api/reviewsApi.js'
import './MyPage.css'

function price(value) { return `${Number(value || 0).toLocaleString('ko-KR')}원` }
function date(value) { return value ? new Date(value).toLocaleDateString('ko-KR') : '날짜 정보 없음' }
function MyPage() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const [profile, setProfile] = useState(null); const [books, setBooks] = useState([]); const [projects, setProjects] = useState([]); const [favorites, setFavorites] = useState([]); const [applications, setApplications] = useState([]); const [reviews, setReviews] = useState([]); const [error, setError] = useState(''); const [busyId, setBusyId] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!isLoggedIn || !user) return
    let active = true
    Promise.all([
      api.get('/users/me/mypage').catch(() => user),
      booksApi.mine(),
      projectsApi.mine(),
      booksApi.favorites(),
      projectsApi.myApplications(),
      reviewsApi.getForUser(user.id),
    ]).then(([p, b, pr, f, a, r]) => {
      if (!active) return
      setProfile(p); setBooks(b); setProjects(pr); setFavorites(f); setApplications(a); setReviews(r); setError('')
    }).catch((e) => active && setError(e.message || '마이페이지 정보를 불러오지 못했습니다.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [isLoggedIn, user])

  if (isLoading) return <main className="mypage">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: '/mypage' } }} />

  async function cancelApplication(application) {
    if (!window.confirm('이 프로젝트 지원을 취소하시겠습니까?')) return
    try { setBusyId(application.applicationId); await projectsApi.cancelApplication(application.projectId, application.applicationId); setApplications((items) => items.filter((x) => x.applicationId !== application.applicationId)) }
    catch (e) { setError(e.message || '지원 취소에 실패했습니다.') }
    finally { setBusyId(null) }
  }

  const nickname = profile?.nickname || user.nickname || user.name
  const department = profile?.department || user.department || '학과 정보 없음'
  return <main className="mypage"><div className="mypage-container">
    <header className="mypage-header"><span>MY CAMPUSCONNECT</span><h1>마이페이지</h1><p>나의 활동과 정보를 한곳에서 관리할 수 있습니다.</p></header>
    <section className="mypage-profile"><div className="mypage-profile-avatar"><UserRound size={35} /></div><div className="mypage-profile-info"><div className="mypage-profile-name"><h2>{nickname}</h2><span>회원</span></div><p><GraduationCap size={15} /> {department}</p><p><UserRound size={15} /> {profile?.email || user.email}</p></div></section>
    {error && <div className="book-form-error" role="alert">{error}</div>}
    <section className="mypage-stats">
      <Link to="#my-books" className="mypage-stat"><BookOpen size={21} /><span>등록한 중고책</span><strong>{books.length}</strong></Link>
      <Link to="#my-projects" className="mypage-stat"><FolderKanban size={21} /><span>작성한 프로젝트</span><strong>{projects.length}</strong></Link>
      <Link to="#my-favorites" className="mypage-stat"><Heart size={21} /><span>관심 도서</span><strong>{favorites.length}</strong></Link>
      <Link to="#my-applications" className="mypage-stat"><ClipboardList size={21} /><span>프로젝트 신청</span><strong>{applications.length}</strong></Link>
      <Link to="#my-reviews" className="mypage-stat"><MessageCircle size={21} /><span>받은 거래 후기</span><strong>{reviews.length}</strong></Link>
    </section>
    {loading ? <div className="mypage-empty">나의 활동을 불러오는 중입니다...</div> : <>
      <section className="mypage-section" id="my-books"><div className="mypage-section-heading"><div><h2>내가 등록한 중고책</h2><p>내가 판매 중이거나 거래 완료한 도서입니다.</p></div><Link to="/books" className="mypage-more">중고책 보기 <ChevronRight size={16} /></Link></div>
        {books.length ? <div className="mypage-item-list">{books.map((book) => <Link to={`/books/${book.id}`} className="mypage-item" key={book.id}><div className="mypage-item-icon"><BookOpen size={23} /></div><div className="mypage-item-info"><strong>{book.title}</strong><span>{book.author} · {book.categoryLabel}</span></div><div className="mypage-item-right"><strong>{price(book.price)}</strong><span>{book.status}</span></div><ChevronRight size={17} /></Link>)}</div> : <div className="mypage-empty"><BookOpen size={28} /><strong>등록한 중고책이 없습니다.</strong><p>필요 없는 교재를 등록해 보세요.</p><Link to="/books/new">중고책 등록하기</Link></div>}
      </section>
      <section className="mypage-section" id="my-projects"><div className="mypage-section-heading"><div><h2>내가 작성한 프로젝트</h2><p>내가 등록한 모집글과 승인 현황입니다.</p></div><Link to="/projects" className="mypage-more">프로젝트 보기 <ChevronRight size={16} /></Link></div>
        {projects.length ? <div className="mypage-item-list">{projects.map((project) => <Link to={`/projects/${project.id}`} className="mypage-item" key={project.id}><div className="mypage-item-icon"><FolderKanban size={23} /></div><div className="mypage-item-info"><strong>{project.title}</strong><span>{project.category}</span></div><div className="mypage-item-right"><strong>{project.currentMembers}/{project.maxMembers}명</strong><span>{project.statusLabel}</span></div><ChevronRight size={17} /></Link>)}</div> : <div className="mypage-empty"><FolderKanban size={28} /><strong>작성한 프로젝트가 없습니다.</strong><p>함께할 팀원을 모집해 보세요.</p><Link to="/projects/new">프로젝트 등록하기</Link></div>}
      </section>
      <section className="mypage-section" id="my-favorites"><div className="mypage-section-heading"><div><h2>관심 도서</h2><p>찜한 중고책 목록입니다.</p></div><Link to="/books" className="mypage-more">도서 둘러보기 <ChevronRight size={16} /></Link></div>
        {favorites.length ? <div className="mypage-item-list">{favorites.map((book) => <Link to={`/books/${book.id}`} className="mypage-item" key={book.id}><div className="mypage-item-icon"><Heart size={23} /></div><div className="mypage-item-info"><strong>{book.title}</strong><span>{book.author} · {book.categoryLabel}</span></div><div className="mypage-item-right"><strong>{price(book.price)}</strong><span>{book.status}</span></div><ChevronRight size={17} /></Link>)}</div> : <div className="mypage-empty"><Heart size={28} /><strong>관심 도서가 없습니다.</strong><p>마음에 드는 도서를 찜해 보세요.</p><Link to="/books">중고책 둘러보기</Link></div>}
      </section>
      <section className="mypage-section" id="my-applications"><div className="mypage-section-heading"><div><h2>프로젝트 신청 내역</h2><p>지원 상태를 확인하고 대기 중인 지원을 취소할 수 있습니다.</p></div><Link to="/projects" className="mypage-more">프로젝트 보기 <ChevronRight size={16} /></Link></div>
        {applications.length ? <div className="mypage-item-list">{applications.map((application) => <article className="mypage-application-item" key={application.applicationId}><div className="mypage-application-info"><strong>{application.projectTitle}</strong><span><CalendarDays size={13} /> {date(application.appliedAt)}</span><span>지원 역할: {application.roleName}</span></div><div className="mypage-item-right"><span className={`mypage-application-status ${application.status === 'APPROVED' ? 'is-approved' : application.status === 'REJECTED' ? 'is-rejected' : 'is-pending'}`}>{application.status === 'APPROVED' ? '승인' : application.status === 'REJECTED' ? '거절' : '지원 대기'}</span>{application.status === 'PENDING' && <button type="button" onClick={() => cancelApplication(application)} disabled={busyId === application.applicationId}><XCircle size={14} /> 지원 취소</button>}<Link to={`/projects/${application.projectId}`}>상세 보기</Link></div></article>)}</div> : <div className="mypage-empty"><ClipboardList size={28} /><strong>프로젝트 신청 내역이 없습니다.</strong><p>관심 있는 프로젝트에 지원해 보세요.</p><Link to="/projects">프로젝트 둘러보기</Link></div>}
      </section>
      <section className="mypage-section" id="my-reviews"><div className="mypage-section-heading"><div><h2>받은 거래 후기</h2><p>다른 사용자가 나에게 남긴 후기입니다.</p></div><span className="mypage-transaction-count">총 {reviews.length}건</span></div>
        {reviews.length ? <div className="mypage-review-list">{reviews.map((review) => <article className="mypage-review-card" key={review.id}><div className="mypage-review-header"><div><strong>{review.reviewerName || '사용자'}</strong><span>{review.bookTitle}</span></div><div className="mypage-review-rating">★ {review.rating}.0</div></div>{review.comment && <p className="mypage-review-comment">{review.comment}</p>}<time>{date(review.createdAt)}</time></article>)}</div> : <div className="mypage-empty"><MessageCircle size={28} /><strong>아직 받은 거래 후기가 없습니다.</strong></div>}
      </section>
    </>}
    <p className="mypage-notice">마이페이지 정보는 CampusConnect 서버에서 불러옵니다.</p>
  </div></main>
}
export default MyPage
