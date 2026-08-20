import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
}

test('primary actions and report reflow without horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/re-value/');
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' })).toBeVisible();

  await page.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' }).click();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: '자원 정보 분석' }).click();
  await page.getByRole('button', { name: '검증된 경로 확인' }).click();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: '의사결정 보고서 보기' }).click();

  await expect(page.getByText('Synthetic Demo Scenario')).toBeVisible();
  await expect(page.getByLabel('현재 월 발생량')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('report.png'), fullPage: true });
});

test('keyboard focus is visible and 200% text does not create horizontal overflow', async ({ page }) => {
  await page.goto('/re-value/');
  await page.keyboard.press('Tab');
  const primaryAction = page.getByRole('button', { name: '현대모비스 진천 PBT 사례 분석' });
  await expect(primaryAction).toBeFocused();
  const focusStyle = await primaryAction.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle.outlineStyle).toBe('solid');
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(primaryAction).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
