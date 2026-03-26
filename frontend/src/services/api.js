import axios from "axios";

import { API_BASE_URL, APP_ENV, isDevelopment } from "../config/env";
import { getStoredDevelopmentSession } from "./devSession";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-App-Environment": APP_ENV,
  },
});

api.interceptors.request.use((config) => {
  const session = getStoredDevelopmentSession();
  if (isDevelopment && session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export const fetchUserCity = async (username) => {
  const response = await api.post("/api/user-city", { username });
  return response.data;
};

export default api;
