# 백엔드 개발 시작하기

공용 베이스가 `develop`에 병합된 뒤 아래 순서로 시작합니다. 병합 전 확인할 때는 2번에서 `feature/be-init`으로 이동합니다.

## 개발 환경

- Java 17
- Spring Boot 4.1.1 (현재 `build.gradle` 기준)
- Gradle Wrapper 9.7.1 사용
- MySQL 8.x
- IntelliJ IDEA 권장

## 처음 프로젝트를 받은 후

1. 저장소를 clone하고 저장소 폴더로 이동합니다.

   ```sh
   git clone https://github.com/Campus-link-team/Campus-Connect.git
   cd Campus-Connect
   ```

2. `git switch develop`으로 개발 기준 브랜치에 이동합니다. 기능 작업은 여기서 새 작업 브랜치를 만들어 진행합니다.
3. IntelliJ에서 `backend` 폴더를 Gradle 프로젝트로 엽니다.
4. Project SDK와 Gradle JVM을 JDK 17로 맞춥니다. 터미널에서 실행할 때도 `java -version`으로 Java 17인지 확인합니다.
5. MySQL을 실행하고 `campus_connect` DB를 만듭니다.

   ```sql
   CREATE DATABASE IF NOT EXISTS campus_connect CHARACTER SET utf8mb4;
   ```

6. `backend/src/main/resources/application-local.yml.example`을 같은 폴더에 복사하고, 복사본 이름을 `application-local.yml`로 바꿉니다.
7. 복사본의 `username`과 `password`에 자신의 MySQL 접속 정보를 입력합니다. 접속 주소나 포트가 다르면 `url`도 맞춥니다.
8. 실제 `application-local.yml`은 Git에 커밋하면 안 됩니다. 저장소 루트에서 아래 명령으로 제외 규칙이 적용되는지 확인합니다.

   ```sh
   git check-ignore -v backend/src/main/resources/application-local.yml
   ```

9. `backend` 폴더에서 Gradle Wrapper로 빌드합니다. 빌드에는 Spring Boot 실행 환경을 확인하는 테스트가 포함되므로, 로컬 설정 파일과 MySQL을 먼저 준비해야 합니다.

   Mac/Linux:

   ```sh
   ./gradlew build
   ```

   Windows:

   ```bat
   gradlew.bat build
   ```

10. 빌드가 성공하면 IntelliJ에서 `CampusconnectApplication`을 실행합니다. 터미널에서는 Mac/Linux는 `./gradlew bootRun`, Windows는 `gradlew.bat bootRun`을 사용합니다. 기존 `application.yml`이 `local` 프로필을 활성화하므로 로컬 설정과 MySQL이 필요합니다.

## 패키지 구조

`com.campuslink.campusconnect` 아래에 `auth`, `user`, `book`, `project`, `chat`, `review`, `global` 패키지를 둡니다. 각 패키지의 `package-info.java`는 빈 패키지를 Git에 남기기 위한 파일입니다. 하위 구조는 실제 기능 개발 때 필요한 만큼 추가합니다.
