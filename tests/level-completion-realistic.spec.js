// @ts-check
import { test, expect } from '@playwright/test';
import { BASE_URL } from './test-config.js';

test.describe('Level Completion - Realistic Scenario', () => {
  test('should complete level and navigate to map when all collectibles are collected', async ({ page }) => {
    // Navigate to the game
    await page.goto(`${BASE_URL}/index.html`);

    // Close intro screen if it appears
    await page.waitForSelector('.close-intro', { timeout: 5000 }).catch(() => {});
    const closeButton = await page.$('.close-intro');
    if (closeButton) {
      await closeButton.click();
    }

    // Wait for game to be fully initialized
    await page.waitForFunction(() => {
      return window.gameCore && window.player1 && window.player2;
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Get initial game state
    const initialState = await page.evaluate(() => {
      return {
        levelIndex: window.gameCore.currentLevelIndex,
        collectibles: window.gameCore.currentLevel.collectibles.map(c => ({
          type: c.type,
          x: c.x,
          y: c.y
        })),
        puppy: window.gameCore.currentLevel.puppy ? {
          x: window.gameCore.currentLevel.puppy.x,
          y: window.gameCore.currentLevel.puppy.y
        } : null
      };
    });

    console.log('Initial state:', initialState);

    // Simulate collecting all collectibles in order
    // First collect PEPPER and HOURGLASS (can be collected before puppy)
    // Then rescue puppy
    // Then collect DOGFOOD and STAR
    await page.evaluate(() => {
      const collectibles = window.gameCore.currentLevel.collectibles;
      const puppy = window.gameCore.currentLevel.puppy;

      // Helper function to move player to position and trigger collision
      function collectItem(player, item) {
        player.x = item.x;
        player.y = item.y;
        // Trigger update to detect collision
        player.update(null, [], [], collectibles);
      }

      // Step 1: Collect PEPPER (can be collected anytime)
      const pepper = collectibles.find(c => c.type === 'PEPPER');
      if (pepper) {
        console.log('Collecting PEPPER at', pepper.x, pepper.y);
        collectItem(window.player1, pepper);
      }

      // Step 2: Collect HOURGLASS (can be collected anytime)
      const hourglass = collectibles.find(c => c.type === 'HOURGLASS');
      if (hourglass) {
        console.log('Collecting HOURGLASS at', hourglass.x, hourglass.y);
        collectItem(window.player1, hourglass);
      }

      // Step 3: Rescue puppy
      if (puppy) {
        console.log('Rescuing puppy at', puppy.x, puppy.y);
        collectItem(window.player1, puppy);
      }

      // Wait a frame to ensure puppy is marked as saved
      return new Promise(resolve => {
        setTimeout(() => {
          // Step 4: Collect DOGFOOD (can be collected after puppy)
          const dogfoods = collectibles.filter(c => c.type === 'DOGFOOD');
          dogfoods.forEach(dogfood => {
            console.log('Collecting DOGFOOD at', dogfood.x, dogfood.y);
            collectItem(window.player1, dogfood);
          });

          // Step 5: Collect STAR (must be collected after puppy)
          const star = collectibles.find(c => c.type === 'STAR');
          if (star) {
            console.log('Collecting STAR at', star.x, star.y);
            collectItem(window.player1, star);
          }

          resolve();
        }, 100);
      });
    });

    // Wait for game loop to process the collections
    await page.waitForTimeout(1000);

    // Check if level is completed
    const completionState = await page.evaluate(() => {
      return {
        levelCompleted: window.gameCore.levelCompleted,
        message: window.gameCore.gameState.message,
        collectiblesRemaining: window.gameCore.currentLevel.collectibles.length,
        puppySaved: window.gameCore.gameState.puppySaved
      };
    });

    console.log('Completion state:', completionState);

    // Verify level is completed
    expect(completionState.levelCompleted).toBe(true);
    expect(completionState.collectiblesRemaining).toBe(0);
    expect(completionState.puppySaved).toBe(true);
    expect(completionState.message).toContain('Level voltooid');

    // Now test that space key works to navigate to map
    // Set up navigation promise
    const navigationPromise = page.waitForURL('**/map.html', { timeout: 3000 });

    // Press space
    await page.keyboard.press('Space');

    // Wait for navigation
    await navigationPromise;

    // Verify we're on the map page
    expect(page.url()).toContain('map.html');
  });

  test('should not allow level completion if collectibles remain', async ({ page }) => {
    // Navigate to the game
    await page.goto(`${BASE_URL}/index.html`);

    // Close intro screen if it appears
    await page.waitForSelector('.close-intro', { timeout: 5000 }).catch(() => {});
    const closeButton = await page.$('.close-intro');
    if (closeButton) {
      await closeButton.click();
    }

    // Wait for game to be fully initialized
    await page.waitForFunction(() => {
      return window.gameCore && window.player1;
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Collect only some collectibles (not all)
    await page.evaluate(() => {
      const collectibles = window.gameCore.currentLevel.collectibles;
      const puppy = window.gameCore.currentLevel.puppy;

      // Helper function
      function collectItem(player, item) {
        player.x = item.x;
        player.y = item.y;
        player.update(null, [], [], collectibles);
      }

      // Collect only PEPPER and rescue puppy, but leave other collectibles
      const pepper = collectibles.find(c => c.type === 'PEPPER');
      if (pepper) {
        collectItem(window.player1, pepper);
      }

      if (puppy) {
        collectItem(window.player1, puppy);
      }
    });

    await page.waitForTimeout(500);

    // Check state
    const state = await page.evaluate(() => {
      return {
        levelCompleted: window.gameCore.levelCompleted,
        collectiblesRemaining: window.gameCore.currentLevel.collectibles.length
      };
    });

    // Level should NOT be completed
    expect(state.levelCompleted).toBe(false);
    expect(state.collectiblesRemaining).toBeGreaterThan(0);
  });
});
