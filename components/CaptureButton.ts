// Capture button component (vanilla JS for content script)

import { calculateButtonPosition } from "../utils/content/buttonPositioning";
import { getSelectionPosition, highlightTextRange } from "../utils/content/selectionUtils";
import { sendCaptureHighlight, showSuccessNotification, showErrorNotification } from "../utils/content/messaging";

export interface CaptureButtonOptions {
  onCapture?: () => void;
}

/**
 * CaptureButton class - manages the highlight capture button
 */
export class CaptureButton {
  private button: HTMLElement | null = null;
  private currentSelection: { text: string; range: Range } | null = null;
  private options: CaptureButtonOptions;

  constructor(options: CaptureButtonOptions = {}) {
    this.options = options;
  }

  /**
   * Create the button element
   */
  private createButton(): HTMLElement {
    const button = document.createElement("button");
    button.id = "highlight-capture-btn";
    button.innerHTML = "💡 Capture Highlight";
    button.style.cssText = `
      position: fixed !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      z-index: 2147483647 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      transition: all 0.2s ease !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      pointer-events: auto !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      transform: none !important;
    `;

    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0)";
      button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });

    button.addEventListener("click", (e) => this.handleCapture(e));

    if (document.body) {
      document.body.appendChild(button);
    }

    return button;
  }

  /**
   * Position the button near the selection
   */
  show(selectionRect: DOMRect, text: string, range: Range): void {
    if (!this.button) {
      this.button = this.createButton();
    }

    this.currentSelection = { text, range };

    const { left, top } = calculateButtonPosition(selectionRect, {
      width: 180,
      height: 40,
    });

    this.button.style.setProperty("left", `${left}px`, "important");
    this.button.style.setProperty("top", `${top}px`, "important");
    this.button.style.setProperty("display", "block", "important");
    this.button.style.setProperty("visibility", "visible", "important");
    this.button.style.setProperty("opacity", "1", "important");

    // Ensure button is in DOM
    if (!document.body.contains(this.button)) {
      document.body.appendChild(this.button);
    }

    // Force reflow
    void this.button.offsetHeight;
  }

  /**
   * Hide the button
   */
  hide(): void {
    if (this.button) {
      this.button.style.setProperty("display", "none", "important");
      this.button.style.setProperty("visibility", "hidden", "important");
      this.button.style.setProperty("opacity", "0", "important");
    }
    this.currentSelection = null;
  }

  /**
   * Handle capture button click
   */
  private async handleCapture(e: Event): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    if (!this.currentSelection) return;

    const { text, range } = this.currentSelection;

    try {
      // Get selection position data
      const position = getSelectionPosition(range);

      // Get current page info
      const pageUrl = window.location.href;
      const pageTitle = document.title;

      // Send to background script
      const response = await sendCaptureHighlight({
        text,
        position,
        pageUrl,
        pageTitle,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        // Visual feedback
        showSuccessNotification();
        highlightTextRange(range);
        this.options.onCapture?.();
      } else {
        showErrorNotification(response.error || "Failed to capture highlight");
      }
    } catch (error) {
      console.error("Error capturing highlight:", error);
      showErrorNotification();
    }

    this.hide();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.button && document.body.contains(this.button)) {
      document.body.removeChild(this.button);
    }
    this.button = null;
    this.currentSelection = null;
  }
}

