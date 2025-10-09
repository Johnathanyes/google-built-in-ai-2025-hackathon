export default defineBackground(() => {
  console.log('Background script initialized', { id: browser.runtime.id });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CAPTURE_HIGHLIGHT') {
      handleCaptureHighlight(message.payload, sender).then(sendResponse);
      return true; // Keep message channel open for async response
    }
    
    if (message.type === 'GET_HIGHLIGHTS') {
      getHighlights(message.payload).then(sendResponse);
      return true;
    }
  });

  async function handleCaptureHighlight(payload: any, sender: chrome.runtime.MessageSender) {
    try {
      const { db } = await import('../utils/db/index');
      
      // Initialize database
      await db.init();
      
      // Generate unique ID
      const highlightId = `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create highlight object
      const highlight: import('../utils/db/schema').HighlightedContext = {
        id: highlightId,
        conversationId: payload.conversationId || 'default', // Use 'default' if no conversation
        highlightedText: payload.text,
        timeCreated: new Date(payload.timestamp),
        color: '#ffeb3b',
        position: payload.position,
        note: undefined,
      };
      
      // Save to database
      await db.highlights.save(highlight);
      
      console.log('Highlight saved:', highlight);
      
      // Notify popup to refresh (if open)
      chrome.runtime.sendMessage({ type: 'HIGHLIGHT_ADDED', payload: highlight });
      
      return { success: true, highlightId };
    } catch (error) {
      console.error('Error saving highlight:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async function getHighlights(payload: { conversationId?: string }) {
    try {
      const { db } = await import('../utils/db/index');
      await db.init();
      
      let highlights;
      if (payload?.conversationId) {
        highlights = await db.highlights.getByConversation(payload.conversationId);
      } else {
        highlights = await db.highlights.getAll();
      }
      
      return { success: true, highlights };
    } catch (error) {
      console.error('Error getting highlights:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
});
