import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Always send cookies for authentication
});

// axiosClient.js (request interceptor)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If no token, skip retry and reject immediately
    config._skipRetry = true;
  }
  return config;
});
// Handle 401 errors (expired access token)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry for logout or auth-related requests
    if (
      originalRequest.url.includes("/auth/logout") ||
      originalRequest._skipRetry
    ) {
      return Promise.reject(error);
    }

    // Only retry if the error is 401 (Unauthorized) and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        const { data } = await axiosClient.post("/auth/refresh-token", {});
        localStorage.setItem("accessToken", data.accessToken); // Store new token
        return axiosClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        // If refresh fails, force logout and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Hard redirect to break loops
        return Promise.reject(refreshError);
      }
    }
    // For all other errors, reject immediately
    return Promise.reject(error);
  }
);

// Response interceptor to parse errors globally
axiosClient.interceptors.response.use(
  (response) => response, // Simply return the response for successful requests
  (error) => {
    // Use optional chaining to safely access error.response.data.error
    const errorMessage =
      error.response?.data?.error || "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
