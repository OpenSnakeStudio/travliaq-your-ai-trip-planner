/**
 * Results Widgets - Compact result cards and action buttons
 *
 * These widgets display search results in a compact format suitable
 * for embedding in chat messages, with integrated action buttons.
 */

// CompactFlightCard - Flight result display
export {
  CompactFlightCard,
  type FlightSegment,
  type CompactFlightData,
} from "./CompactFlightCard";

// CompactHotelCard - Hotel result display
export {
  CompactHotelCard,
  type HotelAmenity,
  type CompactHotelData,
} from "./CompactHotelCard";

// CompactActivityCard - Activity result display
export {
  CompactActivityCard,
  type ActivityCategory,
  type CompactActivityData,
} from "./CompactActivityCard";

// Action Buttons - Reusable action buttons
export {
  AddToTripButton,
  QuickCompareButton,
  SaveButton,
  ShareButton,
  ViewDetailsButton,
  ActionButtonGroup,
  type ResultItemType,
} from "./ActionButtons";
