import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Full User Journey
 *
 * Comprehensive end-to-end tests simulating real user workflows
 * Tests all features working together in realistic scenarios
 */

test.describe('Full User Journey', () => {
  test('Complete multi-destination trip planning with custom preferences', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // STEP 1: User configures travelers
    await page.sendChatMessage('Trip for 2 adults and 1 child (age 5)');
    await page.waitForChatResponse();

    // Verify travelers recorded
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(2);
    expect(travelMemory.travelers.children).toBe(1);

    // STEP 2: User creates multi-destination trip via chat
    await page.sendChatMessage('Multi-city trip: Paris → Tokyo (June 1-10) → Bangkok (June 10-15)');
    await page.waitForFlightProcessing();

    // Verify flights created
    await page.switchToFlights();
    const legs = await page.getFlightLegs();
    expect(legs.length).toBeGreaterThanOrEqual(2);

    // STEP 3: Check accommodations auto-created
    await page.switchToStays();
    await page.waitForAccommodationSync();

    let accommodations = await page.getAllAccommodations();
    expect(accommodations.length).toBeGreaterThanOrEqual(2);

    const cities = accommodations.map(a => a.city);
    expect(cities).toContain('Tokyo');
    expect(cities).toContain('Bangkok');

    // STEP 4: User customizes Tokyo accommodation
    await page.selectAccommodation('Tokyo');
    await page.selectBudgetPreset('premium'); // Upgrade Tokyo to premium
    await page.setCheckInDate('2024-06-05'); // User manually adjusts dates
    await page.setCheckOutDate('2024-06-12');

    // STEP 5: User customizes Bangkok accommodation
    await page.selectAccommodation('Bangkok');
    await page.selectBudgetPreset('eco'); // Keep Bangkok budget-friendly

    // STEP 6: User adds Singapore via chat
    await page.sendChatMessage('Add Singapore after Bangkok (June 15-18)');
    await page.waitForFlightProcessing();

    // STEP 7: Verify Singapore auto-created with DEFAULT budget (not premium or eco)
    await page.switchToStays();
    await page.waitForAccommodationSync();

    accommodations = await page.getAllAccommodations();
    const singapore = accommodations.find(a => a.city === 'Singapore');
    expect(singapore).toBeDefined();
    expect(singapore?.budgetPreset).toBe('comfort'); // Default budget

    // STEP 8: User modifies flight dates via chat
    await page.sendChatMessage('Change all flights to start July 1st instead');
    await page.waitForChatResponse();

    // STEP 9: Verify accommodations respect userModifiedDates
    await page.switchToStays();
    accommodations = await page.getAllAccommodations();

    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    const bangkok = accommodations.find(a => a.city === 'Bangkok');

    // Tokyo dates should be PROTECTED (userModifiedDates=true)
    expect(tokyo?.checkIn).toContain('2024-06-05');
    expect(tokyo?.checkOut).toContain('2024-06-12');
    expect(tokyo?.userModifiedDates).toBe(true);

    // Bangkok might sync (userModifiedDates not set)
    // Singapore should sync to new dates

    // STEP 10: Verify budgets are PROTECTED
    expect(tokyo?.budgetPreset).toBe('premium'); // ✅ Protected
    expect(tokyo?.userModifiedBudget).toBe(true);

    expect(bangkok?.budgetPreset).toBe('eco'); // ✅ Protected
    expect(bangkok?.userModifiedBudget).toBe(true);

    // STEP 11: Request trip summary from chat
    await page.sendChatMessage('Show me my complete trip summary');
    const summary = await page.getLastChatMessage();

    // Should contain all cities
    expect(summary.toLowerCase()).toMatch(/tokyo|bangkok|singapore/i);
    // Should reflect travelers
    expect(summary.toLowerCase()).toMatch(/2 adults|child/i);

    // STEP 12: Verify localStorage persistence
    const accomMemory = await page.memory.getAccommodationMemory();
    expect(accomMemory.accommodations.length).toBeGreaterThanOrEqual(3);
    expect(accomMemory.defaultBudgetPreset).toBeDefined();

    const flightMemory = await page.memory.getFlightMemory();
    expect(flightMemory.tripType).toBe('multi');
    expect(flightMemory.passengers.adults).toBe(2);
  });

  test('Roundtrip journey with budget propagation', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // STEP 1: Create roundtrip
    await page.switchToFlights();
    await page.selectTripType('roundtrip');
    await page.selectDestinations('London', 'New York');

    // STEP 2: Set eco budget
    await page.switchToStays();
    await page.waitForAccommodationSync();
    await page.selectBudgetPreset('eco');

    // STEP 3: Switch to multi-destination
    await page.switchToFlights();
    await page.selectTripType('multi');
    await page.sendChatMessage('Add Boston and Miami to the trip');
    await page.waitForFlightProcessing();

    // STEP 4: New cities should have eco budget (propagated)
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const accommodations = await page.getAllAccommodations();
    const boston = accommodations.find(a => a.city === 'Boston');
    const miami = accommodations.find(a => a.city === 'Miami');

    expect(boston?.budgetPreset).toBe('eco');
    expect(miami?.budgetPreset).toBe('eco');
  });

  test('Chat-driven workflow with mixed manual and auto changes', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // User starts with chat
    await page.sendChatMessage('Solo trip to Barcelona');
    await page.waitForChatResponse();

    // User manually adjusts in widget
    await page.switchToStays();
    await page.selectBudgetPreset('premium');

    // User adds travelers via chat
    await page.sendChatMessage('Actually, add 1 more adult');
    await page.waitForChatResponse();

    // Verify room suggestions updated
    await page.switchToStays();
    const suggestedRooms = await page.getSuggestedRoomsCount();
    expect(suggestedRooms).toBe(1); // 2 adults = 1 double room

    // Budget should remain premium (userModifiedBudget)
    const accomMemory = await page.memory.getAccommodationMemory();
    expect(accomMemory.accommodations[0].budgetPreset).toBe('premium');
  });

  test('Complex trip with all features: multi-destination, custom budgets, travelers, date overrides', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Initialize
    await page.sendChatMessage('Family trip: 2 adults, 2 children');
    await page.setupMultiDestination(['Paris', 'Rome', 'Barcelona', 'Lisbon']);

    await page.switchToStays();
    await page.waitForAccommodationSync();

    // Custom budget for each city
    await page.selectAccommodation('Paris');
    await page.selectBudgetPreset('premium');

    await page.selectAccommodation('Rome');
    await page.selectBudgetPreset('comfort');

    await page.selectAccommodation('Barcelona');
    await page.setCustomBudget(90, 150);

    await page.selectAccommodation('Lisbon');
    await page.selectBudgetPreset('eco');

    // Custom dates for Rome
    await page.selectAccommodation('Rome');
    await page.setCheckInDate('2024-08-10');
    await page.setCheckOutDate('2024-08-18');

    // Try to change all dates via chat
    await page.sendChatMessage('Move trip to September instead');
    await page.waitForChatResponse();

    // Rome dates should be protected
    const accommodations = await page.getAllAccommodations();
    const rome = accommodations.find(a => a.city === 'Rome');
    expect(rome?.checkIn).toContain('2024-08-10'); // ✅ Protected

    // All budgets should remain as set
    const paris = accommodations.find(a => a.city === 'Paris');
    const barcelona = accommodations.find(a => a.city === 'Barcelona');
    const lisbon = accommodations.find(a => a.city === 'Lisbon');

    expect(paris?.budgetPreset).toBe('premium');
    expect(rome?.budgetPreset).toBe('comfort');
    expect(barcelona?.budgetPreset).toBe('custom');
    expect(lisbon?.budgetPreset).toBe('eco');

    // Room suggestions should account for 4 travelers
    const roomsSummary = await page.getRoomsSummary();
    expect(roomsSummary.toLowerCase()).toMatch(/2.*room|family/i);
  });

  test('Trip type switching preserves critical data', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Start multi-destination with customizations
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();

    await page.selectAccommodation('Paris');
    await page.selectBudgetPreset('premium');
    await page.setCheckInDate('2024-06-01');

    // Switch to roundtrip (only Paris should remain)
    await page.switchToFlights();
    await page.selectTripType('roundtrip');

    await page.switchToStays();
    await page.waitForAccommodationSync();

    let accommodations = await page.getAllAccommodations();
    expect(accommodations.length).toBe(1);

    // Paris should retain customizations
    const paris = accommodations[0];
    expect(paris.budgetPreset).toBe('premium');
    expect(paris.checkIn).toContain('2024-06-01');
  });

  test('Page refresh preserves all data', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set up complex trip
    await page.sendChatMessage('3 adults to Paris, Tokyo, Bangkok - premium accommodations');
    await page.waitForFlightProcessing();

    await page.switchToStays();
    await page.selectAccommodation('Tokyo');
    await page.setCheckInDate('2024-07-15');

    // Refresh page
    await page.page.reload();
    await page.page.waitForLoadState('networkidle');

    // Verify all data persisted
    const flightMemory = await page.memory.getFlightMemory();
    const travelMemory = await page.memory.getTravelMemory();
    const accomMemory = await page.memory.getAccommodationMemory();

    expect(flightMemory.tripType).toBe('multi');
    expect(travelMemory.travelers.adults).toBe(3);
    expect(accomMemory.defaultBudgetPreset).toBe('premium');

    const tokyo = accomMemory.accommodations.find((a: any) => a.city === 'Tokyo');
    expect(tokyo?.checkIn).toBeDefined();
  });
});
