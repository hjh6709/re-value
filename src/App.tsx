import type { AnalysisStep } from './app/analysisReducer';
import { useAnalysis } from './app/useAnalysis';

const stepMeta: Record<AnalysisStep, { number: number; label: string; heading: string }> = {
  case_library: { number: 1, label: '사례 선택', heading: '실제 공개사례로 시작하기' },
  resource_input: { number: 2, label: '자원 정보', heading: '공정부산물 정보' },
  resolution: { number: 3, label: '자원 정체성', heading: '자원 정체성 확인' },
  route_decision: { number: 4, label: 'Route 검증', heading: '검증된 Route 비교' },
  decision_report: { number: 5, label: '의사결정', heading: '의사결정 보고서' },
};

export default function App() {
  const analysis = useAnalysis();
  const meta = stepMeta[analysis.state.step];

  return (
    <>
      <header className="app-header">
        <strong>RE:VALUE</strong>
        <p aria-label="분석 진행 단계">{meta.number} / 5 · {meta.label}</p>
        {analysis.state.step !== 'case_library' && <button type="button" onClick={analysis.goBack}>이전</button>}
      </header>
      <main className="app-shell" id="main-content">
        <h1>{meta.heading}</h1>
        <p>근거 기반 자원 의사결정 서비스</p>
      </main>
    </>
  );
}
