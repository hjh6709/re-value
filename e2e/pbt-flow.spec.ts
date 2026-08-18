import { expect, test } from '@playwright/test';

test('completes the evidence-based PBT decision flow offline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }).click();
  await expect(page.getByLabel('현장 자원명')).toHaveValue('PBT 외장 플라스틱');
  await page.getByRole('button', { name: '자원 정보 분석' }).click();
  await expect(page.getByRole('heading', { name: '자원 정체성 확인' })).toBeVisible();
  await expect(page.getByText('Official Source').first()).toBeVisible();

  await page.getByRole('button', { name: '검증된 경로 확인' }).click();
  await expect(page.getByText('Qualification Required')).toBeVisible();
  await expect(page.getByText('재활용업체 수용규격 확인').first()).toBeVisible();
  await page.getByRole('button', { name: '의사결정 보고서 보기' }).click();

  await expect(page.getByRole('heading', { name: '의사결정 보고서' })).toBeVisible();
  await expect(page.getByText('PBT 재생원료화 검토 · 추가 자격 확인 필요')).toBeVisible();
  await expect(page.getByText('Historical').first()).toBeVisible();
  await expect(page.getByText('확인 가능한 공식 시장근거가 없습니다.')).toBeVisible();
  await expect(page.getByText('Synthetic Demo Scenario')).toBeVisible();
  await expect(page.getByText(/\d+점|\d+%/)).toHaveCount(0);

  await page.getByLabel('현재 월 발생량').fill('12');
  await expect(page.getByText('Decision Stale → 재검토 필요')).toBeVisible();
});
