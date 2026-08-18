# RE:VALUE MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a five-screen, offline-first RE:VALUE web prototype that resolves manufacturing by-products into sourced resource identities, retrieves only verified route evidence, qualifies routes without scores, and reopens stale decisions when explicit conditions change.

**Architecture:** A React + TypeScript + Vite single-page application keeps domain logic in pure engine modules and official/synthetic demo records in versioned seed data. The UI consumes one typed analysis result, while an optional remote AI resolver falls back to a deterministic resolver so the complete judging demo works without a network or API key.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, semantic CSS variables, browser localStorage

**Spec:** `docs/superpowers/specs/2026-08-18-re-value-mvp-design.md`

## Global Constraints

- The primary judging flow must complete without a backend, network, or API key.
- Resource Resolver resolves identity only; it never creates routes.
- Route candidates come only from the checked-in Route Library.
- Do not calculate or display suitability scores, stars, percentages, unsupported prices, savings, or carbon reductions.
- Every displayed fact carries independent provenance and validation state.
- Evidence Gate evaluates Resource Identity, Quality, and Supply readiness only; route existence belongs to retrieval and qualification.
- Route missing evidence is derived from the selected route's required conditions, never hard-coded in a screen.
- Expired evidence is historical and cannot support a current precedent.
- The 4t→12t reopen flow is labeled `Synthetic Demo Scenario` in data and UI.
- Official-source facts and demo-added values must never share the same provenance label.
- UI copy is Korean; domain identifiers and source code names are English.

---

## Planned File Structure

```text
package.json                         project scripts and dependencies
vite.config.ts                      Vite and Vitest configuration
playwright.config.ts                desktop/mobile browser checks
src/main.tsx                        application entry
src/App.tsx                         five-screen flow coordinator
src/domain/model.ts                 shared domain contracts
src/data/cases.ts                   official and direct-input demo cases
src/data/evidence.ts                source metadata and supported claims
src/data/routes.ts                  closed Route Library and conditions
src/data/decisions.ts               synthetic Decision Memory seed
src/data/validateSeedData.ts         seed integrity checks
src/engine/resourceResolver.ts       resolver interface and deterministic fallback
src/engine/evidenceGate.ts           resource-readiness gate
src/engine/routeDecision.ts          retrieval and condition qualification
src/engine/freshness.ts              evidence expiry and conditional reopen
src/engine/buildReport.ts            guarded Decision Report projection
src/app/analysisReducer.ts           explicit screen and analysis state transitions
src/app/useAnalysis.ts               engine orchestration for the UI
src/components/AppHeader.tsx         product context and progress
src/components/CaseLibrary.tsx       home and real-case entry
src/components/ResourceForm.tsx      incomplete-input-friendly resource form
src/components/ResolutionView.tsx    Resource Identity and Evidence Gate
src/components/RouteDecisionView.tsx route condition comparison
src/components/DecisionReport.tsx    decision, unknowns, actions, and sources
src/components/FreshnessDemo.tsx     labeled synthetic reopen demonstration
src/components/StatusBadge.tsx       accessible provenance/state presentation
src/styles/tokens.css                semantic color, type, spacing tokens
src/styles/global.css                reset, layout, focus, responsive behavior
e2e/pbt-flow.spec.ts                 three-minute primary judging flow
e2e/responsive.spec.ts               narrow-width and overflow checks
README.md                            setup, demo script, source/data disclaimers
```

## Task 1: Create the Tested React Application Shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: `App(): JSX.Element`
- Produces scripts: `dev`, `test`, `test:run`, `typecheck`, `build`

- [ ] **Step 1: Scaffold the Vite React TypeScript project without overwriting `docs/`**

Run:

```bash
npm init -y
npm install react react-dom
npm install -D vite typescript @types/react @types/react-dom @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Patch `package.json` to set `"type": "module"` and the scripts declared by this task. Create the Vite configuration files explicitly so the existing `README.md` and `docs/` tree cannot be overwritten by a project initializer.

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc -b --pretty false",
    "build": "tsc -b && vite build"
  }
}
```

- [ ] **Step 2: Add test configuration and the first failing application test**

Add to `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('identifies RE:VALUE as an evidence-based resource decision service', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'RE:VALUE' })).toBeInTheDocument();
    expect(screen.getByText(/근거 기반 자원 의사결정/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and verify RED**

Run: `npm run test:run -- src/App.test.tsx`  
Expected: FAIL because the generated `App` does not render the required Korean product identity.

- [ ] **Step 4: Implement the minimal semantic shell and base tokens**

Replace `src/App.tsx` with a semantic `<header>` and `<main>` containing the exact heading and product description required by the test. Define semantic tokens for `--color-action`, `--color-success`, `--color-warning`, `--color-danger`, `--color-border`, `--color-text`, `--color-muted`, spacing, and visible `:focus-visible`; do not introduce gradients, glass effects, or decorative card grids.

```tsx
export default function App() {
  return (
    <>
      <header className="app-header"><strong>RE:VALUE</strong></header>
      <main>
        <h1>RE:VALUE</h1>
        <p>근거 기반 자원 의사결정 서비스</p>
      </main>
    </>
  );
}
```

```css
:root {
  --color-action: #0b6b57;
  --color-success: #176b45;
  --color-warning: #8a4b08;
  --color-danger: #a52828;
  --color-border: #cbd5d1;
  --color-text: #17211e;
  --color-muted: #596762;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
}

:focus-visible { outline: 3px solid var(--color-action); outline-offset: 3px; }
```

- [ ] **Step 5: Verify GREEN and the production build**

Run:

```bash
npm run test:run -- src/App.test.tsx
npm run typecheck
npm run build
```

Expected: all commands exit 0 with no test warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src
git commit -m "feat: scaffold re-value web prototype"
```

## Task 2: Define Domain Contracts and Validate Seed Evidence

**Files:**
- Create: `src/domain/model.ts`
- Create: `src/data/cases.ts`
- Create: `src/data/evidence.ts`
- Create: `src/data/routes.ts`
- Create: `src/data/decisions.ts`
- Create: `src/data/validateSeedData.ts`
- Create: `src/test/fixtures.ts`
- Test: `src/data/validateSeedData.test.ts`

**Interfaces:**
- Produces: `Resource`, `SourcedValue<T>`, `EvidenceRecord`, `RouteDefinition`, `DecisionMemory`
- Produces: `validateSeedData(dataset): string[]`
- Produces constants: `demoCases`, `evidenceRecords`, `routeLibrary`, `decisionMemories`
- Produces test factories: `confirmedValue`, `unknownValue`, `resourceFixture`, `pbtResource`, `completeResourceFixture`

- [ ] **Step 1: Write failing seed-integrity tests**

