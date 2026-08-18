import type { EvidenceRecord } from '../domain/model';
import type { DecisionReportModel } from '../engine/buildReport';
import { StatusBadge } from './StatusBadge';

const evidenceTypeCopy: Record<EvidenceRecord['evidenceType'], string> = {
  case: '공개사례',
  benchmark: '공식 조사자료',
  bid: '입찰자료',
  regulation: '법령·제도',
};

const marketKindCopy = {
  monthly_average: '월별 조사 평균',
  listing_price: '등록가격',
  bid_minimum: '입찰 기준가격',
} as const;

function SourceList({ sources, emptyCopy }: { sources: EvidenceRecord[]; emptyCopy: string }) {
  if (sources.length === 0) return <p className="helper-text">{emptyCopy}</p>;
  return (
    <ul className="source-list">
      {sources.map((source) => (
        <li key={source.id}>
          <a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.title}</a>
          <span>{evidenceTypeCopy[source.evidenceType]} · 확인일 {source.observedAt}</span>
          <StatusBadge value={source.status} />
        </li>
      ))}
    </ul>
  );
}

export function DecisionReport({ report }: { report: DecisionReportModel }) {
  return (
    <article className="flow-section report" aria-labelledby="report-title">
      <div className="eyebrow">Evidence-Guarded Report</div>
      <h1 id="report-title">의사결정 보고서</h1>
      <p className="lead">확인된 조건, 미확인 조건, 다음 행동을 분리한 현재 시점의 판단입니다.</p>

      <section className="report-decision" aria-labelledby="current-decision-title">
        <h2 id="current-decision-title">현재 판단</h2>
        <p>{report.currentDecision}</p>
      </section>

      <section className="report-section" aria-labelledby="reason-title">
        <h2 id="reason-title">왜</h2>
        {report.currentReasons.length > 0 ? (
          <ul>{report.currentReasons.map(({ condition }) => <li key={condition.id}>{condition.label}</li>)}</ul>
        ) : <p>현재 충족이 확인된 Route 조건이 없습니다.</p>}
      </section>

      <section className="report-section" aria-labelledby="unknown-title">
        <h2 id="unknown-title">아직 모르는 것</h2>
        {report.unknowns.length > 0 ? (
          <ul>{report.unknowns.map((item) => <li key={item.conditionId}>{item.label}</li>)}</ul>
        ) : <p>선택 Route의 필수 미확인 조건이 없습니다.</p>}
      </section>

      <section className="report-section" aria-labelledby="action-title">
        <h2 id="action-title">다음 행동</h2>
        {report.nextActions.length > 0 ? (
          <ol>{report.nextActions.map((action) => <li key={action}>{action}</li>)}</ol>
        ) : <p>현재 조건으로 Route 담당자 검토를 진행합니다.</p>}
      </section>

      <section className="report-section" aria-labelledby="evidence-title">
        <h2 id="evidence-title">현재 근거</h2>
        <SourceList sources={report.currentSources} emptyCopy="현재 효력이 확인된 Route 근거가 없습니다." />
        <h3>과거·만료 근거</h3>
        <SourceList sources={report.historicalSources} emptyCopy="참고할 과거·만료 근거가 없습니다." />
      </section>

      <section className="market-notice" aria-label="시장 근거">
        {report.marketReference?.marketKind ? (
          <p>
            {marketKindCopy[report.marketReference.marketKind]} ·{' '}
            <a href={report.marketReference.sourceUrl} target="_blank" rel="noreferrer">{report.marketReference.title}</a>
          </p>
        ) : <p>{report.marketNotice}</p>}
      </section>
    </article>
  );
}
