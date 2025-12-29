# Nutrition Filter & Recommendation

NutriGo 프론트엔드 애플리케이션입니다. React 18과 TypeScript를 기반으로 구축되었으며, Vite를 빌드 도구로 사용합니다.

---

## 준비물

- Node.js 18.0 이상
- npm 또는 yarn

---

## 설치

### 1) 의존성 설치

프로젝트 루트 디렉터리에서:

```bash
npm install
```

---

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정합니다:

- `VITE_API_BASE_URL`: 백엔드 API 기본 URL (예: `http://localhost:8080`)
- `VITE_AI_SERVICE_URL`: AI 서비스 URL (예: `http://localhost:8000`)

예시:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

## 실행

### 개발 모드

```bash
npm run dev
```

개발 서버가 시작되면 기본적으로 http://localhost:5173 에서 접속할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 디렉터리에 생성됩니다.

---

## 주요 기능

### 페이지 구성
- 홈페이지: 서비스 소개 및 주요 기능 안내
- 분석 페이지: 가게 링크 또는 이미지 업로드를 통한 영양 분석
- 인사이트 페이지: 식습관 캘린더 및 주간 리포트
- 챌린지 페이지: 건강 목표 달성을 위한 챌린지
- NutriBot 페이지: 기록 기반 챗봇 코칭
- 마이페이지: 사용자 설정 및 목표 관리

### 주요 컴포넌트
- `src/components/ui/`: 재사용 가능한 UI 컴포넌트 (shadcn/ui 기반)
- `src/pages/`: 페이지 컴포넌트
- `src/api/`: 백엔드 API 호출 함수
- `src/contexts/`: React Context (인증 등)

---

## 디렉터리 구조

```
frontend/
├── src/
│   ├── api/              # API 호출 함수
│   │   ├── auth.ts
│   │   ├── nutrition.ts
│   │   ├── nutribot.ts
│   │   └── ...
│   ├── components/        # React 컴포넌트
│   │   ├── ui/           # UI 컴포넌트
│   │   └── ...
│   ├── contexts/         # React Context
│   ├── pages/            # 페이지 컴포넌트
│   ├── styles/           # 스타일 파일
│   ├── App.tsx           # 메인 앱 컴포넌트
│   └── main.tsx          # 진입점
├── package.json
├── vite.config.ts
└── index.html
```

---

## 기술 스택

- React 18.3+
- TypeScript
- Vite 6.3+
- Tailwind CSS
- shadcn/ui
- React Router
- Framer Motion
- Axios
- Recharts

---

## 문제 해결

### npm install 실패
- Node.js 버전 확인: `node --version` (18.0 이상 필요)
- `node_modules` 폴더 삭제 후 재설치:
  ```bash
  rm -rf node_modules
  npm install
  ```

### 개발 서버가 시작되지 않음
- 포트 5173이 이미 사용 중인지 확인
- `vite.config.ts`에서 포트 변경 가능

### API 호출 실패
- `.env` 파일의 `VITE_API_BASE_URL` 설정 확인
- 백엔드 서버가 실행 중인지 확인
- CORS 설정 확인

### 빌드 오류
- TypeScript 타입 오류 확인
- 의존성 버전 충돌 확인

---
