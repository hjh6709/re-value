import { useEffect, useMemo, useReducer } from 'react';
import { evidenceRecords } from '../data/evidence';
import { routeLibrary } from '../data/routes';
import type { ResourceDraft } from '../domain/model';
import { buildDecisionReport } from '../engine/buildReport';
import { evaluateEvidenceGate } from '../engine/evidenceGate';
import { createResourceResolver, type ResourceResolver } from '../engine/resourceResolver';
import { qualifyRoute, retrieveRoutes } from '../engine/routeDecision';
import { analysisReducer, initialAnalysisState } from './analysisReducer';

export function useAnalysis(injectedResolver?: ResourceResolver) {
  const [state, dispatch] = useReducer(analysisReducer, initialAnalysisState);
  const resolver = useMemo(
    () => injectedResolver ?? createResourceResolver(),
    [injectedResolver],
  );

  useEffect(() => {
    if (state.step !== 'case_library' && typeof localStorage?.setItem === 'function') {
      localStorage.setItem('re-value:last-draft', JSON.stringify(state.draft));
    }
  }, [state.draft, state.step]);

  const analyzeResource = async () => {
    dispatch({ type: 'resolution_started' });
    try {
      const resource = await resolver.resolve(state.draft);
      dispatch({ type: 'resource_resolved', resource, gate: evaluateEvidenceGate(resource) });
    } catch {
      dispatch({ type: 'resolution_failed', message: '자원 정보를 분석하지 못했습니다. 입력값을 확인해 주세요.' });
    }
  };

  const reviewRoutes = () => {
    if (!state.resource) return;
    const routes = retrieveRoutes(state.resource, routeLibrary);
    const qualifications = routes.map((route) => qualifyRoute(state.resource!, route, evidenceRecords));
    dispatch({ type: 'routes_reviewed', qualifications });
  };

  const openReport = () => {
    if (!state.resource || !state.gate) return;
    const report = buildDecisionReport({
      resource: state.resource,
      gate: state.gate,
      qualifications: state.qualifications,
      freshness: null,
    });
    dispatch({ type: 'report_opened', report });
  };

  const goBack = () => {
    if (state.step === 'resource_input') dispatch({ type: 'restart' });
    if (state.step === 'resolution') dispatch({ type: 'edit_resource' });
    if (state.step === 'route_decision') dispatch({ type: 'back_to_resolution' });
    if (state.step === 'decision_report') dispatch({ type: 'back_to_routes' });
  };

  return {
    state,
    selectCase: (caseId: string) => dispatch({ type: 'case_selected', caseId }),
    startDirectInput: () => dispatch({ type: 'direct_input_selected' }),
    updateDraft: (draft: ResourceDraft) => dispatch({ type: 'draft_changed', draft }),
    analyzeResource,
    reviewRoutes,
    openReport,
    editResource: () => dispatch({ type: 'edit_resource' }),
    goBack,
    restart: () => dispatch({ type: 'restart' }),
  };
}
