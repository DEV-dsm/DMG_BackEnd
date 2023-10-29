# 데미지 (Developer MessenGer)

### 💬 DMG?

빠르고 정확하게 채팅방에 친구를 초대할 수 있는 대덕소프트웨어마이스터고등학교 전용 채팅 서비스

- 다음과 같은 문제점들을 해결하기 위해 해당 서비스를 기획하였습니다.
    - 페이스북 메신저: 동일한 기본 프로필 사진과 동명이인의 존재로 초대 시 구별 어려움 → 채팅방에 다른 사람을 초대하는 경우 발생
    - 카카오톡: 채팅하기 위해 연락처를 일일이 물어보며 초대해야하는 번거로움
    - 슬랙: 친구 추가 기능이 없어 직접 방에 초대해야만 1:1 채팅 가능

### 🔧 Server Tech Stack

---

- Backend: Node.js, NestJS, TypeORM, Typescript, Redis, JWT
- Deploy: Docker, Nginx, AWS EC2, ECR, Github Actions
- DB: MySQL

### 🧩 Commit Rule

---

| 이모지 | Type 키워드 | 사용 시점 |
| --- | --- | --- |
| ✨ :: | feat | 새로운 기능 추가 |
| 👀 :: | chore | 작은 수정, 자잘한 수정 |
| 🚑️ :: | hotfix | 긴급한 수정 |
| 🐛 :: | fix | 버그 / 오타 수정 |
| ✍ :: | style & refactor | 코드 스타일 변경 (코드 포매팅, 세미콜론 누락 등)기능 수정이 없는 경우, 코드 리팩토링 |
| 💡 :: | setting | 프로젝트 세팅 관련 |
| 📎 :: | rename | 파일 혹은 폴더명을 수정만 한 경우 |
| 🗑 :: | remove | 파일을 삭제만 한 경우 |
| 🌱 :: | add | 파일 추가 |
| 📁 :: | fileStr | 파일 구조 변경 |
| 🔀 :: | merge | 머지 |
| ✏️ :: | premier | 주석 변경 / 추가 |
| 🙈 ::  | gitignore update | .gitignore 변경 |
| 🗃️ :: | db | 데이터베이스 관련 변경 |
| 🔧 ::  | env | 환경 파일 변경 |