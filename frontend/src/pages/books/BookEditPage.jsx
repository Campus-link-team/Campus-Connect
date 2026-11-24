import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { booksApi } from '../../api/booksApi.js'
import { useAuth } from '../../context/useAuth.js'
import './BookCreatePage.css'

function BookEditPage() {
  const { bookId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [book, setBook] = useState(null); const [title, setTitle] = useState(''); const [author, setAuthor] = useState(''); const [price, setPrice] = useState(''); const [category, setCategory] = useState('MAJOR'); const [description, setDescription] = useState(''); const [tradePlace, setTradePlace] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { let active = true; booksApi.get(bookId).then((data) => { if (!active) return; setBook(data); setTitle(data.title || ''); setAuthor(data.author || ''); setPrice(String(data.price ?? '')); setCategory(data.category || 'MAJOR'); setDescription(data.description || ''); setTradePlace(data.tradePlace || '') }).catch((e) => active && setError(e.message)); return () => { active = false } }, [bookId])
  if (isLoading) return <main className="book-create-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: `/books/${bookId}/edit` } }} />
  if (error && !book) return <main className="book-create-page"><div className="book-form-error">{error}</div><Link to="/books">목록으로</Link></main>
  if (!book) return <main className="book-create-page">상품 정보를 불러오는 중입니다...</main>
  if (Number(book.seller?.id) !== Number(user.id)) return <main className="book-create-page"><div className="book-form-error">본인이 등록한 상품만 수정할 수 있습니다.</div><Link to={`/books/${bookId}`}>상품으로 돌아가기</Link></main>
  async function handleSubmit(event) { event.preventDefault(); setError(''); if (!title.trim() || !author.trim() || !description.trim()) return setError('교재명, 저자, 설명을 입력해 주세요.'); if (!Number.isFinite(Number(price)) || Number(price) < 0) return setError('가격을 확인해 주세요.'); try { setBusy(true); await booksApi.update(bookId, { title, author, price, category, description, tradePlace }); navigate(`/books/${bookId}`) } catch (e) { setError(e.message || '상품 수정에 실패했습니다.') } finally { setBusy(false) } }
  return <main className="book-create-page"><Link to={`/books/${bookId}`} className="book-create-back"><ArrowLeft size={17} /> 상품 상세로</Link><div className="book-create-heading"><span>CAMPUS MARKET</span><h1>상품 정보 수정</h1><p>등록한 교재 정보를 수정합니다.</p></div>
    <form className="book-create-form" onSubmit={handleSubmit}><section className="book-form-section"><h2>상품 정보</h2>
      <div className="book-form-field"><label htmlFor="edit-book-title">책 이름</label><input id="edit-book-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required /></div>
      <div className="book-form-field"><label htmlFor="edit-book-author">저자</label><input id="edit-book-author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={50} required /></div>
      <div className="book-form-field"><label htmlFor="edit-book-category">도서 구분</label><select id="edit-book-category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="MAJOR">전공</option><option value="GENERAL">교양</option></select></div>
      <div className="book-form-field"><label htmlFor="edit-book-price">판매 가격</label><div className="book-form-price"><input id="edit-book-price" type="number" min="0" max="10000000" value={price} onChange={(e) => setPrice(e.target.value)} required /><span>원</span></div></div>
      <div className="book-form-field"><label htmlFor="edit-book-place">거래 희망 장소</label><input id="edit-book-place" value={tradePlace} onChange={(e) => setTradePlace(e.target.value)} maxLength={100} /></div>
    </section><section className="book-form-section"><h2>상품 설명</h2><textarea className="book-form-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={6} required /><span className="book-form-character-count">{description.length}/2000</span></section>
    {error && <div className="book-form-error" role="alert">{error}</div>}<button type="submit" className="book-form-submit" disabled={busy}>{busy ? '저장 중...' : '수정 내용 저장'}</button></form></main>
}
export default BookEditPage
