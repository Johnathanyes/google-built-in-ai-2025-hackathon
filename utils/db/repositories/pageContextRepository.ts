// Page Context repository - handles page context operations
import type { DBOperations } from '../db';
import type { PageContext } from '../schema';

const STORE_NAME = 'pageContext';

export class PageContextRepository {
  constructor(private readonly ops: DBOperations) {}

  async save(pageContext: PageContext): Promise<void> {
    await this.ops.put(STORE_NAME, pageContext);
  }

  async get(id: string): Promise<PageContext | undefined> {
    return this.ops.get<PageContext>(STORE_NAME, id);
  }

  async getByConversation(conversationId: string): Promise<PageContext[]> {
    return this.ops.getAllByIndex<PageContext>(
      STORE_NAME,
      'conversationId',
      conversationId
    );
  }

  async delete(id: string): Promise<void> {
    await this.ops.delete(STORE_NAME, id);
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    const contexts = await this.getByConversation(conversationId);
    await Promise.all(contexts.map(ctx => this.delete(ctx.id)));
  }
}

