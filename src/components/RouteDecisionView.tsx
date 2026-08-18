import type { ConditionResult, RouteQualification } from '../domain/model';
import { StatusBadge } from './StatusBadge';

interface RouteDecisionViewProps {
  qualifications: RouteQualification[];
  onOpenReport: () => void;
}

const conditionResultCopy: Record<ConditionResult, string> = {
  met: '충족',
  not_met: '불충족',
  unknown: '확인 필요',
  not_applicable: '해당 없음',
};

export function RouteDecisionView({ qualifications, onOpenReport }: RouteDecisionViewProps) {
  return (
    <section className="flow-section" aria-labelledby="route-title">
      <div className="eyebrow">Verified Route Library</div>
      <h1 id="route-title">검증된 Route 비교</h1>
      <p className="lead">공개 근거가 등록된 경로만 보여주며, 순위나 적합도 점수를 만들지 않습니다.</p>

      {qualifications.length === 0 ? (
        <div className="empty-state">
          <h2>현재 Library에서 일치하는 Route가 없습니다.</h2>
          <p>자원 정보는 보존됩니다. 새로운 공식 선례가 검증되면 다시 비교할 수 있습니다.</p>
        </div>
      ) : (
        <div className="route-list">
          {qualifications.map((item) => (
            <article className="route-item" key={item.route.id}>
              <div className="route-heading">
                <div>
                  <p className="route-kind">{item.route.kind === 'baseline' ? '현재 처리 기준선' : '검토 후보'}</p>
                  <h2>{item.route.name}</h2>
                </div>
                <StatusBadge value={item.decision} />
              </div>
              <p>{item.route.description}</p>

              <div className="route-callout">
                <h3>추가 확인</h3>
                {item.missingEvidence.length > 0 ? (
                  <ul>
                    {item.missingEvidence.map((missing) => <li key={missing.conditionId}>{missing.label}</li>)}
                  </ul>
                ) : <p>현재 Route 조건에서 추가 확인사항이 없습니다.</p>}
              </div>

              <details>
                <summary>조건과 근거 보기</summary>
                {item.conditions.length > 0 ? (
                  <ul className="condition-list">
                    {item.conditions.map(({ condition, result }) => (
                      <li key={condition.id}>
                        <span>{condition.label}</span>
                        <strong>{conditionResultCopy[result]}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p>별도 자격조건이 없는 비교 기준선입니다.</p>}
                <div className="evidence-columns">
                  <div>
                    <h3>현재 근거</h3>
                    {item.currentEvidence.length > 0 ? (
                      <ul>{item.currentEvidence.map((source) => <li key={source.id}><a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
                    ) : <p>현재 효력이 확인된 근거 없음</p>}
                  </div>
                  <div>
                    <h3>과거·만료 근거</h3>
                    {item.historicalEvidence.length > 0 ? (
                      <ul>{item.historicalEvidence.map((source) => <li key={source.id}><a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
                    ) : <p>해당 없음</p>}
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      )}

      <button type="button" className="button-primary" onClick={onOpenReport}>의사결정 보고서 보기</button>
    </section>
  );
}
