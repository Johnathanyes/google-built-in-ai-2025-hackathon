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
      console.log('[Auth] signIn: requesting interactive token');
      // Get OAuth token from Chrome Identity API
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (result) => {
          if (chrome.runtime.lastError) {
            console.error('[Auth] getAuthToken interactive error:', chrome.runtime.lastError.message);
            return reject(new Error(chrome.runtime.lastError.message));
          }
          // Chrome Identity API returns the token directly as a string, not as result.token
          if (!result || typeof result !== 'string') {
            console.error('[Auth] getAuthToken interactive returned empty result:', result);
            return reject(new Error('No token returned'));
          }
          console.log('[Auth] getAuthToken interactive success: token present');
          resolve(result);
        });
      });

      this.token = token;

      console.log('[Auth] fetching userinfo with token');
      // Fetch user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('[Auth] userinfo fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userInfo: GoogleUserInfo = await response.json();
      console.log('[Auth] userinfo:', userInfo);

      // Save to IndexedDB
      const userData: UserData = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        profile_picture: userInfo.profile_picture,
      };

      await db.saveUser(userData);
      console.log('[Auth] user saved to IndexedDB');
      return userData;
    } catch (error) {
      // Clear token on error
      this.token = null;
      console.error('[Auth] signIn failed:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    const tokenToRevoke = this.token;
    
    try {
      if (tokenToRevoke) {
        // Remove cached token
        await new Promise<void>((resolve, reject) => {
          chrome.identity.removeCachedAuthToken({ token: tokenToRevoke }, () => {
            if (chrome.runtime.lastError) {
              return reject(new Error(chrome.runtime.lastError.message));
            }
            resolve();
          });
        });

        // Revoke token on Google's servers
        const revokeResponse = await fetch(
          `https://accounts.google.com/o/oauth2/revoke?token=${tokenToRevoke}`
        );
        
        if (!revokeResponse.ok) {
          console.warn('Token revocation failed on Google servers');
        }
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      // Always clear token, even if revocation fails
      this.token = null;
    }
  }

  static async getCurrentUser(): Promise<UserData | null> {
    try {
      console.log('[Auth] getCurrentUser: requesting non-interactive token');
      // Try to get cached token (non-interactive)
      const token = await new Promise<string | null>((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (result) => {
          if (chrome.runtime.lastError || !result || typeof result !== 'string') {
            if (chrome.runtime.lastError) {
              console.warn('[Auth] getAuthToken non-interactive error:', chrome.runtime.lastError.message);
            } else {
              console.log('[Auth] getAuthToken non-interactive returned no token');
            }
            return resolve(null);
          }
          console.log('[Auth] getAuthToken non-interactive success: token present');
          resolve(result);
        });
      });

      if (!token) return null;

      this.token = token;

      console.log('[Auth] fetching userinfo (non-interactive)');
      // Verify token and get user info
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('[Auth] userinfo (non-interactive) not ok:', response.status, response.statusText);
        // Token might be expired, clear it
        this.token = null;
        return null;
      }

      const userInfo: GoogleUserInfo = await response.json();
      console.log('[Auth] userinfo (non-interactive):', userInfo);
      
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
        console.log('[Auth] user created in IndexedDB');
      }

      return userData;
    } catch (error) {
      console.error('[Auth] getCurrentUser failed:', error);
      this.token = null;
      return null;
    }
  }
}