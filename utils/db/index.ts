// Main database entrypoint - exports singleton instance and repositories
import { Database, DBOperations } from './db';
import { allSchemas } from './schemas';
import { UserRepository } from './repositories/userRepository';
import { ConversationRepository } from './repositories/conversationRepository';
import { MessageRepository } from './repositories/messageRepository';

// Create singleton database instance
const database = new Database('AppDB', allSchemas);
const dbOps = new DBOperations(database);

// Initialize database on import (lazy init on first use)
let initPromise: Promise<void> | null = null;
const ensureInit = async () => {
  if (!initPromise) {
    initPromise = database.init();
  }
  return initPromise;
};

// Repository instances
export const userRepo = new UserRepository(dbOps);
export const conversationRepo = new ConversationRepository(dbOps);
export const messageRepo = new MessageRepository(dbOps);

// Simple API for common operations (backwards compatible with old db.ts)
export const db = {
  async init() {
    await ensureInit();
  },

  async saveUser(userData: import('./schema').UserData) {
    await ensureInit();
    return userRepo.save(userData);
  },

  async getUser(id: string) {
    await ensureInit();
    return userRepo.get(id);
  },

  async getAllUsers() {
    await ensureInit();
    return userRepo.getAll();
  },

  async deleteUser(id: string) {
    await ensureInit();
    return userRepo.delete(id);
  },

  // Expose repositories for advanced usage
  users: userRepo,
  conversations: conversationRepo,
  messages: messageRepo,
};

// Export types
export * from './schema';
export type { Database, DBOperations, StoreConfig, Schema } from './db';

