# PCF Dashboard

**HanaLoop 채용 과제 — 제품 탄소발자국(PCF) 전과정 데이터 시각화 대시보드 MVP**

기업 고객이 원소재 · 전기 · 운송 등의 활동 데이터를 엑셀로 입력하면 제품별 탄소 배출량을 자동 계산·시각화하는 SaaS 대시보드.
실무자는 활동별 raw 데이터와 단계별 분포를, 경영자는 요약 KPI와 감축 시나리오 효과를 한 화면에서 확인할 수 있도록 설계.

---

## 빠른 시작

> 사전 요구: Node.js 22+, yarn 1.x

```bash
git clone https://github.com/agrade1/hanaloop_assignment.git
cd hanaloop_assignment
yarn install
yarn build
yarn start
```

→ http://localhost:3000 에서 대시보드 확인.

개발 모드(HMR)로 띄우려면 `yarn dev`. 테스트는 `yarn test`.

---

## 주요 기능

| 영역 | 기능 |
|---|---|
| **데이터 입력** | 엑셀(.xlsx) 업로드 — 키 헤더 자동 감지, 행 단위 검증 메시지, 검증 통과 시 대시보드 즉시 갱신 |
| **요약 KPI** | Total PCF · 월 평균 · Top Lifecycle Stage · Hotspot 활동 |
| **시각화** | 월별 PCF Bar, Lifecycle Donut, 월별 단계 적층 Bar (shadcn / Recharts) |
| **상세 데이터** | Emission Detail Table (활동량 / 단위 / 배출계수 / 계산값 / GHG Scope 분류) |
| **필터링** | 단계 멀티 토글 + 시작/끝 월 범위 |
| **감축 시뮬레이션** | 단계별 감축률 슬라이더 → 대시보드 전체에 즉시 반영, Before/After 비교 + 절감 효과 표시 |
| **성능** | React 19 Compiler 자동 메모이제이션 + 슬라이더 디바운스 500ms |

---

## 시스템 설계

### 기술 스택

- **Next.js 16** (App Router, Server Component + Client Component 분리)
- **React 19** + **React 19 Compiler** (자동 메모이제이션)
- **TypeScript** 도메인 타입 중심 설계
- **Tailwind CSS v4** + **shadcn/ui** (디자인 시스템 통일)
- **Recharts** (차트), **SheetJS / xlsx** (엑셀 파싱)
- **Vitest** (계산·파서 단위 테스트)

### 폴더 구조

```
src/
├── app/
│   ├── page.tsx              ← 서버 컴포넌트: 데이터 페치만
│   ├── layout.tsx            ← Pretendard 폰트 + 녹색 토큰
│   └── globals.css
├── components/
│   ├── dashboard/            ← 도메인 컴포넌트
│   │   ├── DashboardClient.tsx     ← state 통합 + 단방향 흐름 (클라이언트)
│   │   ├── HeaderBar.tsx
│   │   ├── FiltersBar.tsx          ← 단계·기간 필터
│   │   ├── KpiCard.tsx
│   │   ├── MonthlyPcfBarChart.tsx
│   │   ├── LifecycleDonutChart.tsx
│   │   ├── MonthlyStageStackedBarChart.tsx
│   │   ├── EmissionDetailTable.tsx
│   │   ├── ReductionScenarioPanel.tsx
│   │   ├── ExcelUploadButton.tsx
│   │   └── ProfilerMeasurementCard.tsx  ← dev 전용
│   └── ui/                  ← shadcn 컴포넌트
└── lib/
    ├── types.ts             ← 도메인 타입 (Product / ActivityRecord / EmissionFactor / ...)
    ├── data-source.ts       ← DataSource 인터페이스 + 정적 JSON 구현체
    ├── calc.ts              ← 순수 계산 함수 (calculateEmission / aggregateBy* / applyScenario / ...)
    ├── units.ts             ← 단위 포맷 (kgCO₂e / tCO₂e 자동 변환)
    ├── excel-import.ts      ← 엑셀 자동 감지 + 검증
    ├── calc.test.ts         ← 29 케이스
    └── excel-import.test.ts ← 8 케이스
data/
├── products.json
├── activities.json
└── emission-factors.json    ← 버전·시점 정보 포함
```

### 데이터 흐름

```
엑셀 업로드 → parseActivities (자동 감지 + 검증) → ActivityRecord[]
                                                      ↓
                                        [단계 필터 → 기간 필터]
                                                      ↓
                                       감축 시나리오 슬라이더 (감축률)
                                                      ↓
                                          applyScenario(reductions)
                                                      ↓
                                    KPI · 차트 · Detail Table 즉시 갱신
```

