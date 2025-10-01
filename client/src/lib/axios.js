import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // This is important for sending cookies with requests
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if refresh-token request fails
    const isRefreshUrl = originalRequest.url.includes("auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshUrl
    ) {
      originalRequest._retry = true;

      try {
        // Try refreshing token
        await axiosInstance.post("auth/refresh-token");

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed. Logging out.");

        // Redirect to login
        window.location.href = "/login";
      }
    }

    // If not a 401, or already retried, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance;
