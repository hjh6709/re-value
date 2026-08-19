import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ResourceDraft } from '../domain/model';

interface ResourceFormProps {
  draft: ResourceDraft;
  sourceLabel: string;
  sourceUrl: string | null;
  isResolving: boolean;
  error: string | null;
  onChange: (draft: ResourceDraft) => void;
  onSubmit: () => Promise<void>;
}

export function ResourceForm({
  draft,
  sourceLabel,
  sourceUrl,
  isResolving,
  error,
  onChange,
  onSubmit,
}: ResourceFormProps) {
  const [nameError, setNameError] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({
      ...draft,
      [name]: name === 'monthlyQuantityTon' ? (value === '' ? null : Number(value)) : value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNameError('현장에서 사용하는 자원명을 입력해 주세요.');
      return;
    }
    setNameError('');
    await onSubmit();
  };

  return (
    <section className="flow-section form-section" aria-labelledby="resource-input-title">
      <div className="eyebrow">Resource Input</div>
      <h1 id="resource-input-title">공정부산물 정보</h1>
      <p className="lead">모르는 값은 비워두세요. RE:VALUE는 누락을 숨기지 않고 다음 확인사항으로 전환합니다.</p>
      <p className="source-banner">
        <span>{sourceLabel}</span>
        {sourceUrl && <> · <a href={sourceUrl} target="_blank" rel="noreferrer">원문 확인</a></>}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field field-wide">
            <label htmlFor="resource-name">현장 자원명 <span aria-hidden="true">*</span></label>
            <input id="resource-name" name="name" value={draft.name} onChange={handleChange} aria-describedby={nameError ? 'name-error' : undefined} />
            {nameError && <p className="field-error" id="name-error">{nameError}</p>}
          </div>
          <div className="field field-wide">
            <label htmlFor="description">발생 상황</label>
            <textarea id="description" name="description" rows={3} value={draft.description} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="administrativeIdentity">행정상 분류</label>
            <input id="administrativeIdentity" name="administrativeIdentity" value={draft.administrativeIdentity} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="materialIdentity">실제 재질</label>
            <input id="materialIdentity" name="materialIdentity" value={draft.materialIdentity} onChange={handleChange} placeholder="모르면 비워두기" />
          </div>
          <div className="field">
            <label htmlFor="processIdentity">발생공정</label>
            <input id="processIdentity" name="processIdentity" value={draft.processIdentity} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="form">형태</label>
            <select id="form" name="form" value={draft.form} onChange={handleChange}>
              <option value="">모름</option>
              <option value="고상">고상</option>
              <option value="성형부품">성형부품</option>
              <option value="분쇄품">분쇄품</option>
              <option value="압축품">압축품</option>
              {draft.form && !['고상', '성형부품', '분쇄품', '압축품'].includes(draft.form) && <option value={draft.form}>{draft.form}</option>}
            </select>
          </div>
          <div className="field">
            <label htmlFor="contaminants">오염·이물 정보</label>
            <input id="contaminants" name="contaminants" value={draft.contaminants} onChange={handleChange} placeholder="모르면 비워두기" />
          </div>
          <div className="field">
            <label htmlFor="monthlyQuantityTon">월 발생량(톤)</label>
            <input id="monthlyQuantityTon" name="monthlyQuantityTon" type="number" min="0" step="0.1" value={draft.monthlyQuantityTon ?? ''} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="qualitySpecification">품질·수용규격</label>
            <input id="qualitySpecification" name="qualitySpecification" value={draft.qualitySpecification} onChange={handleChange} placeholder="모르면 비워두기" />
          </div>
          <div className="field">
            <label htmlFor="currentTreatment">현재 처리방법</label>
            <input id="currentTreatment" name="currentTreatment" value={draft.currentTreatment} onChange={handleChange} />
          </div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="button-primary" disabled={isResolving}>
          {isResolving ? '분석 중…' : '자원 정보 분석'}
        </button>
      </form>
    </section>
  );
}
