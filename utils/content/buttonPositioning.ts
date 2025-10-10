// Button positioning utilities

export interface ButtonDimensions {
  width: number;
  height: number;
}

export interface ViewportBounds {
  width: number;
  height: number;
}

/**
 * Calculate optimal button position based on selection rect
 * Uses viewport coordinates for fixed positioning
 */
export function calculateButtonPosition(
  selectionRect: DOMRect,
  buttonDimensions: ButtonDimensions,
  padding: number = 10
): { left: number; top: number } {
  const viewport: ViewportBounds = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Center button horizontally above selection
  let left = selectionRect.left + selectionRect.width / 2 - buttonDimensions.width / 2;
  let top = selectionRect.top - buttonDimensions.height - padding;

  // Horizontal bounds checking
  if (left + buttonDimensions.width > viewport.width) {
    left = viewport.width - buttonDimensions.width - padding;
  }
  if (left < padding) {
    left = padding;
  }

  // Vertical bounds checking
  if (top < padding) {
    // Not enough space above, position below
    top = selectionRect.bottom + padding;
  }

  // Check if button would be below viewport
  if (top + buttonDimensions.height > viewport.height) {
    // Try above again
    top = selectionRect.top - buttonDimensions.height - padding;
    if (top < padding) {
      // If still doesn't fit, position at top
      top = padding;
    }
  }

  return { left, top };
}

/**
 * Check if element is within viewport bounds
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

