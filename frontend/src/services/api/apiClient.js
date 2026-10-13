import axios from "axios";

import {
  getToken,
  clearAuthStorage,
} from "../../lib/authStorage";

const LOGOUT_FLAG = "careermetric_logout_in_progress";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * FormData requests must not manually use
     * application/json.
     *
     * Axios/browser will automatically set:
     *
     * multipart/form-data; boundary=...
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      /*
       * If logout was intentionally initiated,
       * do not redirect to /login.
       */
      if (!isLogoutInProgress()) {
        clearAuthStorage();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/*
 * Mark that logout was intentionally initiated.
 */
export function markLogoutInProgress() {
  sessionStorage.setItem(LOGOUT_FLAG, "true");
}

/*
 * Check whether logout was intentionally initiated.
 */
export function isLogoutInProgress() {
  return sessionStorage.getItem(LOGOUT_FLAG) === "true";
}

/*
 * Clear the intentional logout state.
 */
export function clearLogoutInProgress() {
  sessionStorage.removeItem(LOGOUT_FLAG);
}