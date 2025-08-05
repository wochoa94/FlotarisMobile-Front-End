import AsyncStorage from '@react-native-async-storage/async-storage';

// Types (copied from your web project)
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

// IMPORTANT: Replace this with the actual URL of your running backend service.
const BASE_URL = 'https://flotaris-backend.onrender.com/api';

// Helper function to handle API calls (adapted for React Native)
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await AsyncStorage.getItem('auth_token'); // Using AsyncStorage instead of localStorage
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle responses that don't have JSON content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Authentication Service (adapted for React Native)
export const authService = {
  async signIn(email: string, password: string): Promise<{ user?: User; error?: Error }> {
    try {
      const response = await apiCall('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
      }

      return { 
        user: {
          id: response.user.id,
          email: response.user.email,
          isAdmin: response.user.email === 'wochoa.automata@gmail.com',
        }
      };
    } catch (error) {
      return { error: error as Error };
    }
  },

  async signOut(): Promise<void> {
    try {
      await apiCall('/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
    }
  },

  async getSession(): Promise<{ user?: User }> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return {};

      const response = await apiCall('/auth/session');
      return {
        user: {
          id: response.user.id,
          email: response.user.email,
          isAdmin: response.user.email === 'wochoa.automata@gmail.com',
        }
      };
    } catch (error) {
      await AsyncStorage.removeItem('auth_token');
      return {};
    }
  },

  // Simplified implementation for React Native
  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    return { unsubscribe: () => {} };
  },
};