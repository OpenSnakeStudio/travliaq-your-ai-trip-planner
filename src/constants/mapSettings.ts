// Shared map settings for consistent behavior across components

// Zoom level used for accommodation/stays tab focus
export const STAYS_ZOOM = 10;

// Calculate horizontal offset for stays tab when panel is open
// Returns a negative value to shift camera left → city appears more to the right
export function getStaysPanelOffset(isPanelOpen: boolean): number {
  if (!isPanelOpen) return 0;

  const panelEl = document.querySelector('[data-tour="widgets-panel"]') as HTMLElement | null;
  const panelWidth = panelEl?.getBoundingClientRect().width ?? 420;

  // Shift left by ~1/4 of panel width for more right placement
  const offset = -Math.round(panelWidth / 4);
  return Math.max(0, Math.min(-80, offset));
}

// Get horizontal pixel offset for hotel click - shifts point to the right of center
// to account for the left panel taking up space
export function getHotelClickOffset(): [number, number] {
  const panelEl = document.querySelector('[data-tour="widgets-panel"]') as HTMLElement | null;
  const panelWidth = panelEl?.getBoundingClientRect().width ?? 420;
  
  // Shift the map so the clicked point appears to the right of center
  // Negative X = map moves left, point appears on the right
  return [-(panelWidth / 2 + 50), 0];
}
