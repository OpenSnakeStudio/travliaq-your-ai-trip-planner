import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Budget Override Protection (BUG #6)
 *
 * Tests that manually modified budgets are protected from auto-propagation
 * Bug: No userModifiedBudget flag existed
 * Fix: Added userModifiedBudget flag to AccommodationEntry interface
 */

test.describe('Budget Override Protection', () => {
  test('should protect manually modified budget from chat updates', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User manually sets Tokyo to premium
    await page.selectAccommodation('Tokyo');
    await page.selectBudgetPreset('premium');

    // Chat tries to set all to eco
    await page.sendChatMessage('Find cheap accommodations everywhere');
    await page.waitForChatResponse();

    // Verify Tokyo still premium (protected)
    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    const paris = accommodations.find(a => a.city === 'Paris');
    const bangkok = accommodations.find(a => a.city === 'Bangkok');

    expect(tokyo?.budgetPreset).toBe('premium'); // ✅ Protected
    expect(tokyo?.userModifiedBudget).toBe(true);

    // Others should change to eco
    expect(paris?.budgetPreset).toBe('eco'); // ✅ Changed
    expect(bangkok?.budgetPreset).toBe('eco'); // ✅ Changed
  });

  test('should mark budget as user-modified when set via widget', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    await page.setupMultiDestination(['Paris', 'Tokyo']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User sets budget manually
    await page.selectAccommodation('Paris');
    await page.selectBudgetPreset('eco');

    // Verify flag is set
    const accomMemory = await page.memory.getAccommodationMemory();
    const paris = accomMemory.accommodations.find((a: any) => a.city === 'Paris');
    expect(paris.userModifiedBudget).toBe(true);
  });

  test('should mark custom budget as user-modified', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    await page.selectDestination('London');
    await page.switchToStays();
    await page.setCustomBudget(120, 300);

    // Verify userModifiedBudget flag
    const accomMemory = await page.memory.getAccommodationMemory();
    const london = accomMemory.accommodations[0];
    expect(london.userModifiedBudget).toBe(true);
    expect(london.budgetPreset).toBe('custom');
  });

  test('should allow chat to override if user explicitly targets city', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();

    // User sets Tokyo to premium manually
    await page.selectAccommodation('Tokyo');
    await page.selectBudgetPreset('premium');

    // User explicitly asks chat to change Tokyo
    await page.sendChatMessage('Change Tokyo to eco budget');
    await page.waitForChatResponse();

    // Tokyo should change (explicit override)
    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.budgetPreset).toBe('eco'); // ✅ Explicitly overridden
  });

  test('should preserve userModifiedBudget across tab switches', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    await page.selectDestination('Paris');
    await page.switchToStays();
    await page.selectBudgetPreset('premium');

    // Switch tabs multiple times
    await page.switchToFlights();
    await page.wait(200);
    await page.switchToActivities();
    await page.wait(200);
    await page.switchToStays();

    // Flag should persist
    const accomMemory = await page.memory.getAccommodationMemory();
    const paris = accomMemory.accommodations[0];
    expect(paris.userModifiedBudget).toBe(true);
    expect(paris.budgetPreset).toBe('premium');
  });

  test('should preserve protection across trip type changes', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Multi-destination with manual budget
    await page.setupMultiDestination(['Paris', 'Tokyo']);
    await page.switchToStays();
    await page.selectAccommodation('Tokyo');
    await page.selectBudgetPreset('premium');

    // Switch to roundtrip (Tokyo removed)
    await page.switchToFlights();
    await page.selectTripType('roundtrip');

    // Switch back to multi (Tokyo re-added)
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Tokyo again');
    await page.waitForFlightProcessing();

    // New Tokyo should inherit default budget (not protected anymore - it's a new accommodation)
    await page.switchToStays();
    const accommodations = await page.getAllAccommodations();
    const newTokyo = accommodations.find(a => a.city === 'Tokyo');

    // New accommodation shouldn't have userModifiedBudget flag yet
    expect(newTokyo?.userModifiedBudget).toBeUndefined();
  });

  test('should handle mixed protected and unprotected budgets', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup 3 destinations
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();

    // User modifies Paris only
    await page.selectAccommodation('Paris');
    await page.selectBudgetPreset('eco');

    // Global budget change via default
    await page.setDefaultBudget('premium');

    // Add new destination
    await page.switchToFlights();
    await page.sendChatMessage('Add Singapore');
    await page.waitForFlightProcessing();

    // Verify results
    await page.switchToStays();
    const accommodations = await page.getAllAccommodations();

    const paris = accommodations.find(a => a.city === 'Paris');
    const singapore = accommodations.find(a => a.city === 'Singapore');

    expect(paris?.budgetPreset).toBe('eco'); // ✅ Protected (user-modified)
    expect(singapore?.budgetPreset).toBe('premium'); // ✅ New default
  });
});