```ts
import { describe, expect, it } from 'vitest';
import { demoCases } from './cases';
import { decisionMemories } from './decisions';
import { evidenceRecords } from './evidence';
import { routeLibrary } from './routes';
import { validateSeedData } from './validateSeedData';

describe('validateSeedData', () => {
  it('accepts only resolvable evidence references and unique ids', () => {
    expect(validateSeedData({ demoCases, decisionMemories, evidenceRecords, routeLibrary })).toEqual([]);
  });

  it('marks the conditional reopen case as synthetic', () => {
    const reopen = decisionMemories.find((item) => item.id === 'quantity-reopen-demo');
    expect(reopen?.scenarioKind).toBe('synthetic_demo');
    expect(reopen?.displayLabel).toBe('Conditional Reopen 기능 시연용 가상 시나리오');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test:run -- src/data/validateSeedData.test.ts`  
Expected: FAIL because the model and seed modules do not exist.

- [ ] **Step 3: Implement the exact domain types**

Define the spec types plus these required fields in `src/domain/model.ts`:

```ts
export type MarketKind = 'monthly_average' | 'listing_price' | 'bid_minimum';

export interface EvidenceRecord {
  id: string;
  title: string;
  evidenceType: 'case' | 'benchmark' | 'bid' | 'regulation';
  sourceUrl: string;
  observedAt: string;
  validUntil: string | null;
  status: 'current' | 'historical' | 'expired';
  supportedClaims: string[];
  marketKind: MarketKind | null;
}

export type ResourceField =
  | 'materialIdentity'
  | 'processIdentity'
  | 'form'
  | 'contaminants'
  | 'monthlyQuantityTon'
  | 'qualitySpecification';

export interface Resource {
  id: string;
  name: string;
  administrativeIdentity: SourcedValue<string>;
  materialIdentity: SourcedValue<string[]>;
  processIdentity: SourcedValue<string>;
  form: SourcedValue<string>;
  contaminants: SourcedValue<string[]>;
  monthlyQuantityTon: SourcedValue<number>;
  qualitySpecification: SourcedValue<string>;
  currentTreatment: SourcedValue<string>;
  notices: string[];
}

export interface QualificationCondition {
  id: string;
  label: string;
  field: ResourceField;
  operator: 'equals' | 'includes' | 'gte' | 'lte' | 'known';
  expected: string | number | boolean;
  required: boolean;
  basis: 'official_evidence' | 'system_validation';
  evidenceId: string | null;
}

export interface RouteDefinition {
  id: string;
  name: string;
  description: string;
  kind: 'candidate' | 'baseline';
  materialKeys: string[];
  conditions: QualificationCondition[];
  evidenceIds: string[];
}

export interface DecisionMemory {
  id: string;
  resourceId: string;
  status: 'rejected' | 'accepted' | 'review';
  decidedAt: string;
  reason: string;
  reopenCondition: QualificationCondition | null;
  evidenceSnapshot: Record<string, string | number | boolean | null>;
  scenarioKind: 'official_case' | 'synthetic_demo';
  displayLabel: string;
}
```

- [ ] **Step 4: Add source-faithful seed data**

Seed the three Home cases and evidence identifiers below:

```ts
export const SOURCE_IDS = {
  hyundaiPbt: 'evidence-hyundai-pbt-20230830001',
  skIcTray: 'evidence-sk-ic-tray-15',
  skWaferCarrier: 'evidence-sk-wafer-carrier-696',
  dongwonExpired: 'evidence-dongwon-576-expired',
  jincheonBid: 'evidence-jincheon-bid-20260409014',
} as const;
```

For each official record include its source URL, `observedAt: '2026-08-18'`, evidence type, current/historical/expired status, and only claims directly supported by the source. Mark the PBT entry as a published circulation-support request that desires raw-material recycling; do not label it a completed recycling success. Mark Dongwon SN576 as expired. Store the quantity reopen record only in `decisions.ts` with `scenarioKind: 'synthetic_demo'`.

Create reusable real-object test factories in `src/test/fixtures.ts`; do not mock domain engines:

```ts
import type { Resource, SourcedValue } from '../domain/model';
import { decisionMemories } from '../data/decisions';
import { evidenceRecords } from '../data/evidence';
import { routeLibrary } from '../data/routes';

export const confirmedValue = <T>(value: T): SourcedValue<T> => ({
  value,
  provenance: 'user_input',
  validationState: 'confirmed',
  evidenceIds: [],
});

export const unknownValue = <T>(value: T): SourcedValue<T> => ({
  value,
  provenance: 'unknown',
  validationState: 'needs_validation',
  evidenceIds: [],
});

export function resourceFixture(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 'resource-fixture',
    name: '테스트 자원',
    administrativeIdentity: confirmedValue('51-03-01 폐합성수지류'),
    materialIdentity: confirmedValue(['PBT']),
    processIdentity: confirmedValue('자동차 부품 조립·검사'),
    form: confirmedValue('성형부품'),
    contaminants: confirmedValue([]),
    monthlyQuantityTon: confirmedValue(10),
    qualitySpecification: unknownValue(''),
    currentTreatment: confirmedValue('일반소각'),
    notices: [],
    ...overrides,
  };
}

export const pbtResource = (overrides: Partial<Resource> = {}) => resourceFixture(overrides);
export const ppResource = (overrides: Partial<Resource> = {}) => resourceFixture({ materialIdentity: confirmedValue(['PP']), ...overrides });
export const completeResourceFixture = () => resourceFixture({ qualitySpecification: confirmedValue('구매자 확인 완료') });

function mustFind<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`테스트 시드 누락: ${id}`);
  return item;
}

export const pbtRecoveryRoute = mustFind(routeLibrary, 'pbt-material-recovery');
export const expiredOnlyRoute = mustFind(routeLibrary, 'pp-expired-precedent');
export const dongwonExpiredEvidence = mustFind(evidenceRecords, 'evidence-dongwon-576-expired');
export const quantityReopenMemory = mustFind(decisionMemories, 'quantity-reopen-demo');
```

- [ ] **Step 5: Implement seed validation**

`validateSeedData` must return human-readable errors for duplicate IDs, missing evidence references, official records without `sourceUrl` or `observedAt`, and synthetic decisions without the required label. It must not mutate the supplied dataset.

```ts
export function validateSeedData(data: SeedDataset): string[] {
  const errors: string[] = [];
  const allIds = [
    ...data.demoCases.map((item) => item.id),
    ...data.decisionMemories.map((item) => item.id),
    ...data.evidenceRecords.map((item) => item.id),
    ...data.routeLibrary.map((item) => item.id),
  ];
  const seen = new Set<string>();
  for (const id of allIds) {
    if (seen.has(id)) errors.push(`중복 ID: ${id}`);
    seen.add(id);
  }

  const evidenceIds = new Set(data.evidenceRecords.map((item) => item.id));
  for (const route of data.routeLibrary) {
    for (const evidenceId of route.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) errors.push(`존재하지 않는 Evidence: ${route.id}/${evidenceId}`);
    }
  }
  for (const evidence of data.evidenceRecords) {
    if (!evidence.sourceUrl || !evidence.observedAt) errors.push(`출처 메타데이터 누락: ${evidence.id}`);
    if ((evidence.evidenceType === 'benchmark' || evidence.evidenceType === 'bid') && evidence.marketKind === null) {
      errors.push(`시장근거 유형 누락: ${evidence.id}`);
    }
  }
  for (const memory of data.decisionMemories) {
    if (memory.scenarioKind === 'synthetic_demo' && memory.displayLabel !== 'Conditional Reopen 기능 시연용 가상 시나리오') {
      errors.push(`가상 시나리오 라벨 오류: ${memory.id}`);
    }
  }
  return errors;
}
```

