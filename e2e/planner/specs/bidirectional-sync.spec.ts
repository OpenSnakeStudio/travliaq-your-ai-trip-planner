import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Bidirectional Synchronization
 *
 * Tests that data flows correctly between Chat ↔ Memory ↔ Widgets
 * Ensures all three layers stay in sync
 */

test.describe('Bidirectional Synchronization', () => {
  test('Chat → Widgets: flight dates modified via chat reflect in widgets', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Chat sets dates
    await page.sendChatMessage('Paris to Tokyo from June 1-15');
    await page.waitForChatResponse();

    // Verify flight widget
    await page.switchToFlights();
    const departureDate = await page.getDepartureDate();
    expect(departureDate).toContain('2024-06-01');

    // Verify accommodation widget
    await page.switchToStays();
    await page.waitForAccommodationSync();
    const checkIn = await page.getCheckInDate();
    expect(checkIn).toContain('2024-06-01');
  });

  test('Widgets → Chat: flight modifications visible in chat context', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // User modifies dates manually in widget
    await page.switchToFlights();
    await page.setDepartureDate('2024-07-10');
    await page.setReturnDate('2024-07-20');

    // Chat should see new dates
    await page.sendChatMessage('Show me my trip summary');
    const response = await page.getLastChatMessage();
    expect(response.toLowerCase()).toMatch(/july|juillet|7/i);
  });

  test('Chat → Memory → Widgets: travelers propagate through all layers', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Chat sets travelers
    await page.sendChatMessage('Trip for 2 adults and 1 child');
    await page.waitForChatResponse();

    // Verify FlightMemory
    const flightMemory = await page.memory.getFlightMemory();
    expect(flightMemory.passengers.adults).toBe(2);
    expect(flightMemory.passengers.children).toBe(1);

    // Verify TravelMemory
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(2);
    expect(travelMemory.travelers.children).toBe(1);

    // Verify accommodation suggestions
    await page.selectDestination('Paris');
    await page.switchToStays();
    const roomsSummary = await page.getRoomsSummary();
    expect(roomsSummary.toLowerCase()).toMatch(/family|2 adults|child/i);
  });

  test('Widgets → Memory → Chat: destination changes sync to chat', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // User sets destination via widget
    await page.switchToFlights();
    await page.selectDestinations('London', 'Berlin');

    // Chat should reflect this
    await page.sendChatMessage('What are my destinations?');
    const response = await page.getLastChatMessage();
    expect(response.toLowerCase()).toContain('london');
    expect(response.toLowerCase()).toContain('berlin');
  });

  test('Multi-layer sync: chat → flights → accommodations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Chat creates multi-destination
    await page.sendChatMessage('Plan trip: Paris → Tokyo → Bangkok from June 1-20');
    await page.waitForFlightProcessing();

    // Verify flight legs
    await page.switchToFlights();
    const legs = await page.getFlightLegs();
    expect(legs.length).toBeGreaterThanOrEqual(2);

    // Verify accommodations auto-created
    await page.switchToStays();
    await page.waitForAccommodationSync();
    const accommodations = await page.getAllAccommodations();
    expect(accommodations.length).toBeGreaterThanOrEqual(2);

    // Verify cities match
    const cities = accommodations.map(a => a.city.toLowerCase());
    expect(cities).toContain('tokyo');
    expect(cities).toContain('bangkok');
  });

  test('Bidirectional budget sync: widget changes reflect in memory', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    await page.selectDestination('Paris');
    await page.switchToStays();

    // Widget sets budget
    await page.selectBudgetPreset('premium');

    // Verify memory updated
    const accomMemory = await page.memory.getAccommodationMemory();
    const paris = accomMemory.accommodations[0];
    expect(paris.budgetPreset).toBe('premium');
    expect(paris.priceMin).toBeGreaterThanOrEqual(180);
    expect(paris.priceMax).toBeLessThanOrEqual(500);
  });

  test('Accommodation sync respects userModifiedDates flag', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User manually modifies Tokyo dates
    await page.selectAccommodation('Tokyo');
    await page.setCheckInDate('2024-06-10');
    await page.setCheckOutDate('2024-06-20');

    // Chat modifies flight dates
    await page.sendChatMessage('Change all flight dates to July');
    await page.waitForChatResponse();

    // Tokyo dates should NOT change (userModifiedDates=true)
    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.checkIn).toContain('2024-06-10'); // ✅ Protected
  });

  test('Real-time sync across rapid changes', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Rapid changes via chat
    await page.sendChatMessage('Paris to London');
    await page.wait(500);
    await page.sendChatMessage('Add 1 child');
    await page.wait(500);
    await page.sendChatMessage('Change to premium accommodations');
    await page.wait(500);

    // All should be reflected
    const flightMemory = await page.memory.getFlightMemory();
    const travelMemory = await page.memory.getTravelMemory();
    const accomMemory = await page.memory.getAccommodationMemory();

    expect(flightMemory.arrival?.city).toMatch(/London/i);
    expect(travelMemory.travelers.children).toBe(1);
    expect(accomMemory.defaultBudgetPreset).toBe('premium');
  });

  test('Sync preserves data across tab switches', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set up complete trip
    await page.sendChatMessage('Paris to Tokyo, 2 adults, June 1-10, premium accommodations');
    await page.waitForFlightProcessing();

    // Switch through all tabs
    await page.switchToFlights();
    await page.wait(300);
    await page.switchToStays();
    await page.wait(300);
    await page.switchToActivities();
    await page.wait(300);
    await page.switchToPreferences();
    await page.wait(300);

    // Verify all data persisted
    const flightMemory = await page.memory.getFlightMemory();
    const travelMemory = await page.memory.getTravelMemory();
    const accomMemory = await page.memory.getAccommodationMemory();

    expect(flightMemory.arrival?.city).toMatch(/Tokyo/i);
    expect(travelMemory.travelers.adults).toBe(2);
    expect(accomMemory.accommodations.length).toBeGreaterThanOrEqual(1);
    expect(accomMemory.defaultBudgetPreset).toBe('premium');
  });
});
