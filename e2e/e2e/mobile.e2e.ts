import { expect, test } from '@playwright/test';

test.describe('Mobile responsive layout', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 15-ish
  });

  test('no horizontal scroll and header/sidebar behave correctly', async ({ page }) => {
    await page.goto('/');

    // Ensure there is no horizontal scroll (scrollWidth == clientWidth)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Header buttons should be visible
    await expect(page.getByRole('button', { name: /toggle sidebar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /share/i })).toBeVisible();

    // Open sidebar via hamburger
    await page.getByRole('button', { name: /toggle sidebar/i }).click();

    // Sidebar should be present and cover part of the screen
    const sidebarVisible = await page.locator('.sidebar-wrapper.open').isVisible();
    expect(sidebarVisible).toBe(true);
  });
});

