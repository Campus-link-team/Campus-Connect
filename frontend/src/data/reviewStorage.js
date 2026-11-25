
import { getTransactions } from './transactionStorage.js'
import { addNotification } from './notificationStorage.js'

const STORAGE_KEY = 'campuslink_transactions'

// 사용자 일치 여부 확인
function isSameUser(a, b) {
  if (!a || !b) return false

  if (
    a.id &&
    b.id &&
    String(a.id) === String(b.id)
  ) {
    return true
  }

  return Boolean(
    a.email &&
    b.email &&
    a.email.toLowerCase() === b.email.toLowerCase()
  )
}

// 알림 생성 실패가 평가 저장에 영향을 주지 않도록 처리
function createNotificationSafely(notificationData) {
  try {
    addNotification(notificationData)
  } catch (error) {
    console.error('평가 알림 생성에 실패했습니다.', error)
  }
}

// 거래 내역 저장
function saveTransactions(transactions) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    )
  } catch (error) {
    console.error('평가 저장에 실패했습니다.', error)
    throw new Error('평가 정보를 저장할 수 없습니다.', { cause: error })
  }
}

// 특정 거래에 대한 평가 제출
export function submitTransactionReview(
  transactionId,
  reviewer,
  reviewData
) {
  if (!reviewer) {
    throw new Error('로그인이 필요합니다.')
  }

  const transactions = getTransactions()

  const transactionIndex = transactions.findIndex(
    (item) => String(item.id) === String(transactionId)
  )

  if (transactionIndex === -1) {
    throw new Error('거래 내역을 찾을 수 없습니다.')
  }

  const transaction = transactions[transactionIndex]

  if (transaction.status !== 'completed') {
    throw new Error('완료된 거래만 평가할 수 있습니다.')
  }

  // 판매자 또는 구매자인지 확인
  let reviewField
  let target

  const seller = {
    id: transaction.sellerId,
    email: transaction.sellerEmail,
  }

  const buyer = {
    id: transaction.buyerId,
    email: transaction.buyerEmail,
  }

  if (isSameUser(seller, reviewer)) {
    reviewField = 'sellerReview'
    target = {
      id: transaction.buyerId,
      email: transaction.buyerEmail,
      name: transaction.buyerName,
    }
  } else if (isSameUser(buyer, reviewer)) {
    reviewField = 'buyerReview'
    target = {
      id: transaction.sellerId,
      email: transaction.sellerEmail,
      name: transaction.sellerName,
    }
  } else {
    throw new Error('해당 거래의 참여자만 평가할 수 있습니다.')
  }

  // 중복 평가 방지
  if (transaction[reviewField]) {
    throw new Error('이미 평가를 작성한 거래입니다.')
  }

  const rating = Number(reviewData.rating)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('평점은 1점부터 5점까지 선택할 수 있습니다.')
  }

  const tags = Array.isArray(reviewData.tags)
    ? [...new Set(
        reviewData.tags
          .filter((tag) => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter(Boolean)
      )].slice(0, 5)
    : []

  const comment = String(reviewData.comment || '').trim()

  if (comment.length > 500) {
    throw new Error('후기는 500자 이내로 작성해 주세요.')
  }

  if (tags.length === 0 && !comment) {
    throw new Error('매너 평가 항목이나 후기를 작성해 주세요.')
  }

  // 평가 데이터 생성
  const review = {
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

    transactionId: transaction.id,

    reviewerId: String(reviewer.id || ''),
    reviewerEmail: reviewer.email || '',
    reviewerName: reviewer.name || '사용자',

    targetId: String(target.id || ''),
    targetEmail: target.email || '',
    targetName: target.name || '사용자',

    rating,
    tags,
    comment,

    createdAt: new Date().toISOString(),
  }

  const updatedTransaction = {
    ...transaction,
    [reviewField]: review,
  }

  const updatedTransactions = [...transactions]
  updatedTransactions[transactionIndex] = updatedTransaction

  // 평가 저장
  saveTransactions(updatedTransactions)

  // 평가를 받은 상대방에게 알림
  if (target.id || target.email) {
    createNotificationSafely({
      recipient: {
        id: String(target.id || ''),
        email: target.email || '',
        name: target.name || '사용자',
      },

      actor: {
        id: String(reviewer.id || ''),
        email: reviewer.email || '',
        name: reviewer.name || '사용자',
      },

      type: 'review_received',
      title: '새로운 거래 후기가 도착했습니다.',
      message: `${reviewer.name || '사용자'}님이 '${transaction.bookTitle}' 거래에 후기를 남겼습니다.`,

      link: '/mypage#my-reviews',
      relatedId: transaction.id,
    })
  }

  return review
}

// 내가 특정 거래에 평가를 작성했는지 확인
export function hasReviewedTransaction(transaction, user) {
  if (!transaction || !user) return false

  const seller = {
    id: transaction.sellerId,
    email: transaction.sellerEmail,
  }

  const buyer = {
    id: transaction.buyerId,
    email: transaction.buyerEmail,
  }

  if (isSameUser(seller, user)) {
    return Boolean(transaction.sellerReview)
  }

  if (isSameUser(buyer, user)) {
    return Boolean(transaction.buyerReview)
  }

  return false
}

// 사용자가 받은 전체 평가 조회
export function getReceivedReviews(user) {
  if (!user) return []

  const transactions = getTransactions()
  const reviews = []

  transactions.forEach((transaction) => {
    if (transaction.sellerReview) {
      const review = transaction.sellerReview

      if (
        isSameUser(
          {
            id: review.targetId,
            email: review.targetEmail,
          },
          user
        )
      ) {
        reviews.push({
          ...review,
          bookTitle: transaction.bookTitle,
        })
      }
    }

    if (transaction.buyerReview) {
      const review = transaction.buyerReview

      if (
        isSameUser(
          {
            id: review.targetId,
            email: review.targetEmail,
          },
          user
        )
      ) {
        reviews.push({
          ...review,
          bookTitle: transaction.bookTitle,
        })
      }
    }
  })

  return reviews.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
}

// 사용자의 매너 온도 및 평가 통계
export function getMannerSummary(user) {
  const reviews = getReceivedReviews(user)

  if (reviews.length === 0) {
    return {
      temperature: 36.5,
      reviewCount: 0,
      averageRating: 0,
    }
  }

  const totalRating = reviews.reduce(
    (total, review) => total + review.rating,
    0
  )

  const averageRating = totalRating / reviews.length

  // 평균 별점 1점당 0.5도 상승
  const temperature = Math.min(
    99.9,
    36.5 + averageRating * 0.5
  )

  return {
    temperature: Number(temperature.toFixed(1)),
    reviewCount: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
  }
}
