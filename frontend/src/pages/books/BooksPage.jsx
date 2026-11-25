import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Search, Plus, BookOpen } from 'lucide-react'
import { booksApi } from '../../api/booksApi.js'
import './BooksPage.css'

const saleFilters = ['전체', '판매 중', '예약 중', '판매 완료']

function BooksPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [books, setBooks] = useState([])
  const [loadState, setLoadState] = useState({ requestKey: null, error: '' })
  const requestKey = `${statusFilter}\u0000${search.trim()}`
  const loading = loadState.requestKey !== requestKey
  const error = loadState.requestKey === requestKey ? loadState.error : ''

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      let requestError = ''

      try {
        const result = await booksApi.list({
          status: statusFilter,
          keyword: search.trim() || undefined,
        })
        if (active) setBooks(result)
      } catch (e) {
        requestError = e.message || '도서 목록을 불러오지 못했습니다.'
      } finally {
        if (active) setLoadState({ requestKey, error: requestError })
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [requestKey, search, statusFilter])

  const filteredBooks = [...books].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return (
    <main className="books-page">
      <section className="books-page__heading">
        <div><span className="books-page__eyebrow">CAMPUS MARKET</span><h1>중고책 거래</h1><p>필요한 교재를 합리적인 가격으로 만나보세요.</p></div>
        <Link to="/books/new" className="books-page__register"><Plus size={18} /> 책 등록하기</Link>
      </section>
      <section className="books-toolbar">
        <div className="books-search"><Search size={19} /><input type="text" placeholder="책 제목, 저자 또는 키워드를 검색하세요." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="books-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="책 정렬 방식">
          <option value="latest">최신 등록순</option><option value="price-low">낮은 가격순</option><option value="price-high">높은 가격순</option>
        </select>
      </section>
      <section className="books-status-filter"><span className="books-status-filter__label">거래 상태</span><div className="books-status-filter__buttons">
        {saleFilters.map((filter) => <button type="button" key={filter} className={`books-status-button ${statusFilter === filter ? 'is-selected' : ''}`} onClick={() => setStatusFilter(filter)} aria-pressed={statusFilter === filter}>{filter}</button>)}
      </div></section>
      <section className="books-list">
        <div className="books-list__heading"><h2>{statusFilter === '전체' ? '등록된 중고책' : `${statusFilter} 상품`}</h2><span>총 {filteredBooks.length}개</span></div>
        {error && <div className="book-form-error" role="alert">{error}</div>}
        {loading ? <div className="books-empty">도서 목록을 불러오는 중입니다...</div> : filteredBooks.length ? (
          <div className="books-grid">{filteredBooks.map((book) => <Link to={`/books/${book.id}`} className="book-card" key={book.id}>
            <div className={`book-card__image book-card__image--green`}><BookOpen size={48} strokeWidth={1.3} /><span className="book-card__image-title">{book.title}</span></div>
            <div className="book-card__info"><span className={`book-card__status ${book.status === '판매 완료' ? 'is-completed' : book.status === '예약 중' ? 'is-reserved' : 'is-selling'}`}>{book.status}</span>
              <h3>{book.title}</h3><span className="book-card__department">{book.author} · {book.categoryLabel}</span><strong>{Number(book.price).toLocaleString('ko-KR')}원</strong>
              <small>{book.seller?.nickname || '판매자'} · {book.tradePlace || '거래 장소 협의'}</small></div>
          </Link>)}</div>
        ) : <div className="books-empty"><BookOpen size={40} /><p>{error ? '' : '검색 결과가 없습니다.'}</p><span>다른 검색어나 거래 상태를 선택해 보세요.</span></div>}
      </section>
    </main>
  )
}
export default BooksPage
