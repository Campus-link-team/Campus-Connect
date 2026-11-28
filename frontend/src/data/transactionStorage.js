
import { getChats } from './chatStorage.js'
import { updateBook } from './bookStorage.js'
import { addNotification } from './notificationStorage.js'

const STORAGE_KEY = 'campuslink_transactions'

// 알림 생성 실패가 거래 완료에 영향을 주지 않도록 처리
function createNotificationSafely(notificationData) {
  try {
    addNotification(notificationData)
  } catch (error) {
    console.error('거래 알림 생성에 실패했습니다.', error)
  }
}

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

// 거래 내역 불러오기
export function getTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) return []

    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('거래 내역을 불러오지 못했습니다.', error)
    return []
  }
}

// 거래 내역 저장하기
function saveTransactions(transactions) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    )
  } catch (error) {
    console.error('거래 내역 저장에 실패했습니다.', error)
    throw new Error('거래 정보를 저장할 수 없습니다.', { cause: error })
  }
}

// 특정 상품의 채팅 참여자 중 구매 후보 목록 가져오기
export function getBookChatBuyers(bookId, seller) {
  if (!seller) return []

  const chats = getChats()
  const buyers = new Map()

  chats
    .filter(
      (chat) =>
        chat.type === 'book' &&
        String(chat.bookId) === String(bookId)
    )
    .forEach((chat) => {
      const participants = chat.participants || []

      // 판매자가 참여한 채팅방인지 확인
      const sellerExists = participants.some(
        (participant) => isSameUser(participant, seller)
      )

      if (!sellerExists) return

      // 판매자가 아닌 상대방을 구매 후보로 등록
      participants.forEach((participant) => {
        if (isSameUser(participant, seller)) return

        if (!participant.id && !participant.email) return

        const buyer = {
          id: String(participant.id || ''),
          email: participant.email || '',
          name: participant.name || '구매자',
        }

        const key = buyer.id
          ? `id:${buyer.id}`
          : `email:${buyer.email.toLowerCase()}`

        if (!buyers.has(key)) {
          buyers.set(key, buyer)
        }
      })
    })

  return Array.from(buyers.values())
}

// 거래 완료 및 구매자 연결
export function completeBookTransaction(book, seller, buyer) {
  if (!book || !seller || !buyer) {
    throw new Error('상품 또는 거래 참여자 정보가 없습니다.')
  }

  // 판매자 본인인지 확인
  const bookSeller = {
    id: String(book.sellerId || ''),
    email: book.sellerEmail || '',
  }

  if (!isSameUser(bookSeller, seller)) {
    throw new Error('상품 판매자만 거래를 완료할 수 있습니다.')
  }

  // 구매자가 해당 상품의 채팅 참여자인지 확인
  const validBuyers = getBookChatBuyers(book.id, seller)

  const selectedBuyer = validBuyers.find(
    (candidate) => isSameUser(candidate, buyer)
  )

  if (!selectedBuyer) {
    throw new Error(
      '해당 상품의 채팅 기록이 있는 구매자만 선택할 수 있습니다.'
    )
  }

  const transactions = getTransactions()

  // 이미 거래가 완료된 상품인지 확인
  const existingTransaction = transactions.find(
    (transaction) =>
      String(transaction.bookId) === String(book.id) &&
      transaction.status === 'completed'
  )

  if (existingTransaction) {
    throw new Error('이미 거래가 완료된 상품입니다.')
  }

  const transaction = {
    id: `transaction_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

    bookId: book.id,
    bookTitle: book.title,
    bookPrice: book.price,

    sellerId: String(seller.id || ''),
    sellerEmail: seller.email || '',
    sellerName: seller.name || book.sellerName || '판매자',

    buyerId: selectedBuyer.id,
    buyerEmail: selectedBuyer.email,
    buyerName: selectedBuyer.name,

    status: 'completed',

    completedAt: new Date().toISOString(),

    sellerReview: null,
    buyerReview: null,
  }

  // 거래 내역 저장
  const updatedTransactions = [
    ...transactions,
    transaction,
  ]

  saveTransactions(updatedTransactions)

  try {
    // 상품 판매 상태도 완료로 변경
    updateBook(book.id, {
      status: '거래 완료',
      transactionId: transaction.id,
      buyerId: selectedBuyer.id,
      buyerEmail: selectedBuyer.email,
      buyerName: selectedBuyer.name,
      soldAt: transaction.completedAt,
    })
  } catch (error) {
    // 상품 상태 변경 실패 시 거래 기록 롤백
    saveTransactions(transactions)
    throw error
  }

  // 구매자에게 거래 완료 알림
  createNotificationSafely({
    recipient: {
      id: selectedBuyer.id,
      email: selectedBuyer.email,
      name: selectedBuyer.name,
    },

    actor: {
      id: String(seller.id || ''),
      email: seller.email || '',
      name: seller.name || '판매자',
    },

    type: 'transaction_completed',
    title: '거래가 완료되었습니다.',
    message: `'${book.title}' 상품의 거래가 완료되었습니다.`,

    link: `/transactions/${transaction.id}/review`,
    relatedId: transaction.id,
  })

  return transaction
}

// 특정 거래 내역 조회
export function getTransactionById(transactionId) {
  return getTransactions().find(
    (transaction) => transaction.id === transactionId
  ) || null
}

// 특정 사용자의 거래 내역 조회
export function getTransactionsForUser(user) {
  if (!user) return []

  return getTransactions()
    .filter(
      (transaction) =>
        isSameUser(
          {
            id: transaction.sellerId,
            email: transaction.sellerEmail,
          },
          user
        ) ||
        isSameUser(
          {
            id: transaction.buyerId,
            email: transaction.buyerEmail,
          },
          user
        )
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt) - new Date(a.completedAt)
    )
}
