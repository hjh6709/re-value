import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAnalysis } from './useAnalysis';

describe('useAnalysis', () => {
  it('orchestrates resolve, gate, route qualification, and report in order', async () => {
    const { result } = renderHook(() => useAnalysis());

    act(() => result.current.selectCase('hyundai-pbt'));
    await act(async () => result.current.analyzeResource());
    expect(result.current.state.step).toBe('resolution');
    expect(result.current.state.resource?.materialIdentity.value).toEqual(['PBT']);

    act(() => result.current.reviewRoutes());
    expect(result.current.state.step).toBe('route_decision');
    expect(result.current.state.qualifications.map((item) => item.route.id)).toEqual([
      'pbt-material-recovery',
      'current-incineration',
    ]);

    act(() => result.current.openReport());
    expect(result.current.state.step).toBe('decision_report');
    expect(result.current.state.report?.currentDecision).toContain('추가 자격 확인 필요');
  });
});
