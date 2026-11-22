# 중고책 판매글 API (`/api/v1/books`)

모든 요청에 `Authorization: Bearer {accessToken}` 필요.
응답 형식: 성공 `{ "data": ..., "error": null }`, 실패 `{ "data": null, "error": { "code": "...", "message": "..." } }`

## 값

| 항목 | 값 |
|---|---|
| `category` | `MAJOR`(전공), `GENERAL`(교양) |
| `status` | `ON_SALE`(판매중), `RESERVED`(예약중), `SOLD`(거래완료) — 세 가지로 고정 |

## 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/v1/books` | 판매글 등록 (상태는 `ON_SALE` 로 시작) | 로그인 |
| GET | `/api/v1/books?category=&status=&keyword=` | 목록. 모두 선택. `keyword` 는 교재명·저자 검색 | 없음 |
| GET | `/api/v1/books/{id}` | 상세 | 없음 |
| GET | `/api/v1/books/{id}/chat-partners` | 구매자 후보 (이 판매글로 채팅한 회원 id·닉네임) | 작성자 |
| GET | `/api/v1/users/me/books` | 내 판매글 목록 | 로그인 |
| PATCH | `/api/v1/books/{id}` | 수정 (보낸 필드만 변경, 모집글 수정과 같은 방식) | 작성자 |
| DELETE | `/api/v1/books/{id}` | 삭제 | 작성자 |
| PATCH | `/api/v1/books/{id}/status` | 판매 상태 변경 | 작성자 |

목록 정렬: 판매중 → 예약중 → 거래완료, 같은 상태끼리는 최신순.

## 등록 요청

```json
{
  "title": "자료구조",
  "author": "홍길동",
  "price": 15000,
  "category": "MAJOR",
  "description": "필기 조금 있어요",
  "tradePlace": "중앙도서관 앞"
}
```

`tradePlace` 는 선택. 수정(PATCH) 때 `""` 로 보내면 삭제됩니다.

## 판매 상태 변경

```json
{ "status": "SOLD", "buyerId": 3 }
```

- `buyerId` 는 `SOLD` 일 때만 선택적으로 보냅니다.
  - 넣으면: 이 판매글로 채팅한 회원인지 확인 후 구매자로 지정 (아니면 `INVALID_BUYER`)
  - 안 넣으면: 구매자 없이 거래완료 (이 경우 후기 없음)
- `SOLD` 가 된 판매글은 다시 상태를 바꿀 수 없습니다 (`ALREADY_SOLD`).

## 응답 예시

```json
{
  "data": {
    "id": 1, "title": "자료구조", "author": "홍길동", "price": 15000,
    "category": "MAJOR", "description": "필기 조금 있어요", "tradePlace": "중앙도서관 앞",
    "status": "SOLD",
    "seller": { "id": 1, "nickname": "판매자" },
    "buyer": { "id": 3, "nickname": "구매자" },
    "createdAt": "2026-11-17T16:00:00", "updatedAt": "2026-11-17T16:10:00"
  },
  "error": null
}
```

## 오류 코드

| code | HTTP | 상황 |
|---|---|---|
| `INVALID_INPUT` | 400 | 필수값 누락, 없는 카테고리/상태 값, SOLD 가 아닌데 buyerId 전송 |
| `INVALID_BUYER` | 400 | 채팅하지 않은 회원(또는 판매자 본인)을 구매자로 지정 |
| `UNAUTHORIZED` | 401 | 토큰 없음/잘못됨 |
| `NOT_BOOK_POST_OWNER` | 403 | 작성자가 아닌 회원의 수정·삭제·상태 변경 |
| `BOOK_POST_NOT_FOUND` | 404 | 없는 판매글 |
| `ALREADY_SOLD` | 409 | 거래완료된 판매글의 상태 변경 |
| `BOOK_POST_HAS_CHAT` | 409 | 채팅이 진행된 판매글 삭제 |