- [ ] **Step 6: Verify GREEN**

Run:

```bash
npm run test:run -- src/data/validateSeedData.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain src/data
git commit -m "feat: add sourced resource and route data model"
```

## Task 3: Implement the AI Resource Resolver Boundary and Offline Fallback

**Files:**
- Create: `src/engine/resourceResolver.ts`
- Test: `src/engine/resourceResolver.test.ts`

**Interfaces:**
- Consumes: `Resource`, `SourcedValue<T>`
- Produces: `ResourceDraft`, `ResourceResolver`, `createResourceResolver(options)`
- Produces: `resolve(draft: ResourceDraft): Promise<Resource>`

- [ ] **Step 1: Write failing resolver behavior tests**

```ts
describe('resource resolver', () => {
  it('separates administrative, material, and process identity', async () => {
    const resource = await createResourceResolver().resolve({
      name: 'PBT 외장 불량품',
      description: '자동차 부품 조립·검사 공정에서 월 10톤 발생',
      administrativeIdentity: '51-03-01 폐합성수지류',
    });
    expect(resource.administrativeIdentity.value).toContain('51-03-01');
    expect(resource.materialIdentity.value).toEqual(['PBT']);
    expect(resource.processIdentity.value).toContain('조립·검사');
  });

  it('marks extracted but unverified form as AI inference', async () => {
    const resource = await createResourceResolver().resolve({
      name: 'PBT 외장 성형 불량품',
      description: '',
      administrativeIdentity: '폐합성수지류',
    });
    expect(resource.form.provenance).toBe('ai_inference');
    expect(resource.form.validationState).toBe('inferred');
  });

  it('falls back to deterministic resolution when the remote resolver fails', async () => {
    const failingRemote = { resolve: async () => { throw new Error('offline'); } };
    const resolver = createResourceResolver({ remote: failingRemote });
    const resource = await resolver.resolve({ name: 'IC Tray', description: '반도체 공정', administrativeIdentity: '51-03-01' });
    expect(resource.materialIdentity.value).toContain('PP');
  });
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run test:run -- src/engine/resourceResolver.test.ts`  
Expected: FAIL because the resolver module does not exist.

- [ ] **Step 3: Implement the resolver interface and deterministic parser**

Use a small, explicit normalization dictionary for the demo cases. Preserve official/user values, attach `ai_inference/inferred` only to extracted values, and emit `unknown/needs_validation` for absent values. The resolver must not import `routeLibrary` or produce route IDs.

```ts
export interface ResourceDraft {
  id?: string;
  name: string;
  description: string;
  administrativeIdentity: string;
  monthlyQuantityTon?: number | null;
  currentTreatment?: string;
  sourceEvidenceIds?: string[];
}

const materialAliases: Record<string, string> = {
  PBT: 'PBT',
  'IC TRAY': 'PP',
  'WAFER CARRIER': 'PC/PBT/POM',
};

export interface ResourceResolver {
  resolve(draft: ResourceDraft): Promise<Resource>;
}

export class DeterministicResourceResolver implements ResourceResolver {
  async resolve(draft: ResourceDraft): Promise<Resource> {
    const haystack = `${draft.name} ${draft.description}`.toUpperCase();
    const alias = Object.keys(materialAliases).find((key) => haystack.includes(key));
    const material = alias ? materialAliases[alias] : null;
    return buildResourceFromDraft(draft, {
      materialIdentity: material ? material.split('/') : [],
      processIdentity: haystack.includes('조립') || haystack.includes('검사') ? '자동차 부품 조립·검사' : '',
      form: haystack.includes('성형') ? '성형부품' : '',
    });
  }
}

function buildResourceFromDraft(
  draft: ResourceDraft,
  inferred: { materialIdentity: string[]; processIdentity: string; form: string },
): Resource {
  const official = (draft.sourceEvidenceIds?.length ?? 0) > 0;
  const supplied = <T>(value: T): SourcedValue<T> => ({
    value,
    provenance: official ? 'official_source' : 'user_input',
    validationState: 'confirmed',
    evidenceIds: draft.sourceEvidenceIds ?? [],
  });
  const inferredValue = <T>(value: T | null): SourcedValue<T> => {
    const known = Array.isArray(value) ? value.length > 0 : value !== '' && value !== null;
    return known
      ? { value, provenance: 'ai_inference', validationState: 'inferred', evidenceIds: [] }
      : { value: null, provenance: 'unknown', validationState: 'needs_validation', evidenceIds: [] };
  };
  return {
    id: draft.id ?? crypto.randomUUID(),
    name: draft.name,
    administrativeIdentity: supplied(draft.administrativeIdentity),
    materialIdentity: inferredValue(inferred.materialIdentity),
    processIdentity: inferredValue(inferred.processIdentity),
    form: inferredValue(inferred.form),
    contaminants: inferredValue<string[]>(null),
    monthlyQuantityTon: draft.monthlyQuantityTon === null || draft.monthlyQuantityTon === undefined
      ? inferredValue<number>(null)
      : supplied(draft.monthlyQuantityTon),
    qualitySpecification: inferredValue(''),
    currentTreatment: draft.currentTreatment ? supplied(draft.currentTreatment) : inferredValue(''),
    notices: [],
  };
}
```

- [ ] **Step 4: Implement remote-first fallback without exposing secrets**

`createResourceResolver` may accept an injected remote resolver or a `VITE_AI_RESOLVER_URL` endpoint. It must never accept or store an API key in browser code. On a remote error, return the deterministic result and an analysis notice that the offline resolver was used.

```ts
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

export function createResourceResolver(options: { remote?: ResourceResolver } = {}): ResourceResolver {
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
        return { ...resource, notices: [...resource.notices, '오프라인 분석기를 사용했습니다.'] };
      }
    },
  };
}
```

- [ ] **Step 5: Verify GREEN and mutation expectations**

Run: `npm run test:run -- src/engine/resourceResolver.test.ts`  
Expected: PASS. Confirm mentally that removing PBT normalization, changing inference provenance, or removing fallback would fail a named test.

- [ ] **Step 6: Commit**

```bash
git add src/engine/resourceResolver.ts src/engine/resourceResolver.test.ts
git commit -m "feat: resolve resource identity with offline fallback"
```

## Task 4: Implement the Resource-Only Evidence Gate

**Files:**
- Create: `src/engine/evidenceGate.ts`
- Test: `src/engine/evidenceGate.test.ts`

**Interfaces:**
- Consumes: `Resource`
- Produces: `evaluateEvidenceGate(resource): EvidenceGateResult`
- `EvidenceGateResult.status`: `ready_for_route_review | qualification_required | insufficient_evidence`

