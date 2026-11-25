import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Star, Send } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import { booksApi } from '../../api/booksApi.js'
import { reviewsApi } from '../../api/reviewsApi.js'
import './ReviewPage.css'

function ReviewPage() {
  const { bookId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [book, setBook] = useState(null); const [existingReview, setExistingReview] = useState(null); const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; Promise.all([booksApi.get(bookId), reviewsApi.getForBook(bookId).catch(() => null)]).then(([b, r]) => { if (active) { setBook(b); setExistingReview(r) } }).catch((e) => active && setError(e.message || '거래 정보를 불러오지 못했습니다.')); return () => { active = false } }, [bookId])
  if (isLoading) return <main className="review-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: `/books/${bookId}/review` } }} />
  if (error && !book) return <main className="review-page"><div className="book-form-error">{error}</div><Link to="/books">도서 목록으로</Link></main>
  if (!book) return <main className="review-page">상품 정보를 불러오는 중입니다...</main>
  if (Number(book.buyer?.id) !== Number(user.id) || book.status !== '거래 완료') return <main className="review-page"><div className="review-container"><h1>후기 작성 권한이 없습니다.</h1><p>거래 완료된 상품의 구매자만 후기를 작성할 수 있습니다.</p><Link to={`/books/${book.id}`}>상품으로 돌아가기</Link></div></main>
  if (existingReview) return <main className="review-page"><div className="review-container"><h1>이미 후기를 작성했습니다.</h1><p>{existingReview.comment}</p><Link to={`/books/${book.id}`}>상품으로 돌아가기</Link></div></main>
  async function submit(event) { event.preventDefault(); setError(''); if (!comment.trim()) return setError('후기 내용을 입력해 주세요.'); try { setBusy(true); await reviewsApi.create(book.id, { rating, comment }); navigate(`/books/${book.id}`, { replace: true }) } catch (e) { setError(e.message || '후기를 등록하지 못했습니다.') } finally { setBusy(false) } }
  return <main className="review-page"><Link to={`/books/${book.id}`} className="review-back"><ArrowLeft size={17} /> 상품 상세로</Link><div className="review-container"><header className="review-header"><span>TRANSACTION REVIEW</span><h1>거래 후기 작성</h1><p>{book.title} · 판매자 {book.seller?.nickname || '판매자'}</p></header>
    <form className="review-form" onSubmit={submit}><section className="review-rating-section"><h2>거래 만족도</h2><div className="review-stars">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value}점`}><Star size={34} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><strong>{rating}점 / 5점</strong></section>
      <section className="review-comment-section"><label htmlFor="review-comment">후기 내용</label><textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={7} placeholder="거래 경험을 솔직하게 남겨 주세요." required /><span>{comment.length}/500</span></section>
      {error && <div className="book-form-error" role="alert">{error}</div>}<button type="submit" className="review-submit" disabled={busy}><Send size={16} /> {busy ? '등록 중...' : '후기 등록하기'}</button>
    </form></div></main>
}
export default ReviewPage
