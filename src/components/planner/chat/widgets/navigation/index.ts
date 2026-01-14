/**
 * Navigation Widgets - Tab switching, buttons, and quick edits
 *
 * These widgets provide navigation controls for the planner,
 * allowing users to switch tabs, go back, and edit parameters.
 */

// TabSwitcher - Tab navigation
export {
  TabSwitcher,
  InlineTabSwitcher,
  QuickTabButtons,
  DEFAULT_TABS,
  type PlannerTab,
  type TabConfig,
} from "./TabSwitcher";

// NavigationButtons - Action buttons
export {
  SearchAgainButton,
  ViewMoreButton,
  BackButton,
  ResetButton,
  RefreshButton,
  HomeButton,
  NavigationButtonGroup,
  PaginationControls,
} from "./NavigationButtons";

// QuickEditChips - Quick parameter editing
export {
  QuickEditChips,
  EditButton,
  AddChip,
  TripParametersBar,
  COMMON_EDIT_CHIPS,
  useCommonEditChips,
  type EditAction,
  type EditChip,
} from "./QuickEditChips";