- [ ] **Step 1: Write failing gate tests that enforce the responsibility boundary**

```ts
describe('evaluateEvidenceGate', () => {
  it('requires material identity before route review', () => {
    const result = evaluateEvidenceGate(resourceFixture({ materialIdentity: unknownValue([]) }));
    expect(result.status).toBe('qualification_required');
    expect(result.missingFields).toContain('materialIdentity');
  });

  it('can mark a resource ready even when no route library is supplied', () => {
    const result = evaluateEvidenceGate(completeResourceFixture());
    expect(result.status).toBe('ready_for_route_review');
  });

  it('does not emit route-specific questions', () => {
    const result = evaluateEvidenceGate(completeResourceFixture());
    expect(result.missingFields).not.toContain('qualitySpecification');
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/engine/evidenceGate.test.ts`  
Expected: FAIL because the gate does not exist.

- [ ] **Step 3: Implement minimal resource readiness rules**

Evaluate only `materialIdentity`, `processIdentity`, `form`, `contaminants`, and `monthlyQuantityTon`. Return `insufficient_evidence` only when both material and process identities are unavailable; otherwise return `qualification_required` for unknown required resource fields and `ready_for_route_review` when all five are known. Do not import evidence or routes.

```ts
const gateFields = ['materialIdentity', 'processIdentity', 'form', 'contaminants', 'monthlyQuantityTon'] as const;

export function evaluateEvidenceGate(resource: Resource): EvidenceGateResult {
  const missingFields = gateFields.filter((field) => resource[field].validationState === 'needs_validation');
  const identityMissing = ['materialIdentity', 'processIdentity'].every((field) =>
    missingFields.includes(field as (typeof gateFields)[number]),
  );
  return {
    status: identityMissing
      ? 'insufficient_evidence'
      : missingFields.length > 0
        ? 'qualification_required'
        : 'ready_for_route_review',
    missingFields,
  };
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/engine/evidenceGate.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/evidenceGate.ts src/engine/evidenceGate.test.ts
git commit -m "feat: evaluate resource evidence readiness"
```

## Task 5: Retrieve Closed-Library Routes and Qualify Explicit Conditions

**Files:**
- Create: `src/engine/routeDecision.ts`
- Test: `src/engine/routeDecision.test.ts`

**Interfaces:**
- Consumes: `Resource`, `RouteDefinition[]`, `EvidenceRecord[]`
- Produces: `retrieveRoutes(resource, routes): RouteDefinition[]`
- Produces: `qualifyRoute(resource, route, evidence): RouteQualification`

- [ ] **Step 1: Write failing retrieval and qualification tests**

```ts
describe('route decision', () => {
  it('returns only routes already present in the checked-in library', () => {
    const routes = retrieveRoutes(pbtResource(), routeLibrary);
    expect(routes.map((route) => route.id)).toEqual(['pbt-material-recovery', 'current-incineration']);
  });

  it('returns no invented route when the material has no library match', () => {
    const routes = retrieveRoutes(resourceFixture({ materialIdentity: confirmedValue(['UNKNOWN-POLYMER']) }), routeLibrary);
    expect(routes).toEqual([]);
  });

  it('derives missing evidence from unknown required route conditions', () => {
    const qualification = qualifyRoute(pbtResource({ qualitySpecification: unknownValue('') }), pbtRecoveryRoute, evidenceRecords);
    expect(qualification.decision).toBe('qualification_required');
    expect(qualification.missingEvidence).toEqual([
      expect.objectContaining({ conditionId: 'pbt-buyer-validation', label: '재활용업체 수용조건 확인' }),
    ]);
  });

  it('does not use expired evidence as current support', () => {
    const qualification = qualifyRoute(ppResource(), expiredOnlyRoute, evidenceRecords);
    expect(qualification.currentEvidence).toEqual([]);
    expect(qualification.historicalEvidence.map((item) => item.id)).toContain('evidence-dongwon-576-expired');
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/engine/routeDecision.test.ts`  
Expected: FAIL because retrieval and qualification are missing.

- [ ] **Step 3: Implement literal closed-library retrieval**

Match only normalized material identifiers declared by each route. Return library objects without synthesizing descriptions, conditions, or evidence. Keep `current-incineration` as an explicit baseline route for the PBT case.

```ts
export function retrieveRoutes(resource: Resource, routes: RouteDefinition[]): RouteDefinition[] {
  const materials = new Set(resource.materialIdentity.value ?? []);
  return routes.filter((route) =>
    route.kind === 'baseline' || route.materialKeys.some((key) => materials.has(key)),
  );
}
```

- [ ] **Step 4: Implement condition evaluation and dynamic missing evidence**

Map each condition to `met`, `not_met`, `unknown`, or `not_applicable`. A required `not_met` condition yields `not_qualified`; a required `unknown` condition yields `qualification_required`; otherwise the non-baseline route yields `review`. Generate `missingEvidence` exclusively from required conditions whose result is `unknown`.

```ts
function evaluateCondition(resource: Resource, condition: QualificationCondition): ConditionResult {
  const sourced = resource[condition.field];
  if (sourced.validationState === 'needs_validation' || sourced.value === null) return 'unknown';
  if (condition.operator === 'known') return 'met';
  if (condition.operator === 'includes' && Array.isArray(sourced.value)) {
    return sourced.value.includes(String(condition.expected)) ? 'met' : 'not_met';
  }
  if (condition.operator === 'equals') return sourced.value === condition.expected ? 'met' : 'not_met';
  if (condition.operator === 'gte' && typeof sourced.value === 'number') return sourced.value >= Number(condition.expected) ? 'met' : 'not_met';
  if (condition.operator === 'lte' && typeof sourced.value === 'number') return sourced.value <= Number(condition.expected) ? 'met' : 'not_met';
  return 'not_applicable';
}

export function qualifyRoute(resource: Resource, route: RouteDefinition, evidence: EvidenceRecord[], asOf = new Date('2026-08-18')): RouteQualification {
  const conditions = route.conditions.map((condition) => ({ condition, result: evaluateCondition(resource, condition) }));
  const missingEvidence = conditions
    .filter(({ condition, result }) => condition.required && result === 'unknown')
    .map(({ condition }) => ({ conditionId: condition.id, label: condition.label }));
  const hasFailure = conditions.some(({ condition, result }) => condition.required && result === 'not_met');
  const decision = route.kind === 'baseline' ? 'baseline' : hasFailure ? 'not_qualified' : missingEvidence.length ? 'qualification_required' : 'review';
  const { currentEvidence, historicalEvidence } = partitionEvidence(route, evidence, asOf);
  return { route, decision, conditions, missingEvidence, currentEvidence, historicalEvidence };
}
```

- [ ] **Step 5: Split current and historical evidence**

Evidence with status `expired` or `historical`, or with `validUntil` before the analysis date, goes to `historicalEvidence` and cannot satisfy a current-evidence requirement.

