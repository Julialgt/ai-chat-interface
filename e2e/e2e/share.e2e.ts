import { expect, test } from '@playwright/test';

test('Share flow opens and closes the share modal', async ({ page }) => {
  await page.goto('/');

  const shareButton = page.getByRole('button', { name: /share/i });
  await expect(shareButton).toBeVisible();

  await shareButton.click();

  const dialog = page.getByRole('dialog', { name: /share chat/i });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).toBeHidden();
});

