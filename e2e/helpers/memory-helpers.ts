import { Page } from '@playwright/test';

/**
 * Helper class for localStorage memory manipulation in E2E tests
 * Provides utilities to get, set, and clear memory states
 */
export class MemoryHelper {
  constructor(private page: Page) {}

  /**
   * Get memory from localStorage by key
   * @param key - localStorage key (e.g., 'travliaq_flight_memory')
   * @returns Parsed memory object or null
   */
  async getLocalStorageMemory(key: string): Promise<any> {
    return await this.page.evaluate((storageKey) => {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    }, key);
  }

  /**
   * Set memory in localStorage by key
   * @param key - localStorage key
   * @param value - Memory object to store
   */
  async setLocalStorageMemory(key: string, value: any): Promise<void> {
    await this.page.evaluate(({ storageKey, storageValue }) => {
      localStorage.setItem(storageKey, JSON.stringify(storageValue));
    }, { storageKey: key, storageValue: value });
  }

  /**
   * Clear all Travliaq memories from localStorage
   */
  async clearAllMemories(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('travliaq_flight_memory');
      localStorage.removeItem('travliaq_accommodation_memory');
      localStorage.removeItem('travliaq_travel_memory');
    });
  }

  /**
   * Get flight memory specifically
   */
  async getFlightMemory(): Promise<any> {
    return this.getLocalStorageMemory('travliaq_flight_memory');
  }

  /**
   * Get accommodation memory specifically
   */
  async getAccommodationMemory(): Promise<any> {
    return this.getLocalStorageMemory('travliaq_accommodation_memory');
  }

  /**
   * Get travel memory specifically
   */
  async getTravelMemory(): Promise<any> {
    return this.getLocalStorageMemory('travliaq_travel_memory');
  }
}
