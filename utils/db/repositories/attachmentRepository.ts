// Attachment repository - handles multimodal attachment operations
import type { DBOperations } from '../db';
import type { MultimodalAttachment } from '../schema';

const STORE_NAME = 'attachments';

export class AttachmentRepository {
  constructor(private readonly ops: DBOperations) {}

  async save(attachment: MultimodalAttachment): Promise<void> {
    await this.ops.put(STORE_NAME, attachment);
  }

  async get(id: string): Promise<MultimodalAttachment | undefined> {
    return this.ops.get<MultimodalAttachment>(STORE_NAME, id);
  }

  async getByConversation(conversationId: string): Promise<MultimodalAttachment[]> {
    return this.ops.getAllByIndex<MultimodalAttachment>(
      STORE_NAME,
      'conversationId',
      conversationId
    );
  }

  async getByMessage(messageId: string): Promise<MultimodalAttachment[]> {
    return this.ops.getAllByIndex<MultimodalAttachment>(
      STORE_NAME,
      'messageId',
      messageId
    );
  }

  async delete(id: string): Promise<void> {
    await this.ops.delete(STORE_NAME, id);
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    const attachments = await this.getByConversation(conversationId);
    await Promise.all(attachments.map(att => this.delete(att.id)));
  }
}

