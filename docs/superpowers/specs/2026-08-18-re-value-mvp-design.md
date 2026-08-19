# RE:VALUE 근거 기반 의사결정 MVP 설계

작성일: 2026-08-18  
대상: 제13회 전국 ICT융합 공모전 디지털 시제품

## 1. 제품 정의

RE:VALUE는 충북 제조기업의 공정부산물 정보를 실제 자원 정체성으로 구조화하고, 검증된 공식 사례와 시장·제도 근거에서 순환경로를 검색한 뒤, 각 경로의 충족 조건과 미확인 사항을 보여주는 AI 의사결정 지원 웹앱이다.

서비스는 AI가 가능한 용도를 자유롭게 발명하거나 확률형 점수를 제시하는 대신 다음 질문에 근거로 답한다.

1. 이 공정부산물은 행정상 분류와 별개로 실제로 무엇인가?
2. 지금 확인된 사실과 아직 모르는 정보는 무엇인가?
3. 공식 선례가 있는 순환경로 중 무엇을 검토할 수 있는가?
4. 각 경로의 기술·시장·제도·물량 조건을 충족하는가?
5. 과거 판단 이후 조건이 변해 다시 검토해야 하는가?

## 2. 대상 사용자와 핵심 과업

### 대상 사용자

- 충북 중소·중견 제조기업의 환경·안전·생산 담당자
- 공정부산물의 재활용 가능성을 검토하지만 소재·시장·제도 정보를 한 번에 확인하기 어려운 실무자

### 핵심 과업

사용자는 불완전한 현장 정보를 입력한 뒤, 3분 안에 다음 결과를 얻어야 한다.

- 행정상 분류, 실제 재질, 발생공정이 분리된 Resource Identity
- 확인된 정보, AI 추론, 추가 확인이 필요한 정보
- 공식 근거가 존재하는 Route 후보
- Route별 충족 조건과 누락 조건
- 현재 판단과 다음 확인 행동
- 판단에 사용된 출처, 조회일, 유효성

## 3. 제품 원칙

### 3.1 근거가 없는 답을 만들지 않는다

- AI는 새로운 재활용 용도나 구매자를 자유롭게 생성하지 않는다.
- Route 후보는 검증된 Route Library에서만 검색한다.
- 시장 근거가 없으면 가격이나 매각 수익을 출력하지 않는다.
- 법적 가능성을 자동으로 확정하지 않으며, 필요한 확인기관과 확인사항을 안내한다.

### 3.2 점수가 아니라 상태와 조건을 보여준다

`적합도 87점`과 같이 근거를 설명하기 어려운 점수는 사용하지 않는다. 판단은 명시적 조건과 Evidence State로 구성한다.

- `Confirmed`: 공식 출처 또는 사용자 입력으로 확인됨
- `AI Inferred`: 입력 문맥으로 추론했으며 검증이 필요함
- `Needs Validation`: 판단에 필요하지만 확인되지 않음
- `Evidence Found`: 비교 가능한 공식 근거가 존재함
- `Not Validated`: 구매자·시험·현장 확인이 완료되지 않음

### 3.3 사실의 출처와 사실의 상태를 분리한다

모든 데이터 항목은 Provenance와 Validation State를 각각 가진다.

#### Provenance

- `Official Source`: 공개된 공식 자료에서 확인
- `User Input`: 사용자가 직접 입력
- `AI Inference`: AI가 문맥에서 추론
- `Unknown`: 확인할 정보가 없음

#### Validation State

- `Confirmed`
- `Inferred`
- `Needs Validation`
- `Historical`
- `Expired`

예를 들어 `형태=성형부품`은 Provenance가 `AI Inference`, Validation State가 `Inferred`일 수 있다. 동원시스템즈 과거 인정 사례는 Provenance가 `Official Source`, Validation State가 `Expired`일 수 있다.

### 3.4 불완전한 입력을 허용한다

사용자가 모든 항목을 아는 것을 전제로 하지 않는다. 모르는 항목은 비워둘 수 있고, 시스템은 이를 숨기지 않고 `Needs Validation`으로 전환한다.

## 4. MVP 범위

### 포함

- 실제 공개사례와 직접 입력
- AI Resource Resolver
- Evidence Gate
- 검증된 Route Evidence 검색
- Route Qualification
- Decision 생성
- Decision Memory와 Conditional Reopen
- 브라우저 Decision Report
- 모든 근거의 출처·조회일·유효성 표시
- API 키가 없어도 완전히 동작하는 데모
- 선택적 AI 분석 어댑터

### 제외

