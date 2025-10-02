import { useState, useEffect } from 'react';
import { AuthService } from '@/utils/auth';
import { db, type UserData } from '@/utils/db';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const userData = await AuthService.signIn();
      setUser(userData);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      {user ? (
        <div>
          <h2>Welcome!</h2>
          {user.profile_picture && <img src={user.profile_picture} alt={user.name} style={{ borderRadius: '50%', width: '50px' }} />}
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Sign In Required</h2>
          <button onClick={handleSignIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}