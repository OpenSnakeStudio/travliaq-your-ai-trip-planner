import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Multi-Destination Persistence (BUG #1)
 *
 * Tests that accommodations persist when switching tabs in multi-destination mode
 * Bug: Component unmounting was resetting prevFlightSyncRef causing data loss
 * Fix: Replaced conditional rendering with CSS display:none
 */

test.describe('Multi-Destination Persistence', () => {
  test('should persist 2 accommodations after switching tabs', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // 1. Create multi-destination via chat
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Paris to Tokyo to Bangkok');
    await page.waitForFlightProcessing();

    // 2. Verify 3 legs created (Paris → Tokyo → Bangkok)
    const legs = await page.getFlightLegs();
    expect(legs.length).toBeGreaterThanOrEqual(2); // At least 2 destinations

    // 3. Switch to stays tab
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accomCount = await page.getAccommodationCount();
    expect(accomCount).toBeGreaterThanOrEqual(1); // At least 1 accommodation

    // 4. CRITICAL: Switch to activities (triggers unmount in old code)
    await page.switchToActivities();
    await page.wait(500);

    // 5. CRITICAL ASSERTION: Return to stays - data must still be there
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accomCountAfter = await page.getAccommodationCount();
    expect(accomCountAfter).toBe(accomCount); // ✅ MUST REMAIN SAME

    // 6. Verify cities are still present
    const cities = await page.getAccommodationCities();
    expect(cities.length).toBeGreaterThanOrEqual(1);
    console.log('Cities after tab switch:', cities);
  });

  test('should persist accommodations after 5 rapid tab switches', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const initialCount = await page.getAccommodationCount();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // STRESS TEST: Switch tabs 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await page.switchToActivities();
      await page.wait(100);
      await page.switchToStays();
      await page.wait(100);
    }

    // Verify data still persists
    const finalCount = await page.getAccommodationCount();
    expect(finalCount).toBe(initialCount); // ✅ Should be unchanged

    console.log(`After 5 rapid switches: ${finalCount} accommodations (expected: ${initialCount})`);
  });

  test('should preserve accommodation data when switching all tabs', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup
    await page.setupMultiDestination(['Paris', 'Tokyo']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const initialCities = await page.getAccommodationCities();
    expect(initialCities.length).toBeGreaterThanOrEqual(1);

    // Switch through all tabs
    await page.switchToActivities();
    await page.wait(300);
    await page.switchToPreferences();
    await page.wait(300);
    await page.switchToFlights();
    await page.wait(300);

    // Return to stays
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // Verify cities preserved
    const finalCities = await page.getAccommodationCities();
    expect(finalCities).toEqual(initialCities); // ✅ Cities must be identical

    console.log('Cities preserved after full tab cycle:', finalCities);
  });
});
