import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { booksApi } from '../../api/booksApi.js'
import { useAuth } from '../../context/useAuth.js'
import './BookCreatePage.css'

function BookCreatePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, isLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('MAJOR')
  const [description, setDescription] = useState('')
  const [tradePlace, setTradePlace] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoading) return <main className="book-create-page">로그인 정보를 확인하고 있습니다...</main>
  if (!isLoggedIn || !user) return <Navigate to="/login" replace state={{ from: { pathname: '/books/new' } }} />

  async function handleSubmit(event) {
    event.preventDefault(); setError('')
    if (!title.trim() || !author.trim() || !description.trim()) return setError('교재명, 저자, 설명을 모두 입력해 주세요.')
    if (!Number.isFinite(Number(price)) || Number(price) < 0) return setError('판매 가격을 0원 이상의 숫자로 입력해 주세요.')
    try {
      setBusy(true)
      const created = await booksApi.create({ title, author, price, category, description, tradePlace })
      navigate(`/books/${created.id}`)
    } catch (e) { setError(e.message || '상품 등록에 실패했습니다.') }
    finally { setBusy(false) }
  }

  return <main className="book-create-page">
    <Link to="/books" className="book-create-back"><ArrowLeft size={17} /> 중고책 목록으로</Link>
    <div className="book-create-heading"><span>CAMPUS MARKET</span><h1>중고책 상품 등록</h1><p>판매할 교재의 정보를 입력해 주세요.</p></div>
    <form className="book-create-form" onSubmit={handleSubmit}>
      <section className="book-form-section"><h2>상품 정보</h2>
        <div className="book-form-field"><label htmlFor="book-title">책 이름 <span>*</span></label><input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="예: 컴퓨터 네트워크" required /></div>
        <div className="book-form-field"><label htmlFor="book-author">저자 <span>*</span></label><input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={50} placeholder="저자명을 입력해 주세요." required /></div>
        <div className="book-form-field"><label htmlFor="book-category">도서 구분 <span>*</span></label><select id="book-category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="MAJOR">전공</option><option value="GENERAL">교양</option></select></div>
        <div className="book-form-field"><label htmlFor="book-price">판매 가격 <span>*</span></label><div className="book-form-price"><input id="book-price" type="number" min="0" max="10000000" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="판매 가격 입력" required /><span>원</span></div></div>
        <div className="book-form-field"><label htmlFor="book-place">거래 희망 장소</label><input id="book-place" value={tradePlace} onChange={(e) => setTradePlace(e.target.value)} maxLength={100} placeholder="예: 삼육대학교 중앙도서관" /></div>
      </section>
      <section className="book-form-section"><h2>상품 설명 <span>*</span></h2><textarea className="book-form-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={6} placeholder="교재의 상태와 거래에 필요한 내용을 작성해 주세요." required /><span className="book-form-character-count">{description.length}/2000</span></section>
      {error && <div className="book-form-error" role="alert">{error}</div>}
      <button type="submit" className="book-form-submit" disabled={busy}>{busy ? '등록 중...' : '상품 등록하기'}</button>
      <p className="book-form-notice">판매자 정보는 로그인한 계정에서 자동으로 연결됩니다.</p>
    </form>
  </main>
}
export default BookCreatePage
