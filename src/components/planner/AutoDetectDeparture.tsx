import { useAutoDetectDeparture } from '@/hooks/useAutoDetectDeparture';

/**
 * Component that automatically detects user's location and sets departure airport.
 * Must be rendered inside FlightMemoryProvider.
 * Renders nothing - just runs the effect.
 */
export function AutoDetectDeparture() {
  useAutoDetectDeparture();
  return null;
}