```ts
function partitionEvidence(route: RouteDefinition, evidence: EvidenceRecord[], asOf: Date) {
  const attached = evidence.filter((item) => route.evidenceIds.includes(item.id));
  const isHistorical = (item: EvidenceRecord) =>
    item.status !== 'current' || (item.validUntil !== null && new Date(item.validUntil) < asOf);
  return {
    historicalEvidence: attached.filter(isHistorical),
    currentEvidence: attached.filter((item) => !isHistorical(item)),
  };
}
```

- [ ] **Step 6: Verify GREEN**

Run:

```bash
npm run test:run -- src/engine/routeDecision.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/engine/routeDecision.ts src/engine/routeDecision.test.ts
git commit -m "feat: qualify verified route evidence"
```

## Task 6: Detect Expired Evidence and Conditional Reopen

**Files:**
- Create: `src/engine/freshness.ts`
- Test: `src/engine/freshness.test.ts`

**Interfaces:**
- Produces: `classifyEvidenceFreshness(evidence, now): EvidenceFreshness`
- Produces: `evaluateDecisionFreshness(memory, resource): DecisionFreshness`

- [ ] **Step 1: Write failing freshness tests**

```ts
describe('freshness', () => {
  it('classifies an expired recognition as historical evidence', () => {
    expect(classifyEvidenceFreshness(dongwonExpiredEvidence, new Date('2026-08-18'))).toEqual({
      status: 'historical',
      reason: 'evidence_expired',
    });
  });

  it('reopens a rejected decision when quantity crosses the explicit threshold', () => {
    const result = evaluateDecisionFreshness(quantityReopenMemory, pbtResource({ monthlyQuantityTon: confirmedValue(12) }));
    expect(result.status).toBe('stale');
    expect(result.reason).toBe('reopen_condition_met');
    expect(result.previousValue).toBe(4);
    expect(result.currentValue).toBe(12);
  });

  it('keeps the decision current below the threshold', () => {
    const result = evaluateDecisionFreshness(quantityReopenMemory, pbtResource({ monthlyQuantityTon: confirmedValue(8) }));
    expect(result.status).toBe('current');
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/engine/freshness.test.ts`  
Expected: FAIL because the freshness engine is missing.

- [ ] **Step 3: Implement date and reopen checks**

Use the injected `now`; do not read the system clock inside condition evaluation. Compare only the explicit field/operator/value from `reopenCondition`. Return previous/current values so the UI can explain the delta.

```ts
export function classifyEvidenceFreshness(evidence: EvidenceRecord, now: Date): EvidenceFreshness {
  const expiredByDate = evidence.validUntil !== null && new Date(evidence.validUntil) < now;
  return evidence.status !== 'current' || expiredByDate
    ? { status: 'historical', reason: 'evidence_expired' }
    : { status: 'current', reason: 'evidence_current' };
}

export function evaluateDecisionFreshness(memory: DecisionMemory, resource: Resource): DecisionFreshness {
  const condition = memory.reopenCondition;
  if (!condition) return { status: 'current', reason: 'no_reopen_condition' };
  const currentValue = resource[condition.field].value;
  const previousValue = memory.evidenceSnapshot[condition.field] ?? null;
  const met = condition.operator === 'gte' && typeof currentValue === 'number'
    ? currentValue >= Number(condition.expected)
    : false;
  return met
    ? { status: 'stale', reason: 'reopen_condition_met', previousValue, currentValue }
    : { status: 'current', reason: 'reopen_condition_not_met', previousValue, currentValue };
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/engine/freshness.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/freshness.ts src/engine/freshness.test.ts
git commit -m "feat: reopen stale resource decisions"
```

## Task 7: Build a Hallucination-Guarded Decision Report

**Files:**
- Create: `src/engine/buildReport.ts`
- Test: `src/engine/buildReport.test.ts`

**Interfaces:**
- Consumes: resource, gate result, qualifications, evidence, freshness
- Produces: `buildDecisionReport(input): DecisionReportModel`

- [ ] **Step 1: Write failing report guard tests**

```ts
const pbtQualificationWithQualityUnknown = qualifyRoute(
  pbtResource({ qualitySpecification: unknownValue('') }),
  pbtRecoveryRoute,
  evidenceRecords,
);

function reportInput(overrides: Partial<DecisionReportInput> = {}): DecisionReportInput {
  return {
    resource: pbtResource(),
    gate: evaluateEvidenceGate(pbtResource()),
    qualifications: [pbtQualificationWithQualityUnknown],
    freshness: null,
    ...overrides,
  };
}

describe('buildDecisionReport', () => {
  it('omits price when no current benchmark or bid evidence exists', () => {
    const report = buildDecisionReport(reportInput({ qualifications: [{ ...pbtQualificationWithQualityUnknown, currentEvidence: [] }] }));
    expect(report.marketReference).toBeUndefined();
    expect(report.marketNotice).toBe('확인 가능한 공식 시장근거가 없습니다.');
  });

  it('never promotes historical evidence into current reasons', () => {
    const report = buildDecisionReport(reportInput({
      qualifications: [{ ...pbtQualificationWithQualityUnknown, currentEvidence: [], historicalEvidence: [dongwonExpiredEvidence] }],
    }));
    expect(report.currentReasons).not.toContainEqual(expect.objectContaining({ evidenceId: dongwonExpiredEvidence.id }));
    expect(report.historicalSources).toContainEqual(expect.objectContaining({ id: dongwonExpiredEvidence.id }));
  });

  it('uses next actions derived from route missing evidence', () => {
    const report = buildDecisionReport(reportInput({ qualifications: [pbtQualificationWithQualityUnknown] }));
    expect(report.nextActions).toContain('재활용업체 수용조건 확인');
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/engine/buildReport.test.ts`  
Expected: FAIL because the report projection is missing.

- [ ] **Step 3: Implement report projection with no free-form facts**

Build report text from fixed Korean copy maps plus values already present in Resource, Qualification, and Evidence records. Include current decision, reasons, unknowns, next actions, compared routes, current sources, historical sources, and optional freshness alert. Do not ask an LLM to compose report facts.

```ts
const decisionCopy: Record<RouteDecision, string> = {
  review: '우선 검토',
  qualification_required: '추가 자격 확인 필요',
  not_qualified: '현재 조건 불충족',
  watch: '관찰',
  baseline: '현재 처리 기준선',
};

export function buildDecisionReport(input: DecisionReportInput): DecisionReportModel {
  const selected = input.qualifications.find((item) => item.decision === 'review')
    ?? input.qualifications.find((item) => item.decision === 'qualification_required')
    ?? input.qualifications[0];
  const currentSources = selected?.currentEvidence ?? [];
  const historicalSources = input.qualifications.flatMap((item) => item.historicalEvidence);
  const nextActions = selected?.missingEvidence.map((item) => item.label) ?? [];
  const marketEvidence = currentSources.filter((item) => item.evidenceType === 'benchmark' || item.evidenceType === 'bid');
  return {
    currentDecision: selected ? decisionCopy[selected.decision] : '검토 가능한 Route 근거 없음',
    currentReasons: selected ? selected.conditions.filter((item) => item.result === 'met') : [],
    unknowns: selected?.missingEvidence ?? [],
    nextActions,
    comparedRoutes: input.qualifications,
    currentSources,
    historicalSources,
    marketReference: marketEvidence[0],
    marketNotice: marketEvidence.length ? undefined : '확인 가능한 공식 시장근거가 없습니다.',
    freshness: input.freshness,
  };
}
```

