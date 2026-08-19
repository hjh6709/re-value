import type { DecisionMemory } from '../domain/model';

export const decisionMemories: DecisionMemory[] = [
  {
    id: 'quantity-reopen-demo',
    resourceId: 'synthetic-quantity-resource',
    status: 'rejected',
    decidedAt: '2026-05-10',
    reason: 'minimum_quantity_not_met',
    reopenCondition: {
      id: 'synthetic-minimum-quantity',
      label: '월 발생량 10톤 이상',
      field: 'monthlyQuantityTon',
      operator: 'gte',
      expected: 10,
      required: true,
      basis: 'system_validation',
      evidenceId: null,
    },
    evidenceSnapshot: { monthlyQuantityTon: 4 },
    scenarioKind: 'synthetic_demo',
    displayLabel: 'Conditional Reopen 기능 시연용 가상 시나리오',
  },
];