- 실제 거래, 결제, 계약
- 구매자 회원가입과 매칭 요청
- 물류 배차
- 실시간 전국 사업자 검색
- 자동 법적 승인 판정
- 근거 없는 가격·절감액·탄소감축량 예측
- 관리자 시스템
- PDF 내보내기

PDF 내보내기는 브라우저 보고서가 완성된 뒤 시간이 남을 경우에만 별도 범위로 검토한다.

## 5. 정보 구조와 화면

### 5.1 Home / Case Library

목적은 시연 시작 5초 안에 실제 공개자료 기반 시제품임을 전달하는 것이다.

- 주 행동: `현대모비스 진천 PBT 사례 분석`
- 보조 사례: `SK하이닉스 IC-Tray`, `Wafer Carrier`
- 직접 입력
- 각 공개사례에 `한국환경공단 순환자원정보센터 공개자료 기반` 표시
- 원문 출처 링크 제공

### 5.2 Resource Input

- 사업장·업종
- 현장명
- 행정상 폐기물 분류
- 실제 재질 또는 구성성분
- 발생공정
- 형태
- 오염·이물 정보
- 월간 발생량
- 현재 처리방법
- 보유 증빙

필수 정보만으로 다음 단계에 진입할 수 있고, 모르는 값은 `모름`으로 남긴다. 오류가 있어도 입력값을 보존하며 필드 가까이에 구체적인 안내를 표시한다.

### 5.3 Resource Resolution + Evidence Gate

첫 번째 핵심 시연 화면이다.

- Administrative Identity
- Material Identity
- Process Identity
- 형태·성분·오염·물량 등 Resource Attributes
- 각 항목의 Provenance와 Validation State
- 추가 확인이 필요한 항목 수와 이유
- 현재 Gate 상태

예시:

```text
행정상 분류  폐합성수지류       Official Source / Confirmed
실제 재질    PBT                Official Source / Confirmed
발생공정     자동차 부품 검사    Official Source / Confirmed
형태         성형부품            AI Inference / Inferred

현재 상태: Qualification Required
Resource Identity 확인을 위해 1개 정보의 확인이 필요합니다.
```

Route별 Missing Evidence는 이 화면에서 고정 질문으로 만들지 않는다. Route Retrieval 이후 실제 Route Evidence에 명시된 요구조건에서 동적으로 생성한다. 공식 근거가 요구하지 않는 난연제·금속이물 등의 항목을 PBT의 필수조건처럼 표시하지 않는다.

### 5.4 Route Decision

추천 하나를 단정하지 않고 검증된 후보를 조건 중심으로 비교한다.

| Route | Resource Fit | Evidence | Missing | Decision |
| --- | --- | --- | --- | --- |
| 재생원료화 | 핵심 재질 조건 부합 | 공식 Route 근거 있음 | Route 조건에서 동적 생성 | Review |
| 직접 재사용 | 용도 조건 미확인 | 제한적 | 품질·수요처 | Watch |
| 현재 소각 | 현재 실행 중 | 확인됨 | 없음 | Baseline |

점수, 별점, 백분율은 표시하지 않는다. 각 판단은 충족된 규칙과 충족되지 않은 규칙을 펼쳐 볼 수 있어야 한다.

### 5.5 Decision Report

- 현재 판단
- 판단 이유
- 확인된 사실
- 아직 모르는 정보
- 다음 행동
- 비교한 Route
- 공식 근거와 시장근거
- 출처, 조회일, 유효성, 근거 유형
- 과거 판단과 현재 변화가 있을 경우 Freshness 경고

보고서는 화면 내에서 읽고 시연할 수 있어야 하며 PDF 생성에 의존하지 않는다.

## 6. 핵심 컴포넌트

### 6.1 AI Resource Resolver

Resource Resolver는 Route를 생성하지 않는다. 서로 다른 언어로 기록된 정보를 실제 Resource Identity로 연결한다.

```text
Extract → Normalize → Link → Mark uncertainty
```

- Extract: 자유문장에서 재질·공정·형태·오염·물량 후보 추출
- Normalize: 동의어와 현장 표현을 표준 표현으로 정규화
- Link: 행정 분류, Material Identity, Process Identity를 연결
- Mark uncertainty: 출처와 확신이 없는 항목을 추론 또는 미확인으로 표시

API 키가 설정된 경우 AI 어댑터를 사용할 수 있다. 키가 없거나 호출이 실패하면 공식 데모 사례용 deterministic parser를 사용한다. 두 경로 모두 동일한 구조의 결과를 반환한다.

### 6.2 Evidence Gate

