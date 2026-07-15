# PolicyAI

AI 기반 공공지원사업 데이터 표준화 및 맞춤형 추천 플랫폼

## 프로젝트 소개

PolicyAI는 기업마당, K-Startup 등 여러 공공기관에 분산된
지원사업 정보를 수집하고 공통 데이터 형식으로 표준화합니다.

공고문에서 지원 대상, 지역, 연령, 접수 기간, 필요 서류 등의
조건을 추출하고 사용자의 상황과 비교해 신청 가능성과 추천
근거를 제공하는 것을 목표로 합니다.

## 주요 기능

- 공공지원사업 데이터 자동 수집
- 사이트별 데이터 형식 표준화
- 공고문 조건 자동 추출
- 사용자 조건 기반 지원사업 추천
- 신청 가능성 및 추천 근거 제공
- 지원사업 비교 및 일정 관리

## 기술 스택

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX

### AI and Data

- Ollama
- 정규표현식 기반 정보 추출
- 공공데이터 API
- PDF 문서 분석

### Database

- PostgreSQL

### Frontend

- React

## 프로젝트 구조

```text
policy-ai
├── backend
│   ├── app
│   │   ├── adapters
│   │   ├── collectors
│   │   ├── parsers
│   │   ├── services
│   │   ├── models
│   │   ├── database
│   │   ├── core
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
├── frontend
├── .env.example
├── .gitignore
└── README.md