- [ ] **Step 4: Implement market evidence guard**

Expose `marketReference` only when at least one current `benchmark` or `bid` EvidenceRecord is deliberately attached to the selected route. Label its kind as `월별 조사 평균`, `등록가격`, or `입찰 기준가격`; never label it a quote or realized transaction.

```ts
export const marketKindCopy = {
  monthly_average: '월별 조사 평균',
  listing_price: '등록가격',
  bid_minimum: '입찰 기준가격',
} as const;
```

- [ ] **Step 5: Verify GREEN**

Run: `npm run test:run -- src/engine/buildReport.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/engine/buildReport.ts src/engine/buildReport.test.ts
git commit -m "feat: build evidence-guarded decision reports"
```

## Task 8: Add Explicit Application Flow State

**Files:**
- Create: `src/app/analysisReducer.ts`
- Create: `src/app/useAnalysis.ts`
- Test: `src/app/analysisReducer.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `AnalysisStep = case_library | resource_input | resolution | route_decision | decision_report`
- Produces: `analysisReducer(state, event): AnalysisState`
- Produces: `useAnalysis()` orchestration API

- [ ] **Step 1: Write failing state-transition tests**

```ts
const pbtQualifications = [qualifyRoute(pbtResource(), pbtRecoveryRoute, evidenceRecords)];
const resolutionState: AnalysisState = {
  ...initialAnalysisState,
  step: 'resolution',
  selectedCaseId: 'hyundai-pbt',
  draft: { name: 'PBT 외장 불량품', description: '', administrativeIdentity: '51-03-01' },
  resource: pbtResource(),
};

it('moves through the five judging steps without skipping evidence review', () => {
  let state = initialAnalysisState;
  state = analysisReducer(state, { type: 'case_selected', caseId: 'hyundai-pbt' });
  expect(state.step).toBe('resource_input');
  state = analysisReducer(state, { type: 'resource_resolved', resource: pbtResource() });
  expect(state.step).toBe('resolution');
  state = analysisReducer(state, { type: 'routes_reviewed', qualifications: pbtQualifications });
  expect(state.step).toBe('route_decision');
  state = analysisReducer(state, { type: 'report_opened' });
  expect(state.step).toBe('decision_report');
});

