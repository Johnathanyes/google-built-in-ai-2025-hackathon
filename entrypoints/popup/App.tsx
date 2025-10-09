import { useState, useEffect } from 'react';
import { AuthService } from "../../utils/auth"
import type { UserData, HighlightedContext } from '../../utils/db';
import Auth from '@/components/Auth';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [highlights, setHighlights] = useState<HighlightedContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadHighlights();
    
    // Listen for new highlights
    const messageListener = (message: any) => {
      if (message.type === 'HIGHLIGHT_ADDED') {
        setHighlights(prev => [message.payload, ...prev]);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHighlights = async () => {
    try {
      chrome.runtime.sendMessage(
        { type: 'GET_HIGHLIGHTS', payload: {} },
        (response) => {
          if (response?.success && response.highlights) {
            setHighlights(response.highlights);
          }
        }
      );
    } catch (err) {
      console.error('Error loading highlights:', err);
    }
  };

  const deleteHighlight = async (id: string) => {
    try {
      const { db } = await import('../../utils/db');
      await db.init();
      await db.highlights.delete(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting highlight:', err);
    }
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="w-96 h-[600px] bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-blue-100"
            />
          )}
          <div>
            <h2 className="text-sm font-bold text-gray-800">{user.name}</h2>
            <p className="text-xs text-gray-500">Highlights</p>
          </div>
        </div>
        <button
          onClick={loadHighlights}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Highlights List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {highlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No highlights yet</h3>
            <p className="text-sm text-gray-500">
              Select text on any webpage and click the "Capture Highlight" button to save it here
            </p>
          </div>
        ) : (
          highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-yellow-400"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(highlight.timeCreated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button
                  onClick={() => deleteHighlight(highlight.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Delete highlight"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                "{highlight.highlightedText}"
              </p>
              {highlight.note && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Note: {highlight.note}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer with instruction */}
      <div className="bg-white border-t border-gray-200 p-3">
        <p className="text-xs text-center text-gray-500">
          💡 Select text on any page to capture highlights
        </p>
      </div>
    </div>
  );
}