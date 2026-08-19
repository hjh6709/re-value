import type { EvidenceGateResult } from './evidenceGate';
import type { DecisionFreshness } from './freshness';
import type { EvidenceRecord, Resource, RouteQualification } from '../domain/model';

export interface DecisionReportInput {
  resource: Resource;
  gate: EvidenceGateResult;
  qualifications: RouteQualification[];
  freshness: DecisionFreshness | null;
}

export interface DecisionReportModel {
  currentDecision: string;
  currentReasons: RouteQualification['conditions'];
  unknowns: RouteQualification['missingEvidence'];
  nextActions: string[];
  comparedRoutes: RouteQualification[];
  currentSources: EvidenceRecord[];
  historicalSources: EvidenceRecord[];
  marketReference?: EvidenceRecord;
  marketNotice?: string;
  freshness: DecisionFreshness | null;
}

const decisionCopy = {
  review: '우선 검토',
  qualification_required: '추가 자격 확인 필요',
  not_qualified: '현재 조건 불충족',
  watch: '관찰',
  baseline: '현재 처리 기준선',
} as const;

function uniqueEvidence(items: EvidenceRecord[]): EvidenceRecord[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function buildDecisionReport(input: DecisionReportInput): DecisionReportModel {
  const selected = input.qualifications.find((item) => item.decision === 'review')
    ?? input.qualifications.find((item) => item.decision === 'qualification_required')
    ?? input.qualifications.find((item) => item.decision === 'baseline')
    ?? input.qualifications[0];
  const currentSources = uniqueEvidence(input.qualifications.flatMap((item) => item.currentEvidence));
  const historicalSources = uniqueEvidence(input.qualifications.flatMap((item) => item.historicalEvidence));
  const marketReference = currentSources.find(
    (item) => item.evidenceType === 'benchmark' || item.evidenceType === 'bid',
  );

  return {
    currentDecision: selected
      ? `${selected.route.name} · ${decisionCopy[selected.decision]}`
      : '검토 가능한 Route 근거 없음',
    currentReasons: selected?.conditions.filter((item) => item.result === 'met') ?? [],
    unknowns: selected?.missingEvidence ?? [],
    nextActions: selected?.missingEvidence.map((item) => item.label) ?? [],
    comparedRoutes: input.qualifications,
    currentSources,
    historicalSources,
    marketReference,
    marketNotice: marketReference ? undefined : '확인 가능한 공식 시장근거가 없습니다.',
    freshness: input.freshness,
  };
}
