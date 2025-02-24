import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  withCredentials: true, // 🏆 Ensures cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track ongoing refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Helper function to retry failed requests after token refresh
const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Response interceptor for token refresh logic
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints
    if (originalRequest.url.includes("/auth/")) return Promise.reject(error);

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Refresh tokens using dedicated API call
          await axiosClient.post("/auth/refresh-token");
          window.location.reload();
          isRefreshing = false;
          onRefreshed();
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          await axiosClient.post("/auth/logout");
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        refreshSubscribers.push(() => {
          resolve(axiosClient(originalRequest)); // Retry original request
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
