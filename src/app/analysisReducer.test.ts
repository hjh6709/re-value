import { describe, expect, it } from 'vitest';
import { demoCases } from '../data/cases';
import { buildDecisionReport } from '../engine/buildReport';
import { evaluateEvidenceGate } from '../engine/evidenceGate';
import { qualifyRoute } from '../engine/routeDecision';
import { evidenceRecords } from '../data/evidence';
import { pbtRecoveryRoute, pbtResource } from '../test/fixtures';
import { analysisReducer, initialAnalysisState } from './analysisReducer';

const pbt = pbtResource();
const gate = evaluateEvidenceGate(pbt);
const qualifications = [qualifyRoute(pbt, pbtRecoveryRoute, evidenceRecords)];
const report = buildDecisionReport({ resource: pbt, gate, qualifications, freshness: null });

describe('analysisReducer', () => {
  it('moves through the five judging steps without skipping evidence review', () => {
    let state = initialAnalysisState;
    state = analysisReducer(state, { type: 'case_selected', caseId: 'hyundai-pbt' });
    expect(state.step).toBe('resource_input');
    state = analysisReducer(state, { type: 'resource_resolved', resource: pbt, gate });
    expect(state.step).toBe('resolution');
    state = analysisReducer(state, { type: 'routes_reviewed', qualifications });
    expect(state.step).toBe('route_decision');
    state = analysisReducer(state, { type: 'report_opened', report });
    expect(state.step).toBe('decision_report');
  });

  it('loads the selected official case draft', () => {
    const state = analysisReducer(initialAnalysisState, { type: 'case_selected', caseId: 'hyundai-pbt' });
    const source = demoCases.find((item) => item.id === 'hyundai-pbt');

    expect(state.draft).toEqual(source?.draft);
  });

  it('returns to resource input without discarding entered data', () => {
    const selected = analysisReducer(initialAnalysisState, { type: 'case_selected', caseId: 'hyundai-pbt' });
    const resolved = analysisReducer(selected, { type: 'resource_resolved', resource: pbt, gate });
    const edited = analysisReducer(resolved, { type: 'edit_resource' });

    expect(edited.step).toBe('resource_input');
    expect(edited.draft.name).toBe('PBT 외장 플라스틱');
  });
});
