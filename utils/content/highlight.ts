import { AddHighlightRequest, SelectionPosition } from "../db";

function getSelectionPosition(): SelectionPosition | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString();

  // Get XPath to the start container
  const xpath = getXPath(range.startContainer);

  // Get context text (30 chars before and after)
  const fullText = range.commonAncestorContainer.textContent || "";
  const absoluteOffset = getAbsoluteOffset(
    range.startContainer,
    range.startOffset
  );

  const textBefore = fullText.substring(
    Math.max(0, absoluteOffset - 30),
    absoluteOffset
  );
  const textAfter = fullText.substring(
    absoluteOffset + selectedText.length,
    absoluteOffset + selectedText.length + 30
  );

  return {
    xpath,
    textBefore,
    textAfter,
    startOffset: range.startOffset,
    endOffset: range.endOffset,
  };
}

function getXPath(node: Node): string {
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

function getAbsoluteOffset(node: Node, offset: number): number {
  const ancestor = node.parentElement;
  if (!ancestor) return offset;

  let absoluteOffset = offset;
  let currentNode = ancestor.firstChild;

  while (currentNode && currentNode !== node) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      absoluteOffset += currentNode.textContent?.length || 0;
    }
    currentNode = currentNode.nextSibling;
  }

  return absoluteOffset;
}

document.addEventListener("mouseup", async () => {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === "") return;

  const text = selection.toString();
  const position = getSelectionPosition();
  if (!position) return;

  const color = "#ffea8a"; // light yellow highlight
  const highlightReq: AddHighlightRequest = {
    conversationId: "current", // Replace dynamically if needed
    text,
    position,
    color,
  };

  // Optional visual highlight
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.backgroundColor = color;
  range.surroundContents(span);

  // Send to background for persistence
  chrome.runtime.sendMessage({ type: "ADD_HIGHLIGHT", payload: highlightReq });
});
