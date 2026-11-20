
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  BookOpen,
  Heart,
  MessageCircle,
  ShieldCheck,
  UserRound,
  CalendarDays,
  CheckCircle,
  Pencil,
  Trash2,
} from 'lucide-react'

import { getBooks, updateBook, deleteBook } from '../../data/bookStorage.js'
import {
  isFavoriteBook,
  toggleFavoriteBook,
} from '../../data/favorites.js'

import './BookDetailPage.css'

const saleStatuses = ['판매 중', '예약 중', '판매 완료']

function BookDetailPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(() =>
    getBooks().find(
      (item) => String(item.id) === bookId
    )
  )

  // 저장소에서 기존 찜 상태 불러오기
  const [isFavorite, setIsFavorite] = useState(() =>
    isFavoriteBook(bookId)
  )

  const [error, setError] = useState('')

  if (!book) {
    return (
      <main className="book-detail-page">
        <div className="book-detail-empty">
          <BookOpen size={48} />
          <h2>책 정보를 찾을 수 없습니다.</h2>
          <p>삭제되었거나 존재하지 않는 게시글입니다.</p>

          <Link to="/books" className="book-detail-back">
            중고책 목록으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  // 판매 상태 변경
  function handleStatusChange(event) {
    const newStatus = event.target.value

    try {
      const updatedBook = updateBook(book.id, {
        status: newStatus,
      })

      setBook(updatedBook)
      setError('')
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  // 찜하기 및 찜 취소
  function handleFavorite() {
    try {
      const updatedFavoriteState = toggleFavoriteBook(book.id)

      setIsFavorite(updatedFavoriteState)
      setError('')
    } catch (favoriteError) {
      setError(favoriteError.message)
    }
  }

  // 상품 삭제
  function handleDelete() {
    const confirmed = window.confirm(
      '정말 이 상품을 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.'
    )

    if (!confirmed) return

    try {
      deleteBook(book.id)

      // 상품 삭제 시 해당 상품의 찜 정보도 제거
      if (isFavoriteBook(book.id)) {
        toggleFavoriteBook(book.id)
      }

      alert('상품이 삭제되었습니다.')
      navigate('/books')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <main className="book-detail-page">
      <Link to="/books" className="book-detail-back">
        <ArrowLeft size={17} />
        중고책 목록
      </Link>

      <div className="book-detail-container">
        {/* 상품 이미지 */}
        <section className="book-detail-image-section">
          <div
            className={`book-detail-image book-detail-image--${book.color || 'green'}`}
          >
            {book.imageUrl ? (
              <img
                className="book-detail-photo"
                src={book.imageUrl}
                alt={book.title}
              />
            ) : (
              <>
                <BookOpen size={100} strokeWidth={1.2} />
                <span>{book.title}</span>
              </>
            )}
          </div>

          <div className="book-detail-image-caption">
            <span>상품 이미지</span>
            <span>{book.imageUrl ? '등록된 사진' : '임시 이미지'}</span>
          </div>
        </section>

        {/* 상품 정보 */}
        <section className="book-detail-info">
          <div className="book-detail-status">
            <span className="book-detail-status__badge">
              {book.status}
            </span>

            <button
              type="button"
              className={`book-detail-favorite ${
                isFavorite ? 'is-favorite' : ''
              }`}
              onClick={handleFavorite}
              aria-label={isFavorite ? '찜 취소' : '찜하기'}
            >
              <Heart
                size={20}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              {isFavorite ? '찜 완료' : '찜하기'}
            </button>
          </div>

          <h1>{book.title}</h1>

          <p className="book-detail-department">
            {book.department}
          </p>

          <div className="book-detail-price">
            {book.price.toLocaleString('ko-KR')}원
          </div>

          <div className="book-detail-condition">
            <span>상품 상태</span>
            <strong>{book.condition}</strong>
          </div>

          <p className="book-detail-condition-description">
            {book.conditionDescription || '상품 상태 설명이 없습니다.'}
          </p>

          <div className="book-detail-divider" />

          {/* 상품 상세 정보 */}
          <div className="book-detail-spec">
            <div>
              <span>책 이름</span>
              <strong>{book.title}</strong>
            </div>

            <div>
              <span>학과</span>
              <strong>{book.department}</strong>
            </div>

            <div>
              <span>저자</span>
              <strong>{book.author || '미입력'}</strong>
            </div>

            <div>
              <span>등록일</span>
              <strong>
                <CalendarDays size={15} />
                {book.createdAt}
              </strong>
            </div>
          </div>

          <div className="book-detail-divider" />

          {/* 판매자 정보 */}
          <section className="book-seller">
            <h2>판매자 정보</h2>

            <div className="book-seller-profile">
              <div className="book-seller-avatar">
                <UserRound size={24} />
              </div>

              <div>
                <strong>{book.sellerName || '판매자'}</strong>
                <span>{book.sellerDepartment || book.department}</span>
              </div>

              <ShieldCheck
                size={21}
                className="book-seller-verified"
              />
            </div>
          </section>

          <button
            type="button"
            className="book-detail-contact"
            disabled
          >
            <MessageCircle size={19} />
            채팅 기능 연결 예정
          </button>

          <p className="book-detail-notice">
            <CheckCircle size={15} />
            실제 거래 전 상품 상태를 확인해 주세요.
          </p>
        </section>
      </div>

      {/* 상품 설명 */}
      <section className="book-description-section">
        <h2>상품 설명</h2>
        <p>{book.description || '상품 설명이 없습니다.'}</p>
      </section>

      {/* 판매자 상품 관리 */}
      <section className="book-detail-management">
        <div className="book-detail-management-heading">
          <div>
            <h2>상품 관리</h2>
            <p>등록된 상품 정보를 관리할 수 있습니다.</p>
          </div>
        </div>

        <div className="book-detail-management-status">
          <label htmlFor="book-sale-status">
            판매 상태 변경
          </label>

          <select
            id="book-sale-status"
            value={book.status}
            onChange={handleStatusChange}
          >
            {saleStatuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="book-management-error" role="alert">
            {error}
          </p>
        )}

        <div className="book-detail-management-actions">
          <Link
            to={`/books/${book.id}/edit`}
            className="book-edit-button"
          >
            <Pencil size={16} />
            상품 수정
          </Link>

          <button
            type="button"
            className="book-delete-button"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            상품 삭제
          </button>
        </div>

        <p className="book-management-notice">
          현재는 테스트용 관리 기능입니다. 실제 서비스에서는 판매자 본인만
          수정 및 삭제할 수 있도록 인증을 적용할 예정입니다.
        </p>
      </section>
    </main>
  )
}

export default BookDetailPage