Route 비교 전에 Resource Evidence의 충족 상태를 검사한다.

최소 Gate 항목:

- 실제 재질 확인
- 발생공정 확인
- 형태 확인
- 오염·이물 확인
- 반복 발생량 확인

Evidence Gate는 Resource 자체의 Identity, Quality, Supply 준비도만 판단한다. 공식 Route Evidence의 존재 여부는 Gate에 포함하지 않고 Route Evidence Retrieval과 Route Qualification 단계에서 처리한다. 따라서 검색 가능한 Route가 없어도 Resource 자체는 `Ready for Route Review` 상태가 될 수 있다.

Gate 결과:

- `Ready for Route Review`
- `Qualification Required`
- `Insufficient Evidence`

Gate는 값이 없다는 이유로 임의 기본값을 넣지 않는다.

### 6.3 Route Evidence Library

Route 후보는 이 Library의 기록만 사용한다.

각 Route Evidence는 다음을 포함한다.

- Route ID와 명칭
- 적용 가능한 Material Identity
- 요구 형태와 전처리
- 허용 또는 제한되는 오염 조건
- 최소·최대 물량 조건이 확인된 경우 해당 조건
- 재활용 유형과 결과물
- 공식 선례 또는 시장 근거
- 근거 유형: 사례, Benchmark, 입찰, 규정
- 출처 URL, 확인일, 유효기간, 현재 상태

의미적 검색은 후보를 찾는 데만 사용한다. 후보의 최종 상태는 명시적 Rule로 결정한다.
Route별 Missing Evidence는 `QualificationCondition` 중 현재 값이 `Unknown`인 필수조건에서 동적으로 생성한다. 시드 데이터나 화면 컴포넌트에 특정 질문을 고정하지 않는다.

### 6.4 Route Qualification Engine

각 후보 Route의 명시적 조건과 현재 Resource를 비교한다.

조건 결과:

- `Met`
- `Not Met`
- `Unknown`
- `Not Applicable`

Route Decision:

- `Review`: 핵심 조건이 충족되고 필요한 후속 확인이 명확함
- `Qualification Required`: 핵심 조건 중 미확인 사항이 있음
- `Not Qualified`: 확인된 정보가 필수 조건과 충돌함
- `Watch`: 근거가 제한적이거나 현재 실행 우선순위가 낮음
- `Baseline`: 현재 처리 경로

### 6.5 Decision Memory

Resource별 과거 판단과 판단 당시의 Evidence Snapshot을 저장한다.

```yaml
decision:
  status: rejected
  decided_at: 2026-05-10
  reason: minimum_quantity_not_met
reopen_condition:
  field: monthly_quantity_ton
  operator: gte
  value: 10
evidence_snapshot:
  monthly_quantity_ton: 4
```

MVP에서는 브라우저 로컬 상태 또는 시드 데이터로 저장한다. 서버 동기화와 다중 사용자는 범위에서 제외한다.

### 6.6 Decision Freshness

Freshness는 출처 만료와 과거 판단의 재검토 필요성을 모두 검사한다.

1. Evidence Freshness
   - 근거가 만료됐거나 현재 상태가 `기간만료`이면 `Historical Evidence`로 표시
   - 현재 유효한 선례처럼 사용하지 않음
2. Decision Freshness
   - 과거 판단 이유와 Reopen Condition을 현재 Resource 값과 비교
   - 조건이 충족되면 과거 판단을 `Stale`로 표시하고 검토를 재개

시연 예시:

```text
과거 판단: 월 물량 부족으로 제외
과거 물량: 월 4t
현재 물량: 월 12t
변화: Reopen Condition 충족
결과: Decision Stale → 재검토 필요
```

### 6.7 Hallucination Guard

- 가격 근거가 없으면 가격 필드를 생성하지 않는다.
- Route Library에 없는 Route를 결과에 포함하지 않는다.
- 만료된 근거를 현재 유효한 근거로 승격하지 않는다.
- AI 결과에 존재하지만 입력·공식자료에서 확인되지 않은 값은 `AI Inference`로 강제 표시한다.
- 법적 적합성은 `확인 필요`를 유지하고 자동 승인 문구를 사용하지 않는다.

## 7. 데이터 모델

