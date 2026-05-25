import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { buildDevicePayload } from "../utils/deviceInfo";

const { BASE_URL, RESET_APP_TYPE, OUTLET_ID } = API_CONFIG;

const RESET_OTP_SEND_PATH =
  import.meta.env.VITE_RESET_OTP_SEND_PATH || "common/send_reset_pin_otp";
const RESET_OTP_VERIFY_PATH =
  import.meta.env.VITE_RESET_OTP_VERIFY_PATH || "common/verify_reset_pin_otp";

export function normalizeResetError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  const detail = data?.message || data?.detail;

  if (status === 404) {
    return detail || "Reset PIN service not found. Please try again later.";
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

/** Payload for send_reset_pin_otp (includes outlet_id) */
function buildSendResetOtpPayload(mobile) {
  const device = buildDevicePayload();
  return {
    mobile,
    outlet_id: OUTLET_ID ?? 123,
    app_type: RESET_APP_TYPE,
    device_id: device.device_id,
    device_model: device.device_model,
  };
}

/**
 * Payload for verify_reset_pin_otp — verify OTP and/or set new PIN.
 * @see POST /common/verify_reset_pin_otp
 */
export function buildVerifyResetPinPayload(mobile, otp, pin) {
  const device = buildDevicePayload();
  const payload = {
    mobile,
    otp: String(otp),
    app_type: RESET_APP_TYPE,
    device_id: device.device_id,
    device_model: device.device_model,
  };
  if (pin != null && pin !== "") {
    payload.pin = String(pin);
  }
  return payload;
}

/** POST /common/send_reset_pin_otp */
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

/**
 * POST /common/verify_reset_pin_otp
 * - OTP only: verifies OTP → { detail: "OTP verified successfully." }
 * - OTP + pin: verifies and updates PIN on the same endpoint
 */
export async function verifyResetPinOtp(mobile, otp, pin) {
  const path = RESET_OTP_VERIFY_PATH.replace(/^\//, "");
  try {
    const response = await axios.post(
      `${BASE_URL}/${path}`,
      buildVerifyResetPinPayload(mobile, otp, pin),
      { timeout: 30000 }
    );
    return response;
  } catch (error) {
    throw new Error(normalizeResetError(error));
  }
}

/** Final step: verify OTP + set new PIN via verify_reset_pin_otp */
export async function completeResetPin(mobile, pin, otp) {
  return verifyResetPinOtp(mobile, otp, pin);
}
