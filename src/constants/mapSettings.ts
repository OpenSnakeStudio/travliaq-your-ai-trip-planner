// Shared map settings for consistent behavior across components

// Zoom level used for accommodation/stays tab focus
export const STAYS_ZOOM = 10;

// Calculate horizontal offset for stays tab
// When panel is closed, shift the map MORE to the left to center content in visible area
// When panel is open, shift less since panel takes space
export function getStaysPanelOffset(isPanelOpen: boolean): number {
  const panelEl = document.querySelector('[data-tour="widgets-panel"]') as HTMLElement | null;
  const panelWidth = panelEl?.getBoundingClientRect().width ?? 420;

  if (!isPanelOpen) {
    // When panel is CLOSED, shift map content significantly to the left
    // This centers the visible map area (since the left panel area is now empty)
    return -Math.round(panelWidth * 0.4); // More pronounced shift: 40% of panel width
  }

  // When panel is OPEN, shift left by ~1/4 of panel width for more right placement
  const offset = -Math.round(panelWidth / 4);
  return Math.max(160, Math.min(-80, offset));
}
