# `docs/AI_USAGE_LOG.md`

```md
# AI 사용 기록

본 문서는 과제 진행 중 AI 도구를 사용한 내역을 기록하기 위한 문서이다.

과제 정책상 AI 도구 사용은 허용되지만, 발표 시 다음 내용을 구분하여 설명해야 한다.

- AI로 무엇을 했는지
- 어떤 Prompt를 사용했는지
- 왜 그런 결정을 했는지
- AI 결과물 중 어떤 부분을 직접 검토하고 수정했는지

## 기록 방식

각 AI 사용 내역은 다음 형식으로 기록한다.

```md
## YYYY-MM-DD - 작업명

### 사용 도구

### 사용 목적

### Prompt

### AI가 제공한 결과

### 직접 검토한 부분

### 최종 반영 여부
```
```

---

## 2026-05-18 - 초기 프로젝트 셋팅을 위한 의사결정 문서 작성

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

PCF 대시보드 과제 진행을 위한 의사결정 및 과제 이해 관련 문서(`ASSIGNMENT_BRIEF.md`, `DECISIONS.md`, `AI_USAGE_LOG.md`)를 작성하고, 지원자 체크리스트의 필수·권장 항목을 충족하기 위한 정책을 정리하기 위해 사용했다.

### Prompt

- "지금 내 docs 디렉토리에 있는 내용을 한번 읽고 내가 어떤 작업을 해야하는지 파악해"
- 지원자 체크리스트(필수/권장/보너스) 항목 제공 후 문서 보강 필요 여부 검토 요청
- "데이터 입력 화면 오류 메시지" 항목 충족을 위한 입력 UI 범위 결정 요청
- Postgres 도입 여부에 대한 자문 요청 (보너스 노선 검토)
- 브랜치 네이밍 규칙 자문 요청
- 이슈/PR 본문 톤 조정 요청 ("수정" 톤 → "작성" 톤)

### AI가 제공한 결과

- `docs/` 디렉토리 내용 분석 및 체크리스트 대비 누락 정책 식별
- 데이터 입력 UI 범위 3가지 시나리오 비교 (A. 입력 없음 / B. 시드 + 시나리오 입력 / C. 풀 CRUD) 후 B안 추천
- Postgres 도입 시 작업량 추정 및 MVP 이후 보너스 노선으로 진행하는 흐름 제안
- 브랜치 네이밍 패턴 2가지 비교 후 `{type}/{keyword}` 규칙 정리
- `docs/ASSIGNMENT_BRIEF.md`에 데이터 입력 UI 범위, 지원자 체크리스트 섹션 추가
- `docs/DECISIONS.md`에 입력 검증 정책, 단위 표시 정책, yarn 고정, 데이터 접근 계층 추상화, trade-off, Postgres 재검토 시점 추가
- GitHub 이슈 #1 생성, `docs/decisions` 브랜치 생성·커밋·푸시, PR #2 생성까지 흐름 자동화

### 직접 검토한 부분

- 데이터 입력 UI 범위는 B안(엑셀 업로드 + 감축 시나리오 입력)으로 결정, CRUD는 향후 확장으로 분리
- 브랜치 네이밍은 `{type}/{keyword}` 채택 (예: `docs/decisions`)
- 커밋 메시지에서 `Co-Authored-By` 줄 제거, 제목은 한글로 유지
- 이슈/PR 본문 톤은 "수정/보강"이 아닌 "작성" 표현으로 통일
- Postgres는 MVP에는 도입하지 않고, MVP 완성 후 시간 여유 시 보너스로 진행

### 최종 반영 여부

