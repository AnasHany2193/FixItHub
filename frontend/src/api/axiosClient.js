import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Always send cookies for authentication
});

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    // Call the refresh token endpoint
    const response = await axios.post(
      "http://localhost:5000/api/v1/auth/refresh-token",
      {},
      { withCredentials: true }
    );

    // Assuming the new access token is returned in response.data.accessToken:
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Refresh token error:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    throw error;
  }
};

// Request Interceptor - Attach Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401 Errors & Refresh Token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no access token is present, do not try to refresh; simply reject.
    if (!localStorage.getItem("accessToken")) return Promise.reject(error);

    // Check if error status is 401 and retry flag is not set to avoid infinite loop.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        // Update the Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest); // Retry the request with the new token
      } catch (refreshError) {
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
