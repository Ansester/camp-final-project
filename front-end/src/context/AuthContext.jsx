import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authUtils } from '../utils/auth.js';

const AuthContext = createContext(null);

// Session timeout modal component
const SessionExpiredModal = ({ onRelogin }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
        <p className="text-gray-600 mb-6">Your session has expired due to inactivity. Please log in again to continue.</p>
        <button
          onClick={onRelogin}
          className="w-full bg-violet-500 text-white py-3 rounded-lg font-semibold hover:bg-violet-600 transition-colors"
        >
          Log In Again
        </button>
      </div>
    </div>
  </div>
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const checkIntervalRef = useRef(null);

  // derive role from user
  const role = user?.role || null;

  // Reset activity timer on user interaction
  const resetActivityTimer = useCallback(() => {
    if (token && user) {
      authUtils.updateLastActivity();
    }
  }, [token, user]);

  // Check if session has expired
  const checkSessionExpiry = useCallback(() => {
    if (token && user && authUtils.isSessionExpired()) {
      setShowSessionExpired(true);
    }
  }, [token, user]);

  // Handle re-login after session expiry
  const handleRelogin = useCallback(() => {
    authUtils.clearAuth();
    setUser(null);
    setToken(null);
    setShowSessionExpired(false);
  }, []);

  useEffect(() => {
    // Load from localStorage on mount
    const existingToken = authUtils.getToken();
    const existingUser = authUtils.getUser();

    // Check if session is already expired
    if (existingToken && existingUser && authUtils.isSessionExpired()) {
      authUtils.clearAuth();
      setInitializing(false);
      return;
    }

    if (existingToken) setToken(existingToken);
    if (existingUser) setUser(existingUser);
    if (existingToken && existingUser) {
      authUtils.updateLastActivity();
    }
    setInitializing(false);

    // Listen for forced logout events triggered by API layer on 401
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('camp:logout', handleForcedLogout);
    return () => window.removeEventListener('camp:logout', handleForcedLogout);
  }, []);

  // Set up activity listeners and session check interval
  useEffect(() => {
    if (!token || !user) return;

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttled activity handler (update at most once per second)
    let lastUpdate = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 1000) {
        lastUpdate = now;
        resetActivityTimer();
      }
    };

    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session expiry every 30 seconds
    checkIntervalRef.current = setInterval(checkSessionExpiry, 30000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [token, user, resetActivityTimer, checkSessionExpiry]);

  const login = useCallback((nextUser, nextToken) => {
    if (nextToken) {
      authUtils.setToken(nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      authUtils.setUser(nextUser);
      setUser(nextUser);
    }
    // Initialize activity timestamp on login
    authUtils.updateLastActivity();
    setShowSessionExpired(false);
  }, []);

  const logout = useCallback(() => {
    authUtils.clearAuth();
    setUser(null);
    setToken(null);
    setShowSessionExpired(false);
  }, []);

  const value = {
    user,
    token,
    role,
    initializing,
    login,
    logout,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionExpired && <SessionExpiredModal onRelogin={handleRelogin} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
