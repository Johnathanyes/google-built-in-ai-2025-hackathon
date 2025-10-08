// User repository - handles all user data operations
import type { DBOperations } from '../db';
import type { UserData } from '../schema';

const STORE_NAME = 'users';

export class UserRepository {
  constructor(private readonly ops: DBOperations) {}

  async save(userData: UserData): Promise<void> {
    await this.ops.put(STORE_NAME, userData);
  }

  async get(id: string): Promise<UserData | undefined> {
    return this.ops.get<UserData>(STORE_NAME, id);
  }

  async getByEmail(email: string): Promise<UserData | undefined> {
    return this.ops.getByIndex<UserData>(STORE_NAME, 'email', email);
  }

  async getAll(): Promise<UserData[]> {
    return this.ops.getAll<UserData>(STORE_NAME);
  }

  async delete(id: string): Promise<void> {
    await this.ops.delete(STORE_NAME, id);
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.get(id);
    return user !== undefined;
  }
}