- 위 문서 3종이 `docs/decisions` 브랜치에 작성되어 `develop` 대상 PR(#2)로 제출됨
- 이슈 #1과 연결 (Closes #1)

---

## 2026-05-18 - Next.js + TypeScript 프로젝트 스캐폴딩

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

DECISIONS의 기술 노선에 따라 Next.js + TypeScript 기반 프로젝트를 스캐폴딩하고, Tailwind CSS와 shadcn/ui 프리셋을 도입하여 대시보드 UI 작성 기반을 마련하기 위해 사용했다.

### Prompt

- "이제 Next.js 및 TS 스캐폴딩 진행하자"
- Tailwind 옵션 비교 (Tailwind / CSS Modules / Tailwind + shadcn/ui) 후 Tailwind + shadcn/ui 선택
- "yarn dev로 직접 실행해서 확인하고 싶다" — dev 서버 실행 방법 질문
- yarn 명령이 PowerShell·VS Code 터미널에서 인식되지 않는 문제 해결 요청

### AI가 제공한 결과

- Node.js 22 환경 확인 및 yarn 설치 자동화 (corepack 권한 에러 발생 후 winget으로 우회 설치)
- `create-next-app`으로 Next.js 16 + TypeScript + App Router + Tailwind CSS v4 + ESLint + `src/` 디렉토리 + import alias `@/*` + yarn 옵션으로 스캐폴딩
- 폴더명 underscore 제약 회피를 위해 `pcf-dashboard` 임시 폴더에 생성 후 파일을 프로젝트 루트로 이동, 임시 폴더 정리
- `shadcn@latest init -d -y` 명령으로 shadcn/ui 초기화 (`components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts` 생성)
- `package.json`에 `packageManager: yarn@1.22.22` 필드 추가
- `yarn build`로 2회 무오류 통과 확인
- yarn PATH 캐시 이슈(winget 설치 직후 `explorer.exe` 캐시 미반영) 진단 및 해결 방법 3가지(세션 내 PATH 갱신 / 탐색기 재시작 / 재로그인) 안내

### 직접 검토한 부분

- Tailwind + shadcn/ui 조합 선택 (대시보드 UI 작성 속도 + 일관된 디자인 시스템 확보)
- `pcf-dashboard` 임시 폴더에서 프로젝트 루트로 파일 이동 시 기존 `README.md`, `docs/`, `data/` 보존
- `AGENTS.md`와 `CLAUDE.md`는 Next.js가 자동 생성한 가이드 파일이므로 보존 (우리 프로젝트 컨벤션은 후속 작업에서 추가하기로 결정)
- yarn 환경 구축 시 corepack 권한 에러 대신 winget을 통한 표준 설치 경로 채택
- `yarn dev`로 로컬에서 직접 동작 확인 후 다음 단계 진행

### 최종 반영 여부

- Next.js + TypeScript + Tailwind + shadcn/ui 스캐폴딩이 `chore/scaffold` 브랜치에 작성되어 `develop` 대상 PR로 제출됨
- yarn 패키지 매니저로 고정되어 `yarn build`, `yarn dev` 정상 동작
- 이슈 #5와 연결 (Closes #5)

---

## 2026-05-19 - 대시보드 레이아웃 + 디자인 토대

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

DECISIONS의 데이터 입력 UI 범위와 회사 도메인(측정·관리·감축)을 반영하여, 데이터 연결 전에 대시보드 페이지 Grid 뼈대와 디자인 토대(Pretendard, 녹색 색상 토큰)를 점진적으로 마련하기 위해 사용했다.

### Prompt

- "탄소 관리 플랫폼이니까 흰색 배경에 녹색 느낌, Pretendard 폰트로 대시보드를 그려달라" — 사용자 ASCII 레이아웃 제공
- "지금 차트 4개만으로 회사 도메인을 만족시키냐?" — 레이아웃 완결성 검토 요청
- "큰 틀에서부터 하나하나 만들어서 커밋하는 구조로 가자" — 점진적 커밋 분할 요청

### AI가 제공한 결과

- 단일 제품(CT-045) 데이터 제약을 반영해 "제품별 비교" 차트 명칭을 시간/단계 기반(월별 PCF Bar, Top Lifecycle Stage, 월별 단계 적층)으로 변경 제안
- Pretendard 패키지 설치 후 `layout.tsx`에서 variable font CSS import + `globals.css`의 `--font-sans` 매핑
- shadcn 디폴트 zinc 토큰 → 녹색(forest) 계열 oklch 토큰으로 교체, `chart-1~5`도 단계 시각화에 맞춰 녹색 그라데이션 + 보조색으로 구성
- shadcn add card, separator로 카드 슬롯용 컴포넌트 추가
- 회사 도메인(측정·관리·감축) ↔ 현재 레이아웃 매핑 분석 후 비어 있는 부분 3가지 식별: ① 데이터 입력 UI ② 감축 효과 임팩트 시각화 ③ 단계 Drill-down
- B안(슬롯 미리 잡기) 선택에 따라 Reduction Scenario에 Before/After + 절감 효과 강조 영역 통합, Stage Drill-down placeholder를 별도 슬롯으로 추가
- 점진적 8커밋 분할로 layout PR 구성 (디자인 토대 → shadcn → 헤더 뼈대 → 필터 → KPI → 차트 → 테이블·시나리오 → 드릴다운)

### 직접 검토한 부분

- 회사 도메인 키워드와 현재 레이아웃 매핑 점검 후 부족한 부분 식별
- 옵션 A(묶음 분할 3커밋) vs B(점진 분할 7~8커밋) 비교 후 B 선택
- Reduction Scenario에 Before/After 통합 vs 별도 슬롯 선택 → 통합 결정
- Stage Drill-down 위치를 단계 적층 차트 아래 + Detail Table 위로 배치 (단계 → 단계 분해 → 활동 raw 순)
- KPI 카드 value 임시 값("10"·"20"·"30"·"40") 유지 (placeholder 시각 확인용)

### 최종 반영 여부

- 8개 커밋으로 `feat/layout` 브랜치에 점진적으로 구성되어 `develop` 대상 PR로 제출됨
- `yarn build` 무오류 통과, `yarn dev` 로컬 동작 확인
- 이슈 #7과 연결 (Closes #7)

---

## 2026-05-19 - 데이터 입력 UI (엑셀 업로드 모달 + 시나리오 슬라이더)

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

DECISIONS의 데이터 입력 UI 범위(엑셀 업로드 + 감축 시나리오 입력)를 UI 수준에서 구현하기 위해 사용했다.
실제 엑셀 파싱·검증 로직과 시나리오의 차트/KPI 반영은 후속 PR에서 다룬다.

### Prompt

- "데이터 입력 UI를 만들면 좋을거같아 일단 UI만 만들고 추후 PR에서 json으로 PCF, GHG Scope을 계산해서 차트로 그려주는 작업을 하면 될거같아"
- "1번은 B안으로 시나리오까지 하고 2번은 다음 PR로" — 엑셀 업로드 + 시나리오 슬라이더 둘 다 포함, GHG Scope placeholder는 다음 PR로
- "커밋할때 네이밍에 feat만 넣고 그뒤에 () 이건 빼고 가자" — 커밋 prefix에서 scope 괄호 제거
- "아니다 A안으로 가자" — push 전 커밋만 수정, 머지된 develop history는 보존

### AI가 제공한 결과

- shadcn `dialog`, `slider`, `label`, `input` 컴포넌트 추가 (`npx shadcn@latest add ... -y`)
- `ExcelUploadButton` 컴포넌트 작성:
  - Dialog 트리거 + 파일 입력 + mock 업로드 흐름 (idle → uploading → success/error)
  - 파일 미선택 / 확장자 오류 시 구체 에러 메시지 표시 슬롯
  - `setTimeout` 1.2초로 검증 시뮬레이션 (실제 파싱은 후속 PR)
- `HeaderBar`에 ExcelUploadButton 통합 (헤더 우측 기간 표시 옆에 배치)
- `ReductionScenarioPanel` 컴포넌트 작성:
  - 원소재 / 전기 / 운송 3단계 슬라이더 (0~100%, step 1)
  - `useState`로 단계별 값 관리, 라벨 우측에 현재 값(%) 표시
  - Before/After 비교 슬롯 + 절감 효과 표시 영역은 placeholder 유지
- `ReductionScenarioPlaceholder` → `ReductionScenarioPanel`로 교체 (`page.tsx` import + 기존 파일 삭제)
- shadcn 최신 버전이 `@base-ui/react` 기반인 점에 따라 API 호환성 보정:
  - DialogTrigger: `asChild` → `render` prop 패턴
  - Slider `onValueChange`: `number | readonly number[]` union에 `Array.isArray` 가드 추가
- 커밋 메시지 컨벤션 변경(scope 괄호 제거)에 따라 push 전 커밋 메시지를 `git filter-branch --msg-filter`로 일괄 수정

### 직접 검토한 부분

- 이번 PR 범위를 B안(엑셀 업로드 + 시나리오 슬라이더 동시)으로 결정
- GHG Scope 차트 placeholder는 이번 PR이 아닌 후속 PR로 분리
- "UI만"의 정의: 파일 입력 동작 + mock 검증 메시지 / 슬라이더 값 조정 + 표시. 실제 파싱·차트 반영 없음
- 커밋 메시지에서 scope 괄호(`feat(dashboard):`)를 제거하고 `feat:` 형태로 통일 — 협업 컨벤션 메모리에도 반영
- 머지된 develop history는 손대지 않고 push 전 로컬 커밋만 수정 (A안)
- `ReductionScenarioPlaceholder`는 별개 신규 컴포넌트로 두지 않고 파일 삭제 + 신규 Panel로 교체

### 최종 반영 여부

- 6개 커밋으로 `feat/input-ui` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn build` 통과 (shadcn @base-ui API 호환성 fix 후 정상)
- 이슈 #9와 연결 (Closes #9)

---

## 2026-05-19 - 도메인 학습 + 계산 모듈 구현 (PR-A)

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

탄소 도메인(PCF, GHG Scope 1/2/3, 배출계수 버전 관리, 감축 시나리오)을 단시간에 학습하고,
DECISIONS의 "PCF 계산 로직과 UI 분리" 원칙에 따라 UI 무관 계산 모듈을 설계·구현하기 위해 사용했다.

AI는 **튜터·검수자(reviewer)** 역할로 두고, 구현 자동화는 위임하되
함수 분할·도메인 매핑·매칭 규칙 같은 의사결정과 최종 검토는 직접 수행하는 흐름으로 진행했다.

### Prompt

- "탄소 도메인 지식이 없는 상태에서 어디서부터 학습해야 가장 효율적인지 경로를 짜달라" — 학습 경로 설계 요청
- "도메인 가이드 1차 문서를 작성해주면 그걸 베이스로 본인 말로 재정리해 학습하겠다" — 학습 자료 생성 후 본인 재구성
- "PR-A 범위는 lib 계층(타입 / DataSource / 계산 / 테스트)만, UI는 안 건드린다" — 범위 명시
- "각 함수에 도메인 의미·입출력·예시를 JSDoc으로 충실히 남겨라" — 학습·발표용 주석 정책 제시
- "테스트 코드 실행 결과를 어떻게 검증하는지" — Vitest 사용법 확인

### AI 활용 영역

- **튜터 모드**: 도메인 학습 경로 7단계 안내 (PCF → 공식 → 생애주기 → GHG Scope → 단위 → 버전 관리 → 시나리오) 후, 본인이 다시 정리하며 학습
- **구현 자동화**: 의사결정한 함수 분할·시그니처에 맞춰 TypeScript 코드 생성, 작성된 코드를 사용자가 라인 단위로 검토
- **검수자 모드**: 코드 작성 후 도메인 관점·정합성 검토 — 매칭 규칙의 시점 비교, Scope 분류 일관성, Boundary case 처리 등
- Vitest 셋업 + 테스트 케이스 설계 자문, 부동소수점·시점 매칭 같은 까다로운 케이스 추가 검토
- 단위 포맷 유틸의 단순화 로직 (`kgCO2e` ↔ `kgCO₂e`, kg ↔ t 자동 변환) 구현 위임

### 직접 결정·검토한 부분

- **함수 분할 (11개)** — 각 함수가 단일 책임을 가지고, 발표 시 한 문장으로 설명 가능한 크기인지 직접 검토
- **Scope 분류 규칙** — 시드 데이터를 직접 보고 매핑 결정: 전기 → Scope 2, 원소재·운송 → Scope 3, 본 데이터엔 Scope 1 없음
- **감축 시나리오 모델** — 활동량 곱셈으로 단순화하기로 결정 (계수 변경 모델은 본 과제 범위 밖이라 의식적 배제)
- **매칭 실패 처리** — 조용히 무시하지 않고 throw로 정합성 보장 (감사·디버깅 관점)
- **DataSource 추상화** — 정적 JSON 구현체와 인터페이스를 분리해 향후 Postgres 교체 시 호출부 변경 없도록 설계
- **테스트 우선순위** — 부동소수점 비교 (`toBeCloseTo`), 시점 경계 (validFrom 직전), 빈 입력 처리 등 도메인 명세 케이스에 집중

### 회고

- 단순 UI나 차트 작업에 비해 **도메인 학습 + 계산 로직 설계 단계에서 시간이 가장 오래 걸렸다.**
  - 도메인 갭을 메우는 데 AI를 튜터로 적극 활용했음에도, 단순히 동작하는 코드 이상으로
    "왜 이런 함수 분할인가", "왜 이런 매칭 규칙인가"를 발표 수준까지 설명 가능하도록
    이해도를 끌어올리는 데 추가 시간을 투자했다.
- 그 결과 각 계산 함수에 대해 도메인 의미·테스트 케이스·예외 처리를 모두 말로 풀어낼 수 있는 상태가 됨.
- 시간 투자가 컸던 만큼 후속 PR(차트 연결·시나리오 인터랙션)은 이 계층을 그대로 import하는 형태라
  속도가 빨라질 것으로 기대.

### 최종 반영 여부

- 7개 커밋(Vitest 셋업 + types + units + data-source + calc + test + fix)으로
  `feat/core` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn test` 29개 모두 통과, `yarn build` 무오류
- 이슈 #11과 연결 (Closes #11)

---

## 2026-05-19 - 차트·데이터 연결 1단계 (서버 컴포넌트 전환 + KPI 카드)

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

PR-A에서 마련한 lib 계층(타입·DataSource·계산 모듈)을 실제 화면에 처음 연결하는 단계.
shadcn 차트 컴포넌트를 도입하고, `page.tsx`를 서버 컴포넌트로 전환해
정적 데이터 페치 + 계산 결과를 KPI 카드에 주입한다.

### Prompt

- "PR-B로 가자. 이슈 제목에 PR-B 안 붙여도 되고 브랜치명은 좀 더 길게 써도 됨"
- "수정한 코드 라인이 500개 넘어가면 PR 자르자, 한 7~800줄에서 끊자" — PR 크기 룰 제시

### AI 활용 영역

- shadcn chart/table 컴포넌트 설치 진행 (Recharts 기반 자동 생성 코드 ~500줄)
- `page.tsx` async 서버 컴포넌트 패턴 적용 — `staticDataSource` + `calc` 모듈 호출 후 props 주입
- `units.ts`에 `splitEmission` 헬퍼 추가 (값/단위 분리 — KpiCard에 별도 시각 요소로 표시하기 위함)
- KPI 카드 4개(Total / Avg / Top Stage / Hotspot)에 계산 결과 매핑 작성

### 직접 결정·검토한 부분

- **렌더링 전략**: 클라이언트 컴포넌트 대신 서버 컴포넌트에서 데이터 페치 (정적 JSON이라 SSG 친화적, 클라이언트 JS 사이즈도 줄임)
- **KpiCard 표시 방식**: value/unit 분리를 유지하면서 자동 단위 변환을 지원하기 위해 `splitEmission` 헬퍼 신설 (`formatEmission`은 한 문자열 합본이라 KpiCard와 안 맞음)
- **PR 분할 룰 확정**: 누적 변경 라인 500~800줄 사이에서 PR 끊기로 협업 컨벤션에 정착. 자동 생성 코드도 카운트에 포함
- **차트 컴포넌트 1개(MonthlyPcfBarChart) 미리 작성했지만 누적 807줄 도달 → 다음 PR로 이월**

### 회고

- PR 크기 룰을 작업 중에 도입한 결과, 이미 작성한 차트 컴포넌트를 다음 PR로 미루는 의사결정이 한 번 발생.
- 다음부터는 PR 분기 시점에 라인 예산을 먼저 추정하고 컴포넌트 단위를 정하는 흐름으로 개선 예정.

### 최종 반영 여부

- 2개 커밋(shadcn chart/table 추가 + page.tsx 서버 컴포넌트 전환·KPI 주입)으로
  `feat/connect-charts-to-data` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn test` 29개 통과, `yarn build` 무오류
- 차트 컴포넌트 작성·연결은 후속 PR (PR-B-2)에서 이어감
- 이슈 #13과 연결 (Closes #13)

---

## 2026-05-19 - 메인 차트 3종 연결 (월별 PCF Bar / Lifecycle Donut / 월별 단계 적층)

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

PR #14에서 마련한 서버 컴포넌트·KPI 구조 위에, 대시보드의 메인 차트 3종을 실제 데이터로 그린다.
shadcn Chart(Recharts) 컴포넌트 패턴을 일관되게 적용하고, 단계 색상 토큰을 차트 간 통일.

### Prompt

- "다음 진행" — PR-B-2 진행 요청

### AI 활용 영역

- shadcn Chart의 `ChartContainer` / `ChartTooltip` / `ChartLegend` API 사용 패턴 적용
- 월별 막대(BarChart), 단계 도넛(PieChart with innerRadius), 적층 막대(Bar with stackId)의 Recharts 매핑
- `aggregateByMonth.byStage`를 적층 차트가 받는 평탄화 데이터로 변환
- chartConfig + STAGE_COLORS 분리 설계 (한글 key가 CSS 변수에 안전하지 않은 점 회피)

### 직접 결정·검토한 부분

- **단계 색상의 차트 간 통일**: Donut과 Stacked Bar가 동일한 `STAGE_COLORS` record를 공유해 시각 일관성 확보
- **chartConfig key를 한글로 두면서도 색상은 별도 record로** — `var(--color-{한글})` CSS 변수가 브라우저에서 항상 안전하지 않은 문제 회피
- **적층 순서** 원소재 → 전기 → 운송으로 결정 (배출 기여도 통상 순서에 맞춤, 단계 색 톤도 짙은→옅은 순으로 자연스럽게)
- **둥근 모서리는 적층 최상단 Bar에만 적용** — 시각적으로 막대 전체가 한 덩어리로 보이게
- **0 값 단계 필터링**: Donut에서 total이 0인 단계는 빈 조각을 만들지 않도록 사전 제거
- 더 이상 쓰이지 않는 `ChartPlaceholder` import 정리 (lint Hint 대응)

### 회고

- PR 크기 룰 도입 후 첫 PR. 컴포넌트 단위 + 라인 예산을 미리 가늠하니 작업 흐름이 매끄러웠음.
- 차트 3종 + page.tsx 연결 = 누적 273줄. 룰(500~800) 한참 안쪽이라 여유.

### 최종 반영 여부

- 3개 커밋(MonthlyPcfBarChart / LifecycleDonutChart / MonthlyStageStackedBarChart 연결)으로
  `feat/main-charts` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn test` 29개 통과, `yarn build` 무오류
- 이슈 #15와 연결 (Closes #15)

---

## 2026-05-19 - Emission Detail Table 연결

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

실무자 뷰의 핵심인 활동 raw 데이터를 표 형태로 시각화해, 평가 가이드의
"활동량 / 단위 / 배출계수 / 계산된 배출량 표시" 요구사항을 충족한다.

### Prompt

- "Emission Detail Table / Stage Drill-down / Reduction Scenario Before — 이 차트들 구현 필수인지" — 평가 기준 대조 요청
- "PR-B-3 이걸로 가자" — Detail Table 단독 진행 결정

### AI 활용 영역

- 평가 가이드와 작업 후보를 대조해 필수/권장/선택 분류 안내
- shadcn Table 컴포넌트 패턴 적용 (sticky header, max-h + overflow-auto)
- 단계 정렬 가중치 record 설계 (원소재→전기→운송)
- `formatActivityUnit`, `formatNumber` 유틸 재사용으로 단위 표시 일관성 유지

### 직접 결정·검토한 부분

- **PR 분할 재구성**: 기존 "Detail Table + Drill-down 정적 + Scenario Before" 묶음이 의미 단위가 약하다는 점 인지 후 분리. Scenario는 PR-C에서 Before+After를 한 번에 다루는 게 자연스러움
- **정렬 규칙**: 일자 → 단계(도메인 흐름 순) → 세부. 단순 일자만 사용하면 같은 일자 안에서 순서가 비결정적이 되는 점 회피
- **중복 레코드 처리**: 5월처럼 같은 키에 두 건 들어와도 그대로 표시 (raw 보존). 합산은 차트가 담당
- **시각 강조**: 배출량 컬럼만 `font-medium`, 배출계수는 `× n` 형태로 표시해 "어떻게 계산됐는지" 한눈에 보이게
- **Stage Drill-down은 권장 항목이라 시간 여유 없으면 제외 가능**하다고 판단, 후속 PR로 미룸

### 회고

- 평가 기준 대조 단계에서 작업 우선순위가 명확해짐. 모든 placeholder를 채우려 하지 말고 필수/권장/선택을 먼저 가르는 흐름이 시간 절약에 효과적이라는 점 재확인.

### 최종 반영 여부

- 단일 커밋(`EmissionDetailTable` 추가 + placeholder 삭제 + page.tsx 교체)으로
  `feat/emission-detail-table` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn test` 29개 통과, `yarn build` 무오류
- 이슈 #17과 연결 (Closes #17)

---

## 2026-05-19 - 시나리오 슬라이더 인터랙션 연결

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

평가 가이드 경영자 뷰의 핵심 — "감축 시나리오에 따른 예상 절감 효과" — 를
인터랙티브로 완성한다. 단순 수치 표시가 아니라 슬라이더 움직임이 대시보드 전체
(KPI · 차트 · 테이블)에 즉시 반영되도록 설계해, 발표 시 강한 어필 포인트로 활용.

### Prompt

- "감축 시나리오에 따른 절감 효과를 바로 보여줄 수 있게, 슬라이더 변경을 통한 절감률을 즉시 데이터에 반영하여 대시보드 전체를 변경시킬 수 있게 가자. props로 절감률을 일괄 전달하고, 슬라이더로 인한 단위 변환은 패널 내부에서 일괄 처리하는 흐름으로 적용." — 설계 방향 지시

### AI 활용 영역

- 지시한 설계(부모 state → props 단방향 흐름)에 맞춰 `DashboardClient` 구현 보조
- ReductionScenarioPanel을 controlled 컴포넌트로 전환하는 코드 자동화
- 슬라이더 UI(0~100%) ↔ 도메인 타입(0~1 비율) 변환 일관 적용
- Before/After 카드와 절감 효과 표시의 UI 마무리

### 직접 결정·검토한 부분

- **데이터 흐름 설계** — 슬라이더 → 부모 state → props로 일괄 전달 → 모든 시각화 즉시 반영
- **단위 변환 책임 분리** — 슬라이더는 0~100 표시, 도메인 타입은 0~1 비율. 변환은 ReductionScenarioPanel 안에서만 수행하도록 지시
- **모든 시각화가 After 기준** — Before 단독 표시 대신 슬라이더 인터랙션이 대시보드 전체에 반영되어 발표 임팩트 강화
- **서버 / 클라이언트 경계** — 데이터 페치는 서버, 인터랙션은 클라이언트 컨테이너로 분리해 SSG 친화성 유지
- **HeaderBar 위치** — DashboardClient 안에 넣지 않고 page.tsx에 그대로 (ExcelUploadButton이 자체 클라이언트 컴포넌트라 무관)
- **절감 효과 카드 빈 상태** — savings가 0이면 "슬라이더를 조정해보세요" 안내 메시지로 UX 명확화

### 회고

- 이전 PR들에서 추상화 계층(DataSource · calc · units)을 잘 분리해둔 덕분에 이번 인터랙션 연결이 단일 PR 250줄 정도로 마무리됨.
- 슬라이더 → 차트·KPI 즉시 반영은 발표 데모에서 가장 인상적인 부분으로 자리잡을 것으로 기대.

### 최종 반영 여부

- 단일 커밋(DashboardClient 신설 + page.tsx 슬림화 + ReductionScenarioPanel controlled 전환)으로
  `feat/scenario-interaction` 브랜치에 구성되어 `develop` 대상 PR로 제출됨
- `yarn test` 29개 통과, `yarn build` 무오류
- 이슈 #19와 연결 (Closes #19)

---

## 2026-05-19 - 엑셀 파싱 · 검증 · 업로드 데이터로 대시보드 갱신

### 사용 도구

Claude Code (Claude Opus 4.7) — VSCode 확장 환경

### 사용 목적

평가 가이드 필수 항목 — "데이터 입력 화면에서 오류 입력 시 에러 메시지가 표시된다" — 를
mock이 아니라 실제로 충족시키기 위해, 엑셀 파싱 + 검증 + 대시보드 즉시 갱신까지 한 흐름으로 완성한다.
보너스 항목 "엑셀을 그대로 임포트"와도 직결되는 영역.

### Prompt

- "현재 ExcelUploadButton은 mock 검증만 동작한다. 평가 필수 요건(데이터 입력 오류 메시지)을 진짜로 충족하려면
  실제 xlsx 파싱·검증·대시보드 반영까지 한 묶음으로 가야 한다. 옵션 A(엑셀 파싱)로 가자."
- "PR을 한 번에 큰 단위로 쪼개지 말고 의미 단위로 작게 점진 빌드하자 — 설치 → 매핑 → 필수 컬럼 검증 →
  값 검증 → 행 번호 메시지 → 테스트 → UI 연결 순으로 자연스러운 흐름으로."
- "엑셀 구조를 직접 분석해 전달: 시트 3개 중 데이터 시트에 헤더가 A3, 같은 시트 G열에 배출계수가 별도 영역으로 존재.
  단순 `sheet_to_json`으로는 안 되니 키 헤더 셀('일자(원본)') 자동 감지 + 헤더 시작 셀에서 오른쪽 5개 컬럼만 읽는
  범위 기반 추출로 가자. 옆 G열의 계수 영역은 자동 회피되어야 한다."
- "배출계수는 시스템 표준 자산이므로 엑셀에서 가져오지 말고 우리 정적 JSON을 그대로 쓰자.
  사용자가 입력하는 건 활동 데이터만."
- "본 SaaS는 사용자가 활동 데이터를 입력하는 흐름이 본질이다. 초기엔 빈 상태로 시작하고 empty state로
  다음 행동(엑셀 업로드)을 명시적으로 유도하자. 권장 항목인 Stage Drill-down은 시간 효율 위해 제외."
- "감축 슬라이더 조정 시 숫자 자릿수가 바뀌면서 Detail Table 컬럼 폭이 출렁이는 게 거슬린다.
  `table-fixed` + 컬럼별 % 너비(14/10/16/16/14/18/12)로 고정하고, th·td 모두 중앙 정렬로 통일하자."
- "헤더의 부가 텍스트(CT-045 / 기간)는 제거. 좌측 제목 + 우측 업로드 버튼만 남기자."
- "업로드 성공 시 2초 뒤 모달 자동 닫기 + 다음 업로드를 위한 상태 reset."
- (검증) "엑셀 업로드하면 시드 JSON이 아니라 실제 업로드 데이터로 교체되는 거 맞지?" —
  데이터 흐름이 의도대로 구현되었는지 직접 확인.

### AI 활용 영역

- 지시한 설계에 맞춰 xlsx(SheetJS) 도입 + 단계별 구현 자동화
- 키 헤더 셀 자동 감지 + 범위 기반 추출 패턴 (`findCellByText`, `decode_cell`, `encode_range`) 코드 작성
- 엑셀 행 번호 prefix("행 N: ...") 포함된 구체 에러 메시지 포맷 일괄 적용
- `XLSX.utils.aoa_to_sheet` + `write({ type: "array" })`로 메모리상 buffer 만드는 테스트 헬퍼 작성
- `ParseResult` discriminated union, 빈 행 자동 skip 등 보일러플레이트 처리
- EmptyState 컴포넌트 UI 마무리, 테이블 % 너비 분배 적용

### 직접 결정·검토한 부분

- **PR 분할 전략** — 의미 단위 작은 커밋으로 자연스러운 점진 빌드 강제. 단계 순서·라인 예산 직접 관리
- **파서 자동 감지 vs 하드코딩** — 시트 이름·헤더 위치를 코드에 박지 않고 키 셀 자동 감지로 결정.
  엑셀 형식 변경에 강하고 면접 답변에도 일관된 스토리("사용자마다 엑셀 형식이 다를 수 있다") 확보
- **엑셀 구조 직접 분석** — CSV로 추출해 시트 구성·헤더 위치·계수 영역을 사전 파악 후 파서 설계에 반영.
  단순 `sheet_to_json`으로 시작한 1차 파서를 자동 감지 방식으로 전면 재작성하는 의사결정
- **배출계수는 엑셀에서 가져오지 않음** — DECISIONS의 계수 버전 관리 정책과 맞추어 시스템 자산으로 유지
- **검증 결과 누적** — 첫 에러에서 throw하지 않고 모든 행을 끝까지 검증해 한 번에 보여주기로 결정
  (사용자가 한 번에 다 고치게)
- **업로드 데이터 흐름** — DashboardClient에 `useState<ActivityRecord[]>` 도입, 콜백 prop drilling으로 단방향 흐름 설계
- **Empty state 도입** — SaaS 흐름(사용자 데이터 입력 → 시각화)에 자연스러운 진입 경험 유도
- **Stage Drill-down 제외** — Detail Table + 단계 적층 차트로 대체 가능, 시간 효율을 위해 정리
- **테이블 레이아웃 안정성** — 감축 슬라이더 인터랙션과 상호작용할 때 표가 흔들리지 않도록 `table-fixed` + % 너비로 고정.
  th·td 모두 중앙 정렬로 통일해 시각적 일관성 확보
- **자동 닫기 UX** — 업로드 성공 후 사용자가 추가 액션 없이 결과(대시보드 갱신)에 집중할 수 있도록 2초 자동 닫기
- **데이터 흐름 검증** — 구현 완료 후 "시드 JSON이 아니라 실제 업로드 데이터를 사용하는가" 직접 확인해
  설계 의도대로 작동함을 검증

### 회고

- 진행 중 CSV로 직접 엑셀 구조를 분석해 전달한 부분이 결정적이었음.
  엑셀 형식을 미리 안 보고 시작했다면 한 번에 짜기 어려웠을 것이고,
  1차 단순 파서에서 자동 감지 파서로 재설계하는 의사결정은 도메인 정보의 사전 분석이 있었기에 가능했음.
- 의미 단위로 잘게 쪼개는 점진 빌드를 처음으로 본격 적용. 각 단계가 다음 단계로 자연스럽게 이어져
  발표에서도 흐름을 설명하기 좋게 정리됨.
- 누적 ~700줄로 PR 크기 룰 안. 다음 PR(README 작성·영상 캡처)로 자연스럽게 이어갈 여유.

### 최종 반영 여부

- 10개 이상의 커밋(설치 → 매핑 → 필수 컬럼 → 값 검증 → 자동 감지 재작성 → 테스트 → ExcelUploadButton 연결
  → HeaderBar prop 전달 → DashboardClient state + empty state + Drill-down 제거 → UI 정리 + td 중앙 정렬
  + 자동 닫기)
- `yarn test` 37개 통과 (calc 29 + excel-import 8)
- `yarn build` 무오류
- 이슈 #21과 연결 (Closes #21)