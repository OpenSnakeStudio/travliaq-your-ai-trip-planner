/**
 * Zustand Store Hooks
 * 
 * These hooks provide drop-in replacements for the old Context hooks.
 * They expose the exact same API but use Zustand under the hood.
 */

// Flight Memory (replaces useFlightMemory from FlightMemoryContext)
export { useFlightMemoryStore } from './useFlightMemoryStore';
export type { 
  FlightMemory, 
  FlightMemoryStoreValue, 
  MemoryRoutePoint,
  MissingField,
  AirportInfo,
  FlightLegMemory,
  TripType,
  CabinClass,
  FlightPassengers,
} from './useFlightMemoryStore';

// Travel Memory (replaces useTravelMemory from TravelMemoryContext)
export { useTravelMemoryStore } from './useTravelMemoryStore';
export type { 
  TravelMemory, 
  TravelMemoryStoreValue,
  TravelersInfo,
  DestinationInfo,
} from './useTravelMemoryStore';

// Re-export bridge hooks for backward compatibility during migration
export * from '../bridgeHooks';
