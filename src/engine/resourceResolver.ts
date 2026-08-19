import type { Provenance, Resource, ResourceDraft, SourcedValue } from '../domain/model';

export interface ResourceResolver {
  resolve(draft: ResourceDraft): Promise<Resource>;
}

interface ResolverOptions {
  remote?: ResourceResolver;
}

const materialAliases: Array<{ pattern: RegExp; materials: string[] }> = [
  { pattern: /\bPBT\b/i, materials: ['PBT'] },
  { pattern: /WAFER\s*CARRIER/i, materials: ['PC', 'PBT', 'POM'] },
];

function unknownValue<T>(): SourcedValue<T> {
  return {
    value: null,
    provenance: 'unknown',
    validationState: 'needs_validation',
    evidenceIds: [],
  };
}

function suppliedValue<T>(draft: ResourceDraft, value: T): SourcedValue<T> {
  const provenance: Provenance = draft.sourceMode;
  return {
    value,
    provenance,
    validationState: 'confirmed',
    evidenceIds: draft.sourceEvidenceIds,
  };
}

function inferredValue<T>(value: T | null): SourcedValue<T> {
  if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return unknownValue<T>();
  }
  return {
    value,
    provenance: 'ai_inference',
    validationState: 'inferred',
    evidenceIds: [],
  };
}

function splitMaterials(value: string): string[] {
  return value
    .split(/[\s,/·]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function inferMaterials(text: string): string[] {
  const match = materialAliases.find(({ pattern }) => pattern.test(text));
  return match?.materials ?? [];
}

function inferProcess(text: string): string {
  if (/자동차.*(조립|검사)|(조립|검사).*자동차/.test(text)) return '자동차 부품 조립·검사';
  if (/반도체/.test(text)) return '반도체 제조공정';
  return '';
}

function inferForm(text: string): string {
  if (/성형/.test(text)) return '성형부품';
  if (/분쇄/.test(text)) return '분쇄품';
  if (/압축/.test(text)) return '압축품';
  return '';
}

export class DeterministicResourceResolver implements ResourceResolver {
  async resolve(draft: ResourceDraft): Promise<Resource> {
    const text = `${draft.name} ${draft.description}`;
    const providedMaterials = splitMaterials(draft.materialIdentity);
    const providedContaminants = draft.contaminants
      .split(/[,/·]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      id: draft.id ?? `resource-${draft.name.trim().toLowerCase().replace(/\s+/g, '-') || 'new'}`,
      name: draft.name,
      administrativeIdentity: draft.administrativeIdentity
        ? suppliedValue(draft, draft.administrativeIdentity)
        : unknownValue<string>(),
      materialIdentity: providedMaterials.length
        ? suppliedValue(draft, providedMaterials)
        : inferredValue(inferMaterials(text)),
      processIdentity: draft.processIdentity
        ? suppliedValue(draft, draft.processIdentity)
        : inferredValue(inferProcess(text)),
      form: draft.form ? suppliedValue(draft, draft.form) : inferredValue(inferForm(text)),
      contaminants: providedContaminants.length
        ? suppliedValue(draft, providedContaminants)
        : unknownValue<string[]>(),
      monthlyQuantityTon: draft.monthlyQuantityTon === null
        ? unknownValue<number>()
        : suppliedValue(draft, draft.monthlyQuantityTon),
      qualitySpecification: draft.qualitySpecification
        ? suppliedValue(draft, draft.qualitySpecification)
        : unknownValue<string>(),
      currentTreatment: draft.currentTreatment
        ? suppliedValue(draft, draft.currentTreatment)
        : unknownValue<string>(),
      notices: [],
    };
  }
}

export class HttpResourceResolver implements ResourceResolver {
  constructor(private readonly endpoint: string) {}

  async resolve(draft: ResourceDraft): Promise<Resource> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!response.ok) throw new Error(`AI resolver failed: ${response.status}`);
    return parseResourceResponse(await response.json());
  }
}

function parseResourceResponse(input: unknown): Resource {
  if (!input || typeof input !== 'object') throw new Error('AI resolver returned a non-object response');
  const candidate = input as Partial<Resource>;
  if (!candidate.id || !candidate.administrativeIdentity || !candidate.materialIdentity || !candidate.processIdentity) {
    throw new Error('AI resolver returned an incomplete resource');
  }
  return candidate as Resource;
}

export function createResourceResolver(options: ResolverOptions = {}): ResourceResolver {
  const offline = new DeterministicResourceResolver();
  const endpoint = import.meta.env.VITE_AI_RESOLVER_URL;
  const remote = options.remote ?? (endpoint ? new HttpResourceResolver(endpoint) : null);

  if (!remote) return offline;

  return {
    async resolve(draft) {
      try {
        return await remote.resolve(draft);
      } catch {
        const resource = await offline.resolve(draft);
        return {
          ...resource,
          notices: [...resource.notices, '원격 AI 연결에 실패해 오프라인 분석기를 사용했습니다.'],
        };
      }
    },
  };
}
