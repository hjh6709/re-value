import type { Resource, ResourceField, SourcedValue } from '../domain/model';
import type { EvidenceGateResult } from '../engine/evidenceGate';
import { StatusBadge } from './StatusBadge';

interface ResolutionViewProps {
  resource: Resource;
  gate: EvidenceGateResult;
  onContinue: () => void;
}

const resourceFieldCopy: Partial<Record<ResourceField, string>> = {
  materialIdentity: '실제 재질',
  processIdentity: '발생공정',
  form: '형태',
  contaminants: '오염·이물 정보',
  monthlyQuantityTon: '월 발생량',
};

const gateCopy = {
  ready_for_route_review: 'Route 근거를 검토할 준비가 됐습니다.',
  qualification_required: 'Resource 자체에 추가 확인이 필요한 정보가 있습니다.',
  insufficient_evidence: '재질과 발생공정 정보가 필요합니다.',
};

function formatValue(value: string | string[] | number | null): string {
  if (value === null || (Array.isArray(value) && value.length === 0)) return '미확인';
  if (Array.isArray(value)) return value.join(' · ');
  return String(value);
}

function IdentityRow({ label, sourced }: { label: string; sourced: SourcedValue<string | string[] | number> }) {
  return (
    <div className="identity-row">
      <dt>{label}</dt>
      <dd className="identity-value">{formatValue(sourced.value)}</dd>
      <dd className="badge-row">
        <StatusBadge value={sourced.provenance} />
        <StatusBadge value={sourced.validationState} />
      </dd>
    </div>
  );
}

export function ResolutionView({ resource, gate, onContinue }: ResolutionViewProps) {
  const identityRows: Array<[string, SourcedValue<string | string[] | number>]> = [
    ['행정상 분류', resource.administrativeIdentity],
    ['실제 재질', resource.materialIdentity],
    ['발생공정', resource.processIdentity],
    ['형태', resource.form],
    ['오염·이물', resource.contaminants],
    ['월 발생량(톤)', resource.monthlyQuantityTon],
  ];

  return (
    <section className="flow-section" aria-labelledby="resolution-title">
      <div className="eyebrow">AI Resource Resolver</div>
      <h1 id="resolution-title">자원 정체성 확인</h1>
      <p className="lead">행정 언어와 실제 재질·공정 정보를 분리하고, 각 값의 출처와 검증상태를 함께 표시합니다.</p>

      <dl className="identity-list">
        {identityRows.map(([label, sourced]) => <IdentityRow key={label} label={label} sourced={sourced} />)}
      </dl>

      <section className="gate-summary" aria-labelledby="gate-title">
        <h2 id="gate-title">Evidence Gate</h2>
        <p>{gateCopy[gate.status]}</p>
        {gate.missingFields.length > 0 && (
          <ul>
            {gate.missingFields.map((field) => <li key={field}>{resourceFieldCopy[field] ?? field} 확인 필요</li>)}
          </ul>
        )}
        <p className="helper-text">여기에는 Route별 구매자 조건이 포함되지 않습니다. 다음 단계에서 실제 Route 요구조건과 비교합니다.</p>
      </section>

      <button type="button" className="button-primary" onClick={onContinue}>검증된 경로 확인</button>
    </section>
  );
}
