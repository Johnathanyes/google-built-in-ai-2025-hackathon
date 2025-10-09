// ============================================
// USER DATA
// ============================================
export interface UserData {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark";
}

// ============================================
// CONVERSATIONS
// ============================================
export interface Conversations {
  id: string;
  pageUrl: string;
  pageTitle: string;
  dateCreated: Date;
  lastUpdated: Date;
  hasPageContext: boolean; // True if user clicked "Capture Page"
  messageCount: number;
}

// ============================================
// MESSAGES
// ============================================
export interface MessageStore {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string | MultimodalContent;
  timeCreated: Date;
  // Context used for THIS specific message
  usedPageContext: boolean; // Was page context included in this message?
  usedHighlightIds?: string[]; // Which highlights were active for this message
  usedAttachmentIds?: string[]; // Which attachments were sent with this message
  tokenCount?: number;
  error?: string;
}

export interface MultimodalContent {
  type: "multimodal";
  parts: ContentPart[];
}

export interface ContentPart {
  type: "text" | "image";
  content: string; // Text or base64 for images
  mimeType?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    alt?: string;
  };
}

// ============================================
// PAGE CONTEXT (Manual capture via button)
// ============================================
export interface PageContext {
  id: string;
  conversationId: string;
  context: string; // Extracted page text
  metadata: PageMetadata;
  timeCreated: Date;
  captureMethod: "manual-button" | "auto-refresh"; // How it was captured
  isActive: boolean; // User can toggle on/off in UI
  tokenCount?: number;
  // Track if page has changed since capture
  lastPageUrl: string; // URL when captured
  pageVersion?: string; // Hash of content to detect changes
}

export interface PageMetadata {
  url: string;
  title: string;
  description?: string;
  author?: string;
  language?: string;
  selectors?: CaptureSelectors; // What was captured
}

export interface CaptureSelectors {
  includeHeader: boolean;
  includeMainContent: boolean;
  includeSidebar: boolean;
  includeFooter: boolean;
  customSelectors?: string[]; // Advanced: user-defined CSS selectors
}

// ============================================
// HIGHLIGHTED CONTEXT
// ============================================
export interface HighlightedContext {
  id: string;
  conversationId: string;
  highlightedText: string;
  timeCreated: Date;
  color?: string; // Visual marker: 'yellow', 'green', 'blue'
  position?: SelectionPosition; // Where on page
  note?: string; // User can add a note about why they highlighted this
}

export interface SelectionPosition {
  xpath?: string; // DOM path
  textBefore?: string; // 30 chars before for context
  textAfter?: string; // 30 chars after for context
  startOffset: number;
  endOffset: number;
}

// ============================================
// MULTIMODAL ATTACHMENTS
// ============================================
export interface MultimodalAttachment {
  id: string;
  conversationId: string;
  messageId?: string; // If attached to a specific message
  timeCreated: Date;
  type: "image" | "screenshot" | "paste";
  data: string; // Base64 encoded
  mimeType: string;
  size: number; // Bytes
  fileName?: string;
  source: "upload" | "screenshot" | "paste" | "drag-drop";
  thumbnail?: string; // Smaller version (200x200) for UI
  isActive: boolean; // Can be toggled off without deletion
  metadata?: {
    width?: number;
    height?: number;
    description?: string; // User-added caption
  };
}

// ============================================
// UTILITY TYPES
// ============================================

// Full conversation data for rendering
export interface ConversationWithContext extends Conversations {
  pageContext?: PageContext; // Only present if user clicked "Capture Page"
  highlightedContexts: HighlightedContext[]; // All user highlights
  multimodalAttachments: MultimodalAttachment[]; // All attachments
  messages: MessageStore[];
}

// For building the prompt to send to API
export interface PromptContext {
  userMessage: string | MultimodalContent;
  // Optional contexts (controlled by UI toggles)
  pageContext?: string; // Only if user has it captured AND toggled on
  highlights?: string[]; // Only selected highlights
  attachments?: string[]; // Only selected attachments (base64)
}

// For the "Capture Page" button action
export interface CapturePageRequest {
  conversationId: string;
  selectors?: CaptureSelectors; // What to capture (default: main content)
  overwrite?: boolean; // Replace existing capture or version it
}

// For the highlight action
export interface AddHighlightRequest {
  conversationId: string;
  text: string;
  position: SelectionPosition;
  label?: string;
  color?: string;
}
