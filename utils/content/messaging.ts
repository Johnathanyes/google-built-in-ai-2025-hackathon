// Chrome extension messaging utilities

import type { PositionData } from "./selectionUtils";

export interface CaptureHighlightPayload {
  text: string;
  position: PositionData;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
}

export interface CaptureHighlightResponse {
  success: boolean;
  highlightId?: string;
  error?: string;
}

/**
 * Send highlight capture message to background script
 */
export async function sendCaptureHighlight(
  payload: CaptureHighlightPayload
): Promise<CaptureHighlightResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "CAPTURE_HIGHLIGHT",
        payload,
      },
      (response: CaptureHighlightResponse) => {
        resolve(response);
      }
    );
  });
}

/**
 * Show success notification
 */
export function showSuccessNotification(message: string = "✓ Highlight captured!"): void {
  const feedback = document.createElement("div");
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #4caf50 !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    animation: slideIn 0.3s ease !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.animation = "slideOut 0.3s ease";
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

/**
 * Show error notification
 */
export function showErrorNotification(message: string = "Failed to capture highlight"): void {
  const feedback = document.createElement("div");
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #f44336 !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    animation: slideIn 0.3s ease !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.animation = "slideOut 0.3s ease";
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

