import axios from "axios";
import { getToken, removeToken } from "./auth";
import { getApiErrorMessage } from "./errors";
import { pushToast } from "./toastBridge";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? "" : "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        removeToken();
        const isLoginRequest = error.config?.url?.includes("/auth/login");
        const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
        if (!isLoginRequest && !isLoginPage) {
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      const skipToast = error.config?.headers?.["X-Skip-Toast"];
      if (!skipToast) {
        pushToast(
          getApiErrorMessage(error, "Something went wrong. Please try again."),
          "error"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
