import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Remove all the refresh token logic - just use the simple interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect if already on login page
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/signup"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
