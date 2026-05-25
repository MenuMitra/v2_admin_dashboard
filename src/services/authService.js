import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { buildDevicePayload } from "../utils/deviceInfo";

const {
  BASE_URL,
  VERSION,
  APP_TYPE,
  OUTLET_ID,
  OTP_SEND_PATH,
  OTP_VERIFY_PATH,
  PIN_VERIFY_PATH,
} = API_CONFIG;

function buildBasePayload(mobile, extra = {}) {
  return {
    mobile,
    app_type: APP_TYPE,
    version: VERSION,
    ...buildDevicePayload(),
    ...extra,
  };
}

function normalizeError(error) {
  const data = error.response?.data;
  return (
    data?.message ||
    data?.detail ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

/** PIN login — POST /common/login */
export async function loginWithPin(mobile, pin) {
  try {
    const response = await axios.post(
      `${BASE_URL}/common/login`,
      buildBasePayload(mobile, { pin })
    );
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Payload for POST /common/login (OTP send) */
export function buildCommonLoginOtpPayload(mobile, outletId = OUTLET_ID) {
  const device = buildDevicePayload();
  return {
    mobile,
    outlet_id: outletId ?? 123,
    app_type: APP_TYPE || "admin",
    device_id: device.device_id,
    device_model: device.device_model,
  };
}

/** OTP send — POST /common/login (sends OTP) */
export async function sendOtp(mobile, outletId = OUTLET_ID) {
  const path = (OTP_SEND_PATH || "common/login").replace(/^\//, "");
  try {
    const payload = buildCommonLoginOtpPayload(mobile, outletId);
    const response = await axios.post(`${BASE_URL}/${path}`, payload);
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Payload for POST /common/verify_pin */
export function buildVerifyPinPayload(mobile, pin) {
  const device = buildDevicePayload();
  return {
    mobile,
    app_type: APP_TYPE || "admin",
    device_id: device.device_id,
    device_model: device.device_model,
    pin,
  };
}

/** PIN verify — POST /common/verify_pin (returns access_token, user_id, etc.) */
export async function verifyPin(mobile, pin) {
  const path = (PIN_VERIFY_PATH || "common/verify_pin").replace(/^\//, "");
  try {
    const response = await axios.post(
      `${BASE_URL}/${path}`,
      buildVerifyPinPayload(mobile, pin)
    );
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Legacy admin OTP verify — returns tokens for setup/reset flows */
export async function verifyOtp(mobile, otp) {
  const device = buildDevicePayload();
  const path = (OTP_VERIFY_PATH || "admin/admin_verify_otp").replace(/^\//, "");
  try {
    const response = await axios.post(`${BASE_URL}/${path}`, {
      mobile,
      otp: parseInt(otp, 10),
      app_type: APP_TYPE,
      version: VERSION,
      user_agent_name: device.user_agent_name,
      device_id: device.device_id,
      device_model: device.device_model,
    });
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Create PIN after OTP verification — POST /common/setup_pin */
export async function setupPin(mobile, pin, otp) {
  try {
    const response = await axios.post(
      `${BASE_URL}/common/setup_pin`,
      buildBasePayload(mobile, { pin, otp: parseInt(otp, 10) })
    );
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Reset PIN after OTP verification — POST /common/reset_pin */
export async function resetPin(mobile, pin, otp) {
  try {
    const response = await axios.post(
      `${BASE_URL}/common/reset_pin`,
      buildBasePayload(mobile, { pin, otp: parseInt(otp, 10) })
    );
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

export async function resendOtp(mobile, authToken) {
  try {
    const headers = authToken ? { Authorization: authToken } : {};
    const response = await axios.post(
      `${BASE_URL}/common/resend_otp`,
      { mobile, app_type: APP_TYPE, version: VERSION },
      { headers }
    );
    return response;
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

/** Map API login response to session + adminData for the dashboard */
export function mapLoginResponse(response, mobile) {
  const data = response.data ?? response;
  const accessToken = data.token || data.access_token;
  const user = data.user || {};

  const adminData = {
    user_id: user.id ?? data.user_id,
    name: user.name ?? data.name,
    mobile: user.mobile ?? data.mobile ?? mobile,
    email: user.email ?? data.email,
    role: data.role,
  };

  return {
    accessToken,
    refreshToken: data.refresh_token,
    tokenType: data.token_type || "Bearer",
    expiresOn: data.expires_at || data.expires_on,
    adminData,
    activeSessions: data.active_sessions,
    raw: data,
  };
}

export function isPinNotSetError(message) {
  return /pin\s*(not\s*set|required|setup)|no\s*pin|create\s*(a\s*)?pin|first.?time/i.test(
    message || ""
  );
}

export function isInvalidPinError(message) {
  return /invalid\s*pin|incorrect\s*pin|wrong\s*pin/i.test(message || "");
}

export function isAccountLockedError(message) {
  return /locked|too\s*many\s*attempt|failed\s*attempt/i.test(message || "");
}