```ts
type Provenance =
  | 'official_source'
  | 'user_input'
  | 'ai_inference'
  | 'unknown';

type ValidationState =
  | 'confirmed'
  | 'inferred'
  | 'needs_validation'
  | 'historical'
  | 'expired';

interface SourcedValue<T> {
  value: T | null;
  provenance: Provenance;
  validationState: ValidationState;
  evidenceIds: string[];
}

interface Resource {
  id: string;
  name: string;
  administrativeIdentity: SourcedValue<string>;
  materialIdentity: SourcedValue<string[]>;
  processIdentity: SourcedValue<string>;
  form: SourcedValue<string>;
  contaminants: SourcedValue<string[]>;
  monthlyQuantityTon: SourcedValue<number>;
  qualitySpecification: SourcedValue<string>;
  currentTreatment: SourcedValue<string>;
  notices: string[];
}

interface EvidenceRecord {
  id: string;
  title: string;
  evidenceType: 'case' | 'benchmark' | 'bid' | 'regulation';
  sourceUrl: string;
  observedAt: string;
  validUntil: string | null;
  status: 'current' | 'historical' | 'expired';
  supportedClaims: string[];
  marketKind: 'monthly_average' | 'listing_price' | 'bid_minimum' | null;
}

interface QualificationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'includes' | 'gte' | 'lte' | 'known';
  expected: string | number | boolean;
  required: boolean;
}

interface RouteDefinition {
  id: string;
  name: string;
  description: string;
  conditions: QualificationCondition[];
  evidenceIds: string[];
}

type ConditionResult = 'met' | 'not_met' | 'unknown' | 'not_applicable';
type RouteDecision =
  | 'review'
  | 'qualification_required'
  | 'not_qualified'
  | 'watch'
  | 'baseline';
```

구현 시 타입 이름은 이 계약을 유지하며, 화면용 한국어 문구는 별도 매핑으로 관리한다.

## 8. 데이터 흐름

```text
Case Library 또는 Resource Input
        ↓
AI Resource Resolver
        ↓
Normalized Resource + Sourced Values
        ↓
Evidence Gate
        ↓
검증된 Route Evidence Retrieval
        ↓
Route Qualification Engine
        ↓
Decision + Missing Evidence + Next Actions
        ↓
Decision Memory
        ↓
Evidence 또는 Resource 변화
        ↓
Decision Freshness / Conditional Reopen
```

## 9. 기술 구조

- 프런트엔드: React, TypeScript, Vite
- 상태: React 기본 상태와 브라우저 로컬 저장소
- 데이터: 버전 관리되는 TypeScript 또는 JSON 시드 데이터
- 테스트: Vitest, Testing Library
- 브라우저 검증: Playwright
- 스타일: 의미 기반 CSS 변수와 컴포넌트 단위 CSS
- 백엔드: MVP에는 없음
- AI: 동일한 `ResourceResolver` 인터페이스를 구현하는 선택적 어댑터

외부 API와 네트워크가 없어도 공개사례 데모, Evidence Gate, Route Qualification, Decision Freshness가 모두 실행돼야 한다.

## 10. 오류와 대체 동작

- 입력 누락: 값을 발명하지 않고 `Needs Validation`으로 이동
- AI 호출 실패: 입력을 보존하고 deterministic resolver로 재시도
- Evidence 없음: `근거를 찾지 못함`을 표시하고 Route를 생성하지 않음
- 시장가격 근거 없음: 가격 영역 자체를 숨기고 `공식 시장근거 없음` 표시
- 만료 근거: `Historical Evidence` 경고와 함께 현재 판단 근거에서 제외
- 잘못된 외부 링크: 출처명·최종 확인일을 유지하고 링크 확인 필요 표시
- 로컬 저장 실패: 현재 세션 내 분석은 유지하고 저장 실패를 알림

## 11. 접근성과 반응형 원칙

- 색만으로 Evidence State를 구분하지 않고 텍스트 라벨을 함께 사용
- 키보드만으로 사례 선택, 입력, Route 세부정보 확인이 가능
- 모든 컨트롤에 명시적 라벨과 보이는 포커스 제공
- 주요 터치 영역은 최소 44×44 CSS px
- 모바일에서는 비교표를 의미 있는 Route 블록으로 재배치하고 가로 스크롤에 의존하지 않음
- `prefers-reduced-motion`을 존중하고 핵심 상태 전달에 애니메이션을 사용하지 않음
- 오류는 해당 입력 가까이에 표시하고 입력값을 보존

## 12. 주 시연 시나리오

### 현대모비스 진천 PBT

