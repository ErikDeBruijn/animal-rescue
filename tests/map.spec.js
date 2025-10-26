// @ts-check
import { test, expect } from '@playwright/test';
import { BASE_URL } from './test-config.js';

test.describe('World Map', () => {
  test('should open and close help popup', async ({ page }) => {
    // Navigate to map page
    await page.goto(`${BASE_URL}/map.html`);

    // Verify help button exists
    const helpButton = page.getByRole('button', { name: '❓' });
    await expect(helpButton).toBeVisible();

    // Click help button to open popup
    await helpButton.click();

    // Verify popup is visible with correct content
    const popup = page.locator('#instructions-popup');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Wereldkaart Instructies');
    await expect(popup).toContainText('Welkom bij de Wereldkaart!');

    // Click close button (X)
    const closeButton = page.locator('.close-popup');
    await closeButton.click();

    // Verify popup is hidden
    await expect(popup).toBeHidden();
  });
});
