import { decisionMemories } from '../data/decisions';
import { evidenceRecords } from '../data/evidence';
import { routeLibrary } from '../data/routes';
import type { Resource, SourcedValue } from '../domain/model';

export const confirmedValue = <T>(value: T): SourcedValue<T> => ({
  value,
  provenance: 'user_input',
  validationState: 'confirmed',
  evidenceIds: [],
});

export const unknownValue = <T>(value: T | null = null): SourcedValue<T> => ({
  value,
  provenance: 'unknown',
  validationState: 'needs_validation',
  evidenceIds: [],
});

export function resourceFixture(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 'resource-fixture',
    name: '테스트 자원',
    administrativeIdentity: confirmedValue('51-03-01 폐합성수지류'),
    materialIdentity: confirmedValue(['PBT']),
    processIdentity: confirmedValue('자동차 부품 조립·검사'),
    form: confirmedValue('성형부품'),
    contaminants: confirmedValue([]),
    monthlyQuantityTon: confirmedValue(10),
    qualitySpecification: unknownValue<string>(),
    currentTreatment: confirmedValue('일반소각'),
    notices: [],
    ...overrides,
  };
}

export const pbtResource = (overrides: Partial<Resource> = {}) => resourceFixture(overrides);

export const ppResource = (overrides: Partial<Resource> = {}) => resourceFixture({
  materialIdentity: confirmedValue(['PP']),
  ...overrides,
});

export const completeResourceFixture = () => resourceFixture({
  qualitySpecification: confirmedValue('구매자 확인 완료'),
});

function mustFind<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`테스트 시드 누락: ${id}`);
  return item;
}

export const pbtRecoveryRoute = mustFind(routeLibrary, 'pbt-material-recovery');
export const expiredOnlyRoute = mustFind(routeLibrary, 'pp-expired-precedent');
export const dongwonExpiredEvidence = mustFind(evidenceRecords, 'evidence-dongwon-576-expired');
export const quantityReopenMemory = mustFind(decisionMemories, 'quantity-reopen-demo');
