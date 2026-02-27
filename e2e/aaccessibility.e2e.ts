import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('main page has no serious/critical axe violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Fail test if serious/critical issues exist (clear output)
  const seriousOrCritical = results.violations.filter(v =>
    v.impact === 'serious' || v.impact === 'critical'
  );

  expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
});