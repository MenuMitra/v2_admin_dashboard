import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { buildDevicePayload } from "../utils/deviceInfo";

const { BASE_URL, RESET_APP_TYPE, OUTLET_ID } = API_CONFIG;

const RESET_OTP_SEND_PATH =
  import.meta.env.VITE_RESET_OTP_SEND_PATH || "common/send_reset_pin_otp";
const RESET_OTP_VERIFY_PATH =
  import.meta.env.VITE_RESET_OTP_VERIFY_PATH || "common/verify_reset_pin_otp";
const RESET_USER_PIN_PATH = (
  API_CONFIG.RESET_USER_PIN_PATH || "common/reset_user_pin"
).replace(/^\//, "");

export function normalizeResetError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  const detail = data?.message || data?.detail;

  if (status === 404) {
    return (
      detail ||
      "Reset PIN service not found. Please check the API endpoint configuration."
    );
  }
  if (status === 400) {
    return detail || "Invalid or expired OTP.";
  }
  if (status >= 500) {
    return detail || "Server error. Please try again later.";
  }
  if (error.code === "ECONNABORTED" || !error.response) {
    return "Network error. Check your connection and try again.";
  }
  return detail || error.message || "Something went wrong. Please try again.";
}

function buildDeviceFields() {
  const device = buildDevicePayload();
  return {
    device_id: device.device_id,
    device_model: device.device_model,
  };
}

/** POST /common/send_reset_pin_otp */
export function buildSendResetOtpPayload(mobile) {
  return {
    mobile,
    outlet_id: OUTLET_ID ?? 4,
    app_type: RESET_APP_TYPE,
    ...buildDeviceFields(),
  };
}

/** POST /common/verify_reset_pin_otp */
export function buildVerifyResetOtpPayload(mobile, otp) {
  return {
    mobile,
    otp: String(otp),
    app_type: RESET_APP_TYPE,
    ...buildDeviceFields(),
  };
}

/** POST /common/reset_user_pin */
export function buildResetUserPinPayload(mobile, otp, newPin, resetToken) {
  if (!resetToken) {
    throw new Error("Reset session expired. Please verify OTP again.");
  }
  return {
    mobile,
    outlet_id: OUTLET_ID ?? 4,
    otp: String(otp),
    reset_token: String(resetToken),
    new_pin: String(newPin),
    app_type: RESET_APP_TYPE,
    ...buildDeviceFields(),
  };
}

export async function sendResetPinOtp(mobile) {
  const path = RESET_OTP_SEND_PATH.replace(/^\//, "");
  try {
    const response = await axios.post(
      `${BASE_URL}/${path}`,
      buildSendResetOtpPayload(mobile)
    );
    return response;
  } catch (error) {
    throw new Error(normalizeResetError(error));
  }
}

/** Verify OTP only — does not update PIN */
export async function verifyResetPinOtp(mobile, otp) {
  const path = RESET_OTP_VERIFY_PATH.replace(/^\//, "");
  try {
    const response = await axios.post(
      `${BASE_URL}/${path}`,
      buildVerifyResetOtpPayload(mobile, otp),
      { timeout: 30000 }
    );
    return response;
  } catch (error) {
    throw new Error(normalizeResetError(error));
  }
}

/** Final step — set new PIN after OTP verified (requires reset_token from verify step) */
export async function resetUserPin(mobile, otp, newPin, resetToken) {
  const path = RESET_USER_PIN_PATH.replace(/^\//, "");
  const payload = buildResetUserPinPayload(mobile, otp, newPin, resetToken);
  try {
    const response = await axios.post(`${BASE_URL}/${path}`, payload, {
      timeout: 30000,
    });
    return response;
  } catch (error) {
    throw new Error(normalizeResetError(error));
  }
}
