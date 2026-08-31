/**
 * Application Configuration
 * Single source of truth for the entire application
 */

// Get API base URL from environment variable (Netlify)
// Falls back to testing API if not set
const getApiBaseUrl = () => {
  // Check for Vite environment variable (set in Netlify)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Default fallback for local development (testing API)
  return "https://menusmitra.xyz/v2.3";

};

const PRODUCTION_CUSTOMER_APP_URL = "https://customer.2.3.menumitra.com";
const TESTING_CUSTOMER_APP_URL =
  "https://test-menumitra-customer-v2.netlify.app";

const isProductionEnvironment = () => {
  const apiBaseUrl = getApiBaseUrl();
  if (typeof apiBaseUrl === "string" && apiBaseUrl.includes("menu4.xyz")) {
    return true;
  }

  if (typeof window !== "undefined") {
    const productionHosts = [
      "menumitra.com",
      "user.menumitra.com",
      "www.menumitra.com",
      "www.user.menumitra.com",
      "admin-v2.menumitra.com",
      "www.admin-v2.menumitra.com",
      "admin.menumitra.com",
      "www.admin.menumitra.com",
      "admin.2.3.menumitra.com",
      "www.admin.2.3.menumitra.com",
    ];
    return productionHosts.includes(window.location.hostname);
  }

  return false;
};

// Get Customer App base URL from environment variable (Netlify)
// Falls back based on production vs testing environment
const getCustomerAppUrl = () => {
  if (import.meta.env.VITE_CUSTOMER_APP_URL) {
    return import.meta.env.VITE_CUSTOMER_APP_URL;
  }

  return isProductionEnvironment()
    ? PRODUCTION_CUSTOMER_APP_URL
    : TESTING_CUSTOMER_APP_URL;
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(), // Full URL including /v2.3
  CUSTOMER_APP_URL: getCustomerAppUrl(), // Customer app base URL
  VERSION: "2.3.0",
  /** Login / verify_pin app type */
  APP_TYPE: import.meta.env.VITE_APP_TYPE || "admin",
  /**
   * Reset PIN flow — use owner_app for send/verify/reset_user_pin APIs.
   */
  RESET_APP_TYPE: import.meta.env.VITE_RESET_APP_TYPE || "owner_app",
  /** outlet_id for reset PIN APIs (send_reset_pin_otp, reset_user_pin) */
  OUTLET_ID: import.meta.env.VITE_OUTLET_ID
    ? parseInt(import.meta.env.VITE_OUTLET_ID, 10)
    : 4,
  /** OTP send endpoint (relative to BASE_URL) */
  OTP_SEND_PATH: import.meta.env.VITE_OTP_SEND_PATH || "common/login",
  /** OTP verify endpoint (legacy) */
  OTP_VERIFY_PATH:
    import.meta.env.VITE_OTP_VERIFY_PATH || "admin/admin_verify_otp",
  /** PIN verify — POST /common/verify_pin */
  PIN_VERIFY_PATH:
    import.meta.env.VITE_PIN_VERIFY_PATH || "common/verify_pin",
  /** Final reset step — POST /common/reset_user_pin */
  RESET_USER_PIN_PATH:
    import.meta.env.VITE_RESET_USER_PIN_PATH || "common/reset_user_pin",
  PIN_LENGTH: 4,
};

// Protected Users Configuration
export const PROTECTED_USERS = {
  ADMIN_MOBILES: ["8806431723", "9767637798", "8600704616"],
  // Add other protected user types if needed
};

// Export a default configuration object if needed
export default {
  API_CONFIG,
};