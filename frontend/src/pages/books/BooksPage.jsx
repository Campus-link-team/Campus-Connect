
import { useState } from 'react'
import { Link } from 'react-router'
import { Search, Plus, BookOpen } from 'lucide-react'
import { getBooks } from '../../data/bookStorage.js'
import './BooksPage.css'

const saleFilters = [
  '전체',
  '판매 중',
  '예약 중',
  '판매 완료',
]

function BooksPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [books] = useState(() => getBooks())

  // 검색, 판매 상태 필터링, 정렬
  const filteredBooks = books
    .filter((book) => {
      const keyword = search.trim().toLowerCase()

      const matchesSearch =
        book.title.toLowerCase().includes(keyword) ||
        book.department.toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === '전체' ||
        book.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sort === 'price-low') {
        return a.price - b.price
      }

      if (sort === 'price-high') {
        return b.price - a.price
      }

      return (b.createdOrder || 0) - (a.createdOrder || 0)
    })

  return (
    <main className="books-page">
      {/* 페이지 제목 */}
      <section className="books-page__heading">
        <div>
          <span className="books-page__eyebrow">
            CAMPUS MARKET
          </span>

          <h1>중고책 거래</h1>

          <p>
            필요한 교재를 합리적인 가격으로 만나보세요.
          </p>
        </div>

        <Link to="/books/new" className="books-page__register">
          <Plus size={18} />
          책 등록하기
        </Link>
      </section>

      {/* 검색 및 정렬 */}
      <section className="books-toolbar">
        <div className="books-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="책 제목 또는 학과명을 검색하세요."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="books-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="책 정렬 방식"
        >
          <option value="latest">최신 등록순</option>
          <option value="price-low">낮은 가격순</option>
          <option value="price-high">높은 가격순</option>
        </select>
      </section>

      {/* 판매 상태 필터 */}
      <section className="books-status-filter">
        <span className="books-status-filter__label">
          거래 상태
        </span>

        <div className="books-status-filter__buttons">
          {saleFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={`books-status-button ${
                statusFilter === filter ? 'is-selected' : ''
              }`}
              onClick={() => setStatusFilter(filter)}
              aria-pressed={statusFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 책 목록 */}
      <section className="books-list">
        <div className="books-list__heading">
          <h2>
            {statusFilter === '전체'
              ? '등록된 중고책'
              : statusFilter + ' 상품'}
          </h2>

          <span>총 {filteredBooks.length}개</span>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <Link
                to={`/books/${book.id}`}
                className="book-card"
                key={book.id}
              >
                {/* 상품 이미지 */}
                <div
                  className={`book-card__image book-card__image--${book.color || 'green'}`}
                >
                  {book.imageUrl ? (
                    <img
                      className="book-card__photo"
                      src={book.imageUrl}
                      alt={book.title}
                    />
                  ) : (
                    <>
                      <BookOpen size={48} strokeWidth={1.3} />

                      <span className="book-card__image-title">
                        {book.title}
                      </span>
                    </>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="book-card__info">
                  <span
                    className={`book-card__status ${
                      book.status === '판매 완료'
                        ? 'is-completed'
                        : book.status === '예약 중'
                          ? 'is-reserved'
                          : 'is-selling'
                    }`}
                  >
                    {book.status}
                  </span>

                  <h3>{book.title}</h3>

                  <span className="book-card__department">
                    {book.department}
                  </span>

                  <strong>
                    {book.price.toLocaleString('ko-KR')}원
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="books-empty">
            <BookOpen size={40} />

            <p>검색 결과가 없습니다.</p>

            <span>
              다른 검색어나 거래 상태를 선택해 보세요.
            </span>
          </div>
        )}
      </section>
    </main>
  )
}

export default BooksPage
