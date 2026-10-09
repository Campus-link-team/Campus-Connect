# Auth, Login, JWT Token

JWT - 웹 / 앱에서 사용자를 인증하고, 권한을 확인하는 용도 ID Token 혹은 Access Token으로 활용
사용자 로그인 시
1. 사용자가 server에 서비스 로그인 요청
2. 올바른 ID와 PW를 통해 로그인 성공 시 JWT Token발급(Access Token)

Access Token 인증 과정
1. 사용자가 ID, PW를 입력해 로그인 시도 
2. server에서 로그인 정보 검증 후 Access Token 발급하여 client에게 전달
3. client는 API 요청 시마다 Access Token을 포함해서 서버에 전송
4. 서버는 인가 처리를 위한 과정(Secret key, EXP, 변조) 확인
5. 검증 완료 되면 API 요청을 처리 
6. Access Token이 만료되면 재 로그인을 요청

## Login
Local Login :
ID, PW를 이용하여 로그인하며 성공 서버에서 Access Token과 Refresh Token 발급
username : PK
password : 8자리 이상 영어,숫자, 특수문자 조합 ( 저장 시 hash 처리)
nickname : 유일하며 15글자 이하 중복검사 필요

고도화 계획 - sns 혹은 email 인증 별도 토큰 발급 방식

## Auth
Local Auth : 
username, password, nickname을 입력받음
SNS 최초 회원가입 로그인 시 nickname을 입력받아 회원가입 진행 

## Auth DB 
local - username, hashed_password, nickname, role, created_at, updated_at, last_login 등의 정보를 저장하며, 
        선택적으로 email을 저장.

sns - social_provider, social_id, nickname, role, created_at, updated_at, last_login 등과 함께 
      선택적으로 profile_image, email을 저장.

## user information UPDATE
회원은 자기의 닉네임, 비밀번호, 이메일을 변경 가능

## logout
로그아웃 시 Access Token을 기반으로 로그아웃 진행

## user Info
마이페이지를 통해 회원 자신의 정보 수정과 게시물 등을 수정 가능함
