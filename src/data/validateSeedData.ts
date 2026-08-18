import type { DecisionMemory, DemoCase, EvidenceRecord, RouteDefinition } from '../domain/model';

export interface SeedDataset {
  demoCases: DemoCase[];
  decisionMemories: DecisionMemory[];
  evidenceRecords: EvidenceRecord[];
  routeLibrary: RouteDefinition[];
}

export function validateSeedData(data: SeedDataset): string[] {
  const errors: string[] = [];
  const allIds = [
    ...data.demoCases.map((item) => item.id),
    ...data.decisionMemories.map((item) => item.id),
    ...data.evidenceRecords.map((item) => item.id),
    ...data.routeLibrary.map((item) => item.id),
  ];
  const seen = new Set<string>();

  for (const id of allIds) {
    if (seen.has(id)) errors.push(`중복 ID: ${id}`);
    seen.add(id);
  }

  const evidenceIds = new Set(data.evidenceRecords.map((item) => item.id));
  for (const route of data.routeLibrary) {
    for (const evidenceId of route.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`존재하지 않는 Evidence: ${route.id}/${evidenceId}`);
    }
    for (const condition of route.conditions) {
      if (condition.evidenceId && !evidenceIds.has(condition.evidenceId)) {
        errors.push(`존재하지 않는 조건 Evidence: ${route.id}/${condition.id}/${condition.evidenceId}`);
      }
    }
  }

  for (const evidence of data.evidenceRecords) {
    if (!evidence.sourceUrl || !evidence.observedAt) errors.push(`출처 메타데이터 누락: ${evidence.id}`);
    if ((evidence.evidenceType === 'benchmark' || evidence.evidenceType === 'bid') && evidence.marketKind === null) {
      errors.push(`시장근거 유형 누락: ${evidence.id}`);
    }
  }

  for (const demoCase of data.demoCases) {
    for (const evidenceId of demoCase.draft.sourceEvidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`존재하지 않는 사례 Evidence: ${demoCase.id}/${evidenceId}`);
    }
  }

  for (const memory of data.decisionMemories) {
    if (
      memory.scenarioKind === 'synthetic_demo'
      && memory.displayLabel !== 'Conditional Reopen 기능 시연용 가상 시나리오'
    ) {
      errors.push(`가상 시나리오 라벨 오류: ${memory.id}`);
    }
  }

  return errors;
}
