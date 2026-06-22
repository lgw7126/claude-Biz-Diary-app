# 오늘 장사 어땠어요? 📒

> 자영업자를 위한 AI 스마트 경영 일기 앱

---

## 기획 의도

매일 매출을 기록하고 싶지만 복잡한 건 싫은 사장님들을 위해 만들었습니다.

- 하루 30초면 충분 — 매출 입력하고 저장 버튼 하나
- AI가 오늘 장사를 분석해 친근한 말투로 코멘트
- 날씨, 요일, 특이사항을 자동으로 반영한 매출 트렌드 분석
- 연속 기록 스트릭으로 꾸준한 습관 형성

식당, 카페, 미용실, 편의점 등 모든 소상공인에게 맞게 업종 설정 가능합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 매출 기록 | 오늘 매출, 특이사항, 메모 입력 |
| AI 분석 | Claude AI가 매출 트렌드 분석 및 코멘트 |
| 날씨 연동 | 현재 날씨 자동 기록 (OpenWeather) |
| 캘린더 히트맵 | 월별 매출 현황 한눈에 보기 |
| 기록 히스토리 | 최근 7일 매출 차트 + 전체 기록 |
| 연속 기록 스트릭 | 매일 기록 시 🔥 스트릭 카운트 |

---

## 기술 스택

- **Frontend**: React 18 + Vite + TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic) via Supabase Edge Functions
- **날씨**: OpenWeather API
- **차트**: Recharts

---

## 로컬 실행 방법

### 1. 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

### 2. 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## Supabase 설정

`supabase/schema.sql` 파일을 Supabase SQL Editor에서 실행하세요.

Edge Function (`supabase/functions/analyze-sales/index.ts`)을 Supabase에 배포하고 `CLAUDE_API_KEY` 시크릿을 설정하세요.
