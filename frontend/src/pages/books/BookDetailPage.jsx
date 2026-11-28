import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, BookOpen, Heart, MessageCircle, Pencil, Trash2, Star } from 'lucide-react'
import { booksApi } from '../../api/booksApi.js'
import { chatsApi } from '../../api/chatsApi.js'
import { reviewsApi } from '../../api/reviewsApi.js'
import { useAuth } from '../../context/useAuth.js'
import './BookDetailPage.css'

function BookDetailPage() {
  const { bookId } = useParams(); const navigate = useNavigate(); const { user, isLoggedIn, isLoading } = useAuth()
  const [book, setBook] = useState(null); const [favorite, setFavorite] = useState(false); const [buyers, setBuyers] = useState([]); const [buyerId, setBuyerId] = useState(''); const [showCompletionOptions, setShowCompletionOptions] = useState(false); const [review, setReview] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const item = await booksApi.get(bookId)
        if (!item) throw new Error('상품을 찾을 수 없습니다.')
        const [favorites, existingReview] = await Promise.all([
          isLoggedIn ? booksApi.favorites().catch(() => []) : Promise.resolve([]),
          reviewsApi.getForBook(bookId).catch(() => null),
        ])
        if (!active) return
        setBook(item)
        setFavorite(favorites.some((x) => Number(x.id) === Number(item.id)))
        setReview(existingReview || null)
      } catch (e) { if (active) setError(e.message || '상품 정보를 불러오지 못했습니다.') }
    }
    load()
    return () => { active = false }
  }, [bookId, isLoggedIn])

  const isOwner = Boolean(book && user && Number(book.seller?.id) === Number(user.id))
  const isBuyer = Boolean(book && user && book.buyer && Number(book.buyer.id) === Number(user.id))
  const sellerName = book?.seller?.nickname || '판매자'

  async function handleFavorite() {
    if (!isLoggedIn) return navigate('/login', { state: { from: { pathname: `/books/${bookId}` } } })
    try { setBusy(true); const next = await booksApi.toggleFavorite(bookId); setFavorite(next) }
    catch (e) { setError(e.message || '찜 상태를 변경하지 못했습니다.') }
    finally { setBusy(false) }
  }

  async function handleChat() {
    if (!isLoggedIn) return navigate('/login', { state: { from: { pathname: `/books/${bookId}` } } })
    if (isOwner) return setError('본인이 등록한 상품에는 채팅을 시작할 수 없습니다.')
    try {
      setBusy(true)
      const room = await chatsApi.createOrGet({ contextType: 'BOOK', contextId: book.id, participantUserId: book.seller.id })
      navigate(`/chats/${room.chatId ?? room.id}`)
    } catch (e) { setError(e.message || '채팅방을 열지 못했습니다.') }
    finally { setBusy(false) }
  }

  async function handleStatusChange(event) {
    const nextStatus = event.target.value
    setError('')

    if (nextStatus === '거래 완료') {
      try {
        setBusy(true)
        const options = await booksApi.chatPartners(book.id)
        setBuyers(options)
        setBuyerId('')
        setShowCompletionOptions(true)
      } catch (e) {
        setError(e.message || '구매자 목록을 불러오지 못했습니다.')
      } finally {
        setBusy(false)
      }
      return
    }

    try {
      setBusy(true)
      const updated = await booksApi.updateStatus(book.id, nextStatus)
      setBook(updated)
      setBuyers([])
      setBuyerId('')
      setShowCompletionOptions(false)
    } catch (e) { setError(e.message || '거래 상태를 변경하지 못했습니다.') }
    finally { setBusy(false) }
  }

  async function handleConfirmCompletion() {
    setError('')
    try {
      setBusy(true)
      const selectedBuyer = buyerId ? Number(buyerId) : undefined
      const updated = await booksApi.updateStatus(book.id, '거래 완료', selectedBuyer)
      setBook(updated)
      setShowCompletionOptions(false)
      setBuyers([])
      setBuyerId('')
    } catch (e) {
      setError(e.message || '거래 완료 처리에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('이 상품을 삭제하시겠습니까?')) return
    try { setBusy(true); await booksApi.remove(book.id); navigate('/books') }
    catch (e) { setError(e.message || '상품을 삭제하지 못했습니다.') }
    finally { setBusy(false) }
  }

  if (isLoading) return <main className="book-detail-page">로그인 정보를 확인하고 있습니다...</main>
  if (error && !book) return <main className="book-detail-page"><div className="book-form-error">{error}</div><Link to="/books">도서 목록으로</Link></main>
  if (!book) return <main className="book-detail-page">상품 정보를 불러오는 중입니다...</main>

  return <main className="book-detail-page">
    <Link to="/books" className="book-detail-back"><ArrowLeft size={17} /> 중고책 목록으로</Link>
    <div className="book-detail-layout">
      <section className="book-detail-main">
        <div className="book-detail-image"><BookOpen size={76} strokeWidth={1.1} /><span>{book.title}</span></div>
        <div className="book-detail-content">
          <span className={`book-card__status ${book.status === '거래 완료' ? 'is-completed' : book.status === '예약 중' ? 'is-reserved' : 'is-selling'}`}>{book.status}</span>
          <h1>{book.title}</h1>
          <p className="book-detail-subtitle">{book.author} · {book.categoryLabel}</p>
          <strong className="book-detail-price">{Number(book.price).toLocaleString('ko-KR')}원</strong>
          <div className="book-detail-description"><h2>상품 설명</h2><p>{book.description}</p></div>
          <div className="book-detail-description"><h2>거래 정보</h2><p>거래 희망 장소: {book.tradePlace || '협의'}</p><p>판매자: {sellerName}</p></div>
        </div>
      </section>
      <aside className="book-detail-sidebar">
        <div className="book-detail-seller"><span>판매자</span><strong>{sellerName}</strong><small>{book.createdAt ? new Date(book.createdAt).toLocaleString('ko-KR') : ''}</small></div>
        {!isOwner && book.status !== '거래 완료' && <button type="button" className="book-detail-primary" onClick={handleChat} disabled={busy}><MessageCircle size={17} /> 채팅으로 거래하기</button>}
        {!isOwner && <button type="button" className={`book-detail-favorite ${favorite ? 'is-favorite' : ''}`} onClick={handleFavorite} disabled={busy}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? '찜 취소' : '찜하기'}</button>}
        {isOwner && <div className="book-detail-owner-actions">
          <label htmlFor="book-status">거래 상태 변경</label>
          <select id="book-status" value={book.status} onChange={handleStatusChange} disabled={busy || book.status === '거래 완료'}><option value="판매 중">판매 중</option><option value="예약 중">예약 중</option><option value="거래 완료">거래 완료</option></select>
          {showCompletionOptions && <div className="book-detail-completion-options">
            <label htmlFor="book-buyer">구매자 선택 (선택 사항)</label>
            <select id="book-buyer" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} disabled={busy}>
              <option value="">구매자 선택 안 함</option>
              {buyers.map((b) => <option key={b.userId} value={b.userId}>{b.nickname}</option>)}
            </select>
            <p className="book-detail-buyer-hint">구매자를 선택하지 않으면 거래 완료만 처리되며, 구매자 후기 기능은 사용할 수 없습니다.</p>
            {buyers.length === 0 && <p className="book-detail-buyer-hint">선택할 수 있는 채팅 상대가 없습니다. 구매자 없이 거래 완료 처리할 수 있습니다.</p>}
            <button type="button" className="book-detail-primary" onClick={handleConfirmCompletion} disabled={busy}>거래 완료 처리</button>
            <button type="button" className="book-detail-edit" onClick={() => { setShowCompletionOptions(false); setBuyerId(''); setBuyers([]) }} disabled={busy}>취소</button>
          </div>}
          <Link to={`/books/${book.id}/edit`} className="book-detail-edit"><Pencil size={16} /> 상품 수정</Link>
          <button type="button" className="book-detail-delete" onClick={handleDelete} disabled={busy}><Trash2 size={16} /> 상품 삭제</button>
        </div>}
        {error && <div className="book-form-error" role="alert">{error}</div>}
      </aside>
    </div>
    {review && <section className="book-detail-review"><h2><Star size={18} /> 거래 후기</h2><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong><p>{review.comment}</p><small>{review.reviewerName || '구매자'} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}</small></section>}
    {book.status === '거래 완료' && isBuyer && !review && <section className="book-detail-review"><h2>거래가 완료되었습니다.</h2><p>판매자에게 거래 후기를 남겨 주세요.</p><Link to={`/books/${book.id}/review`} className="book-detail-edit">후기 작성하기</Link></section>}
  </main>
}
export default BookDetailPage