1. Home에서 `현대모비스 진천 PBT 사례 분석`을 선택한다.
2. 공식 공개자료에서 확인된 값이 Resource Input에 채워진다.
3. Resource Resolver가 행정 분류, PBT, 자동차 부품 조립·검사 공정을 분리한다.
4. 형태는 AI 추론으로 표시하고, 입력되지 않은 Resource 품질 정보는 `Unknown`으로 유지한다.
5. Evidence Gate가 Route와 무관한 Resource 준비도만 판정한다.
6. Route Library에서 공식 등록자료에 원료 재활용 수요가 확인된 후보와 현재 소각 Baseline을 검색하고, 실제 Route 요구조건에서 Missing Evidence를 생성한다. 등록된 희망경로는 완료된 재활용 선례로 표현하지 않는다.
7. Route Qualification이 점수 없이 충족·미확인 조건을 비교한다.
8. Decision Report가 `재생원료화 Route 우선 검토`, 판단 이유, 미확인 사항, 다음 행동, 출처를 보여준다.

### Freshness 보조 시연

이 흐름은 실제 공개기업 사례가 아닌 `Synthetic Demo Scenario`이며, 시드 데이터와 화면 상단에 `Conditional Reopen 기능 시연용 가상 시나리오`라고 표시한다.

1. 과거 월 4t으로 물량 조건을 충족하지 못해 제외된 Decision Memory를 불러온다.
2. 현재 물량을 월 12t으로 변경한다.
3. 시스템이 `monthly_quantity_ton >= 10` Reopen Condition 충족을 감지한다.
4. `Decision Stale → 재검토 필요`를 표시한다.

## 13. 검증 기준

### 자동 테스트

1. `materialIdentity`가 없으면 Evidence Gate가 `Qualification Required`를 반환한다.
2. 만료된 Evidence는 현재 선례가 아니라 `Historical Evidence`로 반환한다.
3. 과거 물량 4t, 재개 조건 10t 이상, 현재 물량 12t이면 Decision이 `Stale`이 된다.
4. 시장가격 Evidence가 없으면 결과에 가격이 포함되지 않는다.
5. Route Library에 없는 경로는 결과에 포함되지 않는다.
6. AI가 추론한 값은 `AI Inference / Inferred` 상태를 벗어날 수 없다.

### 사용자 시연 성공 기준

- 3분 안에 PBT 사례의 입력부터 Decision Report까지 완료
- 첫 분석 화면에서 행정·재질·공정 Identity의 차이를 이해 가능
- 사용자가 무엇이 사실이고 무엇이 미확인인지 별도 설명 없이 구분 가능
- 모든 핵심 결론에서 근거 링크와 조회일 확인 가능
- 점수나 근거 없는 가격 없이 다음 행동을 결정 가능

## 14. 공식 근거 시드

- 현대모비스 진천 PBT: https://www.re.or.kr/circul/viewCirculSup.do?sn=20230830001
- 현대모비스 Waste Tray: https://www.re.or.kr/circul/viewCirculSup.do?sn=20230117001
- SK하이닉스 IC Tray: https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=15&popYn=Y
- SK하이닉스 Wafer Carrier: https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=696&popYn=Y
- 동원시스템즈 과거 사례: https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=576&popYn=Y
- 재활용가능자원 가격 API: https://www.data.go.kr/data/15156640/openapi.do
- 진천·음성 PE·PP 입찰: https://www.re.or.kr/bid/viewBidAdPage.do?bidAdNum=20260409014&bidTimeNum=0
- 순환자원 인정현황: https://www.re.or.kr/info/listRecyclableResourcesPageNew.do
- 순환경제 DNA 선도기업 공고: https://www.keco.or.kr/web/lay1/bbs/S1T17C108/A/18/view.do?article_seq=99943

시드 데이터에는 원문에서 직접 확인되는 사실만 넣는다. 데모를 위해 추가한 값은 반드시 `User Input` 또는 `AI Inference`로 분리한다.

## 15. 설계 완료 조건

이 MVP는 다음 조건을 모두 만족할 때 설계 의도를 충족한다.

- Resource Resolver와 Route Qualification이 분리되어 있음
- 임의 점수 없이 Evidence State와 명시적 Rule로 판단함
- 검증된 Route Library 밖의 경로를 생성하지 않음
- 출처 만료와 Conditional Reopen을 모두 Freshness로 처리함
- Route별 Missing Evidence가 실제 Route 조건에서 동적으로 생성됨
- Evidence Gate가 Resource 준비도만 판단하고 Route 존재 여부와 분리됨
- Conditional Reopen 보조 시연이 `Synthetic Demo Scenario`로 표시됨
- 실제 공개사례와 데모 추가정보의 출처 수준을 구분함
- API 키와 네트워크 없이 전체 주 시나리오가 동작함
- 공모전 심사위원에게 3분 안에 핵심 차별성을 시연할 수 있음
