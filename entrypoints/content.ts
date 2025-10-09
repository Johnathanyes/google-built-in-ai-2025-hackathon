export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    console.log('🎯 Highlight capture content script loaded');
    
    let captureButton: HTMLElement | null = null;
    let currentSelection: { text: string; range: Range } | null = null;
    let isInitialized = false;

    // Create the capture button
    function createCaptureButton(): HTMLElement {
      console.log('🔨 Creating capture button');
      const button = document.createElement('button');
      button.id = 'highlight-capture-btn';
      button.innerHTML = '💡 Capture Highlight';
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
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      button.addEventListener('click', handleCaptureClick);
      
      // Ensure body exists before appending
      if (document.body) {
        document.body.appendChild(button);
        console.log('✅ Button appended to body');
        console.log('🔍 Button element:', button);
        console.log('🔍 Button in DOM:', document.body.contains(button));
      } else {
        console.error('❌ Document body not found');
      }
      
      return button;
    }

    // Position the button near the selection
    function positionButton(rect: DOMRect) {
      if (!captureButton) return;
      
      const buttonWidth = 180;
      const buttonHeight = 40;
      const padding = 10;
      
      // For position:fixed, use viewport coordinates (don't add scroll offsets)
      let left = rect.left + (rect.width / 2) - (buttonWidth / 2);
      let top = rect.top - buttonHeight - padding;
      
      // Keep button within viewport
      if (left + buttonWidth > window.innerWidth) {
        left = window.innerWidth - buttonWidth - padding;
      }
      if (left < padding) {
        left = padding;
      }
      if (top < padding) {
        // Position below the selection instead
        top = rect.bottom + padding;
      }
      
      // Check if button would be below the viewport
      if (top + buttonHeight > window.innerHeight) {
        // Try to position above again
        top = rect.top - buttonHeight - padding;
        if (top < padding) {
          // If still doesn't fit, position at the top of viewport
          top = padding;
        }
      }
      
      console.log('📐 Button position:', {
        left,
        top,
        rect: { left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        scroll: { x: window.scrollX, y: window.scrollY }
      });
      
      captureButton.style.setProperty('left', `${left}px`, 'important');
      captureButton.style.setProperty('top', `${top}px`, 'important');
      captureButton.style.setProperty('display', 'block', 'important');
      captureButton.style.setProperty('visibility', 'visible', 'important');
      captureButton.style.setProperty('opacity', '1', 'important');
      
      
      if (!document.body.contains(captureButton)) {
        document.body.appendChild(captureButton);
      }
      
      void captureButton.offsetHeight;
    }

    // Handle text selection
    function handleSelection() {
      const selection = window.getSelection();
      
      console.log('📝 Selection changed:', selection?.toString());
      
      if (!selection || selection.toString().trim() === '') {
        hideButton();
        currentSelection = null;
        return;
      }

      const text = selection.toString().trim();
      
      // Minimum selection length
      if (text.length < 3) {
        console.log('⚠️ Selection too short');
        hideButton();
        return;
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      console.log('✨ Valid selection detected:', text.substring(0, 50) + '...');
      
      currentSelection = { text, range: range.cloneRange() };
      
      if (!captureButton) {
        captureButton = createCaptureButton();
      }
      
      if (captureButton) {
        positionButton(rect);
        console.log('📍 Button positioned');
      }
    }

    // Hide the button
    function hideButton() {
      if (captureButton) {
        captureButton.style.setProperty('display', 'none', 'important');
        captureButton.style.setProperty('visibility', 'hidden', 'important');
        captureButton.style.setProperty('opacity', '0', 'important');
      }
    }

    // Handle capture button click
    async function handleCaptureClick(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!currentSelection) return;

      const { text, range } = currentSelection;
      
      // Get selection position data
      const position = getSelectionPosition(range);
      
      // Get current page URL and title
      const pageUrl = window.location.href;
      const pageTitle = document.title;
      
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'CAPTURE_HIGHLIGHT',
        payload: {
          text,
          position,
          pageUrl,
          pageTitle,
          timestamp: new Date().toISOString(),
        }
      }, (response) => {
        if (response?.success) {
          // Visual feedback
          showSuccessFeedback();
          // Optionally highlight the text
          highlightText(range);
        }
      });
      
      hideButton();
      currentSelection = null;
    }

    // Get selection position details
    function getSelectionPosition(range: Range) {
      const selectedText = range.toString();
      const fullText = range.commonAncestorContainer.textContent || '';
      
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
      
      const textBefore = fullText.substring(Math.max(0, absoluteOffset - 30), absoluteOffset);
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

    // Get XPath for a node
    function getXPath(node: Node): string {
      const parts: string[] = [];
      let currentNode: Node | null = node;
      
      while (currentNode && currentNode.nodeType === Node.ELEMENT_NODE) {
        let index = 0;
        let sibling = currentNode.previousSibling;
        
        while (sibling) {
          if (sibling.nodeType === Node.ELEMENT_NODE && 
              sibling.nodeName === currentNode.nodeName) {
            index++;
          }
          sibling = sibling.previousSibling;
        }
        
        const tagName = (currentNode as Element).tagName.toLowerCase();
        const pathIndex = index > 0 ? `[${index + 1}]` : '';
        parts.unshift(tagName + pathIndex);
        
        currentNode = currentNode.parentNode;
      }
      
      return parts.length ? '/' + parts.join('/') : '';
    }

    // Highlight the selected text
    function highlightText(range: Range) {
      try {
        const span = document.createElement('span');
        span.style.backgroundColor = '#ffeb3b';
        span.style.padding = '2px 0';
        span.className = 'captured-highlight';
        range.surroundContents(span);
      } catch (e) {
        console.log('Could not highlight text:', e);
      }
    }

    // Show success feedback
    function showSuccessFeedback() {
      const feedback = document.createElement('div');
      feedback.textContent = '✓ Highlight captured!';
      feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
      }, 2000);
    }

    // Initialize function
    function init() {
      if (isInitialized) return;
      
      console.log('🚀 Initializing highlight capture...');
      
      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Event listeners
      document.addEventListener('mouseup', (e) => {
        // Small delay to ensure selection is complete
        setTimeout(handleSelection, 10);
      });

      document.addEventListener('mousedown', (e) => {
        // Hide button if clicking outside
        if (captureButton && e.target !== captureButton) {
          setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
              hideButton();
            }
          }, 10);
        }
      });
      
      isInitialized = true;
      console.log('✅ Highlight capture initialized successfully!');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  },
});
