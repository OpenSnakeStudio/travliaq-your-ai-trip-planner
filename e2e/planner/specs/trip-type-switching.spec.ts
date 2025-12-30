import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Trip Type Switching (BUG #2)
 *
 * Tests that accommodations are properly cleaned up when switching trip types
 * Bug: Switching from multi to roundtrip/oneway left obsolete accommodations
 * Fix: Added useEffect listener in AccommodationMemoryContext
 */

const testCases = [
  {
    from: 'multi',
    to: 'roundtrip',
    expectedAccom: 1,
    description: 'Multi → Roundtrip should keep only 1 accommodation'
  },
  {
    from: 'multi',
    to: 'oneway',
    expectedAccom: 1,
    description: 'Multi → Oneway should keep only 1 accommodation'
  },
  {
    from: 'roundtrip',
    to: 'multi',
    expectedAccom: 2,
    description: 'Roundtrip → Multi should create 2 accommodations (after sync)'
  },
  {
    from: 'oneway',
    to: 'multi',
    expectedAccom: 2,
    description: 'Oneway → Multi should create 2 accommodations'
  },
  {
    from: 'roundtrip',
    to: 'oneway',
    expectedAccom: 1,
    description: 'Roundtrip → Oneway should keep 1 accommodation'
  },
  {
    from: 'oneway',
    to: 'roundtrip',
    expectedAccom: 1,
    description: 'Oneway → Roundtrip should keep 1 accommodation'
  },
];

test.describe('Trip Type Switching', () => {
  testCases.forEach(({ from, to, expectedAccom, description }) => {
    test(description, async ({ authenticatedPage }) => {
      const page = new PlannerPage(authenticatedPage);
      await page.goto();

      // Setup initial trip type
      await page.switchToFlights();
      await page.selectTripType(from);

      if (from === 'multi') {
        await page.sendChatMessage('Paris to Tokyo to Bangkok');
        await page.waitForFlightProcessing();
      } else {
        await page.selectDestinations('Paris', 'Tokyo');
      }

      // Verify initial state
      await page.switchToStays();
      await page.waitForAccommodationSync();
      const initialCount = await page.getAccommodationCount();
      console.log(`Initial accommodation count (${from}):`, initialCount);

      // Switch trip type
      await page.switchToFlights();
      await page.selectTripType(to);

      if (to === 'multi') {
        // Multi-destination needs additional destinations
        await page.sendChatMessage('Add Bangkok as next stop');
        await page.waitForFlightProcessing();
      }

      // Wait for cleanup/sync
      await page.wait(500);

      // Verify cleanup happened
      await page.switchToStays();
      await page.waitForAccommodationSync();
      const finalCount = await page.getAccommodationCount();

      console.log(`Final accommodation count (${to}):`, finalCount);
      expect(finalCount).toBe(expectedAccom);
    });
  });

  test('should preserve accommodation data when switching back and forth', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Start with roundtrip
    await page.switchToFlights();
    await page.selectTripType('roundtrip');
    await page.selectDestinations('Paris', 'Tokyo');

    // Modify accommodation
    await page.switchToStays();
    await page.waitForAccommodationSync();
    await page.selectBudgetPreset('premium');
    await page.setCheckInDate('2024-06-01');
    await page.setCheckOutDate('2024-06-10');

    // Switch to oneway and back
    await page.switchToFlights();
    await page.selectTripType('oneway');
    await page.wait(300);
    await page.selectTripType('roundtrip');

    // Verify data preserved
    await page.switchToStays();
    const checkIn = await page.getCheckInDate();
    expect(checkIn).toContain('2024-06-01');
  });

  test('should handle rapid trip type changes', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Rapid switching
    await page.switchToFlights();
    await page.selectTripType('roundtrip');
    await page.wait(100);
    await page.selectTripType('oneway');
    await page.wait(100);
    await page.selectTripType('roundtrip');
    await page.wait(100);
    await page.selectTripType('oneway');

    // Should end up with 1 accommodation (oneway)
    await page.switchToStays();
    await page.waitForAccommodationSync();
    const count = await page.getAccommodationCount();
    expect(count).toBe(1);
  });
});
