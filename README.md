# RE:VALUE

충북 제조업 공정부산물의 실제 정체성을 정리하고, 등록된 공식 근거와 현재 조건을 비교해 다음 확인사항을 제시하는 오프라인 우선 의사결정 시제품입니다. 적합도 점수나 AI가 생성한 경로 대신 `Resource Identity → Evidence Gate → Verified Route → Decision Report → Conditional Reopen` 순서로 판단 과정을 공개합니다.

## 실행과 검증

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

기본 실행에는 백엔드, 네트워크, AI API 키가 필요하지 않습니다. `VITE_AI_RESOLVER_URL`을 지정하면 Resource Identity 해석만 원격 엔드포인트에 요청하며, 실패하면 자동으로 결정론적 오프라인 Resolver를 사용합니다. 원격 Resolver도 Route를 생성할 수 없습니다.

## 3분 시연 순서

1. `현대모비스 진천 PBT 사례 분석`을 선택합니다.
2. 공개자료에서 가져온 입력값과 비어 있는 오염·수용규격을 확인하고 `자원 정보 분석`을 누릅니다.
3. Provenance와 Validation State가 분리된 Resource Identity와 Evidence Gate를 확인합니다.
4. `검증된 경로 확인`에서 PBT Route의 실제 요구조건으로부터 `재활용업체 수용규격 확인`이 생성된 것을 확인합니다.
5. 보고서에서 현재 판단, 충족 이유, 미확인 조건, 다음 행동, 현재/과거 근거를 확인합니다.
6. 별도 가상 시나리오의 월 발생량을 4t에서 12t로 바꿔 `Decision Stale → 재검토 필요`를 확인합니다.

## 근거와 데이터 경계

공식 데이터는 2026-08-18에 아래 원문을 확인해 시드했습니다.

- [현대모비스 진천 PBT 유통지원 사례](https://www.re.or.kr/circul/viewCirculSup.do?sn=20230830001)
- [SK하이닉스 청주 폐IC-Tray 순환자원 인정](https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=15&popYn=Y)
- [SK하이닉스 청주 Wafer Carrier 순환자원 인정](https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=696&popYn=Y)
- [동원시스템즈 PP 부산물 인정 이력](https://www.re.or.kr/info/viewRecyclableResourcesPage.do?SN=576&popYn=Y)
- [진천·음성 압축 PP·PE 매각 입찰](https://www.re.or.kr/bid/viewBidAdPage.do?bidAdNum=20260409014&bidTimeNum=0)
- [한국환경공단 재활용가능자원 가격조사 API](https://www.data.go.kr/data/15156640/openapi.do)

SK하이닉스 폐IC-Tray 공식 페이지는 세부 수지 재질을 공개하지 않으므로 `Unknown / Needs Validation`으로 저장합니다. 현대모비스 PBT 등록은 현재 선례가 아니라 2023년 유통지원 이력으로 `Historical` 표시합니다. 만료된 근거는 현재 Route를 확정하는 데 사용하지 않습니다.

`4t → 12t` Conditional Reopen은 실제 기업 사례가 아니며 데이터와 화면에 항상 `Synthetic Demo Scenario`로 표시합니다. 공식 출처 값과 사용자 입력, AI 추론, 미확인 값은 각각 독립 Provenance로 관리합니다.

## 시스템 가드레일

- Route는 코드에 검증되어 등록된 Route Library에서만 조회합니다.
- Evidence Gate는 Resource의 재질·공정·형태·오염·공급 준비도만 평가합니다.
- Route 요구조건과 Resource의 비교는 별도 Qualification 단계에서 수행합니다.
- Route별 누락 근거는 해당 Route의 필수조건에서 동적으로 생성합니다.
- 점수, 별점, 퍼센트 적합도, 확인되지 않은 가격·절감액·탄소량을 생성하지 않습니다.
- 시장자료가 없으면 `확인 가능한 공식 시장근거가 없습니다.`라고 명시합니다.

현재 MVP 범위에는 사용자 계정, 서버 저장, 외부 기업 매칭, 법적 적합성 자동확정, 실시간 가격·배출량 산정이 포함되지 않습니다.
