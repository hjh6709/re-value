import type { DecisionMemory, Resource } from '../domain/model';
import { evaluateDecisionFreshness } from '../engine/freshness';

interface FreshnessDemoProps {
  memory: DecisionMemory;
  resource: Resource;
  onQuantityChange: (quantity: number) => void;
}

export function FreshnessDemo({ memory, resource, onQuantityChange }: FreshnessDemoProps) {
  const freshness = evaluateDecisionFreshness(memory, resource);
  const previousQuantity = memory.evidenceSnapshot.monthlyQuantityTon;
  const threshold = memory.reopenCondition?.expected;

  return (
    <aside className="freshness-demo" aria-labelledby="freshness-title">
      <p className="synthetic-label">Synthetic Demo Scenario</p>
      <h2 id="freshness-title">{memory.displayLabel}</h2>
      <p className="helper-text">아래 수치는 실제 기업 사례가 아닌 기능 설명용 가상 데이터입니다.</p>
      <dl className="freshness-facts">
        <div><dt>과거 판단</dt><dd>월 물량 부족으로 제외</dd></div>
        <div><dt>과거 물량</dt><dd>월 {String(previousQuantity)}t</dd></div>
        <div><dt>재검토 조건</dt><dd>월 {String(threshold)}t 이상</dd></div>
      </dl>
      <div className="field quantity-control">
        <label htmlFor="current-quantity">현재 월 발생량</label>
        <input
          id="current-quantity"
          type="number"
          min="0"
          step="1"
          value={resource.monthlyQuantityTon.value ?? ''}
          onChange={(event) => onQuantityChange(event.target.value === '' ? 0 : Number(event.target.value))}
        />
      </div>
      <p className={`freshness-result ${freshness.status === 'stale' ? 'is-stale' : ''}`} aria-live="polite">
        {freshness.status === 'stale' ? 'Decision Stale → 재검토 필요' : '기존 판단 유지'}
      </p>
    </aside>
  );
}
