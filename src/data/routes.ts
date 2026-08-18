import type { RouteDefinition } from '../domain/model';
import { SOURCE_IDS } from './evidence';

export const routeLibrary: RouteDefinition[] = [
  {
    id: 'pbt-material-recovery',
    name: 'PBT 재생원료화 검토',
    description: '공식 등록자료에서 요청된 원료 제조(재활용) 경로를 현재 조건으로 다시 검토합니다.',
    kind: 'candidate',
    materialKeys: ['PBT'],
    conditions: [
      {
        id: 'pbt-material-confirmed',
        label: 'PBT 재질 확인',
        field: 'materialIdentity',
        operator: 'includes',
        expected: 'PBT',
        required: true,
        basis: 'official_evidence',
        evidenceId: SOURCE_IDS.hyundaiPbt,
      },
      {
        id: 'pbt-quality-specification',
        label: '재활용업체 수용규격 확인',
        field: 'qualitySpecification',
        operator: 'known',
        expected: true,
        required: true,
        basis: 'system_validation',
        evidenceId: null,
      },
    ],
    evidenceIds: [SOURCE_IDS.hyundaiPbt],
  },
  {
    id: 'current-incineration',
    name: '현재 일반소각',
    description: '공개사례에서 확인된 현재 처리방식을 비교 기준선으로 유지합니다.',
    kind: 'baseline',
    materialKeys: ['PBT'],
    conditions: [],
    evidenceIds: [SOURCE_IDS.hyundaiPbt],
  },
  {
    id: 'wafer-carrier-r44',
    name: 'Wafer Carrier 합성수지 제품 제조',
    description: '공식 인정된 PC·PBT·POM 복합재질의 R-4-4 경로입니다.',
    kind: 'candidate',
    materialKeys: ['PC', 'PBT', 'POM'],
    conditions: [
      {
        id: 'wafer-composition-confirmed',
        label: 'PC·PBT·POM 복합재질 확인',
        field: 'qualitySpecification',
        operator: 'known',
        expected: true,
        required: true,
        basis: 'official_evidence',
        evidenceId: SOURCE_IDS.skWaferCarrier,
      },
    ],
    evidenceIds: [SOURCE_IDS.skWaferCarrier],
  },
  {
    id: 'pp-expired-precedent',
    name: 'PP 부산물 과거 인정경로',
    description: '기간이 만료된 사례로 현재 선례가 아닌 역사적 근거로만 표시합니다.',
    kind: 'candidate',
    materialKeys: ['PP'],
    conditions: [
      {
        id: 'pp-material-confirmed',
        label: 'PP 재질 확인',
        field: 'materialIdentity',
        operator: 'includes',
        expected: 'PP',
        required: true,
        basis: 'official_evidence',
        evidenceId: SOURCE_IDS.dongwonExpired,
      },
    ],
    evidenceIds: [SOURCE_IDS.dongwonExpired],
  },
];
