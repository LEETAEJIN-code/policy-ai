# PolicyAI

공공지원사업 데이터를 통합하여 검색하고, 사용자 조건에 맞는 정책을 추천하는 웹 서비스입니다.

기업마당과 K-Startup 등 여러 공공지원사업 데이터를 수집하고 공통 형식으로 표준화하여 사용자가 필요한 지원사업을 보다 쉽게 찾을 수 있도록 구성했습니다.

---

## 주요 기능

### 1. 정책 통합 조회

여러 출처에서 수집한 정책 데이터를 하나의 화면에서 조회할 수 있습니다.

- 키워드 검색
- 지역 필터
- 지원 대상 필터
- 지원 유형 필터
- 기관 필터
- 출처 필터
- 종료된 정책 포함 여부 설정
- 페이지네이션
- 정책 상세 조회
- 원문 페이지 이동

### 2. 맞춤 정책 추천

사용자가 입력한 조건을 기반으로 적합한 정책을 추천합니다.

입력 조건 예시:

- 연령
- 지역
- 지원 대상
- 관심 분야
- 지원 유형

추천 결과에서는 정책별 추천 점수와 적합성 정보를 확인할 수 있습니다.

또한 추천 결과의 필터링, 정렬 및 페이지 이동을 지원합니다.

### 3. 북마크

관심 있는 정책을 북마크하여 별도로 관리할 수 있습니다.

- 북마크 추가
- 북마크 삭제
- 북마크 여부 확인
- 저장한 정책 목록 조회
- 전체 북마크 정리

### 4. 최근 본 정책

사용자가 최근 확인한 정책을 저장하여 다시 빠르게 접근할 수 있습니다.

### 5. 정책 통계

수집된 정책 데이터를 기준으로 다음 정보를 제공합니다.

- 전체 정책
- 신청 가능 정책
- 마감 임박 정책
- 종료된 정책
- 마감일 확인 필요 정책

### 6. 관리자 대시보드

정책 데이터의 수집 및 시스템 상태를 관리할 수 있습니다.

- 전체 정책 수 확인
- 최근 동기화 시간 확인
- 수집 정책 수 확인
- 신규 정책 수 확인
- 업데이트 정책 수 확인
- 캐시 상태 확인
- 캐시 초기화
- 동기화 이력 조회
- 정책 동기화 추이 차트

### 7. 정책 데이터 동기화

외부 공공 API에서 최신 정책 데이터를 가져와 데이터베이스와 동기화합니다.

동기화 과정에서 다음 항목을 기록합니다.

- 수집된 정책 수
- 신규 정책 수
- 업데이트된 정책 수
- 동기화 성공/실패 여부
- 동기화 시간

---

## 기술 스택

### Frontend

- React
- TypeScript
- Vite
- React Router
- Recharts
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- HTTPX

### Data Sources

- 기업마당
- K-Startup

---

## 프로젝트 구조

```text
policy-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── collectors/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── policy/
│   │   │   └── recommend/
│   │   │
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── README.md
```

---

# 실행 방법

## 1. 프로젝트 다운로드

```bash
git clone <repository-url>
cd policy-ai
```

---

# Backend 실행

## 2. Backend 폴더 이동

```bash
cd backend
```

## 3. 가상환경 생성

Windows:

```bash
python -m venv venv
```

가상환경 활성화:

```powershell
.\venv\Scripts\Activate.ps1
```

## 4. 패키지 설치

```bash
pip install -r requirements.txt
```

## 5. 환경 변수 설정

`backend` 폴더에 `.env` 파일을 생성합니다.

예시:

```env
BIZINFO_API_KEY=YOUR_API_KEY
KSTARTUP_API_KEY=YOUR_API_KEY
```

실제 API Key는 GitHub에 업로드하지 않습니다.

## 6. FastAPI 서버 실행

```bash
uvicorn app.main:app --reload
```

기본 서버 주소:

```text
http://127.0.0.1:8000
```

Swagger API 문서:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend 실행

새 터미널을 열고 프로젝트 루트에서:

```bash
cd frontend
```

패키지 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

기본 개발 주소:

```text
http://localhost:5173
```

---

# 주요 페이지

| 경로 | 기능 |
| --- | --- |
| `/` | 홈 |
| `/policies` | 정책 조회 |
| `/policies/:policyId` | 정책 상세 |
| `/recommend` | 맞춤 정책 추천 |
| `/recent` | 최근 본 정책 |
| `/bookmarks` | 북마크 |
| `/admin` | 관리자 대시보드 |

---

# 주요 Backend API

## 정책

```text
GET /policies/search
GET /policies/statistics
GET /policies/{policy_id}
```

## 추천

```text
POST /recommend
```

## 북마크

북마크 API를 통해 정책 저장, 삭제 및 조회 기능을 제공합니다.

## 정책 동기화

```text
POST /policies/sync
GET  /policies/sync/latest
GET  /policies/sync/history
```

## 관리자

```text
GET  /admin/dashboard
GET  /admin/cache/status
POST /admin/cache/clear
```

## 원본 데이터 확인

```text
GET /raw/bizinfo
GET /raw/kstartup
```

---

# 캐시

외부 API의 반복 호출을 줄이기 위해 정책 데이터를 일정 시간 캐싱합니다.

관리자 API를 통해 다음 정보를 확인할 수 있습니다.

```text
cached_count
updated_at
is_valid
cache_minutes
```

필요한 경우 관리자가 캐시를 직접 초기화할 수도 있습니다.

---

# 데이터 처리 흐름

```text
기업마당 API ─┐
              │
              ├─> Collector
K-Startup API ─┘
                   │
                   ▼
              데이터 표준화
                   │
                   ▼
              PolicyService
                   │
          ┌────────┴────────┐
          ▼                 ▼
        Cache            Database
                            │
                            ▼
                       FastAPI API
                            │
                            ▼
                      React Frontend
```

---

# UI 구조

공통 UI를 컴포넌트로 분리하여 페이지별 중복 코드를 줄였습니다.

주요 공통 요소:

- Sidebar
- Header
- SearchBar
- PageHeader
- LoadingSpinner
- ErrorState
- EmptyState
- ConfirmModal
- BookmarkButton
- Toast
- Skeleton UI

CSS 역시 기능별 파일로 분리하여 관리합니다.

```text
styles/
├── 00-foundation.css
├── 05-common-components.css
├── 10-policy.css
├── 20-admin.css
├── 30-policy-search.css
├── 40-recommend.css
├── 50-recent.css
├── 60-home.css
├── 70-bookmark.css
└── index.css
```

---

# 개발 목표

PolicyAI는 여러 기관에 분산되어 있는 공공지원사업 정보를 하나의 서비스에서 조회할 수 있도록 만드는 것을 목표로 합니다.

향후에는 데이터 출처를 추가하고 추천 기능을 개선하여 사용자에게 더욱 적합한 지원사업을 빠르게 찾을 수 있도록 확장할 예정입니다.

---

# 향후 개선 사항

- 추가 공공지원사업 API 연동
- 추천 알고리즘 개선
- 사용자 계정 시스템
- 사용자별 북마크 저장
- 검색 성능 개선
- 정책 자동 동기화
- 관리자 기능 강화
- 배포 환경 구축
- 테스트 코드 확대

---

## License

This project is for educational and portfolio purposes.