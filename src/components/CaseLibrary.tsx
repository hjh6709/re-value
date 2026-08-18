import type { DemoCase } from '../domain/model';

interface CaseLibraryProps {
  cases: DemoCase[];
  onSelectCase: (caseId: string) => void;
  onDirectInput: () => void;
}

export function CaseLibrary({ cases, onSelectCase, onDirectInput }: CaseLibraryProps) {
  const primary = cases.find((item) => item.id === 'hyundai-pbt');
  const secondary = cases.filter((item) => item.id !== 'hyundai-pbt');

  return (
    <section className="flow-section" aria-labelledby="case-library-title">
      <div className="eyebrow">충북 제조업 공개사례</div>
      <h1 id="case-library-title">실제 공개사례로 시작하기</h1>
      <p className="lead">근거 기반 자원 의사결정을 위해, 확인된 사실과 모르는 조건을 먼저 분리합니다.</p>

      {primary && (
        <article className="featured-case">
          <p className="case-kicker">주 시연 사례</p>
          <h2>{primary.name}</h2>
          <p>{primary.summary}</p>
          <p className="source-note">{primary.sourceLabel}</p>
          <div className="action-row">
            <button type="button" className="button-primary" onClick={() => onSelectCase(primary.id)}>
              현대모비스 진천 PBT 사례 분석
            </button>
            {primary.sourceUrl && <a href={primary.sourceUrl} target="_blank" rel="noreferrer">원문 출처 보기</a>}
          </div>
        </article>
      )}

      <div className="case-grid" aria-label="추가 공개사례">
        {secondary.map((item) => (
          <article className="case-option" key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.summary}</p>
            <button type="button" className="button-secondary" onClick={() => onSelectCase(item.id)}>
              {item.name} 분석
            </button>
          </article>
        ))}
      </div>

      <button type="button" className="button-text direct-input" onClick={onDirectInput}>내 공정부산물 직접 입력</button>
    </section>
  );
}
