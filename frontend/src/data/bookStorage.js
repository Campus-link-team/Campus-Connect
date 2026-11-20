
import { sampleBooks } from './books.js'

const STORAGE_KEY = 'campuslink_books'

// 저장된 책 목록 불러오기
export function getBooks() {
  try {
    const savedBooks = localStorage.getItem(STORAGE_KEY)

    if (!savedBooks) {
      return sampleBooks
    }

    const parsedBooks = JSON.parse(savedBooks)

    if (!Array.isArray(parsedBooks)) {
      return sampleBooks
    }

    return parsedBooks
  } catch (error) {
    console.error('책 목록을 불러오지 못했습니다.', error)
    return sampleBooks
  }
}

// 책 목록 저장하기
function saveBooks(books) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(books)
    )
  } catch (error) {
    console.error('책 목록 저장에 실패했습니다.', error)
    throw new Error(
      '저장 공간이 부족하거나 상품 정보를 저장할 수 없습니다.'
    )
  }
}

// 새로운 책 등록하기
export function addBook(bookData) {
  const books = getBooks()

  const newBook = {
    ...bookData,
    id: Date.now(),
    createdAt: new Date().toLocaleDateString('ko-KR'),
    createdOrder: Date.now(),
    status: '판매 중',
  }

  const updatedBooks = [newBook, ...books]

  saveBooks(updatedBooks)

  return newBook
}

// 기존 책 정보 수정하기
export function updateBook(bookId, updatedData) {
  const books = getBooks()

  const index = books.findIndex(
    (book) => String(book.id) === String(bookId)
  )

  if (index === -1) {
    throw new Error('수정할 상품을 찾을 수 없습니다.')
  }

  const updatedBook = {
    ...books[index],
    ...updatedData,
    id: books[index].id,
  }

  const updatedBooks = [...books]
  updatedBooks[index] = updatedBook

  saveBooks(updatedBooks)

  return updatedBook
}

// 책 삭제하기
export function deleteBook(bookId) {
  const books = getBooks()

  const updatedBooks = books.filter(
    (book) => String(book.id) !== String(bookId)
  )

  if (books.length === updatedBooks.length) {
    throw new Error('삭제할 상품을 찾을 수 없습니다.')
  }

  saveBooks(updatedBooks)

  return true
}
