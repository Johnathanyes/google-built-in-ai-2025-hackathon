/**
 * Content Script Utilities
 * 
 * Centralized exports for all content script utilities
 */

// Selection utilities
export {
  getXPath,
  getSelectionPosition,
  getValidSelection,
  highlightTextRange,
  type SelectionData,
  type PositionData,
} from "./selectionUtils";

// Button positioning
export {
  calculateButtonPosition,
  isInViewport,
  type ButtonDimensions,
  type ViewportBounds,
} from "./buttonPositioning";

// Messaging
export {
  sendCaptureHighlight,
  showSuccessNotification,
  showErrorNotification,
  type CaptureHighlightPayload,
  type CaptureHighlightResponse,
} from "./messaging";

// Styles
export { injectStyles } from "./styles";

