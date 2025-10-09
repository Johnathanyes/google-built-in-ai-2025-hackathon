import type { DBOperations } from '../db';
import type { HighlightedContext } from '../schema';

const STORE_NAME = "highlights";

export class highlightedContextRepository {
    constructor(private readonly ops: DBOperations) {}

    async save(highlightedContext: HighlightedContext): Promise<void> {
        await this.ops.put(STORE_NAME, highlightedContext);
    }

    async get(id: string): Promise<HighlightedContext | undefined> {
        return this.ops.get<HighlightedContext>(STORE_NAME, id);
    }

    async getAll(): Promise<HighlightedContext[]> {
        const highlights = await this.ops.getAll<HighlightedContext>(STORE_NAME);
        // Sort by time created descending (newest first)
        return highlights.sort((a, b) => 
            new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
        );
    }

    async getByConversation(conversationId: string): Promise<HighlightedContext[]> {
        return this.ops.getAllByIndex<HighlightedContext>(
            STORE_NAME,
            'conversationId',
            conversationId
        );
    }
    
    async delete(id: string): Promise<void> {
        await this.ops.delete(STORE_NAME, id);
    }

    async deleteByConversation(conversationId: string): Promise<void> {
        const highlights = await this.getByConversation(conversationId);
        await Promise.all(highlights.map(highlight => this.delete(highlight.id)));
    }
}