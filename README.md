# Campus-Connect

교내 중고책 거래와 프로젝트 팀원 모집을 한곳에서 이용하는 대학 캡스톤 웹 서비스입니다. 백엔드(Spring Boot)와 프론트엔드(React, Vite)로 구성되며, 로컬에서 함께 실행해 사용합니다.

## 핵심 기능

- 학교 이메일(@syu.ac.kr) 인증 후 회원가입과 로그인 (인증 코드는 Mock 방식)
- 중고책 판매글 등록, 조회, 키워드 검색, 찜, 판매 상태 관리
- 거래 완료 시 채팅한 회원 중 구매자 지정, 지정된 구매자의 판매자 후기와 평점
- 판매글을 중심으로 한 채팅과 메시지 저장
- 프로젝트 모집글 작성, 작성자 승인 방식의 지원, 정원 도달 시 자동 마감과 직접 마감
- 마이페이지에서 내 판매글, 모집글, 지원 내역, 찜 목록 확인

이미지 업로드와 외부 배포는 이번 범위에서 제외했고, 결과는 로컬 실행 화면으로 시연합니다.

## 팀 역할

| 역할 | 주요 업무 |
| --- | --- |
| PM | 요구사항·일정 정리, 협업 문서 관리 |
| 프론트엔드 | 화면, 사용자 흐름, API 연동 |
| 백엔드 | API, 인증, 데이터 모델, 채팅 구현 |
| 팀 공통 | 기능 검토, 테스트, 코드 리뷰 |

세부 담당 기능은 팀 논의와 작업 이슈에서 정합니다.

## 기술 스택

| 영역 | 기본안 |
| --- | --- |
| 프론트엔드 | React, Vite, JavaScript |
| 백엔드 | Spring Boot, Java 17, Gradle, Spring Web, JPA, Spring Security, JWT |
| 데이터베이스 | MySQL 8.x |
| 채팅 | 서버는 WebSocket(STOMP)과 REST를 제공, 화면은 REST 주기 조회로 새 메시지 표시 |

## 디렉터리

```text
Campus-Connect/
├── frontend/                   # 프론트엔드 코드
├── backend/                    # 백엔드 코드
├── docs/
│   ├── data-model.md           # 초기 데이터 모델 초안
│   ├── wireframe.md            # 화면 구성 참고 예시
│   └── images/                 # 설계 문서용 이미지
├── .github/
│   └── pull_request_template.md
├── CONTRIBUTING.md             # 협업 방법
├── .editorconfig
├── .gitignore
└── README.md
```

## 실행 방법

준비 환경은 JDK 17, MySQL 8.x, Node.js 22.22.0 이상입니다.

1. MySQL에 데이터베이스를 만듭니다.

   ```sql
   CREATE DATABASE IF NOT EXISTS campus_connect CHARACTER SET utf8mb4;
   ```

2. `backend/src/main/resources/application-local.yml.example`을 같은 폴더에 `application-local.yml`로 복사하고, 본인의 MySQL 계정 정보를 입력합니다. 이 파일은 `.gitignore`에 포함되어 있으니 GitHub나 메신저에 올리지 않습니다.
3. 백엔드를 실행합니다. 기본 주소는 `http://localhost:8080`입니다.

   ```bash
   cd backend
   ./gradlew bootRun          # Windows: .\gradlew.bat bootRun
   ```

4. 새 터미널에서 프론트엔드를 실행하고 `http://localhost:5173`에 접속합니다. 개발 서버가 `/api` 요청을 8080으로 전달합니다.

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

API 연동 범위와 알려진 제약은 `frontend/INTEGRATION_GUIDE_KO.md`를 참고하세요.

## 브랜치와 PR

`main`은 안정 버전, `develop`은 개발 통합 브랜치입니다. 작업은 `develop`에서 `feature/*`, `fix/*`, `chore/*` 브랜치를 만들어 진행하고, 완료 후 `develop`으로 PR을 보냅니다. `main`과 `develop`에 직접 푸시하지 않습니다. 자세한 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 설계 문서

- [초기 데이터 모델·쉬운 개념도](docs/data-model.md)
- [와이어프레임 예시](docs/wireframe.md)

설계 문서의 이미지는 팀 논의를 위한 참고 자료이며, 실제 DB 설계나 화면 디자인의 확정본이 아닙니다.
