// Database schema definitions with versioning
import type { Schema } from './db';

// Version 1: Initial schema
export const schemaV1: Schema = {
  version: 1,
  stores: [
    {
      name: 'users',
      keyPath: 'id',
      indexes: [
        { name: 'email', keyPath: 'email', unique: true },
      ],
    },
    {
      name: 'conversations',
      keyPath: 'id',
      indexes: [
        { name: 'pageUrl', keyPath: 'pageUrl' },
        { name: 'lastUpdated', keyPath: 'lastUpdated' },
      ],
    },
    {
      name: 'messages',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId' },
        { name: 'timeCreated', keyPath: 'timeCreated' },
      ],
    },
    {
      name: 'pageContext',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId' },
        { name: 'isActive', keyPath: 'isActive' },
      ],
    },
    {
      name: 'highlights',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId' },
        { name: 'isActive', keyPath: 'isActive' },
        { name: 'order', keyPath: 'order' },
      ],
    },
    {
      name: 'attachments',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId' },
        { name: 'messageId', keyPath: 'messageId' },
        { name: 'isActive', keyPath: 'isActive' },
      ],
    },
    {
      name: 'uiState',
      keyPath: 'id',
      indexes: [
        { name: 'conversationId', keyPath: 'conversationId', unique: true },
      ],
    },
  ],
};

// Future schema versions go here
// export const schemaV2: Schema = { ... };

// All schemas (for migrations)
export const allSchemas: Schema[] = [schemaV1];

