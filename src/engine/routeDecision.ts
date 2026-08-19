import type {
  ConditionResult,
  EvidenceRecord,
  QualificationCondition,
  Resource,
  RouteDefinition,
  RouteQualification,
} from '../domain/model';

export function retrieveRoutes(resource: Resource, routes: RouteDefinition[]): RouteDefinition[] {
  const materials = resource.materialIdentity.value;
  if (!materials?.length) return [];

  const resourceSet = new Set(materials);
  return routes.filter((route) => (
    route.materialKeys.length === resourceSet.size
    && route.materialKeys.every((key) => resourceSet.has(key))
  ));
}

function evaluateCondition(resource: Resource, condition: QualificationCondition): ConditionResult {
  const sourced = resource[condition.field];
  const value = sourced.value;
  const unknown = sourced.validationState === 'needs_validation'
    || value === null
    || value === ''
    || (Array.isArray(value) && value.length === 0);

  if (unknown) return 'unknown';
  if (condition.operator === 'known') return 'met';
  if (condition.operator === 'includes' && Array.isArray(value)) {
    return value.includes(String(condition.expected)) ? 'met' : 'not_met';
  }
  if (condition.operator === 'equals') return value === condition.expected ? 'met' : 'not_met';
  if (condition.operator === 'gte' && typeof value === 'number') {
    return value >= Number(condition.expected) ? 'met' : 'not_met';
  }
  if (condition.operator === 'lte' && typeof value === 'number') {
    return value <= Number(condition.expected) ? 'met' : 'not_met';
  }
  return 'not_applicable';
}

function partitionEvidence(route: RouteDefinition, evidence: EvidenceRecord[], asOf: Date) {
  const attached = evidence.filter((item) => route.evidenceIds.includes(item.id));
  const isHistorical = (item: EvidenceRecord) => (
    item.status !== 'current'
    || (item.validUntil !== null && new Date(`${item.validUntil}T23:59:59`) < asOf)
  );

  return {
    currentEvidence: attached.filter((item) => !isHistorical(item)),
    historicalEvidence: attached.filter(isHistorical),
  };
}

export function qualifyRoute(
  resource: Resource,
  route: RouteDefinition,
  evidence: EvidenceRecord[],
  asOf = new Date('2026-08-18T00:00:00'),
): RouteQualification {
  const conditions = route.conditions.map((condition) => ({
    condition,
    result: evaluateCondition(resource, condition),
  }));
  const missingEvidence = conditions
    .filter(({ condition, result }) => condition.required && result === 'unknown')
    .map(({ condition }) => ({ conditionId: condition.id, label: condition.label }));
  const hasRequiredFailure = conditions.some(
    ({ condition, result }) => condition.required && result === 'not_met',
  );
  const decision = route.kind === 'baseline'
    ? 'baseline'
    : hasRequiredFailure
      ? 'not_qualified'
      : missingEvidence.length > 0
        ? 'qualification_required'
        : 'review';
  const { currentEvidence, historicalEvidence } = partitionEvidence(route, evidence, asOf);

  return {
    route,
    decision,
    conditions,
    missingEvidence,
    currentEvidence,
    historicalEvidence,
  };
}
