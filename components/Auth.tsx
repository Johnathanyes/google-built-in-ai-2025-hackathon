import { useState, useEffect } from 'react';
import { AuthService } from "../utils/auth"
import type { UserData } from '../utils/db';

const Auth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Auth check error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to check authentication status: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await AuthService.signIn();
      setUser(userData);
    } catch (err) {
      console.error('Sign in error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to sign in: ${message}`);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to sign out: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-80 h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100"
              />
            )}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
              Yo my guy!!
            </h2>
            <p className="text-gray-600 text-center mb-1">{user.name}</p>
            <p className="text-gray-500 text-sm text-center mb-6">{user.email}</p>
            
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in with your Google account to continue
            </p>
          </div>

          <button
            onClick={handleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default Auth;