
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { addBook } from '../../data/bookStorage.js'
import './BookCreatePage.css'

const conditionDescriptions = {
  신품: '구매 후 사용하지 않은 새 상품입니다.',
  중고: '일반적인 사용감이 있는 중고 상품입니다.',
  '신품급 중고': '사용감이 거의 없어 새 상품에 가까운 상태입니다.',
  '필기 있음': '일부 페이지에 필기나 밑줄이 있는 상품입니다.',
}

// 이미지 압축
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

function BookCreatePage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('중고')
  const [description, setDescription] = useState('')

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 사진 선택: 선택하지 않아도 등록 가능
  function handleImageChange(event) {
    const file = event.target.files?.[0]

    setError('')

    if (!file) return

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

  // 상품 등록
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('책 이름을 입력해 주세요.')
      return
    }

    if (!department.trim()) {
      setError('학과명을 입력해 주세요.')
      return
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      setError('판매 가격은 0원보다 큰 숫자로 입력해 주세요.')
      return
    }

    if (!description.trim()) {
      setError('상품 설명을 입력해 주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 사진을 선택한 경우에만 압축
      // 선택하지 않았다면 빈 문자열 저장
      const imageUrl = imageFile
        ? await compressImage(imageFile)
        : ''

      const newBook = addBook({
        title: title.trim(),
        department: department.trim(),
        author: '',
        price: Number(price),
        condition,
        conditionDescription: conditionDescriptions[condition],
        description: description.trim(),
        imageUrl,
        sellerName: '테스트 판매자',
        sellerDepartment: department.trim(),
        color: 'green',
      })

      // 등록한 상품의 상세 페이지로 이동
      navigate(`/books/${newBook.id}`)
    } catch (submitError) {
      console.error(submitError)

      setError(
        submitError.message ||
        '상품 등록에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="book-create-page">
      <Link to="/books" className="book-create-back">
        <ArrowLeft size={17} />
        중고책 목록으로
      </Link>

      <div className="book-create-heading">
        <span>CAMPUS MARKET</span>
        <h1>중고책 상품 등록</h1>
        <p>판매할 교재의 정보를 입력해 주세요.</p>
      </div>

      <form className="book-create-form" onSubmit={handleSubmit}>
        {/* 상품 사진 - 선택 사항 */}
        <section className="book-form-section">
          <h2>상품 사진 <span className="optional-label">선택</span></h2>

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
                <span>사진 없이도 상품을 등록할 수 있습니다.</span>
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

        {/* 상품 정보 */}
        <section className="book-form-section">
          <h2>상품 정보</h2>

          <div className="book-form-field">
            <label htmlFor="book-title">
              책 이름 <span>*</span>
            </label>

            <input
              id="book-title"
              type="text"
              placeholder="예: 컴퓨터 네트워크"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="book-form-field">
            <label htmlFor="book-department">
              학과명 <span>*</span>
            </label>

            <input
              id="book-department"
              type="text"
              placeholder="예: 컴퓨터공학부"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="book-form-field">
            <label htmlFor="book-price">
              판매 가격 <span>*</span>
            </label>

            <div className="book-form-price">
              <input
                id="book-price"
                type="number"
                min="1"
                step="1"
                placeholder="판매 가격 입력"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span>원</span>
            </div>
          </div>
        </section>

        {/* 상품 상태 */}
        <section className="book-form-section">
          <h2>상품 상태 <span>*</span></h2>

          <div className="book-condition-options">
            {Object.keys(conditionDescriptions).map((item) => (
              <button
                key={item}
                type="button"
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

        {/* 상품 설명 */}
        <section className="book-form-section">
          <h2>상품 설명 <span>*</span></h2>

          <textarea
            className="book-form-description"
            placeholder="책의 상태, 사용감, 거래에 필요한 내용을 작성해 주세요."
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

        {/* 오류 메시지 */}
        {error && (
          <div className="book-form-error" role="alert">
            {error}
          </div>
        )}

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="book-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '상품 등록하기'}
        </button>

        <p className="book-form-notice">
          사진은 선택 사항이며, 상품 정보는 현재 사용하는 브라우저에 저장됩니다.
        </p>
      </form>
    </main>
  )
}

export default BookCreatePage
