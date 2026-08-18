import { demoCases, emptyResourceDraft } from '../data/cases';
import type { DecisionReportModel } from '../engine/buildReport';
import type { EvidenceGateResult } from '../engine/evidenceGate';
import type { Resource, ResourceDraft, RouteQualification } from '../domain/model';

export type AnalysisStep = 'case_library' | 'resource_input' | 'resolution' | 'route_decision' | 'decision_report';

export interface AnalysisState {
  step: AnalysisStep;
  draft: ResourceDraft;
  selectedCaseId: string | null;
  resource: Resource | null;
  gate: EvidenceGateResult | null;
  qualifications: RouteQualification[];
  report: DecisionReportModel | null;
  isResolving: boolean;
  error: string | null;
}

export type AnalysisEvent =
  | { type: 'case_selected'; caseId: string }
  | { type: 'direct_input_selected' }
  | { type: 'draft_changed'; draft: ResourceDraft }
  | { type: 'resolution_started' }
  | { type: 'resolution_failed'; message: string }
  | { type: 'resource_resolved'; resource: Resource; gate: EvidenceGateResult }
  | { type: 'routes_reviewed'; qualifications: RouteQualification[] }
  | { type: 'report_opened'; report: DecisionReportModel }
  | { type: 'edit_resource' }
  | { type: 'back_to_resolution' }
  | { type: 'back_to_routes' }
  | { type: 'restart' };

export const initialAnalysisState: AnalysisState = {
  step: 'case_library',
  draft: { ...emptyResourceDraft.draft },
  selectedCaseId: null,
  resource: null,
  gate: null,
  qualifications: [],
  report: null,
  isResolving: false,
  error: null,
};

function selectedCaseState(state: AnalysisState, caseId: string): AnalysisState {
  const selected = demoCases.find((item) => item.id === caseId);
  if (!selected) return state;
  return {
    ...state,
    step: 'resource_input',
    selectedCaseId: caseId,
    draft: { ...selected.draft, sourceEvidenceIds: [...selected.draft.sourceEvidenceIds] },
    error: null,
  };
}

export function analysisReducer(state: AnalysisState, event: AnalysisEvent): AnalysisState {
  switch (event.type) {
    case 'case_selected':
      return selectedCaseState(state, event.caseId);
    case 'direct_input_selected':
      return { ...initialAnalysisState, step: 'resource_input' };
    case 'draft_changed':
      return { ...state, draft: event.draft };
    case 'resolution_started':
      return { ...state, isResolving: true, error: null };
    case 'resolution_failed':
      return { ...state, isResolving: false, error: event.message };
    case 'resource_resolved':
      return {
        ...state,
        step: 'resolution',
        resource: event.resource,
        gate: event.gate,
        qualifications: [],
        report: null,
        isResolving: false,
        error: null,
      };
    case 'routes_reviewed':
      return { ...state, step: 'route_decision', qualifications: event.qualifications };
    case 'report_opened':
      return { ...state, step: 'decision_report', report: event.report };
    case 'edit_resource':
      return { ...state, step: 'resource_input', error: null };
    case 'back_to_resolution':
      return { ...state, step: 'resolution' };
    case 'back_to_routes':
      return { ...state, step: 'route_decision' };
    case 'restart':
      return initialAnalysisState;
  }
}
