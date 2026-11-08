
export const sampleProjects = [
  {
    id: 1,
    title: '대학생 커뮤니티 웹 서비스 개발 팀원 모집',
    description:
      '대학생들이 편리하게 이용할 수 있는 커뮤니티 서비스를 함께 개발할 팀원을 찾습니다.',
    category: '개발',

    roles: [
      {
        name: '프론트엔드',
        count: 1,
        filled: 0,
        description: 'React 기반 웹 프론트엔드 개발',
      },
      {
        name: '백엔드',
        count: 1,
        filled: 0,
        description: 'Spring Boot 기반 API 개발',
      },
      {
        name: 'UI/UX 디자인',
        count: 1,
        filled: 0,
        description: '서비스 UI 및 UX 디자인',
      },
    ],

    currentMembers: 2,
    maxMembers: 5,

    method: '온라인 / 오프라인',
    location: '장소 협의',
    duration: '약 3개월',
    activitySchedule: '주 1~2회 팀 회의',

    deadlineDays: 7,
    createdAt: '2026.11.07',
    createdOrder: 4,

    authorName: '홍길동',
    authorDepartment: '컴퓨터공학부',

    requirements: [
      '정기적인 팀 회의에 참여할 수 있는 분',
      '맡은 역할에 책임감을 가지고 참여할 수 있는 분',
      '팀원과 원활하게 소통할 수 있는 분',
    ],

    preferences: [
      '관련 프로젝트 경험이 있는 분',
      '협업 도구 사용 경험이 있는 분',
    ],

    status: '모집 중',
  },

  {
    id: 2,
    title: '알고리즘 스터디 참여자 모집',
    description:
      '함께 알고리즘 문제를 풀고 개발 역량을 키워갈 스터디원을 모집합니다.',
    category: '스터디',

    roles: [
      {
        name: '스터디원',
        count: 3,
        filled: 0,
        description: '주기적인 문제 풀이 및 학습 참여',
      },
    ],

    currentMembers: 2,
    maxMembers: 5,

    method: '온라인',
    location: '온라인',
    duration: '약 2개월',
    activitySchedule: '주 2회',

    deadlineDays: 3,
    createdAt: '2026.11.06',
    createdOrder: 3,

    authorName: '김학생',
    authorDepartment: '컴퓨터공학부',

    requirements: [
      '알고리즘 학습에 관심이 있는 분',
      '정기적인 스터디 참여가 가능한 분',
    ],

    preferences: [
      '프로그래밍 기초 지식이 있는 분',
    ],

    status: '모집 중',
  },

  {
    id: 3,
    title: '인디게임 제작 프로젝트 팀원 모집',
    description:
      'Unity를 활용해 함께 게임을 기획하고 개발할 팀원을 모집합니다.',
    category: '개발',

    roles: [
      {
        name: '게임 개발',
        count: 2,
        filled: 0,
        description: 'Unity 기반 게임 시스템 개발',
      },
      {
        name: '기획자',
        count: 1,
        filled: 0,
        description: '게임 시스템 및 콘텐츠 기획',
      },
      {
        name: '그래픽 디자인',
        count: 1,
        filled: 0,
        description: '게임 그래픽 및 리소스 제작',
      },
    ],

    currentMembers: 2,
    maxMembers: 6,

    method: '오프라인',
    location: '장소 협의',
    duration: '약 4개월',
    activitySchedule: '주 1회 팀 회의',

    deadlineDays: 12,
    createdAt: '2026.11.05',
    createdOrder: 2,

    authorName: '이학생',
    authorDepartment: '소프트웨어학과',

    requirements: [
      '게임 제작에 관심이 있는 분',
      '팀 프로젝트에 책임감 있게 참여할 수 있는 분',
    ],

    preferences: [
      'Unity 사용 경험이 있는 분',
      '게임 개발 또는 기획 경험이 있는 분',
    ],

    status: '모집 중',
  },

  {
    id: 4,
    title: '대학생 창업 아이디어 공모전 준비팀',
    description:
      '새로운 서비스 아이디어를 구체화하고 공모전에 도전할 팀원을 찾습니다.',
    category: '공모전',

    roles: [
      {
        name: '기획자',
        count: 1,
        filled: 0,
        description: '서비스 기획 및 아이디어 구체화',
      },
      {
        name: 'UI/UX 디자인',
        count: 1,
        filled: 0,
        description: '서비스 화면 및 디자인 제작',
      },
      {
        name: '마케팅·콘텐츠',
        count: 1,
        filled: 0,
        description: '시장 조사 및 발표 자료 제작',
      },
    ],

    currentMembers: 2,
    maxMembers: 5,

    method: '온라인 / 오프라인',
    location: '장소 협의',
    duration: '약 2개월',
    activitySchedule: '주 1회 팀 회의',

    deadlineDays: 5,
    createdAt: '2026.11.04',
    createdOrder: 1,

    authorName: '박학생',
    authorDepartment: '경영학과',

    requirements: [
      '공모전 참가에 관심이 있는 분',
      '아이디어를 구체화하는 활동에 적극적인 분',
    ],

    preferences: [
      '공모전 참여 경험이 있는 분',
      '발표 및 자료 제작 경험이 있는 분',
    ],

    status: '모집 중',
  },
]
