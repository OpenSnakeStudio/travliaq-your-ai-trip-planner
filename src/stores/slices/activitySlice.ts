/**
 * Activity Slice
 * Manages activities and attractions state
 */

import type { StateCreator } from 'zustand';
import {
  type ActivityState,
  type ActivityEntry,
  type ActivityDestination,
  type ActivityFilters,
  type ViatorActivity,
  initialActivityState,
} from './activityTypes';

export interface ActivityActions {
  addActivityFromSearch: (viatorActivity: ViatorActivity, destinationId: string) => void;
  addManualActivity: (activity: Partial<ActivityEntry>) => string;
  updateActivity: (id: string, updates: Partial<ActivityEntry>) => void;
  removeActivity: (id: string) => void;
  addLocalDestination: (destination: Omit<ActivityDestination, 'id' | 'isInherited'>) => string;
  removeLocalDestination: (id: string) => void;
  updateLocalDestination: (id: string, updates: Partial<ActivityDestination>) => void;
  selectActivity: (id: string | null) => void;
  getSelectedActivity: () => ActivityEntry | null;
  updateActivityFilters: (filters: Partial<ActivityFilters>) => void;
  setActivitySearching: (isSearching: boolean) => void;
  setActivitySearchResults: (results: ViatorActivity[], total: number, hasMore: boolean) => void;
  setActivitySearchError: (error: string | null) => void;
  clearActivitySearch: () => void;
  setRecommendations: (recommendations: ViatorActivity[]) => void;
  setLoadingRecommendations: (loading: boolean) => void;
  getActivitiesByDestination: (destId: string) => ActivityEntry[];
  getActivitiesByDate: (date: Date) => ActivityEntry[];
  getTotalActivityBudget: () => number;
  resetActivities: () => void;
}

export interface ActivitySlice extends ActivityState, ActivityActions {}

export const createActivitySlice: StateCreator<
  ActivitySlice,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  ActivitySlice
> = (set, get) => ({
  ...initialActivityState,

  addActivityFromSearch: (viatorActivity: ViatorActivity, destinationId: string) => {
    set(
      (state) => {
        const newActivity: ActivityEntry = {
          id: crypto.randomUUID(),
          destinationId,
          viatorProductCode: viatorActivity.productCode,
          title: viatorActivity.title,
          description: viatorActivity.description,
          imageUrl: viatorActivity.primaryImage,
          duration: viatorActivity.duration,
          price: viatorActivity.price,
          currency: viatorActivity.currency,
          rating: viatorActivity.rating,
          reviewCount: viatorActivity.reviewCount,
          categories: viatorActivity.categories,
          date: null,
          bookingUrl: viatorActivity.bookingUrl,
          isManual: false,
          addedAt: new Date(),
        };
        return { activities: [...state.activities, newActivity] };
      },
      false,
      'activity/addFromSearch'
    );
  },

  addManualActivity: (activity: Partial<ActivityEntry>) => {
    const id = crypto.randomUUID();
    set(
      (state) => ({
        activities: [
          ...state.activities,
          {
            id,
            destinationId: activity.destinationId || '',
            title: activity.title || 'Nouvelle activité',
            date: activity.date || null,
            isManual: true,
            addedAt: new Date(),
            ...activity,
          } as ActivityEntry,
        ],
      }),
      false,
      'activity/addManual'
    );
    return id;
  },

  updateActivity: (id: string, updates: Partial<ActivityEntry>) => {
    set((state) => ({ activities: state.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)) }), false, 'activity/update');
  },

  removeActivity: (id: string) => {
    set(
      (state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        selectedActivityId: state.selectedActivityId === id ? null : state.selectedActivityId,
      }),
      false,
      'activity/remove'
    );
  },

  addLocalDestination: (destination: Omit<ActivityDestination, 'id' | 'isInherited'>) => {
    const id = crypto.randomUUID();
    set((state) => ({ localDestinations: [...state.localDestinations, { ...destination, id, isInherited: false }] }), false, 'activity/addLocalDestination');
    return id;
  },

  removeLocalDestination: (id: string) => {
    set(
      (state) => ({
        localDestinations: state.localDestinations.filter((d) => d.id !== id),
        activities: state.activities.filter((a) => a.destinationId !== id),
      }),
      false,
      'activity/removeLocalDestination'
    );
  },

  updateLocalDestination: (id: string, updates: Partial<ActivityDestination>) => {
    set((state) => ({ localDestinations: state.localDestinations.map((d) => (d.id === id ? { ...d, ...updates } : d)) }), false, 'activity/updateLocalDestination');
  },

  selectActivity: (id: string | null) => {
    set({ selectedActivityId: id }, false, 'activity/select');
  },

  getSelectedActivity: () => {
    const { activities, selectedActivityId } = get();
    return activities.find((a) => a.id === selectedActivityId) || null;
  },

  updateActivityFilters: (filters: Partial<ActivityFilters>) => {
    set((state) => ({ activeFilters: { ...state.activeFilters, ...filters } }), false, 'activity/updateFilters');
  },

  setActivitySearching: (isSearching: boolean) => {
    set((state) => ({ search: { ...state.search, isSearching } }), false, 'activity/setSearching');
  },

  setActivitySearchResults: (results: ViatorActivity[], total: number, hasMore: boolean) => {
    set(
      (state) => ({
        search: {
          ...state.search,
          isSearching: false,
          searchResults: results,
          attractions: results.slice(0, 15),
          activities: results,
          totalResults: total,
          totalAttractions: Math.min(results.length, 15),
          totalActivities: total,
          hasMore,
          error: null,
        },
      }),
      false,
      'activity/setSearchResults'
    );
  },

  setActivitySearchError: (error: string | null) => {
    set((state) => ({ search: { ...state.search, isSearching: false, error } }), false, 'activity/setSearchError');
  },

  clearActivitySearch: () => {
    set(
      (state) => ({
        search: { ...state.search, searchResults: [], attractions: [], activities: [], totalResults: 0, totalAttractions: 0, totalActivities: 0, currentPage: 1, hasMore: false, error: null },
      }),
      false,
      'activity/clearSearch'
    );
  },

  setRecommendations: (recommendations: ViatorActivity[]) => {
    set({ recommendations, isLoadingRecommendations: false }, false, 'activity/setRecommendations');
  },

  setLoadingRecommendations: (loading: boolean) => {
    set({ isLoadingRecommendations: loading }, false, 'activity/setLoadingRecommendations');
  },

  getActivitiesByDestination: (destId: string) => {
    return get().activities.filter((a) => a.destinationId === destId);
  },

  getActivitiesByDate: (date: Date) => {
    const dateStr = date.toDateString();
    return get().activities.filter((a) => a.date?.toDateString() === dateStr);
  },

  getTotalActivityBudget: () => {
    return get().activities.reduce((sum, a) => sum + (a.price || 0), 0);
  },

  resetActivities: () => {
    set(initialActivityState, false, 'activity/reset');
  },
});
