# 인증 API 명세 (v0.1)

학교 이메일 인증, 회원가입, 로그인, 내 정보 조회를 다룹니다. 응답·에러 형식 같은 공통 규칙은 [README](./README.md)를 따릅니다.

## 개요

### JWT 인증 방식

로그인에 성공하면 서버가 JWT Access Token을 발급하고, 클라이언트는 이후 요청마다 이 토큰으로 사용자를 증명합니다. 서버는 로그인 상태를 따로 저장하지 않습니다.

1. 사용자가 학교 이메일과 비밀번호를 입력해 로그인을 요청합니다.
2. 서버가 로그인 정보를 검증하고 Access Token을 발급해 클라이언트에 전달합니다.
3. 클라이언트는 API를 요청할 때마다 Access Token을 헤더에 담아 보냅니다.
4. 서버는 토큰의 서명(Secret key), 만료 시간(exp), 변조 여부를 확인합니다.
5. 검증에 성공하면 요청을 처리합니다.
6. Access Token이 만료되면 사용자는 다시 로그인합니다.

### 전체 흐름

```
① 인증 코드 요청 → ② 인증 코드 확인 → ③ 회원가입 → ④ 로그인 → ⑤ 토큰으로 API 호출
```

- 학교 이메일 인증을 마친 이메일만 회원가입할 수 있습니다.
- 비밀번호는 해시 처리해 저장하며, 원문은 저장하지 않습니다.

### 입력 규칙

| 항목 | 규칙                                          |
| --- |---------------------------------------------|
| 이메일 | 학교 이메일 도메인(토의 후 결정)만 허용, 로그인 아이디로 사용, 중복 불가 |
| 비밀번호 | 8~20자, 영문·숫자·특수문자 조합                        |
| 닉네임 | 2~15자, 중복 불가                                |
| 인증 코드 | 숫자 6자리, 유효 시간 5분                            |

## API 목록

| 기능 | 메서드 | URL | 인증 |
| --- | --- | --- | --- |
| 인증 코드 요청 | POST | `/api/auth/email/send-code` | 불필요 |
| 인증 코드 확인 | POST | `/api/auth/email/verify` | 불필요 |
| 닉네임 중복 확인 | GET | `/api/auth/nickname/check` | 불필요 |
| 회원가입 | POST | `/api/auth/signup` | 불필요 |
| 로그인 | POST | `/api/auth/login` | 불필요 |
| 내 정보 조회 | GET | `/api/users/me` | 필요 |

---

## 1. 인증 코드 요청

학교 이메일로 6자리 인증 코드를 보냅니다.

`POST /api/auth/email/send-code`

**요청**

```json
{ "email": "student@syu.ac.kr" }
```

**응답** `200 OK`

```json
{ "expiresIn": 300 }
```

- `expiresIn`: 인증 코드 유효 시간(초)

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `INVALID_SCHOOL_EMAIL` | 400 | 학교 이메일 도메인이 아님 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이미 가입된 이메일 |

## 2. 인증 코드 확인

`POST /api/auth/email/verify`

**요청**

```json
{ "email": "student@syu.ac.kr", "code": "482913" }
```

**응답** `200 OK` (본문 없음)

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `VERIFICATION_CODE_MISMATCH` | 400 | 코드 불일치 |
| `VERIFICATION_CODE_EXPIRED` | 400 | 유효 시간 초과 (다시 요청 필요) |

## 3. 닉네임 중복 확인

회원가입 화면에서 닉네임을 입력할 때 사용할 수 있는지 미리 확인합니다.

`GET /api/auth/nickname/check?nickname=홍길동`

**응답** `200 OK`

```json
{ "available": true }
```

- `available`: 사용 가능하면 `true`, 이미 사용 중이면 `false`

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `INVALID_INPUT` | 400 | 닉네임 규칙 위반 (2~15자) |

## 4. 회원가입

`POST /api/auth/signup`

**요청**

```json
{
  "email": "student@syu.ac.kr",
  "password": "abcd1234!",
  "nickname": "홍길동"
}
```

| 필드 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| email | String | O | 2번에서 인증을 마친 이메일 |
| password | String | O | 8~20자, 영문·숫자·특수문자 조합 |
| nickname | String | O | 2~15자, 중복 불가 |

**응답** `201 Created`

```json
{
  "id": 1,
  "email": "student@syu.ac.kr",
  "nickname": "홍길동"
}
```

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `INVALID_INPUT` | 400 | 비밀번호·닉네임 규칙 위반 |
| `EMAIL_NOT_VERIFIED` | 400 | 이메일 인증을 하지 않음 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이미 가입된 이메일 |
| `NICKNAME_ALREADY_EXISTS` | 409 | 이미 사용 중인 닉네임 |

## 5. 로그인

`POST /api/auth/login`

**요청**

```json
{ "email": "student@syu.ac.kr", "password": "abcd1234!" }
```

**응답** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

- `expiresIn`: 토큰 유효 시간(초)

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `LOGIN_FAILED` | 401 | 이메일 또는 비밀번호 불일치 |

> 보안상 "가입되지 않은 이메일"과 "틀린 비밀번호"를 구분하지 않고 같은 에러로 응답합니다.

## 6. 내 정보 조회

`GET /api/users/me`

**요청 헤더**

```
Authorization: Bearer {accessToken}
```

**응답** `200 OK`

```json
{
  "id": 1,
  "email": "student@syu.ac.kr",
  "nickname": "홍길동",
  "createdAt": "2026-10-09T14:30:00"
}
```

**에러**

| code | 상태 | 상황 |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | 토큰 없음 또는 유효하지 않음 |
| `TOKEN_EXPIRED` | 401 | 토큰 만료 (다시 로그인 필요) |

---

## 프론트 참고 사항

- **토큰 저장**: 로그인 응답의 `accessToken`을 저장하고, 인증이 필요한 요청마다 `Authorization` 헤더에 넣습니다.
- **로그아웃**: 별도 API 없이 클라이언트에 저장한 토큰을 삭제합니다.
- **토큰 만료**: `401`과 `TOKEN_EXPIRED`를 받으면 로그인 화면으로 이동합니다.

## 고도화 계획

현재 범위에는 포함하지 않으며, 기본 기능이 안정된 뒤 검토합니다.

- **Refresh Token**: Access Token이 만료돼도 다시 로그인하지 않도록 재발급 토큰을 도입합니다.
- **서버 측 로그아웃**: 로그아웃한 토큰을 서버에서 무효화합니다 (블랙리스트 등).
- **SNS 로그인**: 최초 로그인 시 닉네임을 입력받아 회원가입을 진행합니다. SNS 로그인 사용자도 학교 이메일 인증을 거치도록 할지 함께 정합니다.
- **회원 정보 수정**: 닉네임·비밀번호 변경은 회원 API 명세(`users.md`)에서 다룹니다.

## 추후 결정할 것

- [ ] 실제 학교 이메일 도메인 (현재 예시: `@syu.ac.kr`) - 학교 이메일과 연동 힘들면 SNS 혹은 EMAIL 포털 사이트 Auth로 전환
- [ ] 인증 코드 재요청 제한 (예: 1분에 1번)
- [ ] Access Token 유효 시간 - 회의
