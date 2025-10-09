// Conversation repository - handles conversation operations
import type { DBOperations } from '../db';
import type { Conversations } from '../schema';
import type { MessageRepository } from './messageRepository';
import type { highlightedContextRepository } from './highlightRepository';
import type { PageContextRepository } from './pageContextRepository';
import type { AttachmentRepository } from './attachmentRepository';

const STORE_NAME = 'conversations';

export class ConversationRepository {
  constructor(
    private readonly ops: DBOperations,
    private readonly messageRepo?: MessageRepository,
    private readonly highlightRepo?: highlightedContextRepository,
    private readonly pageContextRepo?: PageContextRepository,
    private readonly attachmentRepo?: AttachmentRepository,
  ) {}

  async save(conversation: Conversations): Promise<void> {
    await this.ops.put(STORE_NAME, conversation);
  }

  async get(id: string): Promise<Conversations | undefined> {
    return this.ops.get<Conversations>(STORE_NAME, id);
  }

  async getAll(): Promise<Conversations[]> {
    const conversations = await this.ops.getAll<Conversations>(STORE_NAME);
    // Sort by lastUpdated descending
    return conversations.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getByPageUrl(pageUrl: string): Promise<Conversations[]> {
    return this.ops.getAllByIndex<Conversations>(STORE_NAME, 'pageUrl', pageUrl);
  }

  async delete(id: string): Promise<void> {
    // Cascade delete all related data
    // Delete in parallel for better performance
    await Promise.all([
      // Delete all messages
      this.messageRepo?.deleteByConversation(id),
      // Delete all highlights
      this.highlightRepo?.deleteByConversation(id),
      // Delete all page contexts
      this.pageContextRepo?.deleteByConversation(id),
      // Delete all attachments
      this.attachmentRepo?.deleteByConversation(id),
    ]);

    // Finally delete the conversation itself
    await this.ops.delete(STORE_NAME, id);
  }

  async count(): Promise<number> {
    return this.ops.count(STORE_NAME);
  }
}

