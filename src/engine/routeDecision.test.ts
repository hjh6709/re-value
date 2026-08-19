import { describe, expect, it } from 'vitest';
import { evidenceRecords } from '../data/evidence';
import { routeLibrary } from '../data/routes';
import {
  completeResourceFixture,
  expiredOnlyRoute,
  pbtRecoveryRoute,
  pbtResource,
  ppResource,
  resourceFixture,
  unknownValue,
} from '../test/fixtures';
import { qualifyRoute, retrieveRoutes } from './routeDecision';

describe('route decision', () => {
  it('returns only matching routes already present in the checked-in library', () => {
    const routes = retrieveRoutes(pbtResource(), routeLibrary);

    expect(routes.map((route) => route.id)).toEqual(['pbt-material-recovery', 'current-incineration']);
  });

  it('returns no invented route when the material has no library match', () => {
    const routes = retrieveRoutes(resourceFixture({
      materialIdentity: {
        value: ['UNKNOWN-POLYMER'],
        provenance: 'user_input',
        validationState: 'confirmed',
        evidenceIds: [],
      },
    }), routeLibrary);

    expect(routes).toEqual([]);
  });

  it('derives missing evidence from unknown required route conditions', () => {
    const qualification = qualifyRoute(
      pbtResource({ qualitySpecification: unknownValue<string>() }),
      pbtRecoveryRoute,
      evidenceRecords,
    );

    expect(qualification.decision).toBe('qualification_required');
    expect(qualification.missingEvidence).toEqual([
      { conditionId: 'pbt-quality-specification', label: '재활용업체 수용규격 확인' },
    ]);
  });

  it('returns review after all required route conditions are known', () => {
    const qualification = qualifyRoute(completeResourceFixture(), pbtRecoveryRoute, evidenceRecords);

    expect(qualification.decision).toBe('review');
    expect(qualification.missingEvidence).toEqual([]);
  });

  it('does not use expired evidence as current support', () => {
    const qualification = qualifyRoute(ppResource(), expiredOnlyRoute, evidenceRecords);

    expect(qualification.currentEvidence).toEqual([]);
    expect(qualification.historicalEvidence.map((item) => item.id)).toContain('evidence-dongwon-576-expired');
  });
});
