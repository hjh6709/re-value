import { describe, expect, it } from 'vitest';
import { demoCases } from './cases';
import { decisionMemories } from './decisions';
import { evidenceRecords } from './evidence';
import { routeLibrary } from './routes';
import { validateSeedData } from './validateSeedData';

describe('validateSeedData', () => {
  it('accepts only resolvable evidence references and unique ids', () => {
    expect(validateSeedData({ demoCases, decisionMemories, evidenceRecords, routeLibrary })).toEqual([]);
  });

  it('marks the conditional reopen case as synthetic', () => {
    const reopen = decisionMemories.find((item) => item.id === 'quantity-reopen-demo');

    expect(reopen?.scenarioKind).toBe('synthetic_demo');
    expect(reopen?.displayLabel).toBe('Conditional Reopen 기능 시연용 가상 시나리오');
  });
});
