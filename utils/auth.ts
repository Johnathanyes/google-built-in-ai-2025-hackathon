import { db, type UserData } from './db';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  profile_picture?: string;
}

export class AuthService {
  private static token: string | null = null;

  static async signIn(): Promise<UserData> {
    try {
      // Get OAuth token from Chrome Identity API
      const token = await chrome.identity.getAuthToken({ interactive: true });
      if (token.token == null) {
        throw new Error('Failed to fetch user info');
      }

      this.token = token.token!;

      // Fetch user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user info');

      const userInfo: GoogleUserInfo = await response.json();

      // Save to IndexedDB
      const userData: UserData = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        profile_picture: userInfo.profile_picture,
      };

      await db.saveUser(userData);
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      if (this.token) {
        await chrome.identity.removeCachedAuthToken({ token: this.token });
        
        // Revoke token on Google's servers
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${this.token}`);
        this.token = null;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<UserData | null> {
    try {
      // Try to get cached token (non-interactive)
      const token = await chrome.identity.getAuthToken({ interactive: false });
      
      if (!token) return null;

      this.token = token.token!;

      // Verify token and get user info
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) return null;

      const userInfo: GoogleUserInfo = await response.json();
      
      // Get from IndexedDB or create new entry
      let userData = await db.getUser(userInfo.id);
      
      if (!userData) {
        userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          profile_picture: userInfo.profile_picture
        };
        await db.saveUser(userData);
      }

      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}