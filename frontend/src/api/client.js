import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  withCredentials: true, // This is crucial for cookie handling
  headers: {
    "Content-Type": "application/json",
  },
});

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

      try {
        // Refresh tokens using dedicated API call
        await axiosClient.post("/auth/refresh-token");
        // Retry original request with new cookies
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Handle failed refresh
        await axiosClient.post("/auth/logout");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
