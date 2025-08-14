/**
 * Authentication Context for Learning Website
 * Provides centralized authentication state management with JWT token handling
 * Includes comprehensive logging for debugging authentication flow
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Constants for API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Authentication action types
const AUTH_ACTIONS = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS', 
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial authentication state
const initialAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Enhanced console logger for authentication events
const authLogger = {
  info: (message, data = null) => {
    console.log(`🔐 [AUTH] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [AUTH] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [AUTH] ${message}`, error ? { error } : '');
  },
  warn: (message, data = null) => {
    console.warn(`⚠️ [AUTH] ${message}`, data ? { data } : '');
  }
};

// Authentication reducer for state management
function authReducer(state, action) {
  authLogger.info(`Action dispatched: ${action.type}`, action.payload);
  
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_REQUEST:
    case AUTH_ACTIONS.REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      authLogger.success('Login successful', { 
        user: action.payload.user?.username,
        userId: action.payload.user?.id 
      });
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      authLogger.success('Registration successful', { 
        user: action.payload.user?.username,
        userId: action.payload.user?.id 
      });
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      authLogger.error('Authentication failed', action.payload);
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
      
    case AUTH_ACTIONS.LOGOUT:
      authLogger.info('User logged out');
      return {
        ...initialAuthState
      };
      
    case AUTH_ACTIONS.SET_USER:
      authLogger.info('User set from stored token', { 
        user: action.payload?.username,
        userId: action.payload?.id 
      });
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      authLogger.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// Create authentication context
const AuthContext = createContext();

// Authentication Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Initialize authentication on app load
  useEffect(() => {
    authLogger.info('Initializing authentication context');
    initializeAuth();
  }, []);

  // Initialize auth from localStorage
  const initializeAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');
      
      if (token && userData) {
        authLogger.info('Found stored authentication data');
        const user = JSON.parse(userData);
        
        // Validate token format (basic JWT check)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          authLogger.success('Valid token format found, restoring session');
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: { user, token } 
          });
        } else {
          authLogger.warn('Invalid token format, clearing storage');
          clearAuthStorage();
        }
      } else {
        authLogger.info('No stored authentication found');
      }
    } catch (error) {
      authLogger.error('Error initializing auth', error);
      clearAuthStorage();
    }
  };

  // Clear authentication storage
  const clearAuthStorage = () => {
    authLogger.info('Clearing authentication storage');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Store authentication data
  const storeAuthData = (user, token) => {
    authLogger.info('Storing authentication data');
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  };

  // API request helper with authentication
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    authLogger.info(`Making API request to: ${endpoint}`);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add authentication header if token exists
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
      authLogger.info('Added authentication header to request');
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      authLogger.info(`API response from ${endpoint}`, { 
        status: response.status, 
        success: data.success 
      });

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      authLogger.error(`API request failed for ${endpoint}`, error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    authLogger.info('Attempting login', { email });
    dispatch({ type: AUTH_ACTIONS.LOGIN_REQUEST });

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.token) {
        const { token } = response;
        // The user object is the response itself, minus the token
        const user = { ...response };
        delete user.token;
        
        storeAuthData(user, token);
        dispatch({ 
          type: AUTH_ACTIONS.LOGIN_SUCCESS, 
          payload: { user, token } 
        });
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      authLogger.error('Login failed', error);
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: error.message 
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    authLogger.info('Attempting registration', { 
      username: userData.username, 
      email: userData.email 
    });
    dispatch({ type: AUTH_ACTIONS.REGISTER_REQUEST });

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success && response.token) {
        const { user, token } = response;

        storeAuthData(user, token);
        dispatch({ 
          type: AUTH_ACTIONS.REGISTER_SUCCESS, 
          payload: { user, token } 
        });
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      authLogger.error('Registration failed', error);
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_FAILURE, 
        payload: error.message 
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authLogger.info('Logging out user');
    clearAuthStorage();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    apiRequest
  };

  authLogger.info('AuthProvider rendering', { 
    isAuthenticated: state.isAuthenticated,
    user: state.user?.username,
    hasToken: !!state.token
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
