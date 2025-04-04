import axios from 'axios';

const BASE_URL = '/evaluation-service';
const AUTH_LOCAL_STORAGE_KEY = 'social_media_auth_token';

// Auth credentials
const authCredentials = {
  email: "e22cseu1303@bennett.edu.in",
  name: "vaibhav pandey",
  rollNo: "e22cseu1303",
  accessCode: "rtCHZJ",
  clientID: "300c3a49-5977-4c66-af80-28f9a374ae96",
  clientSecret: "QEkHfgBaaUdqXgwA"
};

// Latest token from the server
const latestToken = {
  token_type: "Bearer",
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNzQ3ODQzLCJpYXQiOjE3NDM3NDc1NDMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjMwMGMzYTQ5LTU5NzctNGM2Ni1hZjgwLTI4ZjlhMzc0YWU5NiIsInN1YiI6ImUyMmNzZXUxMzAzQGJlbm5ldHQuZWR1LmluIn0sImVtYWlsIjoiZTIyY3NldTEzMDNAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoidmFpYmhhdiBwYW5kZXkiLCJyb2xsTm8iOiJlMjJjc2V1MTMwMyIsImFjY2Vzc0NvZGUiOiJydENIWkoiLCJjbGllbnRJRCI6IjMwMGMzYTQ5LTU5NzctNGM2Ni1hZjgwLTI4ZjlhMzc0YWU5NiIsImNsaWVudFNlY3JldCI6IlFFa0hmZ0JhYVVkcVhnd0EifQ.Bl-TeGdmae1xOzrw-FAaXEzAHQ2PJoqprOjHP5mf36I",
  expires_in: 1743747843,
  timestamp: Date.now()
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to get stored token
const getStoredToken = () => {
  // Check if we have the latest token in memory first
  if (latestToken && latestToken.access_token) {
    return latestToken;
  }
  
  const storedAuth = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
  return storedAuth ? JSON.parse(storedAuth) : null;
};

// Function to set auth token in storage
const setAuthToken = (authData) => {
  if (authData && authData.access_token) {
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(authData));
    api.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`;
    return true;
  }
  return false;
};

// Load token from local storage if available
const loadStoredToken = () => {
  const authData = getStoredToken();
  if (authData && authData.access_token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`;
    return true;
  }
  return false;
};

// Initialize with stored token
loadStoredToken();

// Authentication function
export const authenticate = async (force = false) => {
  // If we're not forcing authentication and we have a token, don't authenticate
  if (!force) {
    const authData = getStoredToken();
    const isTokenValid = authData && authData.expires_in > Date.now();
    if (isTokenValid) {
      return authData;
    }
  }

  try {
    // First try to use the latest token if available
    if (!force && latestToken && latestToken.access_token) {
      setAuthToken(latestToken);
      return latestToken;
    }
    
    // Otherwise make a fresh auth request
    const response = await axios.post(`${BASE_URL}/auth`, authCredentials);
    const authData = {
      ...response.data,
      timestamp: Date.now()
    };
    setAuthToken(authData);
    return authData;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Flag to prevent multiple concurrent auth requests
let isRefreshing = false;
let refreshSubscribers = [];

// Function to add callbacks to the queue
const subscribeToTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to resolve all subscribers
const onTokenRefreshed = (token) => {
  refreshSubscribers.map(callback => callback(token));
  refreshSubscribers = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for new token
        return new Promise((resolve) => {
          subscribeToTokenRefresh(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Mark request as retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Force new authentication
        const authData = await authenticate(true);
        const token = authData.access_token;
        
        // Set headers for original request
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Resolve promises for other requests
        onTokenRefreshed(token);
        
        // Reset refreshing flag
        isRefreshing = false;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Make sure we're authenticated before export is complete
// This ensures that the first API call will have a token
// Set the token immediately from the latest known token
api.defaults.headers.common['Authorization'] = `Bearer ${latestToken.access_token}`;

// API endpoints
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data.posts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const getPostComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching post comments:', error);
    throw error;
  }
};

export const getRandomImage = (width = 200, height = 200) => {
  return `https://picsum.photos/${width}/${height}`;
}; 