
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ImagePlus } from 'lucide-react'

import { getBooks, updateBook } from '../../data/bookStorage.js'
import './BookCreatePage.css'

const conditionDescriptions = {
  신품: '구매 후 사용하지 않은 새 상품입니다.',
  중고: '일반적인 사용감이 있는 중고 상품입니다.',
  '신품급 중고': '사용감이 거의 없어 새 상품에 가까운 상태입니다.',
  '필기 있음': '일부 페이지에 필기나 밑줄이 있는 상품입니다.',
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      try {
        const maxWidth = 1000
        const maxHeight = 1200

        const scale = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height
        )

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)

        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('이미지를 처리할 수 없습니다.')
        }

        context.fillStyle = '#FFFFFF'
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        )

        const compressedImage = canvas.toDataURL('image/jpeg', 0.75)

        URL.revokeObjectURL(objectUrl)
        resolve(compressedImage)
      } catch (error) {
        URL.revokeObjectURL(objectUrl)
        reject(error)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 읽을 수 없습니다.'))
    }

    image.src = objectUrl
  })
}

function BookEditPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()

  const [book] = useState(() =>
    getBooks().find(
      (item) => String(item.id) === bookId
    )
  )

  const [title, setTitle] = useState(book?.title || '')
  const [department, setDepartment] = useState(book?.department || '')
  const [price, setPrice] = useState(
    book ? String(book.price) : ''
  )
  const [condition, setCondition] = useState(
    book?.condition || '중고'
  )
  const [description, setDescription] = useState(
    book?.description || ''
  )

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(
    book?.imageUrl || ''
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!book) {
    return (
      <main className="book-create-page">
        <h1>상품을 찾을 수 없습니다.</h1>
        <Link to="/books">중고책 목록으로 돌아가기</Link>
      </main>
    )
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 등록할 수 있습니다.')
      event.target.value = ''
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('이미지는 8MB 이하의 파일만 등록할 수 있습니다.')
      event.target.value = ''
      return
    }

    setImageFile(file)

    const reader = new FileReader()

    reader.onload = () => {
      setImagePreview(reader.result)
    }

    reader.onerror = () => {
      setError('이미지를 미리 볼 수 없습니다.')
      setImageFile(null)
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (Number(price) <= 0 || !Number.isFinite(Number(price))) {
      setError('판매 가격은 0원보다 큰 숫자로 입력해 주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const imageUrl = imageFile
        ? await compressImage(imageFile)
        : book.imageUrl

      const updatedBook = updateBook(book.id, {
        title: title.trim(),
        department: department.trim(),
        price: Number(price),
        condition,
        conditionDescription: conditionDescriptions[condition],
        description: description.trim(),
        imageUrl,
      })

      navigate(`/books/${updatedBook.id}`)
    } catch (submitError) {
      console.error(submitError)
      setError(submitError.message || '상품 수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="book-create-page">
      <Link
        to={`/books/${book.id}`}
        className="book-create-back"
      >
        <ArrowLeft size={17} />
        상품 상세로 돌아가기
      </Link>

      <div className="book-create-heading">
        <span>CAMPUS MARKET</span>
        <h1>상품 정보 수정</h1>
        <p>변경할 상품 정보를 입력해 주세요.</p>
      </div>

      <form className="book-create-form" onSubmit={handleSubmit}>
        <section className="book-form-section">
          <h2>상품 사진</h2>

          <label className="book-form-upload">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="상품 미리보기"
                className="book-form-preview"
              />
            ) : (
              <div className="book-form-upload-placeholder">
                <ImagePlus size={38} />
                <strong>상품 사진 선택하기</strong>
                <span>JPG, PNG, WEBP · 최대 8MB</span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </section>

        <section className="book-form-section">
          <h2>상품 정보</h2>

          <div className="book-form-field">
            <label htmlFor="edit-book-title">책 이름 *</label>
            <input
              id="edit-book-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="book-form-field">
            <label htmlFor="edit-book-department">학과명 *</label>
            <input
              id="edit-book-department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="book-form-field">
            <label htmlFor="edit-book-price">판매 가격 *</label>

            <div className="book-form-price">
              <input
                id="edit-book-price"
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span>원</span>
            </div>
          </div>
        </section>

        <section className="book-form-section">
          <h2>상품 상태 *</h2>

          <div className="book-condition-options">
            {Object.keys(conditionDescriptions).map((item) => (
              <button
                type="button"
                key={item}
                className={`book-condition-option ${
                  condition === item ? 'is-selected' : ''
                }`}
                onClick={() => setCondition(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <p className="book-form-hint">
            {conditionDescriptions[condition]}
          </p>
        </section>

        <section className="book-form-section">
          <h2>상품 설명 *</h2>

          <textarea
            className="book-form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={6}
            required
          />

          <span className="book-form-character-count">
            {description.length}/1000
          </span>
        </section>

        {error && (
          <div className="book-form-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="book-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '수정 중...' : '수정 완료'}
        </button>
      </form>
    </main>
  )
}

export default BookEditPage
