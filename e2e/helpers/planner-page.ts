import { Page, Locator } from '@playwright/test';
import { MemoryHelper } from './memory-helpers';

/**
 * Page Object Model for the Planner page
 * Provides methods to interact with planner UI and verify state
 */
export class PlannerPage {
  readonly page: Page;
  readonly memory: MemoryHelper;

  // Tab locators
  readonly flightTab: Locator;
  readonly staysTab: Locator;
  readonly activitiesTab: Locator;
  readonly preferencesTab: Locator;

  // Chat locators
  readonly chatInput: Locator;
  readonly chatMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.memory = new MemoryHelper(page);

    // Initialize tab locators
    this.flightTab = page.locator('[data-tab="flights"]');
    this.staysTab = page.locator('[data-tab="stays"]');
    this.activitiesTab = page.locator('[data-tab="activities"]');
    this.preferencesTab = page.locator('[data-tab="preferences"]');

    // Initialize chat locators
    this.chatInput = page.locator('[data-testid="chat-input"]');
    this.chatMessages = page.locator('[data-testid="chat-message"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/planner');
    await this.page.waitForLoadState('networkidle');
  }

  // Tab switching
  async switchToFlights() {
    await this.flightTab.click();
    // Wait for panel to be visible (using display:none fix)
    await this.page.waitForTimeout(300);
  }

  async switchToStays() {
    await this.staysTab.click();
    await this.page.waitForTimeout(300);
  }

  async switchToActivities() {
    await this.activitiesTab.click();
    await this.page.waitForTimeout(300);
  }

  async switchToPreferences() {
    await this.preferencesTab.click();
    await this.page.waitForTimeout(300);
  }

  async switchToTab(tab: 'flights' | 'stays' | 'activities' | 'preferences') {
    switch (tab) {
      case 'flights':
        await this.switchToFlights();
        break;
      case 'stays':
        await this.switchToStays();
        break;
      case 'activities':
        await this.switchToActivities();
        break;
      case 'preferences':
        await this.switchToPreferences();
        break;
    }
  }

  // Chat interactions
  async sendChatMessage(message: string) {
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
  }

  async waitForChatResponse(timeout: number = 5000) {
    await this.page.waitForTimeout(timeout);
  }

  async getLastChatMessage(): Promise<string> {
    const messages = await this.chatMessages.all();
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    return await lastMessage.textContent() || '';
  }

  // Flight operations
  async selectTripType(type: 'oneway' | 'roundtrip' | 'multi') {
    const tripTypeButton = this.page.locator(`[data-trip-type="${type}"]`);
    await tripTypeButton.click();
    await this.page.waitForTimeout(500);
  }

  async selectDestinations(from: string, to: string) {
    // This is a simplified version - actual implementation depends on UI
    await this.sendChatMessage(`Flight from ${from} to ${to}`);
    await this.waitForChatResponse();
  }

  async getFlightLegs(): Promise<any[]> {
    const flightMemory = await this.memory.getFlightMemory();
    return flightMemory?.legs || [];
  }

  async waitForFlightProcessing(timeout: number = 10000) {
    await this.page.waitForTimeout(timeout);
  }

  // Accommodation operations
  async waitForAccommodationSync() {
    await this.page.waitForTimeout(1000);
  }

  async getAccommodationCount(): Promise<number> {
    const accomMemory = await this.memory.getAccommodationMemory();
    return accomMemory?.accommodations?.length ?? 0;
  }

  async getAccommodationCities(): Promise<string[]> {
    const accomMemory = await this.memory.getAccommodationMemory();
    return accomMemory?.accommodations?.map((a: any) => a.city) ?? [];
  }

  async getAllAccommodations(): Promise<any[]> {
    const accomMemory = await this.memory.getAccommodationMemory();
    return accomMemory?.accommodations ?? [];
  }

  async selectAccommodation(city: string) {
    const accomTab = this.page.locator(`[data-accommodation-city="${city}"]`);
    await accomTab.click();
    await this.page.waitForTimeout(300);
  }

  async selectBudgetPreset(preset: 'eco' | 'comfort' | 'premium') {
    const budgetButton = this.page.locator(`[data-budget-preset="${preset}"]`);
    await budgetButton.click();
    await this.page.waitForTimeout(300);
  }

  async setCheckInDate(date: string) {
    const checkInInput = this.page.locator('[data-testid="check-in-date"]');
    await checkInInput.fill(date);
    await this.page.waitForTimeout(300);
  }

  async setCheckOutDate(date: string) {
    const checkOutInput = this.page.locator('[data-testid="check-out-date"]');
    await checkOutInput.fill(date);
    await this.page.waitForTimeout(300);
  }

  async getCheckInDate(): Promise<string> {
    const accomMemory = await this.memory.getAccommodationMemory();
    const activeAccom = accomMemory?.accommodations?.[accomMemory.activeAccommodationIndex];
    return activeAccom?.checkIn || '';
  }

  async getRoomsSummary(): Promise<string> {
    const roomsSummaryElement = this.page.locator('[data-testid="rooms-summary"]');
    return await roomsSummaryElement.textContent() || '';
  }

  async getSuggestedRoomsCount(): Promise<number> {
    const travelMemory = await this.memory.getTravelMemory();
    const { adults } = travelMemory?.travelers || { adults: 1 };
    // Simple calculation: 2 adults per room
    return Math.ceil(adults / 2);
  }

  // Multi-destination setup helper
  async setupMultiDestination(cities: string[]) {
    await this.switchToFlights();
    await this.selectTripType('multi');
    const message = `Trip from ${cities.join(' to ')}`;
    await this.sendChatMessage(message);
    await this.waitForChatResponse(3000);
  }

  // Flight dates
  async getDepartureDate(): Promise<string> {
    const flightMemory = await this.memory.getFlightMemory();
    return flightMemory?.departureDate || '';
  }

  async setDepartureDate(date: string) {
    const departureInput = this.page.locator('[data-testid="departure-date"]');
    await departureInput.fill(date);
    await this.page.waitForTimeout(300);
  }

  async setReturnDate(date: string) {
    const returnInput = this.page.locator('[data-testid="return-date"]');
    await returnInput.fill(date);
    await this.page.waitForTimeout(300);
  }

  // Destination selection
  async selectDestination(city: string) {
    await this.sendChatMessage(`Flight to ${city}`);
    await this.waitForChatResponse();
  }

  // Wait helper
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
