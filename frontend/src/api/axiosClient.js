import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally, you can add interceptors for request/response logging or to attach the JWT token.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to parse errors globally
axiosClient.interceptors.response.use(
  (response) => response, // Simply return the response for successful requests
  (error) => {
    // Use optional chaining to safely access error.response.data.error
    const errorMessage =
      error.response?.data?.error || "An unexpected error occurred";

    // Reject a new Error instance
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
