# 오늘 장사 어땠어요? 📒

[![앱 실행하기](https://img.shields.io/badge/▶%20앱%20실행하기-claude--biz--diary--app.vercel.app-6366f1?style=for-the-badge)](https://claude-biz-diary-app.vercel.app)

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

## 사용 방법

1. **[앱 열기](https://claude-biz-diary-app.vercel.app)** 클릭
2. 오른쪽 상단 ⚙️ 에서 업종 선택 (식당/카페/미용실 등)
3. 오늘 매출 금액 입력
4. 특이사항 선택 (선택사항)
5. **오늘 기록 저장하기** 버튼 클릭
6. AI가 자동으로 오늘 장사를 분석해드립니다
