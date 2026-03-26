const declaredEnvironment = (import.meta.env.VITE_APP_ENV || "").trim().toLowerCase();

export const APP_ENV = declaredEnvironment || (import.meta.env.DEV ? "development" : "production");
export const isDevelopment = APP_ENV === "development";
export const isProduction = APP_ENV === "production";

const developmentApiBaseUrl = import.meta.env.VITE_DEV_API_BASE_URL || "http://localhost:8000";
const productionApiBaseUrl =
  import.meta.env.VITE_PROD_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const API_BASE_URL = isDevelopment ? developmentApiBaseUrl : productionApiBaseUrl;
