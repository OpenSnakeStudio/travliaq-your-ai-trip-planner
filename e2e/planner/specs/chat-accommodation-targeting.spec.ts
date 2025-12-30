import { test, expect } from '../../fixtures/auth';
import { PlannerPage } from '../../helpers/planner-page';

/**
 * Test Suite: Chat Accommodation Targeting (BUG #4)
 *
 * Tests that chat can target and modify specific accommodations by city
 * Bug: useAccommodationMemory was imported but never used
 * Fix: Implemented findAccommodationByCity() + handleAccommodationUpdate()
 */

test.describe('Chat Accommodation Targeting', () => {
  test('should modify dates for specific accommodation via chat', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    const initialAccommodations = await page.getAllAccommodations();
    const tokyoBefore = initialAccommodations.find(a => a.city === 'Tokyo');
    const bangkokBefore = initialAccommodations.find(a => a.city === 'Bangkok');

    // User targets Tokyo specifically via chat
    await page.sendChatMessage('Change Tokyo accommodation to June 20-25');
    await page.waitForChatResponse();

    // Verify ONLY Tokyo changed
    const updatedAccommodations = await page.getAllAccommodations();
    const tokyoAfter = updatedAccommodations.find(a => a.city === 'Tokyo');
    const bangkokAfter = updatedAccommodations.find(a => a.city === 'Bangkok');

    expect(tokyoAfter?.checkIn).toContain('2024-06-20');
    expect(tokyoAfter?.checkOut).toContain('2024-06-25');

    // Bangkok should remain unchanged
    expect(bangkokAfter?.checkIn).toBe(bangkokBefore?.checkIn);
    expect(bangkokAfter?.checkOut).toBe(bangkokBefore?.checkOut);
  });

  test('should change accommodation type for specific city', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User wants villa in Bangkok
    await page.sendChatMessage('I want a villa in Bangkok');
    await page.waitForChatResponse();

    // Verify Bangkok has villa type
    const accommodations = await page.getAllAccommodations();
    const bangkok = accommodations.find(a => a.city === 'Bangkok');
    expect(bangkok?.types).toContain('villa');

    // Paris and Tokyo should be unchanged
    const paris = accommodations.find(a => a.city === 'Paris');
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(paris?.types).not.toContain('villa');
    expect(tokyo?.types).not.toContain('villa');
  });

  test('should update budget for specific city', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination with default budget
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User wants premium in Tokyo only
    await page.sendChatMessage('I want premium accommodation in Tokyo');
    await page.waitForChatResponse();

    // Verify Tokyo has premium budget
    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.budgetPreset).toBe('premium');

    // Others should remain default
    const paris = accommodations.find(a => a.city === 'Paris');
    const bangkok = accommodations.find(a => a.city === 'Bangkok');
    expect(paris?.budgetPreset).not.toBe('premium');
    expect(bangkok?.budgetPreset).not.toBe('premium');
  });

  test('should handle city name variations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User uses different casing/spacing
    await page.sendChatMessage('Change TOKYO to premium');
    await page.waitForChatResponse();

    // Should still find Tokyo (case-insensitive)
    const accommodations = await page.getAllAccommodations();
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.budgetPreset).toBe('premium');
  });

  test('should modify multiple properties at once', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User changes multiple properties
    await page.sendChatMessage('For Bangkok: premium hotel from June 15-20');
    await page.waitForChatResponse();

    // Verify all properties updated
    const accommodations = await page.getAllAccommodations();
    const bangkok = accommodations.find(a => a.city === 'Bangkok');

    expect(bangkok?.budgetPreset).toBe('premium');
    expect(bangkok?.types).toContain('hotel');
    expect(bangkok?.checkIn).toContain('2024-06-15');
    expect(bangkok?.checkOut).toContain('2024-06-20');
  });

  test('should handle targeting non-existent city gracefully', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup with Paris only
    await page.selectDestinations('Paris', 'London');
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User tries to modify non-existent city
    await page.sendChatMessage('Change Tokyo to premium');
    await page.waitForChatResponse();

    // Should show error message or no-op
    const lastMessage = await page.getLastChatMessage();
    // Message should indicate Tokyo not found or similar
    expect(lastMessage.toLowerCase()).toMatch(/tokyo|not found|doesn't exist|no accommodation/i);
  });

  test('should preserve userModified flags when chat updates', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User manually modifies Paris dates
    await page.selectAccommodation('Paris');
    await page.setCheckInDate('2024-06-01');
    await page.setCheckOutDate('2024-06-05');

    // Chat modifies Tokyo
    await page.sendChatMessage('Change Tokyo to June 10-15');
    await page.waitForChatResponse();

    // Verify Paris userModifiedDates flag still set
    const accommodations = await page.getAllAccommodations();
    const paris = accommodations.find(a => a.city === 'Paris');
    expect(paris?.userModifiedDates).toBe(true);

    // Tokyo should also have userModifiedDates from chat
    const tokyo = accommodations.find(a => a.city === 'Tokyo');
    expect(tokyo?.checkIn).toContain('2024-06-10');
  });

  test('should support targeting all accommodations', async ({ authenticatedPage }) => {
    const page = new PlannerPage(authenticatedPage);
    await page.goto();

    // Setup multi-destination
    await page.setupMultiDestination(['Paris', 'Tokyo', 'Bangkok']);
    await page.switchToStays();
    await page.waitForAccommodationSync();

    // User wants to apply to all
    await page.sendChatMessage('Set all accommodations to eco budget');
    await page.waitForChatResponse();

    // Verify all have eco budget
    const accommodations = await page.getAllAccommodations();
    accommodations.forEach(accom => {
      expect(accom.budgetPreset).toBe('eco');
    });
  });
});
