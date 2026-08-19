import type { Resource, ResourceField } from '../domain/model';

export interface EvidenceGateResult {
  status: 'ready_for_route_review' | 'qualification_required' | 'insufficient_evidence';
  missingFields: ResourceField[];
}

const gateFields = [
  'materialIdentity',
  'processIdentity',
  'form',
  'contaminants',
  'monthlyQuantityTon',
] as const satisfies readonly ResourceField[];

export function evaluateEvidenceGate(resource: Resource): EvidenceGateResult {
  const missingFields = gateFields.filter((field) => {
    const sourced = resource[field];
    return sourced.value === null || sourced.validationState === 'needs_validation';
  });
  const identityMissing = missingFields.includes('materialIdentity')
    && missingFields.includes('processIdentity');

  return {
    status: identityMissing
      ? 'insufficient_evidence'
      : missingFields.length > 0
        ? 'qualification_required'
        : 'ready_for_route_review',
    missingFields: [...missingFields],
  };
}
