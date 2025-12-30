import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Budget Propagation (BUG #5)
 *
 * Tests that budget preferences propagate to newly created accommodations
 * Bug: New accommodations always used hardcoded "comfort" budget
 * Fix: Added defaultBudgetPreset, defaultPriceMin, defaultPriceMax to AccommodationMemory
 */

test.describe('Budget Propagation', () => {
  test('should propagate budget to new accommodations in multi-destination', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set destination and configure budget to "eco"
    await page.selectDestination('Paris');
    await page.switchToStays();
    await page.waitForAccommodationSync();
    await page.selectBudgetPreset('eco'); // 0-80€

    // Add multi-destination (should create Tokyo + Bangkok)
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Tokyo and Bangkok to the trip');
    await page.waitForFlightProcessing();

    // Verify new accommodations have "eco" budget
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    const bangkok = accommodations.find(a => a.city === 'Bangkok');

    expect(tokyo?.budgetPreset).toBe('eco');
    expect(tokyo?.priceMin).toBeLessThanOrEqual(0);
    expect(tokyo?.priceMax).toBeLessThanOrEqual(80);

    expect(bangkok?.budgetPreset).toBe('eco');
    expect(bangkok?.priceMin).toBeLessThanOrEqual(0);
    expect(bangkok?.priceMax).toBeLessThanOrEqual(80);
  });

  test('should propagate premium budget to new accommodations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Configure premium budget (180-500€)
    await page.selectDestination('London');
    await page.switchToStays();
    await page.selectBudgetPreset('premium');

    // Add another destination
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Paris as second stop');
    await page.waitForFlightProcessing();

    // Verify Paris has premium budget
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accommodations = await page.getAllAccommodations();
    const paris = accommodations.find(a => a.city === 'Paris');

    expect(paris?.budgetPreset).toBe('premium');
    expect(paris?.priceMin).toBeGreaterThanOrEqual(180);
    expect(paris?.priceMax).toBeLessThanOrEqual(500);
  });

  test('should propagate custom budget to new accommodations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set custom budget (100-250€)
    await page.selectDestination('Barcelona');
    await page.switchToStays();
    await page.setCustomBudget(100, 250);

    // Add multi-destination
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Rome and Amsterdam');
    await page.waitForFlightProcessing();

    // Verify new cities have custom budget
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accommodations = await page.getAllAccommodations();
    const rome = accommodations.find(a => a.city === 'Rome');
    const amsterdam = accommodations.find(a => a.city === 'Amsterdam');

    expect(rome?.budgetPreset).toBe('custom');
    expect(rome?.priceMin).toBe(100);
    expect(rome?.priceMax).toBe(250);

    expect(amsterdam?.budgetPreset).toBe('custom');
    expect(amsterdam?.priceMin).toBe(100);
    expect(amsterdam?.priceMax).toBe(250);
  });

  test('should update default budget when user changes it', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Start with eco
    await page.selectDestination('Paris');
    await page.switchToStays();
    await page.selectBudgetPreset('eco');

    // Add first destination
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Tokyo');
    await page.waitForFlightProcessing();

    // Verify Tokyo has eco
    await page.switchToStays();
    let accommodations = await page.getAllAccommodations();
    let tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.budgetPreset).toBe('eco');

    // Change default to premium
    await page.selectAccommodation('Paris');
    await page.selectBudgetPreset('premium');

    // Add another destination
    await page.switchToFlights();
    await page.sendChatMessage('Add Bangkok');
    await page.waitForFlightProcessing();

    // Verify Bangkok has premium (new default)
    await page.switchToStays();
    accommodations = await page.getAllAccommodations();
    const bangkok = accommodations.find(a => a.city === 'Bangkok');
    expect(bangkok?.budgetPreset).toBe('premium');
  });

  test('should handle budget propagation across trip type changes', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Start with roundtrip, set premium budget
    await page.switchToFlights();
    await page.selectTripType('roundtrip');
    await page.selectDestinations('Paris', 'Tokyo');

    await page.switchToStays();
    await page.selectBudgetPreset('premium');

    // Switch to multi and add destination
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Bangkok after Tokyo');
    await page.waitForFlightProcessing();

    // Bangkok should have premium budget
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accommodations = await page.getAllAccommodations();
    const bangkok = accommodations.find(a => a.city === 'Bangkok');
    expect(bangkok?.budgetPreset).toBe('premium');
  });
});
