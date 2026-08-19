import { describe, expect, it } from 'vitest';
import { demoCases } from '../data/cases';
import type { ResourceDraft } from '../domain/model';
import { createResourceResolver, type ResourceResolver } from './resourceResolver';

function directDraft(overrides: Partial<ResourceDraft> = {}): ResourceDraft {
  return {
    name: 'PBT 외장 불량품',
    description: '자동차 부품 조립·검사 공정에서 월 10톤 발생',
    administrativeIdentity: '51-03-01 폐합성수지류',
    materialIdentity: '',
    processIdentity: '',
    form: '',
    contaminants: '',
    monthlyQuantityTon: 10,
    qualitySpecification: '',
    currentTreatment: '일반소각',
    sourceEvidenceIds: [],
    sourceMode: 'user_input',
    ...overrides,
  };
}

describe('resource resolver', () => {
  it('separates administrative, material, and process identity', async () => {
    const resource = await createResourceResolver().resolve(directDraft());

    expect(resource.administrativeIdentity.value).toContain('51-03-01');
    expect(resource.materialIdentity.value).toEqual(['PBT']);
    expect(resource.processIdentity.value).toContain('조립·검사');
  });

  it('marks extracted but unverified form as AI inference', async () => {
    const resource = await createResourceResolver().resolve(directDraft({
      name: 'PBT 외장 성형 불량품',
      description: '',
      monthlyQuantityTon: null,
    }));

    expect(resource.form.value).toBe('성형부품');
    expect(resource.form.provenance).toBe('ai_inference');
    expect(resource.form.validationState).toBe('inferred');
  });

  it('does not invent the unpublished material of the official IC-Tray case', async () => {
    const icTray = demoCases.find((item) => item.id === 'sk-ic-tray');
    if (!icTray) throw new Error('IC-Tray demo seed is missing');

    const resource = await createResourceResolver().resolve(icTray.draft);

    expect(resource.materialIdentity.value).toBeNull();
    expect(resource.materialIdentity.provenance).toBe('unknown');
    expect(resource.materialIdentity.validationState).toBe('needs_validation');
  });

  it('falls back to deterministic resolution when the remote resolver fails', async () => {
    const failingRemote: ResourceResolver = {
      resolve: async () => {
        throw new Error('offline');
      },
    };
    const resource = await createResourceResolver({ remote: failingRemote }).resolve(directDraft());

    expect(resource.materialIdentity.value).toContain('PBT');
    expect(resource.notices).toContain('원격 AI 연결에 실패해 오프라인 분석기를 사용했습니다.');
  });
});
