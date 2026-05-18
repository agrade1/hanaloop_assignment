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