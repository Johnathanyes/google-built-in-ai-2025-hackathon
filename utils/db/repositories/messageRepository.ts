// Message repository - handles message operations
import type { DBOperations } from '../db';
import type { MessageStore } from '../schema';

const STORE_NAME = 'messages';

export class MessageRepository {
  constructor(private readonly ops: DBOperations) {}

  async save(message: MessageStore): Promise<void> {
    await this.ops.put(STORE_NAME, message);
  }

  async get(id: string): Promise<MessageStore | undefined> {
    return this.ops.get<MessageStore>(STORE_NAME, id);
  }

  async getByConversation(conversationId: string): Promise<MessageStore[]> {
    const messages = await this.ops.getAllByIndex<MessageStore>(
      STORE_NAME,
      'conversationId',
      conversationId
    );
    // Sort by time created ascending
    return messages.sort((a, b) => 
      new Date(a.timeCreated).getTime() - new Date(b.timeCreated).getTime()
    );
  }

  async delete(id: string): Promise<void> {
    await this.ops.delete(STORE_NAME, id);
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    const messages = await this.getByConversation(conversationId);
    await Promise.all(messages.map(msg => this.delete(msg.id)));
  }

  async count(conversationId?: string): Promise<number> {
    if (conversationId) {
      const messages = await this.getByConversation(conversationId);
      return messages.length;
    }
    return this.ops.count(STORE_NAME);
  }
}

