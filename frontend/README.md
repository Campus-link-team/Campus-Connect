# CampusConnect 프론트엔드

CampusConnect의 React 기반 프론트엔드입니다. 백엔드는 별도 Spring Boot 애플리케이션으로 실행하며, 개발 서버의 `/api` 요청은 Vite 프록시를 통해 `http://localhost:8080`으로 전달됩니다.

## 개발 환경

- Node.js 22.22.0 이상 권장 (`react-router` 패키지 엔진 조건)
- npm
- Spring Boot 백엔드 실행 주소: `http://localhost:8080`

## 실행 방법 (Windows PowerShell)

```powershell
npm.cmd ci
npm.cmd run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 검사 및 빌드

```powershell
npm.cmd run lint
npm.cmd run build
```

## 환경 설정

기본 개발 환경에서는 `vite.config.js`의 `/api` 프록시를 사용합니다. 별도의 API 주소가 필요하면 `.env.example`을 참고해 로컬 `.env`를 만들 수 있습니다. 실제 `.env`와 비밀번호·토큰은 저장소에 커밋하지 마세요.

## 기능 범위 및 백엔드 제약

자세한 프론트엔드와 백엔드 API 연결 범위, 현재 백엔드 제약 및 테스트 항목은 [`INTEGRATION_GUIDE_KO.md`](./INTEGRATION_GUIDE_KO.md)를 참고하세요.
