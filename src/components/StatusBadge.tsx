import type { Provenance, RouteDecision, ValidationState } from '../domain/model';

type BadgeValue = Provenance | ValidationState | RouteDecision;

const labelMap: Record<BadgeValue, string> = {
  official_source: 'Official Source',
  user_input: 'User Input',
  ai_inference: 'AI Inference',
  unknown: 'Unknown',
  confirmed: 'Confirmed',
  inferred: 'Inferred',
  needs_validation: 'Needs Validation',
  historical: 'Historical',
  expired: 'Expired',
  review: 'Review',
  qualification_required: 'Qualification Required',
  not_qualified: 'Not Qualified',
  watch: 'Watch',
  baseline: 'Baseline',
};

const toneMap: Record<BadgeValue, string> = {
  official_source: 'positive',
  user_input: 'neutral',
  ai_inference: 'info',
  unknown: 'warning',
  confirmed: 'positive',
  inferred: 'info',
  needs_validation: 'warning',
  historical: 'neutral',
  expired: 'danger',
  review: 'positive',
  qualification_required: 'warning',
  not_qualified: 'danger',
  watch: 'neutral',
  baseline: 'neutral',
};

export function StatusBadge({ value }: { value: BadgeValue }) {
  return <span className={`status-badge status-${toneMap[value]}`}>{labelMap[value]}</span>;
}