it('returns to resource input without discarding entered data', () => {
  const state = analysisReducer(resolutionState, { type: 'edit_resource' });
  expect(state.step).toBe('resource_input');
  expect(state.draft.name).toBe('PBT 외장 불량품');
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/app/analysisReducer.test.ts`  
Expected: FAIL because the state layer does not exist.

- [ ] **Step 3: Implement the reducer and orchestration hook**

Use a discriminated event union. `useAnalysis` invokes resolver → gate → retrieval → qualification → report in order and persists only Decision Memory and the last draft to localStorage. Engine modules remain pure and are passed into the hook so tests can use real deterministic implementations.

```ts
export type AnalysisEvent =
  | { type: 'case_selected'; caseId: string }
  | { type: 'resource_resolved'; resource: Resource }
  | { type: 'routes_reviewed'; qualifications: RouteQualification[] }
  | { type: 'report_opened' }
  | { type: 'edit_resource' }
  | { type: 'restart' };

export function analysisReducer(state: AnalysisState, event: AnalysisEvent): AnalysisState {
  switch (event.type) {
    case 'case_selected': return selectCase(state, event.caseId);
    case 'resource_resolved': return { ...state, step: 'resolution', resource: event.resource };
    case 'routes_reviewed': return { ...state, step: 'route_decision', qualifications: event.qualifications };
    case 'report_opened': return { ...state, step: 'decision_report' };
    case 'edit_resource': return { ...state, step: 'resource_input' };
    case 'restart': return initialAnalysisState;
  }
}

function selectCase(state: AnalysisState, caseId: string): AnalysisState {
  const selected = demoCases.find((item) => item.id === caseId);
  if (!selected) return state;
  return { ...state, step: 'resource_input', selectedCaseId: caseId, draft: selected.draft };
}
```

- [ ] **Step 4: Replace the static App shell with step rendering**

Keep one `<main>` and one visible page heading. Add a text progress indicator such as `2 / 5 · 자원 정보` and a predictable back action. Do not add a sidebar or global dashboard navigation.

```tsx
<AppHeader productName="RE:VALUE" progress={`${stepNumber} / 5 · ${stepLabel}`} onBack={canGoBack ? goBack : undefined} />
<main id="main-content">
  {state.step === 'case_library' && <CaseLibrary onSelectCase={selectCase} />}
  {state.step === 'resource_input' && <ResourceForm draft={state.draft} onSubmit={resolveResource} />}
  {state.step === 'resolution' && <ResolutionView resource={state.resource} gate={state.gate} onContinue={reviewRoutes} />}
  {state.step === 'route_decision' && <RouteDecisionView qualifications={state.qualifications} onOpenReport={openReport} />}
  {state.step === 'decision_report' && <DecisionReport report={state.report} />}
</main>
```

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm run test:run -- src/app/analysisReducer.test.ts src/App.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app src/App.tsx src/App.test.tsx
git commit -m "feat: orchestrate the five-step analysis flow"
```

## Task 9: Build Case, Input, and Resolution Screens

**Files:**
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/CaseLibrary.tsx`
- Create: `src/components/ResourceForm.tsx`
- Create: `src/components/ResolutionView.tsx`
- Create: `src/components/StatusBadge.tsx`
- Test: `src/components/primaryFlow.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: typed cases, draft, Resource, EvidenceGateResult
- Produces callbacks: `onSelectCase`, `onSubmitDraft`, `onContinue`, `onBack`

- [ ] **Step 1: Write failing user-visible flow tests**

```tsx
async function reachResolutionScreen() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }));
  await user.click(screen.getByRole('button', { name: '자원 정보 분석' }));
}

it('starts the official Hyundai PBT case from the primary action', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }));
  expect(screen.getByRole('heading', { name: '공정부산물 정보' })).toBeInTheDocument();
  expect(screen.getByDisplayValue('PBT 외장 불량품')).toBeInTheDocument();
  expect(screen.getAllByText('Official Source').length).toBeGreaterThan(0);
});

it('shows provenance and validation as separate labels after resolution', async () => {
  await reachResolutionScreen();
  expect(screen.getAllByText('Official Source').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
  expect(screen.getAllByText('AI Inference').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Inferred').length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/components/primaryFlow.test.tsx`  
Expected: FAIL because the screens do not exist.

- [ ] **Step 3: Implement Home / Case Library**

Render the PBT case as the single primary button, IC-Tray and Wafer Carrier as secondary case actions, and direct input as a quiet tertiary action. Each official case displays `한국환경공단 순환자원정보센터 공개자료 기반` and an external source link with an accessible name.

```tsx
export function CaseLibrary({ cases, onSelectCase, onDirectInput }: CaseLibraryProps) {
  const primary = cases.find((item) => item.id === 'hyundai-pbt');
  const secondary = cases.filter((item) => item.id !== 'hyundai-pbt');
  return (
    <section aria-labelledby="case-library-title">
      <h1 id="case-library-title">실제 공개사례로 시작하기</h1>
      {primary && <button className="button-primary" onClick={() => onSelectCase(primary.id)}>현대모비스 진천 PBT 사례 분석</button>}
      <p>한국환경공단 순환자원정보센터 공개자료 기반</p>
      <div>{secondary.map((item) => <button key={item.id} onClick={() => onSelectCase(item.id)}>{item.name}</button>)}</div>
      <button className="button-text" onClick={onDirectInput}>직접 입력</button>
    </section>
  );
}
```

- [ ] **Step 4: Implement incomplete-input-friendly Resource Form**

Use persistent labels and explicit `모름` options. Do not block submission for unknown form, contamination, or buyer validation. Preserve values on validation errors. Use one primary action: `자원 정보 분석`.

```tsx
<form onSubmit={handleSubmit} noValidate>
  <label htmlFor="resource-name">현장명</label>
  <input id="resource-name" name="name" value={draft.name} onChange={onChange} required />
  <label htmlFor="resource-form">형태</label>
  <select id="resource-form" name="form" value={draft.form} onChange={onChange}>
    <option value="unknown">모름</option>
    <option value="molded_part">성형부품</option>
    <option value="ground">분쇄품</option>
    <option value="compressed">압축품</option>
  </select>
  <label htmlFor="contaminants">오염·이물 정보</label>
  <input id="contaminants" name="contaminants" value={draft.contaminants} onChange={onChange} />
  <button type="submit">자원 정보 분석</button>
</form>
```

- [ ] **Step 5: Implement Resource Resolution + Evidence Gate**

Present Administrative, Material, and Process Identity first. For every field render provenance and validation separately through `StatusBadge`; badges include visible text, not color alone. Show Gate missing fields only from `evaluateEvidenceGate`, not from routes.

```tsx
const identityRows = [
  ['행정상 분류', resource.administrativeIdentity],
  ['실제 재질', resource.materialIdentity],
  ['발생공정', resource.processIdentity],
] as const;

return (
  <section aria-labelledby="resolution-title">
    <h1 id="resolution-title">자원 정체성 확인</h1>
    <dl>{identityRows.map(([label, sourced]) => (
      <div key={label}>
        <dt>{label}</dt><dd>{formatValue(sourced.value)}</dd>
        <StatusBadge kind="provenance" value={sourced.provenance} />
        <StatusBadge kind="validation" value={sourced.validationState} />
      </div>
    ))}</dl>
    <p>{gateCopy[gate.status]}</p>
    <ul>{gate.missingFields.map((field) => <li key={field}>{resourceFieldCopy[field]}</li>)}</ul>
    <button onClick={onContinue}>검증된 경로 확인</button>
  </section>
);
```

- [ ] **Step 6: Verify GREEN, keyboard order, and mobile reflow**

Run:

```bash
npm run test:run -- src/components/primaryFlow.test.tsx
npm run typecheck
```

Then start `npm run dev`, inspect at 390×844 and 1280×800, and confirm the case button, form fields, back action, and continue action have visible keyboard focus and no horizontal page scroll.

- [ ] **Step 7: Commit**

```bash
git add src/components src/App.tsx src/styles
git commit -m "feat: add resource resolution screens"
```

## Task 10: Build Route Decision, Report, and Synthetic Freshness Demo

**Files:**
- Create: `src/components/RouteDecisionView.tsx`
- Create: `src/components/DecisionReport.tsx`
- Create: `src/components/FreshnessDemo.tsx`
- Test: `src/components/decisionViews.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `RouteQualification[]`, `DecisionReportModel`, `DecisionMemory`
- Produces callbacks: `onOpenReport`, `onChangeSyntheticQuantity`

- [ ] **Step 1: Write failing decision-view tests**

```tsx
const pbtQualificationWithQualityUnknown = qualifyRoute(
  pbtResource({ qualitySpecification: unknownValue('') }),
  pbtRecoveryRoute,
  evidenceRecords,
);

function FreshnessHarness() {
  const [quantity, setQuantity] = useState(4);
  const resource = pbtResource({ monthlyQuantityTon: confirmedValue(quantity) });
  return <FreshnessDemo memory={quantityReopenMemory} resource={resource} onQuantityChange={setQuantity} />;
}

it('shows route conditions and dynamically derived missing evidence without scores', () => {
  render(<RouteDecisionView qualifications={[pbtQualificationWithQualityUnknown]} onOpenReport={() => undefined} />);
  expect(screen.getByText('재활용업체 수용조건 확인')).toBeInTheDocument();
  expect(screen.getByText('Qualification Required')).toBeInTheDocument();
  expect(screen.queryByText(/\d+점|\d+%/)).not.toBeInTheDocument();
});

it('labels the reopen demonstration as synthetic', () => {
  render(<FreshnessDemo memory={quantityReopenMemory} resource={pbtResource()} onQuantityChange={() => undefined} />);
  expect(screen.getByText('Synthetic Demo Scenario')).toBeInTheDocument();
  expect(screen.getByText('Conditional Reopen 기능 시연용 가상 시나리오')).toBeInTheDocument();
});

it('shows stale after the synthetic quantity changes from 4t to 12t', async () => {
  const user = userEvent.setup();
  render(<FreshnessHarness />);
  await user.clear(screen.getByLabelText('현재 월 발생량'));
  await user.type(screen.getByLabelText('현재 월 발생량'), '12');
  expect(screen.getByText('Decision Stale → 재검토 필요')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:run -- src/components/decisionViews.test.tsx`  
Expected: FAIL because the decision views are missing.

- [ ] **Step 3: Implement Route Decision without a ranking score**

Use a comparison table on desktop and one semantic route section per candidate on narrow screens. Show Decision, current/historical evidence, met conditions, and unknown required conditions. A disclosure control may reveal detailed conditions, but all status text remains keyboard accessible.

```tsx
const conditionResultCopy: Record<ConditionResult, string> = {
  met: '충족',
  not_met: '불충족',
  unknown: '확인 필요',
  not_applicable: '해당 없음',
};

export function RouteDecisionView({ qualifications, onOpenReport }: RouteDecisionViewProps) {
  return (
    <section aria-labelledby="route-title">
      <h1 id="route-title">검증된 Route 비교</h1>
      <div className="route-list">{qualifications.map((item) => (
        <article key={item.route.id} className="route-item">
          <h2>{item.route.name}</h2>
          <StatusBadge kind="decision" value={item.decision} />
          <h3>추가 확인</h3>
          {item.missingEvidence.length
            ? <ul>{item.missingEvidence.map((missing) => <li key={missing.conditionId}>{missing.label}</li>)}</ul>
            : <p>현재 Route 조건에서 추가 확인사항이 없습니다.</p>}
          <details><summary>조건과 근거 보기</summary>
            <ul>{item.conditions.map(({ condition, result }) => <li key={condition.id}>{condition.label}: {conditionResultCopy[result]}</li>)}</ul>
            <ul>{item.currentEvidence.map((evidence) => <li key={evidence.id}><a href={evidence.sourceUrl}>{evidence.title}</a></li>)}</ul>
          </details>
        </article>
      ))}</div>
      <button onClick={onOpenReport}>의사결정 보고서 보기</button>
    </section>
  );
}
```

- [ ] **Step 4: Implement Decision Report**

Render `현재 판단`, `왜`, `아직 모르는 것`, `다음 행동`, `근거` in that order. Each source shows title, evidence type, observed date, status, and external link. If `marketReference` is absent, show the explicit no-market-evidence notice; never render an empty price shell.

```tsx
export function DecisionReport({ report }: { report: DecisionReportModel }) {
  return (
    <article aria-labelledby="report-title">
      <h1 id="report-title">의사결정 보고서</h1>
      <section><h2>현재 판단</h2><p>{report.currentDecision}</p></section>
      <section><h2>왜</h2><ul>{report.currentReasons.map(({ condition }) => <li key={condition.id}>{condition.label}</li>)}</ul></section>
      <section><h2>아직 모르는 것</h2><ul>{report.unknowns.map((item) => <li key={item.conditionId}>{item.label}</li>)}</ul></section>
      <section><h2>다음 행동</h2><ol>{report.nextActions.map((action) => <li key={action}>{action}</li>)}</ol></section>
      <section><h2>근거</h2><ul>{report.currentSources.map((source) => <li key={source.id}><a href={source.sourceUrl}>{source.title}</a> · {source.observedAt}</li>)}</ul></section>
      {report.marketReference
        ? <p>{marketKindCopy[report.marketReference.marketKind!]} · <a href={report.marketReference.sourceUrl}>{report.marketReference.title}</a></p>
        : <p>{report.marketNotice}</p>}
    </article>
  );
}
```

- [ ] **Step 5: Implement the isolated synthetic Freshness demonstration**

Place it after the main report under `Conditional Reopen 기능 데모`. Keep the synthetic label visible at all times. Show past rejection, 4t snapshot, current quantity, reopen threshold, and freshness result. Do not attach an official company logo or official-source badge to this scenario.

```tsx
export function FreshnessDemo({ memory, resource, onQuantityChange }: FreshnessDemoProps) {
  const freshness = evaluateDecisionFreshness(memory, resource);
  return (
    <aside aria-labelledby="freshness-title">
      <p className="synthetic-label">Synthetic Demo Scenario</p>
      <h2 id="freshness-title">Conditional Reopen 기능 시연용 가상 시나리오</h2>
      <p>과거 판단: 월 물량 부족으로 제외</p>
      <p>과거 물량: 월 {String(memory.evidenceSnapshot.monthlyQuantityTon)}t</p>
      <label htmlFor="current-quantity">현재 월 발생량</label>
      <input id="current-quantity" type="number" value={resource.monthlyQuantityTon.value ?? ''} onChange={(event) => onQuantityChange(Number(event.target.value))} />
      <p>{freshness.status === 'stale' ? 'Decision Stale → 재검토 필요' : '기존 판단 유지'}</p>
    </aside>
  );
}
```

- [ ] **Step 6: Verify GREEN and interaction states**

Run:

```bash
npm run test:run -- src/components/decisionViews.test.tsx
npm run typecheck
npm run build
```

Inspect focus-visible, disabled/loading behavior during resolution, source-link names, 200% text zoom, reduced motion, and 390px/1280px layouts.

- [ ] **Step 7: Commit**

```bash
git add src/components src/App.tsx src/styles
git commit -m "feat: present route decisions and freshness"
```

## Task 11: Verify the Full Judging Flow and Document the Demo

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/pbt-flow.spec.ts`
- Create: `e2e/responsive.spec.ts`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces script: `test:e2e`
- Produces a reproducible three-minute demo sequence

- [ ] **Step 1: Install Playwright and write the failing primary-flow test**

Run:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create `e2e/pbt-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('completes the evidence-based PBT decision flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }).click();
  await page.getByRole('button', { name: '자원 정보 분석' }).click();
  await expect(page.getByRole('heading', { name: '자원 정체성 확인' })).toBeVisible();
  await page.getByRole('button', { name: '검증된 경로 확인' }).click();
  await expect(page.getByText('Qualification Required')).toBeVisible();
  await page.getByRole('button', { name: '의사결정 보고서 보기' }).click();
  await expect(page.getByRole('heading', { name: '의사결정 보고서' })).toBeVisible();
  await expect(page.getByText('Official Source').first()).toBeVisible();
  await expect(page.getByText(/\d+점|\d+%/)).toHaveCount(0);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm run test:e2e -- e2e/pbt-flow.spec.ts`  
Expected: FAIL until the final accessible names and complete flow match the contract.

- [ ] **Step 3: Align the UI contract and make the primary flow pass**

Fix product code rather than weakening the test. Keep the exact accessible names from the judging script and ensure no step requires network access.

- [ ] **Step 4: Add responsive and overflow checks**

Create `e2e/responsive.spec.ts` with 390×844 and 1280×800 projects. Assert `document.documentElement.scrollWidth <= window.innerWidth`, all primary actions are visible, route content reflows at 390px, and the synthetic label remains visible.

- [ ] **Step 5: Replace README with setup and evidence disclaimers**

Document:

```text
npm install
npm run dev
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

Include the five-step demo script, exact official-source URLs, `observedAt: 2026-08-18`, the distinction between official facts and synthetic demo data, the no-score/no-unsupported-price guardrails, and the optional remote resolver endpoint behavior.

- [ ] **Step 6: Run the complete verification suite**

Run:

```bash
npm run test:run
npm run typecheck
npm run build
npm run test:e2e
```

Expected: all commands exit 0; test output has no React `act` warnings, unhandled rejections, or accessibility-name failures.

- [ ] **Step 7: Perform the manual judging rehearsal**

At 1280×800, start from a clean localStorage state and time the PBT flow. Expected: report reached within three minutes, every conclusion has a source or an explicit unknown state, expired evidence is historical, and no network request is required. Repeat at 390×844 and verify no horizontal overflow or obscured action.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e README.md
git commit -m "test: verify the complete judging flow"
```

## Final Verification Record

Before calling the MVP complete, record the following in the handoff:

- Unit and component test command with pass count
- Typecheck result
- Production build result and output path
- Playwright desktop/mobile result
- Routes and exact UI states manually inspected
- Keyboard path and focus-visible checks
- 390×844 and 1280×800 overflow results
- Which behavior used official seed data, synthetic data, deterministic resolution, or a remote service
- Remaining items deliberately outside the approved MVP scope
