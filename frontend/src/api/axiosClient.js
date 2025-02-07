import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Always send cookies for authentication
});

// Add access token to requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Handle 401 errors (expired access token)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh access token
        const { data } = await axiosClient.post("/auth/refresh-token", {});
        localStorage.setItem("accessToken", data.accessToken); // Store new access token
        return axiosClient(originalRequest); // Retry original request
      } catch (refreshError) {
        // Refresh token expired/invalid → logout user
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
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
