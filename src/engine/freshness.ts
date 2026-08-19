import type { DecisionMemory, EvidenceRecord, Resource } from '../domain/model';

export interface EvidenceFreshness {
  status: 'current' | 'historical';
  reason: 'evidence_current' | 'evidence_expired';
}

export interface DecisionFreshness {
  status: 'current' | 'stale';
  reason: 'no_reopen_condition' | 'reopen_condition_met' | 'reopen_condition_not_met';
  previousValue?: string | number | boolean | null;
  currentValue?: string | number | boolean | string[] | null;
}

export function classifyEvidenceFreshness(evidence: EvidenceRecord, now: Date): EvidenceFreshness {
  const expiredByDate = evidence.validUntil !== null
    && new Date(`${evidence.validUntil}T23:59:59`) < now;
  const historical = evidence.status !== 'current' || expiredByDate;

  return historical
    ? { status: 'historical', reason: 'evidence_expired' }
    : { status: 'current', reason: 'evidence_current' };
}

function conditionIsMet(
  value: string | number | boolean | string[] | null,
  operator: 'equals' | 'includes' | 'gte' | 'lte' | 'known',
  expected: string | number | boolean,
): boolean {
  if (value === null) return false;
  if (operator === 'known') return value !== '' && (!Array.isArray(value) || value.length > 0);
  if (operator === 'includes' && Array.isArray(value)) return value.includes(String(expected));
  if (operator === 'equals') return value === expected;
  if (operator === 'gte' && typeof value === 'number') return value >= Number(expected);
  if (operator === 'lte' && typeof value === 'number') return value <= Number(expected);
  return false;
}

export function evaluateDecisionFreshness(memory: DecisionMemory, resource: Resource): DecisionFreshness {
  const condition = memory.reopenCondition;
  if (!condition) return { status: 'current', reason: 'no_reopen_condition' };

  const currentValue = resource[condition.field].value;
  const previousValue = memory.evidenceSnapshot[condition.field] ?? null;
  const met = conditionIsMet(currentValue, condition.operator, condition.expected);

  return met
    ? { status: 'stale', reason: 'reopen_condition_met', previousValue, currentValue }
    : { status: 'current', reason: 'reopen_condition_not_met', previousValue, currentValue };
}
