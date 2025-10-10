// Selection position utilities for highlight capture
export interface SelectionData {
  text: string;
  range: Range;
}

export interface PositionData {
  textBefore: string;
  textAfter: string;
  startOffset: number;
  endOffset: number;
  xpath: string;
}

/**
 * Get XPath for a DOM node
 */
export function getXPath(node: Node): string {
  const parts: string[] = [];
  let currentNode: Node | null = node;

  while (currentNode && currentNode.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = currentNode.previousSibling;

    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === currentNode.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const tagName = (currentNode as Element).tagName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : "";
    parts.unshift(tagName + pathIndex);

    currentNode = currentNode.parentNode;
  }

  return parts.length ? "/" + parts.join("/") : "";
}

/**
 * Get detailed position data for a text selection
 */
export function getSelectionPosition(range: Range): PositionData {
  const selectedText = range.toString();
  const fullText = range.commonAncestorContainer.textContent || "";

  // Find the absolute offset
  let absoluteOffset = 0;
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node === range.startContainer) break;
    absoluteOffset += node.textContent?.length || 0;
  }
  absoluteOffset += range.startOffset;

  const textBefore = fullText.substring(
    Math.max(0, absoluteOffset - 30),
    absoluteOffset
  );
  const textAfter = fullText.substring(
    absoluteOffset + selectedText.length,
    absoluteOffset + selectedText.length + 30
  );

  return {
    textBefore,
    textAfter,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    xpath: getXPath(range.startContainer),
  };
}

/**
 * Get current text selection if valid
 */
export function getValidSelection(): SelectionData | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const text = selection.toString().trim();
  if (!text) {
    return null;
  }

  const range = selection.getRangeAt(0);
  return {
    text,
    range: range.cloneRange(),
  };
}

/**
 * Highlight selected text visually on the page
 */
export function highlightTextRange(range: Range, color: string = "#ffeb3b"): void {
  try {
    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.style.padding = "2px 0";
    span.className = "captured-highlight";
    range.surroundContents(span);
  } catch (e) {
    console.log("Could not highlight text:", e);
  }
}

