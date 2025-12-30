import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Chat Travelers Propagation (BUG #3)
 *
 * Tests that travelers set via chat properly propagate to TravelMemory
 * Bug: useTravelMemory hook was imported but never called
 * Fix: Added updateTravelers() call in handleTravelersSelect
 */

test.describe('Chat Travelers Propagation', () => {
  test('should propagate travelers from chat to TravelMemory', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // User sets travelers via chat
    await page.sendChatMessage('I need flights for 2 adults and 1 child');
    await page.waitForChatResponse();

    // Verify FlightMemory updated
    const flightMemory = await page.memory.getFlightMemory();
    expect(flightMemory.passengers.adults).toBe(2);
    expect(flightMemory.passengers.children).toBe(1);

    // CRITICAL: Verify TravelMemory also updated
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(2);
    expect(travelMemory.travelers.children).toBe(1);
  });

  test('should suggest correct room configuration based on travelers', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set travelers via chat
    await page.sendChatMessage('Trip for 2 adults and 1 child');
    await page.waitForChatResponse();

    // Switch to accommodations
    await page.selectDestinations('Paris', 'Tokyo');
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // Verify room suggestions reflect travelers
    const suggestedRooms = await page.getSuggestedRoomsCount();
    expect(suggestedRooms).toBeGreaterThanOrEqual(1); // At least 1 family room
  });

  test('should update accommodation suggestions when travelers change', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Start with solo traveler
    await page.sendChatMessage('Solo trip to Paris');
    await page.waitForChatResponse();

    await page.switchToStays();
    await page.waitForAccommodationSync();
    let suggestedRooms = await page.getSuggestedRoomsCount();
    expect(suggestedRooms).toBe(1); // 1 single room

    // Add more travelers
    await page.sendChatMessage('Add 3 more adults to the trip');
    await page.waitForChatResponse();

    // Verify room count increased
    await page.wait(500); // Wait for memory update
    suggestedRooms = await page.getSuggestedRoomsCount();
    expect(suggestedRooms).toBeGreaterThanOrEqual(2); // 4 adults = 2 rooms
  });

  test('should handle infant travelers correctly', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set travelers with infant
    await page.sendChatMessage('2 adults, 1 child age 5, and 1 infant');
    await page.waitForChatResponse();

    // Verify all travelers recorded
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(2);
    expect(travelMemory.travelers.children).toBe(1);
    expect(travelMemory.travelers.infants).toBe(1);

    // Verify FlightMemory also has infants
    const flightMemory = await page.memory.getFlightMemory();
    expect(flightMemory.passengers.infants).toBe(1);
  });

  test('should preserve travelers when switching tabs', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Set travelers
    await page.sendChatMessage('Family trip: 2 adults, 2 children');
    await page.waitForChatResponse();

    // Switch through multiple tabs
    await page.switchToFlights();
    await page.wait(200);
    await page.switchToStays();
    await page.wait(200);
    await page.switchToActivities();
    await page.wait(200);
    await page.switchToPreferences();
    await page.wait(200);

    // Verify travelers still persisted
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(2);
    expect(travelMemory.travelers.children).toBe(2);
  });

  test('should handle complex traveler configurations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Complex group
    await page.sendChatMessage('Group trip: 6 adults, 3 children, 1 infant');
    await page.waitForChatResponse();

    // Verify memory
    const travelMemory = await page.memory.getTravelMemory();
    expect(travelMemory.travelers.adults).toBe(6);
    expect(travelMemory.travelers.children).toBe(3);
    expect(travelMemory.travelers.infants).toBe(1);

    // Verify accommodation suggestions
    await page.selectDestinations('Paris', 'London');
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const suggestedRooms = await page.getSuggestedRoomsCount();
    // 6 adults + 3 children = likely 4-5 rooms
    expect(suggestedRooms).toBeGreaterThanOrEqual(3);
  });
});
