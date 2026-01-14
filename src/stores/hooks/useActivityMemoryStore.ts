/**
 * useActivityMemoryStore - Drop-in replacement for useActivityMemory (Context)
 * 
 * This hook provides the exact same API as ActivityMemoryContext
 * but uses Zustand under the hood for better performance.
 * 
 * Migration: Replace `useActivityMemory` import with `useActivityMemoryStore`
 */

import { useMemo, useCallback } from 'react';
import { usePlannerStoreV2 } from '../plannerStoreV2';
import type { 
  ActivityState,
  ActivityEntry, 
  ActivityDestination, 
  ActivityFilters,
  ViatorActivity,
  ActivitySearchState,
} from '../slices/activityTypes';

// Re-export types for compatibility
export type { 
  ActivityEntry, 
  ActivityDestination, 
  ActivityFilters,
  ViatorActivity,
  ActivitySearchState,
};

// Memory structure (mirrors Context)
export interface ActivityMemory {
  activities: ActivityEntry[];
  localDestinations: ActivityDestination[];
  search: ActivitySearchState;
  recommendations: ViatorActivity[];
  isLoadingRecommendations: boolean;
  selectedActivityId: string | null;
  activeFilters: ActivityFilters;
}

// Context-compatible return type
export interface ActivityMemoryStoreValue {
  state: ActivityMemory;
  
  // CRUD operations
  addActivityFromSearch: (viatorActivity: ViatorActivity, destinationId: string) => void;
  addManualActivity: (activity: Partial<ActivityEntry>) => string;
  updateActivity: (id: string, updates: Partial<ActivityEntry>) => void;
  removeActivity: (id: string) => void;
  
  // Local destination operations
  addLocalDestination: (destination: Omit<ActivityDestination, 'id' | 'isInherited'>) => string;
  removeLocalDestination: (id: string) => void;
  updateLocalDestination: (id: string, updates: Partial<ActivityDestination>) => void;
  
  // Selection
  selectActivity: (id: string | null) => void;
  getSelectedActivity: () => ActivityEntry | null;
  
  // Filters
  updateFilters: (filters: Partial<ActivityFilters>) => void;
  
  // Search state
  setSearching: (isSearching: boolean) => void;
  setSearchResults: (results: ViatorActivity[], total: number, hasMore: boolean) => void;
  setSearchError: (error: string | null) => void;
  clearSearch: () => void;
  
  // Recommendations
  setRecommendations: (recommendations: ViatorActivity[]) => void;
  setLoadingRecommendations: (loading: boolean) => void;
  
  // Queries
  getActivitiesByDestination: (destId: string) => ActivityEntry[];
  getActivitiesByDate: (date: Date) => ActivityEntry[];
  getTotalBudget: () => number;
  
  // Computed
  totalActivitiesCount: number;
  allDestinations: ActivityDestination[];
  
  // Reset
  resetMemory: () => void;
  
  // Serialization
  getSerializedState: () => Record<string, unknown>;
}

/**
 * useActivityMemoryStore - Zustand-based replacement for useActivityMemory
 */
export function useActivityMemoryStore(): ActivityMemoryStoreValue {
  const store = usePlannerStoreV2();

  // Build state object (mirrors Context structure)
  const state = useMemo<ActivityMemory>(() => ({
    activities: store.activities,
    localDestinations: store.localDestinations,
    search: store.search,
    recommendations: store.recommendations,
    isLoadingRecommendations: store.isLoadingRecommendations,
    selectedActivityId: store.selectedActivityId,
    activeFilters: store.activeFilters,
  }), [
    store.activities,
    store.localDestinations,
    store.search,
    store.recommendations,
    store.isLoadingRecommendations,
    store.selectedActivityId,
    store.activeFilters,
  ]);

  // Get selected activity
  const getSelectedActivity = useCallback((): ActivityEntry | null => {
    return store.getSelectedActivity();
  }, [store]);

  // Get activities by destination
  const getActivitiesByDestination = useCallback((destId: string): ActivityEntry[] => {
    return store.getActivitiesByDestination(destId);
  }, [store]);

  // Get activities by date
  const getActivitiesByDate = useCallback((date: Date): ActivityEntry[] => {
    return store.getActivitiesByDate(date);
  }, [store]);

  // Get total budget
  const getTotalBudget = useCallback((): number => {
    return store.getTotalActivityBudget();
  }, [store]);

  // Total activities count
  const totalActivitiesCount = state.activities.length;

  // All destinations (local only for now - accommodation sync happens in context)
  const allDestinations = useMemo(() => {
    return state.localDestinations;
  }, [state.localDestinations]);

  // Reset memory
  const resetMemory = useCallback(() => {
    store.resetActivities();
  }, [store]);

  // Get serialized state
  const getSerializedState = useCallback((): Record<string, unknown> => {
    return {
      activities: state.activities.map((a) => ({
        ...a,
        date: a.date?.toISOString() ?? null,
        addedAt: a.addedAt.toISOString(),
      })),
      localDestinations: state.localDestinations.map((d) => ({
        ...d,
        checkIn: d.checkIn?.toISOString() ?? null,
        checkOut: d.checkOut?.toISOString() ?? null,
      })),
      activeFilters: state.activeFilters,
      totalActivitiesCount,
    };
  }, [state, totalActivitiesCount]);

  return {
    state,
    
    // CRUD
    addActivityFromSearch: store.addActivityFromSearch,
    addManualActivity: store.addManualActivity,
    updateActivity: store.updateActivity,
    removeActivity: store.removeActivity,
    
    // Local destinations
    addLocalDestination: store.addLocalDestination,
    removeLocalDestination: store.removeLocalDestination,
    updateLocalDestination: store.updateLocalDestination,
    
    // Selection
    selectActivity: store.selectActivity,
    getSelectedActivity,
    
    // Filters
    updateFilters: store.updateActivityFilters,
    
    // Search state
    setSearching: store.setActivitySearching,
    setSearchResults: store.setActivitySearchResults,
    setSearchError: store.setActivitySearchError,
    clearSearch: store.clearActivitySearch,
    
    // Recommendations
    setRecommendations: store.setRecommendations,
    setLoadingRecommendations: store.setLoadingRecommendations,
    
    // Queries
    getActivitiesByDestination,
    getActivitiesByDate,
    getTotalBudget,
    
    // Computed
    totalActivitiesCount,
    allDestinations,
    
    // Reset
    resetMemory,
    
    // Serialization
    getSerializedState,
  };
}
