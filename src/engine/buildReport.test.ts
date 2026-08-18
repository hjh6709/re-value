import { describe, expect, it } from 'vitest';
import { evidenceRecords } from '../data/evidence';
import { evaluateEvidenceGate } from './evidenceGate';
import type { DecisionReportInput } from './buildReport';
import { buildDecisionReport } from './buildReport';
import { qualifyRoute } from './routeDecision';
import {
  dongwonExpiredEvidence,
  pbtRecoveryRoute,
  pbtResource,
  unknownValue,
} from '../test/fixtures';

const pbtQualificationWithQualityUnknown = qualifyRoute(
  pbtResource({ qualitySpecification: unknownValue<string>() }),
  pbtRecoveryRoute,
  evidenceRecords,
);

function reportInput(overrides: Partial<DecisionReportInput> = {}): DecisionReportInput {
  const resource = pbtResource();
  return {
    resource,
    gate: evaluateEvidenceGate(resource),
    qualifications: [pbtQualificationWithQualityUnknown],
    freshness: null,
    ...overrides,
  };
}

describe('buildDecisionReport', () => {
  it('omits price when no current benchmark or bid evidence is attached', () => {
    const report = buildDecisionReport(reportInput());

    expect(report.marketReference).toBeUndefined();
    expect(report.marketNotice).toBe('확인 가능한 공식 시장근거가 없습니다.');
  });

  it('never promotes historical evidence into current sources', () => {
    const report = buildDecisionReport(reportInput({
      qualifications: [{
        ...pbtQualificationWithQualityUnknown,
        currentEvidence: [],
        historicalEvidence: [dongwonExpiredEvidence],
      }],
    }));

    expect(report.currentSources).toEqual([]);
    expect(report.historicalSources.map((item) => item.id)).toContain(dongwonExpiredEvidence.id);
  });

  it('uses next actions derived from route missing evidence', () => {
    const report = buildDecisionReport(reportInput());

    expect(report.nextActions).toContain('재활용업체 수용규격 확인');
  });

  it('uses fixed copy when no verified route is available', () => {
    const report = buildDecisionReport(reportInput({ qualifications: [] }));

    expect(report.currentDecision).toBe('검토 가능한 Route 근거 없음');
    expect(report.nextActions).toEqual([]);
  });
});
