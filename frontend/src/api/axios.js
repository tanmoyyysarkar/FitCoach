import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  // Request succeeded
  (response) => {
    return response;
  },

  // Request failed
  async (error) => {
    const originalRequest = error.config;

    // Access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Ask backend to refresh the tokens
        await api.post("/users/refresh-token");

        // New cookies have been set by backend.
        // Retry the original request.
        return api(originalRequest);

      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;