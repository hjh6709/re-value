export type Provenance = 'official_source' | 'user_input' | 'ai_inference' | 'unknown';

export type ValidationState = 'confirmed' | 'inferred' | 'needs_validation' | 'historical' | 'expired';

export interface SourcedValue<T> {
  value: T | null;
  provenance: Provenance;
  validationState: ValidationState;
  evidenceIds: string[];
}

export interface Resource {
  id: string;
  name: string;
  administrativeIdentity: SourcedValue<string>;
  materialIdentity: SourcedValue<string[]>;
  processIdentity: SourcedValue<string>;
  form: SourcedValue<string>;
  contaminants: SourcedValue<string[]>;
  monthlyQuantityTon: SourcedValue<number>;
  qualitySpecification: SourcedValue<string>;
  currentTreatment: SourcedValue<string>;
  notices: string[];
}

export interface ResourceDraft {
  id?: string;
  name: string;
  description: string;
  administrativeIdentity: string;
  materialIdentity: string;
  processIdentity: string;
  form: string;
  contaminants: string;
  monthlyQuantityTon: number | null;
  qualitySpecification: string;
  currentTreatment: string;
  sourceEvidenceIds: string[];
  sourceMode: 'official_source' | 'user_input';
}

export type MarketKind = 'monthly_average' | 'listing_price' | 'bid_minimum';

export type EvidenceType = 'case' | 'benchmark' | 'bid' | 'regulation';

export interface EvidenceRecord {
  id: string;
  title: string;
  evidenceType: EvidenceType;
  sourceUrl: string;
  observedAt: string;
  validUntil: string | null;
  status: 'current' | 'historical' | 'expired';
  supportedClaims: string[];
  marketKind: MarketKind | null;
}

export type ResourceField =
  | 'materialIdentity'
  | 'processIdentity'
  | 'form'
  | 'contaminants'
  | 'monthlyQuantityTon'
  | 'qualitySpecification';

export interface QualificationCondition {
  id: string;
  label: string;
  field: ResourceField;
  operator: 'equals' | 'includes' | 'gte' | 'lte' | 'known';
  expected: string | number | boolean;
  required: boolean;
  basis: 'official_evidence' | 'system_validation';
  evidenceId: string | null;
}

export interface RouteDefinition {
  id: string;
  name: string;
  description: string;
  kind: 'candidate' | 'baseline';
  materialKeys: string[];
  conditions: QualificationCondition[];
  evidenceIds: string[];
}

export type ConditionResult = 'met' | 'not_met' | 'unknown' | 'not_applicable';

export type RouteDecision = 'review' | 'qualification_required' | 'not_qualified' | 'watch' | 'baseline';

export interface MissingEvidence {
  conditionId: string;
  label: string;
}

export interface RouteQualification {
  route: RouteDefinition;
  decision: RouteDecision;
  conditions: Array<{ condition: QualificationCondition; result: ConditionResult }>;
  missingEvidence: MissingEvidence[];
  currentEvidence: EvidenceRecord[];
  historicalEvidence: EvidenceRecord[];
}

export interface DecisionMemory {
  id: string;
  resourceId: string;
  status: 'rejected' | 'accepted' | 'review';
  decidedAt: string;
  reason: string;
  reopenCondition: QualificationCondition | null;
  evidenceSnapshot: Record<string, string | number | boolean | null>;
  scenarioKind: 'official_case' | 'synthetic_demo';
  displayLabel: string;
}

export interface DemoCase {
  id: string;
  name: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string | null;
  draft: ResourceDraft;
}
