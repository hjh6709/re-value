import { useState } from 'react';
import type { AnalysisStep } from './app/analysisReducer';
import { useAnalysis } from './app/useAnalysis';
import { demoCases, emptyResourceDraft } from './data/cases';
import { decisionMemories } from './data/decisions';
import { AppHeader } from './components/AppHeader';
import { CaseLibrary } from './components/CaseLibrary';
import { DecisionReport } from './components/DecisionReport';
import { FreshnessDemo } from './components/FreshnessDemo';
import { ResourceForm } from './components/ResourceForm';
import { ResolutionView } from './components/ResolutionView';
import { RouteDecisionView } from './components/RouteDecisionView';

const stepMeta: Record<AnalysisStep, { number: number; label: string; heading: string }> = {
  case_library: { number: 1, label: '사례 선택', heading: '실제 공개사례로 시작하기' },
  resource_input: { number: 2, label: '자원 정보', heading: '공정부산물 정보' },
  resolution: { number: 3, label: '자원 정체성', heading: '자원 정체성 확인' },
  route_decision: { number: 4, label: 'Route 검증', heading: '검증된 Route 비교' },
  decision_report: { number: 5, label: '의사결정', heading: '의사결정 보고서' },
};

export default function App() {
  const analysis = useAnalysis();
  const [syntheticQuantity, setSyntheticQuantity] = useState(4);
  const meta = stepMeta[analysis.state.step];
  const selectedCase = demoCases.find((item) => item.id === analysis.state.selectedCaseId);
  const quantityReopenMemory = decisionMemories.find((item) => item.id === 'quantity-reopen-demo');
  const syntheticResource = analysis.state.resource && {
    ...analysis.state.resource,
    id: 'synthetic-quantity-resource',
    monthlyQuantityTon: {
      value: syntheticQuantity,
      provenance: 'user_input' as const,
      validationState: 'confirmed' as const,
      evidenceIds: [],
    },
  };

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
        {analysis.state.step === 'route_decision' && (
          <RouteDecisionView qualifications={analysis.state.qualifications} onOpenReport={analysis.openReport} />
        )}
        {analysis.state.step === 'decision_report' && analysis.state.report && (
          <>
            <DecisionReport report={analysis.state.report} />
            {quantityReopenMemory && syntheticResource && (
              <FreshnessDemo
                memory={quantityReopenMemory}
                resource={syntheticResource}
                onQuantityChange={setSyntheticQuantity}
              />
            )}
            <button type="button" className="button-text restart-button" onClick={analysis.restart}>다른 자원 분석하기</button>
          </>
        )}
      </main>
    </>
  );
}
