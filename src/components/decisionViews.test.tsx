import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { evidenceRecords } from '../data/evidence';
import { confirmedValue, pbtRecoveryRoute, pbtResource, quantityReopenMemory, unknownValue } from '../test/fixtures';
import { qualifyRoute } from '../engine/routeDecision';
import { buildDecisionReport } from '../engine/buildReport';
import { evaluateEvidenceGate } from '../engine/evidenceGate';
import { DecisionReport } from './DecisionReport';
import { FreshnessDemo } from './FreshnessDemo';
import { RouteDecisionView } from './RouteDecisionView';

const qualification = qualifyRoute(
  pbtResource({ qualitySpecification: unknownValue<string>() }),
  pbtRecoveryRoute,
  evidenceRecords,
);

function FreshnessHarness() {
  const [quantity, setQuantity] = useState(4);
  const resource = pbtResource({ monthlyQuantityTon: confirmedValue(quantity) });
  return <FreshnessDemo memory={quantityReopenMemory} resource={resource} onQuantityChange={setQuantity} />;
}

describe('decision views', () => {
  it('shows route-derived missing evidence without scores', () => {
    render(<RouteDecisionView qualifications={[qualification]} onOpenReport={() => undefined} />);
    const missingEvidence = screen.getByRole('heading', { name: '추가 확인' }).parentElement;
    expect(within(missingEvidence!).getByText('재활용업체 수용규격 확인')).toBeInTheDocument();
    expect(screen.getByText('Qualification Required')).toBeInTheDocument();
    expect(screen.queryByText(/\d+점|\d+%/)).not.toBeInTheDocument();
  });

  it('renders an evidence-guarded report with an explicit market notice', () => {
    const resource = pbtResource();
    const report = buildDecisionReport({
      resource,
      gate: evaluateEvidenceGate(resource),
      qualifications: [qualification],
      freshness: null,
    });
    render(<DecisionReport report={report} />);
    expect(screen.getByRole('heading', { name: '현재 판단' })).toBeInTheDocument();
    expect(screen.getByText('확인 가능한 공식 시장근거가 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '과거·만료 근거' })).toBeInTheDocument();
  });

  it('always labels the reopen demonstration as synthetic', () => {
    render(<FreshnessHarness />);
    expect(screen.getByText('Synthetic Demo Scenario')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Conditional Reopen 기능 시연용 가상 시나리오' })).toBeInTheDocument();
  });

  it('shows stale after the synthetic quantity changes from 4t to 12t', async () => {
    const user = userEvent.setup();
    render(<FreshnessHarness />);
    await user.clear(screen.getByLabelText('현재 월 발생량'));
    await user.type(screen.getByLabelText('현재 월 발생량'), '12');
    expect(screen.getByText('Decision Stale → 재검토 필요')).toBeInTheDocument();
  });
});
