
const STORAGE_KEY = 'campuslink_favorite_books'

// 찜한 책의 ID 목록 불러오기
export function getFavoriteBookIds() {
  try {
    const savedFavorites = localStorage.getItem(STORAGE_KEY)

    if (!savedFavorites) {
      return []
    }

    const parsedFavorites = JSON.parse(savedFavorites)

    if (!Array.isArray(parsedFavorites)) {
      return []
    }

    return parsedFavorites.map(String)
  } catch (error) {
    console.error('찜 목록을 불러오지 못했습니다.', error)
    return []
  }
}

// 특정 책이 찜 목록에 있는지 확인
export function isFavoriteBook(bookId) {
  const favoriteIds = getFavoriteBookIds()

  return favoriteIds.includes(String(bookId))
}

// 찜하기 또는 찜 취소
export function toggleFavoriteBook(bookId) {
  const favoriteIds = getFavoriteBookIds()
  const targetId = String(bookId)

  const isAlreadyFavorite = favoriteIds.includes(targetId)

  const updatedFavorites = isAlreadyFavorite
    ? favoriteIds.filter((id) => id !== targetId)
    : [...favoriteIds, targetId]

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedFavorites)
    )

    return !isAlreadyFavorite
  } catch (error) {
    console.error('찜 목록 저장에 실패했습니다.', error)
    throw new Error('찜 상태를 저장하지 못했습니다.')
  }
}

// 찜한 책 전체 초기화
export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY)
}
