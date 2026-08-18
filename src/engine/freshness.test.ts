import { describe, expect, it } from 'vitest';
import { evidenceRecords } from '../data/evidence';
import { confirmedValue, dongwonExpiredEvidence, pbtResource, quantityReopenMemory } from '../test/fixtures';
import { classifyEvidenceFreshness, evaluateDecisionFreshness } from './freshness';

describe('freshness', () => {
  it('classifies an expired recognition as historical evidence', () => {
    expect(classifyEvidenceFreshness(dongwonExpiredEvidence, new Date('2026-08-18T00:00:00'))).toEqual({
      status: 'historical',
      reason: 'evidence_expired',
    });
  });

  it('keeps a non-expired recognition current', () => {
    const wafer = evidenceRecords.find((item) => item.id === 'evidence-sk-wafer-carrier-696');
    if (!wafer) throw new Error('Wafer Carrier evidence is missing');

    expect(classifyEvidenceFreshness(wafer, new Date('2026-08-18T00:00:00'))).toEqual({
      status: 'current',
      reason: 'evidence_current',
    });
  });

  it('reopens a rejected decision when quantity crosses the explicit threshold', () => {
    const result = evaluateDecisionFreshness(
      quantityReopenMemory,
      pbtResource({ monthlyQuantityTon: confirmedValue(12) }),
    );

    expect(result.status).toBe('stale');
    expect(result.reason).toBe('reopen_condition_met');
    expect(result.previousValue).toBe(4);
    expect(result.currentValue).toBe(12);
  });

  it('keeps the decision current below the threshold', () => {
    const result = evaluateDecisionFreshness(
      quantityReopenMemory,
      pbtResource({ monthlyQuantityTon: confirmedValue(8) }),
    );

    expect(result.status).toBe('current');
    expect(result.reason).toBe('reopen_condition_not_met');
  });
});
