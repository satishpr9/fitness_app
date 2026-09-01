import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Fallback to local network / machine IP
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator localhost alias
  }
  return 'http://localhost:3000';   // iOS Simulator / Web / Desktop
};

export const API_BASE_URL = getBaseUrl();

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
export const ACCESS_TOKEN_KEY = 'fitpulse_access_token';
export const REFRESH_TOKEN_KEY = 'fitpulse_refresh_token';

// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem(ACCESS_TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore secure storage read errors
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Unpack data and handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps everything in { success: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized & refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        let refreshToken: string | null = null;
        if (Platform.OS === 'web') {
          refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        } else {
          refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        }

        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const tokens = res.data.data || res.data;
          if (tokens.accessToken) {
            if (Platform.OS === 'web') {
              localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
              if (tokens.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
            } else {
              await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
              if (tokens.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch {
        // Refresh failed -> clear storage
        if (Platform.OS === 'web') {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  },
);

export default apiClient;
