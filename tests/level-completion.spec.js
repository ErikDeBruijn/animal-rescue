// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5050';

test.describe('Level Completion', () => {
  test('should allow space key to complete level and go to map', async ({ page }) => {

    // Navigate to level 1
    await page.goto(`${BASE_URL}/index.html#level=1`);

    // Wait for the game to load
    await page.waitForLoadState('networkidle');

    // Wait for game to be fully initialized (wait for player1 to exist)
    await page.waitForFunction(() => {
      return window.gameCore && window.player1;
    }, { timeout: 10000 });

    await page.waitForTimeout(500); // Give game loop time to start

    // Set the level as completed by executing JavaScript
    // This simulates completing a level
    await page.evaluate(() => {
      window.gameCore.levelCompleted = true;
      window.gameCore.gameState.message = "Level voltooid! Druk op spatie om naar de kaart te gaan.";
    });

    // Wait for the completion message to appear
    await page.waitForTimeout(500);

    // Verify the completion message is showing
    const completionVisible = await page.evaluate(() => {
      return window.gameCore.levelCompleted === true;
    });
    expect(completionVisible).toBe(true);

    // Set up navigation promise before pressing space
    const navigationPromise = page.waitForURL('**/map.html', { timeout: 5000 });

    // Press space to go to map
    await page.keyboard.press('Space');

    // Wait for navigation to map.html
    await navigationPromise;

    // Verify we're on the map page
    expect(page.url()).toContain('map.html');
  });

  test('should not navigate to map when cat uses claw ability with space', async ({ page }) => {

    // Navigate to level 1 (which allows cat)
    await page.goto(`${BASE_URL}/index.html#level=1`);

    // Wait for the game to load
    await page.waitForLoadState('networkidle');

    // Wait for game to be fully initialized
    await page.waitForFunction(() => {
      return window.gameCore && window.player1;
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Ensure we're playing as cat and set level as completed
    await page.evaluate(() => {
      // Make sure player is a cat
      if (window.player1 && window.player1.animalType !== 'CAT') {
        // Switch to cat
        window.player1.switchAnimal('CAT');
      }

      // Mark level as completed
      window.gameCore.levelCompleted = true;
      window.gameCore.gameState.message = "Level voltooid! Druk op spatie om naar de kaart te gaan.";

      // Reset claw ability to ensure it can be activated
      window.player1.canClaw = true;
      window.player1.clawActive = false;
      window.player1.clawTimer = 0;
    });

    await page.waitForTimeout(500);

    // Get initial URL
    const initialUrl = page.url();

    // Press space - this should activate cat claw ability
    // but should STILL navigate to map because level is completed
    await page.keyboard.press('Space');

    // Wait a short moment for any immediate reactions
    await page.waitForTimeout(500);

    // Check if claw was activated
    const clawActivated = await page.evaluate(() => {
      return window.player1.clawActive === true || window.player1.spaceKeyWasDown === true;
    });

    // The claw might have been activated, but we should still navigate
    // Wait for navigation or timeout
    try {
      await page.waitForURL('**/map.html', { timeout: 2000 });
      // Navigation happened - this is correct behavior
      expect(page.url()).toContain('map.html');
    } catch (e) {
      // Navigation didn't happen - this is the bug!
      // The space key was consumed by claw ability instead of level completion
      throw new Error('BUG DETECTED: Space key did not navigate to map.html when level was completed. Cat claw ability may have intercepted the key press.');
    }
  });

  test('should prioritize level completion over cat claw ability', async ({ page }) => {

    // Navigate to level 1
    await page.goto(`${BASE_URL}/index.html#level=1`);

    // Wait for the game to load
    await page.waitForLoadState('networkidle');

    // Wait for game to be fully initialized
    await page.waitForFunction(() => {
      return window.gameCore && window.player1;
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Setup: Cat player with completed level
    await page.evaluate(() => {
      // Switch to cat
      if (window.player1) {
        window.player1.switchAnimal('CAT');
      }

      // Mark level as completed
      window.gameCore.levelCompleted = true;

      // Ensure claw is ready
      window.player1.canClaw = true;
      window.player1.clawActive = false;
      window.player1.clawTimer = 0;
    });

    await page.waitForTimeout(300);

    // Press space - level completion should take priority
    const navigationPromise = page.waitForURL('**/map.html', { timeout: 3000 });
    await page.keyboard.press('Space');

    // Should navigate to map
    await navigationPromise;
    expect(page.url()).toContain('map.html');
  });
});