- 데이터 페치는 **서버 컴포넌트**, 인터랙션·재계산은 **클라이언트 컨테이너**(`DashboardClient`)에 한정
- 모든 시각화는 단방향 흐름. state는 `DashboardClient` 한 곳에서만 관리
- `DataSource` 인터페이스로 추상화 → 향후 Postgres·외부 API 교체 시 호출부 변경 0

### 도메인 타입

- `Product`, `LifecycleStage` (`"원소재" | "전기" | "운송"`), `Scope` (`1 | 2 | 3`)
- `ActivityRecord` (raw), `EmissionFactor` (`version`·`validFrom`/`validTo` 포함), `CalculatedEmission` (원본 추적성 + 적용 계수 보존)
- `ScenarioReductions`, `MonthlyAggregate`, `StageAggregate`

자세한 도메인 개념(PCF · 활동량 × 배출계수 · GHG Scope 1/2/3 · 배출계수 버전 관리)은 별도 학습 자료 참조.

---

## 성능 최적화

### React 19 Compiler 도입 + 정량 측정

`next.config.ts`의 `reactCompiler: true`로 자동 메모이제이션 활성화.
헤더에 dev 모드 전용 측정 카드(`<Profiler onRender>` 기반)를 두어 동일 시나리오를 두 번 측정해 비교:

| 지표 (두 번 측정 평균) | Compiler OFF | Compiler ON | 변화 |
|---|---|---|---|
| avg actualDuration | 3.76ms | 2.47ms | **−34.4%** |
| max actualDuration | 116.5ms | 102.6ms | −11.9% |

→ 두 번 독립 측정에서 일관되게 30%+ avg 단축 확인. 자세한 측정 절차·해석은 [`docs/AI_USAGE_LOG.md`](docs/AI_USAGE_LOG.md) 참조.


## AI 도구 사용

### 사용 도구
- **Claude Code (Claude Opus 4.7)** — VSCode 확장 환경

### 활용 영역 (요약)
- **AI 자문**으로 탄소 도메인(PCF · GHG Scope 1/2/3 · 배출계수 버전 관리) 빠르게 학습 + 계산 로직 이해
- TypeScript 도메인 타입 · 계산 모듈 · 차트 컴포넌트 · 엑셀 파서 등 **구현 자동화**

### 직접 결정·수행한 부분
- **협업 컨벤션 정의** — 브랜치 네이밍(`{type}/{keyword}`), 커밋 메시지 형식, PR 본문 구조 등을 직접 정의. **PR 분할은 누적 변경 라인 800줄 이하 룰** 적용. 각 PR마다 커밋 구성·변경점을 사전에 정리해 AI에 작업 단위로 분배
- **엑셀 형식 분석** — 과제 엑셀을 CSV로 직접 추출해 시트 구조 · 헤더 위치(A3) · 같은 시트 G열의 배출계수 영역을 파악 후 자동 감지 + 범위 기반 파서 설계 지시
- **성능 측정** — React 19 Compiler 도입 전/후 동일 시나리오를 두 번 독립 측정해 재현성 확인
- **UX 디테일** — 시나리오 슬라이더 디바운스, 엑셀 업로드 모달 자동 닫기 등 인터랙션 다듬기

> 작업별 상세 프롬프트 · 결정 사항 · 회고는 [`docs/AI_USAGE_LOG.md`](docs/AI_USAGE_LOG.md) 참조.

---

## 의사결정 · Trade-off

주요 의사결정과 trade-off는 [`docs/DECISIONS.md`](docs/DECISIONS.md)에 정리되어 있습니다. 핵심 요약:

- **정적 JSON vs Postgres** — MVP 완성도 우선, `DataSource` 인터페이스로 추후 교체 가능하게 추상화
- **활동 데이터 CRUD vs 엑셀 업로드 + 감축 시나리오 슬라이더** — 사용자가 입력하는 화면은 두 가지로 한정. 활동을 한 건씩 추가·편집하는 CRUD UI는 만들지 않고, 핵심인 계산 흐름과 시각화에 집중
- **단일 제품(CT-045) 뷰** — 제품 1개 데이터라 비교 차트 대신 단일 제품 깊이 분석
- **차트 라이브러리(shadcn / Recharts)** — 시간 안에 일관된 차트 품질 확보

---

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/ASSIGNMENT_BRIEF.md`](docs/ASSIGNMENT_BRIEF.md) | 과제 요구사항 · 데이터 입력 UI 범위 · 지원자 체크리스트 |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 기술·설계 의사결정 + Trade-off |
| [`docs/AI_USAGE_LOG.md`](docs/AI_USAGE_LOG.md) | AI 도구 사용 내역 (작업별 프롬프트 · 결과 · 검토) |

---

## 테스트

```bash
yarn test          # 한 번 실행 (calc 29개 + excel-import 8개 = 총 37개)
yarn test:watch    # 감시 모드
```