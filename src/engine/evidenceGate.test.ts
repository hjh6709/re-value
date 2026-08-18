import { describe, expect, it } from 'vitest';
import { completeResourceFixture, resourceFixture, unknownValue } from '../test/fixtures';
import { evaluateEvidenceGate } from './evidenceGate';

describe('evaluateEvidenceGate', () => {
  it('requires material identity before route review', () => {
    const result = evaluateEvidenceGate(resourceFixture({ materialIdentity: unknownValue<string[]>() }));

    expect(result.status).toBe('qualification_required');
    expect(result.missingFields).toContain('materialIdentity');
  });

  it('can mark a resource ready without receiving a route library', () => {
    const result = evaluateEvidenceGate(completeResourceFixture());

    expect(result.status).toBe('ready_for_route_review');
  });

  it('does not emit route-specific quality questions', () => {
    const result = evaluateEvidenceGate(completeResourceFixture());

    expect(result.missingFields).not.toContain('qualitySpecification');
  });

  it('reports insufficient evidence when material and process are both unknown', () => {
    const result = evaluateEvidenceGate(resourceFixture({
      materialIdentity: unknownValue<string[]>(),
      processIdentity: unknownValue<string>(),
    }));

    expect(result.status).toBe('insufficient_evidence');
  });
});
