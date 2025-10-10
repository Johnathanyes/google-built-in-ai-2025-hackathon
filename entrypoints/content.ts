/**
 * Content Script - Highlight Capture Feature
 * 
 * This script enables users to select text on any webpage and capture it
 * as a highlight that persists in the extension popup.
 */

import { CaptureButton } from "../components/CaptureButton";
import { getValidSelection } from "../utils/content/selectionUtils";
import { injectStyles } from "../utils/content/styles";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  main() {
    let captureButton: CaptureButton | null = null;
    let isInitialized = false;

    /**
     * Handle text selection events
     */
    function handleSelection(): void {
      const selection = getValidSelection();

      if (!selection) {
        captureButton?.hide();
        return;
      }

      const { text, range } = selection;
      const rect = range.getBoundingClientRect();

      if (!captureButton) {
        captureButton = new CaptureButton();
      }

      captureButton.show(rect, text, range);
    }

    /**
     * Handle clicks outside the button
     */
    function handleClickOutside(e: MouseEvent): void {
      const target = e.target as HTMLElement;
      
      // Don't hide if clicking the button itself
      if (target.id === "highlight-capture-btn") {
        return;
      }

      // Small delay to check if there's still a selection
      setTimeout(() => {
        const selection = getValidSelection();
        if (!selection) {
          captureButton?.hide();
        }
      }, 10);
    }

    /**
     * Initialize the content script
     */
    function init(): void {
      if (isInitialized) return;

      // Inject CSS styles
      injectStyles();

      // Set up event listeners
      document.addEventListener("mouseup", () => {
        // Small delay to ensure selection is complete
        setTimeout(handleSelection, 10);
      });

      document.addEventListener("mousedown", handleClickOutside);

      // Handle page unload
      window.addEventListener("beforeunload", () => {
        captureButton?.destroy();
      });

      isInitialized = true;
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  },
});
