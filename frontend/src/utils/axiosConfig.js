import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < (currentTime + 60); // Refresh 1 minute before expiry
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

// Function to refresh token
const refreshToken = async () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  const parsedUser = JSON.parse(storedUser);
  const refreshToken = parsedUser.userWithToken?.refreshToken;

  if (!refreshToken || isTokenExpired(refreshToken)) {
    // Refresh token is also expired, logout
    localStorage.removeItem("user");
    window.location.href = '/login';
    return null;
  }

  try {
    const response = await axios.post('http://localhost:8000/api/v1/refresh-token', {
      refreshToken
    });

    if (response.data.userWithToken) {
      // Update localStorage with new token
      localStorage.setItem("user", JSON.stringify(response.data.userWithToken));
      return response.data.userWithToken.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem("user");
    window.location.href = '/login';
    return null;
  }

  return null;
};

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      let token = parsedUser.userWithToken?.token;

      // Check if token is expired or about to expire
      if (isTokenExpired(token)) {
        console.log('Token expired, refreshing...');
        token = await refreshToken();
      }

      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
