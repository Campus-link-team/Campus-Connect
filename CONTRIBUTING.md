# 협업 방법

5인 캡스톤 팀이 함께 작업하기 위한 기본 규칙입니다.

## 브랜치와 PR

1. `develop`을 최신 상태로 맞춘 뒤 작업 브랜치를 만듭니다. 예: `feature/fe-init`, `feature/be-init`, `fix/chat-connection`, `chore/docs-update`
2. 변경 내용을 작업 브랜치에 커밋하고 푸시합니다. `main`과 `develop`에 직접 푸시하지 않습니다.
3. `develop`을 대상으로 PR을 만들고, 변경 이유와 확인한 내용을 적습니다.
4. PR 내용을 확인한 뒤 병합합니다. 중요한 변경은 필요에 따라 팀원에게 리뷰를 요청합니다.

`main`과 `develop`은 보호 브랜치입니다. 두 브랜치의 강제 푸시와 삭제는 제한됩니다. 작업 브랜치에서도 다른 팀원이 사용 중이라면 강제 푸시하거나 삭제하기 전에 먼저 이야기해 주세요.

## 커밋 메시지 예시

- `feat(auth): 학교 이메일 인증 API 추가
- "fix(login): 로그인 실패시 문구 추가"
- `docs: describe initial data model`
- `chore: initialize frontend project`

한 커밋에는 관련된 변경만 담고, PR은 리뷰할 수 있는 크기로 나누면 됩니다.
