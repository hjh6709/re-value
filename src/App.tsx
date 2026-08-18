import type { AnalysisStep } from './app/analysisReducer';
import { useAnalysis } from './app/useAnalysis';
import { demoCases, emptyResourceDraft } from './data/cases';
import { AppHeader } from './components/AppHeader';
import { CaseLibrary } from './components/CaseLibrary';
import { ResourceForm } from './components/ResourceForm';
import { ResolutionView } from './components/ResolutionView';

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
  const selectedCase = demoCases.find((item) => item.id === analysis.state.selectedCaseId);

  return (
    <>
      <AppHeader
        progress={`${meta.number} / 5 · ${meta.label}`}
        canGoBack={analysis.state.step !== 'case_library'}
        onBack={analysis.goBack}
      />
      <main className="app-shell" id="main-content">
        {analysis.state.step === 'case_library' && (
          <CaseLibrary cases={demoCases} onSelectCase={analysis.selectCase} onDirectInput={analysis.startDirectInput} />
        )}
        {analysis.state.step === 'resource_input' && (
          <ResourceForm
            draft={analysis.state.draft}
            sourceLabel={selectedCase?.sourceLabel ?? emptyResourceDraft.sourceLabel}
            sourceUrl={selectedCase?.sourceUrl ?? null}
            isResolving={analysis.state.isResolving}
            error={analysis.state.error}
            onChange={analysis.updateDraft}
            onSubmit={analysis.analyzeResource}
          />
        )}
        {analysis.state.step === 'resolution' && analysis.state.resource && analysis.state.gate && (
          <ResolutionView resource={analysis.state.resource} gate={analysis.state.gate} onContinue={analysis.reviewRoutes} />
        )}
        {analysis.state.step === 'route_decision' && <h1>{meta.heading}</h1>}
        {analysis.state.step === 'decision_report' && <h1>{meta.heading}</h1>}
      </main>
    </>
  );
}
