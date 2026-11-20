# Campus-Connect

교내 중고책 거래와 프로젝트·활동 모집을 한곳에서 이용하는 대학 캡스톤 웹 서비스입니다. 현재 저장소는 개발을 시작하기 위한 협업 구조와 데이터 모델 초안을 담고 있습니다.

## 핵심 기능

- 학교 이메일을 이용한 회원 인증
- 중고책 판매글 등록·조회, 찜, 거래 상태 관리와 거래 후기
- 판매글을 중심으로 한 실시간 채팅 및 메시지 저장
- 프로젝트·활동 모집글 작성과 정원 기준 선착순 신청

이미지 업로드는 현재 구현 범위에서 제외합니다.

## 팀 역할

| 역할 | 주요 업무 |
| --- | --- |
| PM | 요구사항·일정 정리, 협업 문서 관리 |
| 프론트엔드 | 화면, 사용자 흐름, API 연동 |
| 백엔드 | API, 인증, 데이터 모델, 채팅 구현 |
| 팀 공통 | 기능 검토, 테스트, 코드 리뷰 |

세부 담당 기능은 팀 논의와 작업 이슈에서 정합니다.

## 예정 기술 스택

| 영역 | 기본안 |
| --- | --- |
| 프론트엔드 | React, Vite, JavaScript |
| 백엔드 | Spring Boot, Java 17, Gradle, Spring Web, JPA, Spring Security, JWT |
| 데이터베이스 | MySQL 8.x |
| 실시간 채팅 | WebSocket 기반 구현 예정 |

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

`frontend/`와 `backend/`는 초기 구조를 표시하는 `.gitkeep`만 있습니다. 실행 방법은 각 앱의 초기 설정이 끝나면 추가합니다.

## 브랜치와 PR

`main`은 안정 버전, `develop`은 개발 통합 브랜치입니다. 작업은 `develop`에서 `feature/*`, `fix/*`, `chore/*` 브랜치를 만들어 진행하고, 완료 후 `develop`으로 PR을 보냅니다. `main`과 `develop`에 직접 푸시하지 않습니다. 자세한 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 설계 문서

- [초기 데이터 모델·쉬운 개념도](docs/data-model.md)
- [와이어프레임 예시](docs/wireframe.md)

설계 문서의 이미지는 팀 논의를 위한 참고 자료이며, 실제 DB 설계나 화면 디자인의 확정본이 아닙니다.
