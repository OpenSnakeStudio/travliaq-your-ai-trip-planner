// Shared map settings for consistent behavior across components

// Zoom level used for accommodation/stays tab focus
export const STAYS_ZOOM = 13;

// Calculate horizontal offset for stays tab when panel is open
// Returns a negative value to shift camera left → city appears more to the right
export function getStaysPanelOffset(isPanelOpen: boolean): number {
  if (!isPanelOpen) return 0;

  const panelEl = document.querySelector('[data-tour="widgets-panel"]') as HTMLElement | null;
  const panelWidth = panelEl?.getBoundingClientRect().width ?? 420;

  // Shift left by ~1/5 of panel width for balanced centering
  const offset = -Math.round(panelWidth / 5);
  return Math.max(-160, Math.min(-60, offset));
}
