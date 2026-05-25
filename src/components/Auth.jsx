import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo/logo.png";
import grid01 from "../assets/images/shape/grid-01.svg";
import { toastController } from "../utils/toastController";
import { API_CONFIG } from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";
import { useOtpTimer } from "../hooks/useOtpTimer";
import { verifyPin } from "../services/authService";
import {
  sendResetPinOtp,
  verifyResetPinOtp,
} from "../services/resetPinService";
import PinInput from "./auth/PinInput";
import YouTubePlayer from "./YouTubePlayer";

const PIN_LENGTH = API_CONFIG.PIN_LENGTH || 4;
const OTP_LENGTH = 4;

const STEP = {
  MOBILE: "mobile",
  PIN: "pin",
  RESET_SEND: "reset_send",
  RESET_OTP: "reset_otp",
  RESET_NEW_PIN: "reset_new_pin",
};

function Auth() {
  const [step, setStep] = useState(STEP.MOBILE);
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [pinError, setPinError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resetPinError, setResetPinError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const { countdown, start: startOtpTimer, canResend } = useOtpTimer(30);

  const isResetFlow = [
    STEP.RESET_SEND,
    STEP.RESET_OTP,
    STEP.RESET_NEW_PIN,
  ].includes(step);

  const validateMobile = () => {
    if (mobile.length > 0 && "012345".includes(mobile[0])) {
      setMobileError("Mobile number must start with 6-9");
      return false;
    }
    if (mobile.length !== 10) {
      setMobileError("Enter a valid 10-digit mobile number");
      return false;
    }
    setMobileError("");
    return true;
  };

  const clearResetState = () => {
    setResetOtp("");
    setNewPin("");
    setConfirmPin("");
    setResetOtpVerified(false);
    setOtpError("");
    setResetPinError("");
  };

  const handleContinueMobile = (e) => {
    e?.preventDefault();
    setError("");
    if (!validateMobile()) return;
    setStep(STEP.PIN);
    setPin("");
    setPinError("");
  };

  const handleBackToMobile = () => {
    setStep(STEP.MOBILE);
    setPin("");
    setPinError("");
    setError("");
    clearResetState();
  };

  const handleForgotPin = () => {
    if (!validateMobile()) return;
    clearResetState();
    setError("");
    setStep(STEP.RESET_SEND);
  };

  const handleBackFromReset = () => {
    clearResetState();
    setError("");
    setStep(STEP.PIN);
  };

  const handleSendResetOtp = async (e) => {
    e?.preventDefault();
    if (!validateMobile() || loading) return;

    setLoading(true);
    setError("");
    setOtpError("");
    try {
      await toastController.promise(sendResetPinOtp(mobile), {
        loading: "Sending OTP...",
        success: "OTP sent to your mobile",
        error: (err) => err?.message || "Failed to send OTP",
      });
      setResetOtp("");
      setStep(STEP.RESET_OTP);
      startOtpTimer();
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (!canResend || loading) return;
    setOtpError("");
    setLoading(true);
    try {
      await toastController.promise(sendResetPinOtp(mobile), {
        loading: "Resending OTP...",
        success: "OTP resent",
        error: (err) => err?.message || "Failed to resend OTP",
      });
      setResetOtp("");
      startOtpTimer();
    } catch (err) {
      setOtpError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e, otpOverride) => {
    e?.preventDefault();
    const otpValue = otpOverride ?? resetOtp;
    if (otpValue.length !== OTP_LENGTH) {
      setOtpError("Enter the 4-digit OTP");
      return;
    }
    if (loading) return;

    setLoading(true);
    setOtpError("");
    setError("");
    try {
      await toastController.promise(verifyResetPinOtp(mobile, otpValue), {
        loading: "Verifying OTP...",
        success: "OTP verified",
        error: (err) => err?.message || "Incorrect OTP",
      });
      setResetOtp(otpValue);
      setResetOtpVerified(true);
      setNewPin("");
      setConfirmPin("");
      setStep(STEP.RESET_NEW_PIN);
    } catch (err) {
      setOtpError(err.message || "Incorrect OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async (e) => {
    e?.preventDefault();
    if (!resetOtpVerified) {
      setStep(STEP.RESET_SEND);
      return;
    }
    if (newPin.length !== PIN_LENGTH) {
      setResetPinError(`PIN must be ${PIN_LENGTH} digits`);
      return;
    }
    if (confirmPin.length !== PIN_LENGTH) {
      setResetPinError("Confirm your PIN");
      return;
    }
    if (newPin !== confirmPin) {
      setResetPinError("PINs do not match");
      return;
    }
    if (loading) return;

    setLoading(true);
    setResetPinError("");
    try {
      await toastController.promise(
        verifyResetPinOtp(mobile, resetOtp, newPin),
        {
          loading: "Updating PIN...",
          success: "PIN updated successfully.",
          error: (err) => err?.message || "Failed to update PIN",
        }
      );
      clearResetState();
      setPin("");
      setPinError("");
      setStep(STEP.PIN);
      toastController.info("Please login with your new PIN.");
    } catch (err) {
      setResetPinError(err.message || "Failed to update PIN");
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e, pinOverride) => {
    e?.preventDefault?.();
    const pinToUse = pinOverride ?? pin;
    if (!validateMobile()) return;
    if (pinToUse.length !== PIN_LENGTH) {
      setPinError(`Enter your ${PIN_LENGTH}-digit PIN`);
      return;
    }
    if (loading) return;

    setLoading(true);
    setError("");
    setPinError("");
    try {
      const response = await toastController.promise(
        verifyPin(mobile, pinToUse),
        {
          loading: "Signing in...",
          success: "Login successful!",
          error: (err) => err?.message || "Invalid PIN",
        }
      );

      const data = response.data;
      if (!data?.access_token) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      login(response);

      const adminData = {
        user_id: data.user_id,
        name: data.name,
        mobile: data.mobile || mobile,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("token", `Bearer ${data.access_token}`);
      localStorage.setItem("mm_last_access_token", data.access_token);
      if (data.active_sessions) {
        localStorage.setItem(
          "admin_active_sessions",
          JSON.stringify(data.active_sessions)
        );
      }
      localStorage.setItem("adminData", JSON.stringify(adminData));
      navigate("/home");
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Invalid PIN";
      if (/pin|invalid|incorrect/i.test(errorMsg)) {
        setPinError(errorMsg);
        setError("");
      } else {
        setError(errorMsg);
        setPinError("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    switch (step) {
      case STEP.MOBILE:
        handleContinueMobile(e);
        break;
      case STEP.PIN:
        handlePinLogin(e);
        break;
      case STEP.RESET_SEND:
        handleSendResetOtp(e);
        break;
      case STEP.RESET_OTP:
        handleVerifyResetOtp(e);
        break;
      case STEP.RESET_NEW_PIN:
        handleUpdatePin(e);
        break;
      default:
        break;
    }
  };

  const subtitle = () => {
    switch (step) {
      case STEP.MOBILE:
        return "Enter your mobile number to continue";
      case STEP.PIN:
        return `Enter PIN for ${mobile}`;
      case STEP.RESET_SEND:
        return "Reset your PIN — we'll send an OTP";
      case STEP.RESET_OTP:
        return `Enter OTP sent to ${mobile}`;
      case STEP.RESET_NEW_PIN:
        return "Create your new PIN";
      default:
        return "";
    }
  };

  const submitLabel = () => {
    if (loading) return "Please wait...";
    switch (step) {
      case STEP.MOBILE:
        return "Continue";
      case STEP.PIN:
        return "Sign In";
      case STEP.RESET_SEND:
        return "Send OTP";
      case STEP.RESET_OTP:
        return "Verify OTP";
      case STEP.RESET_NEW_PIN:
        return "Update PIN";
      default:
        return "Continue";
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    switch (step) {
      case STEP.MOBILE:
        return mobile.length !== 10;
      case STEP.PIN:
        return pin.length !== PIN_LENGTH;
      case STEP.RESET_SEND:
        return mobile.length !== 10;
      case STEP.RESET_OTP:
        return resetOtp.length !== OTP_LENGTH;
      case STEP.RESET_NEW_PIN:
        return (
          newPin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH
        );
      default:
        return true;
    }
  };

  const showMobileField =
    step === STEP.MOBILE ||
    step === STEP.PIN ||
    step === STEP.RESET_SEND ||
    step === STEP.RESET_OTP ||
    step === STEP.RESET_NEW_PIN;

  const mobileDisabled =
    step !== STEP.MOBILE && step !== STEP.RESET_SEND;

  return (
    <>
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <div className="relative flex flex-col justify-start w-full min-h-screen dark:bg-gray-900 sm:p-0 lg:flex-row">
          <div className="flex flex-col flex-1 w-full lg:w-1/2">
            <div className="flex flex-col justify-center items-center flex-1 w-full max-w-md mx-auto">
              <div className="w-full">
                <div className="rounded-xl p-6 border-2 border-gray-300 dark:border-gray-600 shadow-md mb-4 bg-white dark:bg-gray-800">
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <img
                      src={Logo}
                      alt="MenuMitra"
                      className="w-14 h-14 object-contain"
                    />
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                        MenuMitra
                      </div>
                      <div className="text-md font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Admin Dashboard
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {subtitle()}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleFormSubmit}>
                    <div className="space-y-5">
                      {showMobileField && (
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Mobile Number
                            <span className="text-error-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <i
                                className="fa-solid fa-mobile text-lg"
                                aria-hidden
                              />
                            </span>
                            <input
                              type="tel"
                              inputMode="numeric"
                              value={mobile}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (!/^\d{0,10}$/.test(value)) return;
                                if (
                                  value.length > 0 &&
                                  "012345".includes(value[0])
                                ) {
                                  setMobileError(
                                    "Mobile number must start with 6-9"
                                  );
                                  setMobile("");
                                } else {
                                  setMobileError("");
                                  setMobile(value);
                                }
                              }}
                              placeholder="Enter your mobile number"
                              disabled={mobileDisabled}
                              className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-black bg-transparent px-4 pl-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-black focus:outline-none dark:border-black dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                                mobileDisabled
                                  ? "cursor-not-allowed bg-gray-100 opacity-70 dark:bg-gray-800"
                                  : ""
                              }`}
                            />
                          </div>
                          {mobileError ? (
                            <p className="mt-1 text-sm text-error-500">
                              {mobileError}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {step === STEP.PIN && (
                        <>
                          <PinInput
                            length={PIN_LENGTH}
                            value={pin}
                            onChange={setPin}
                            onComplete={(p) => handlePinLogin(null, p)}
                            error={!!pinError}
                            label="PIN"
                            id="login-pin"
                            disabled={loading}
                            autoFocus
                          />
                          {pinError ? (
                            <p className="text-sm font-medium text-error-500">
                              {pinError}
                            </p>
                          ) : null}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleForgotPin}
                              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                            >
                              Forgot PIN?
                            </button>
                          </div>
                        </>
                      )}

                      {step === STEP.RESET_OTP && (
                        <>
                          <PinInput
                            length={OTP_LENGTH}
                            value={resetOtp}
                            onChange={setResetOtp}
                            onComplete={(o) => handleVerifyResetOtp(null, o)}
                            error={!!otpError}
                            label="OTP"
                            id="reset-otp"
                            showToggle={false}
                            disabled={loading}
                            autoFocus
                          />
                          {otpError ? (
                            <p className="text-sm font-medium text-error-500">
                              {otpError}
                            </p>
                          ) : null}
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Didn&apos;t receive OTP?</span>
                            <button
                              type="button"
                              onClick={handleResendResetOtp}
                              disabled={!canResend || loading}
                              className={`font-medium ${
                                !canResend || loading
                                  ? "cursor-not-allowed text-gray-400"
                                  : "text-brand-500 hover:text-brand-600"
                              }`}
                            >
                              Resend{countdown > 0 ? ` (${countdown}s)` : ""}
                            </button>
                          </div>
                        </>
                      )}

                      {step === STEP.RESET_NEW_PIN && (
                        <>
                          <PinInput
                            length={PIN_LENGTH}
                            value={newPin}
                            onChange={setNewPin}
                            error={!!resetPinError}
                            label="New PIN"
                            id="new-pin"
                            disabled={loading}
                            autoFocus
                          />
                          <PinInput
                            length={PIN_LENGTH}
                            value={confirmPin}
                            onChange={setConfirmPin}
                            onComplete={() => {}}
                            error={!!resetPinError}
                            label="Confirm PIN"
                            id="confirm-pin"
                            disabled={loading}
                          />
                          {resetPinError ? (
                            <p className="text-sm font-medium text-error-500">
                              {resetPinError}
                            </p>
                          ) : null}
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitDisabled()}
                        className={`flex w-full items-center justify-center px-4 py-3 text-sm font-medium text-white transition rounded-3xl shadow-theme-xs ${
                          isSubmitDisabled()
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-brand-500 hover:bg-brand-600"
                        } disabled:opacity-70`}
                      >
                        {loading && (
                          <i
                            className="fa-solid fa-circle-notch mr-2 animate-spin"
                            aria-hidden
                          />
                        )}
                        {submitLabel()}
                      </button>

                      {error ? (
                        <p className="text-sm text-error-500">{error}</p>
                      ) : null}

                      {step === STEP.PIN && (
                        <button
                          type="button"
                          onClick={handleBackToMobile}
                          className="w-full text-center text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          ← Change mobile number
                        </button>
                      )}

                      {isResetFlow && (
                        <button
                          type="button"
                          onClick={handleBackFromReset}
                          className="w-full text-center text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          ← Back to sign in
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <AuthFooter />
              </div>
            </div>
          </div>

          <AuthHero />
        </div>
      </div>
    </>
  );
}

function AuthFooter() {
  return (
    <div className="flex flex-col items-center gap-3">
      <nav className="flex gap-10 text-sm text-gray-500 dark:text-gray-400">
        <a href="https://menumitra.com/" className="hover:text-gray-700">
          Home
        </a>
        <a href="https://menumitra.com/book-demo" className="hover:text-gray-700">
          Book a demo
        </a>
        <a href="https://menumitra.com/about" className="hover:text-gray-700">
          Contact
        </a>
        <a href="https://menumitra.com/contact" className="hover:text-gray-700">
          Support
        </a>
      </nav>
      <div className="flex justify-center gap-4 mt-6">
        {[
          { href: "https://menumitra.com/", icon: "ri-google-fill", color: "#4CAF50" },
          {
            href: "https://www.facebook.com/people/Menu-Mitra/61565082412478/",
            icon: "ri-facebook-fill",
            color: "#1877F2",
          },
          {
            href: "https://www.instagram.com/menumitra/",
            icon: "ri-instagram-fill",
            color: "#E91E63",
          },
          {
            href: "https://www.youtube.com/@menumitra",
            icon: "ri-youtube-fill",
            color: "#FF0000",
          },
        ].map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
          >
            <i className={`${s.icon} text-2xl`} style={{ color: s.color }} />
          </a>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">Version {API_CONFIG.VERSION}</span>
        <span>|</span>
        <span>
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

function AuthHero() {
  return (
    <div className="relative hidden w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <img src={grid01} alt="" />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <img src={grid01} alt="" />
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-8">
        <div className="flex flex-col items-center text-center">
          <img src={Logo} alt="Logo" className="mb-4 h-20 w-20" draggable={false} />
          <h2 className="text-2xl font-semibold text-white">Admin Dashboard</h2>
          <p className="mt-2 max-w-xs text-sm text-brand-100/90">
            Secure PIN sign-in with OTP-based reset when you forget your PIN.
          </p>
        </div>
        <div className="w-full max-w-md">
          <YouTubePlayer videoId="j2e2stCcICo" />
        </div>
      </div>
    </div>
  );
}

export default Auth;
