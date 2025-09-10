import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/images/logo/logo.png";
import grid01 from "../assets/images/shape/grid-01.svg";
import { toastController } from "../utils/toastController";
import { API_CONFIG } from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";
import YouTubePlayer from "./YouTubePlayer";

function Auth() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  // const [isOtpScreen, setIsOtpScreen] = useState(false); // Unused variable
  const [mobileError, setMobileError] = useState("");
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [countdown, setCountdown] = useState(0);
  const { getToken, login } = useAuth();

  const navigate = useNavigate();

  const inputRef = useCallback(
    (inputElement) => {
      if (inputElement && isOtpSent) {
        inputElement.focus();
      }
    },
    [isOtpSent]
  );

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 3) {
      const nextInput = document.querySelector(
        `input.otp-input[data-index="${index + 1}"]`
      );
      if (nextInput) {
        nextInput.focus();
      }
    }

  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.querySelector(
        `input.otp-input[data-index="${index - 1}"]`
      );
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/admin/admin_login`, { mobile }),
        {
          loading: "Sending OTP...",
          success: "OTP sent successfully!",
          error: "Admin not found with this mobile number",
        }
      );

      if (response.data.detail === "OTP sent successfully") {
        setIsOtpSent(true);
        setCountdown(5);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Something went wrong";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault?.();
    setVerifyLoading(true);
    setError("");

    const otpString = otp.join("");

    try {
      const response = await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/admin/admin_verify_otp`, {
          mobile,
          otp: parseInt(otpString),
        }),
        {
          loading: "Verifying OTP...",
          success: "Login successful!",
          error: "Incorrect OTP",
        }
      );

      if (response.data.detail === "Login successful") {
        // Use the login function from useAuth hook for consistent token management
        login(response);

        const adminData = {
          user_id: response.data.user_id,
          name: response.data.name,
          mobile: response.data.mobile,
          email: response.data.email,
          role: response.data.role,
        };
        localStorage.setItem("adminData", JSON.stringify(adminData));
        navigate("/home");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to verify OTP";
      setError(errorMsg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    setIsOtpSent(false);
    setOtp(["", "", "", ""]);
    setError("");
  };

  const handleOtpKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !otp.some((digit) => digit === "") &&
      !verifyLoading
    ) {
      handleVerifyOTP(e);
    }
  };

  const handleMobileKeyPress = (e) => {
    if (e.key === "Enter" && !loading && mobile.length === 10) {
      handleLogin(e);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/resend_otp`,
          { mobile, app_type: "admin" },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Resending OTP...",
          success: "OTP resent successfully!",
          error: "Failed to resend OTP",
        }
      );

      if (response.status === 200) {
        setCountdown(5);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to resend OTP";
      setError(errorMsg);
    }
  };

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
                      <div className="text-xl font-semibold text-gray-800 dark:text-white">
                        MenuMitra
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {!isOtpSent
                          ? "Sign in to continue to your account"
                          : "Verify your mobile number"}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={!isOtpSent ? handleLogin : handleVerifyOTP}>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Mobile Number
                          <span className="text-error-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <i
                              className="fa-solid fa-mobile text-lg"
                              aria-hidden="true"
                            ></i>
                          </span>
                          <input
                            type="number"
                            value={mobile}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,10}$/.test(value)) {
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
                              }
                            }}
                            onKeyPress={handleMobileKeyPress}
                            placeholder="Enter your mobile number"
                            disabled={isOtpSent}
                            className={`dark:bg-dark-900 h-11 w-full rounded-lg border border-black bg-transparent px-4 pl-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-black focus:outline-none dark:border-black dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                              isOtpSent
                                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                : ""
                            }`}
                          />
                        </div>
                        {mobileError && (
                          <p className="mt-1 text-sm text-error-500">
                            {mobileError}
                          </p>
                        )}
                      </div>

                      {isOtpSent && (
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            OTP
                            <span className="text-error-500">*</span>
                          </label>
                          <div
                            className="flex gap-2 sm:gap-4"
                            id="otp-container"
                          >
                            {[0, 1, 2, 3].map((index) => (
                              <input
                                key={index}
                                type="text"
                                maxLength="1"
                                data-index={index}
                                value={otp[index]}
                                ref={index === 0 ? inputRef : null}
                                onChange={(e) =>
                                  handleOtpChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onKeyPress={handleOtpKeyPress}
                                className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-black bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 placeholder:text-gray-400 focus:border-black focus:outline-none dark:border-black dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={
                            !isOtpSent
                              ? loading || mobile.length !== 10
                              : verifyLoading ||
                                otp.some((digit) => digit === "")
                          }
                          className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs ${
                            (!isOtpSent && (loading || mobile.length !== 10)) ||
                            (isOtpSent &&
                              (verifyLoading ||
                                otp.some((digit) => digit === "")))
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-brand-500 hover:bg-brand-600"
                          } disabled:opacity-70`}
                        >
                          {!isOtpSent
                            ? loading
                              ? "Sending OTP..."
                              : "Send OTP"
                            : verifyLoading
                            ? "Verifying..."
                            : "Verify OTP"}
                        </button>
                      </div>

                      {error && (
                        <div className="mt-4 text-sm text-error-500">
                          {error}
                        </div>
                      )}

                      {isOtpSent && (
                        <div className="mt-5">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-400 sm:justify-start whitespace-nowrap">
                            <span>Didn't receive OTP?</span>
                            <a
                              onClick={handleResendOTP}
                              className={`cursor-pointer whitespace-nowrap ${
                                countdown > 0
                                  ? "text-error-500 cursor-not-allowed"
                                  : "text-error-500 hover:text-error-600 dark:text-error-400"
                              }`}
                            >
                              Resend OTP
                              {countdown > 0 ? ` (${countdown}s)` : ""}
                            </a>
                            <span>|</span>
                            <a
                              onClick={handleBackToLogin}
                              className="cursor-pointer text-brand-500 hover:text-brand-600 dark:text-brand-400 whitespace-nowrap"
                            >
                              Change Number?
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
                <div className="flex flex-col items-center gap-3">
                  {/* Footer links below the card (separate from card) */}
                  <div className="w-full flex justify-center lg:justify-center">
                    <nav className="flex gap-10 text-sm text-gray-500 dark:text-gray-400">
                      <a href="#" className="hover:text-gray-700">
                        Home
                      </a>
                      <a href="#" className="hover:text-gray-700">
                        Book a demo
                      </a>
                      <a href="#" className="hover:text-gray-700">
                        Contact
                      </a>
                      <a href="#" className="hover:text-gray-700">
                        Support
                      </a>
                    </nav>
                  </div>
                  {/* Fixed Social Icons Section */}
                  <div className="flex justify-center gap-4 mt-6">
                    <a
                      href="https://www.facebook.com/people/Menu-Mitra/61565082412478/"
                      className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <i
                        className="ri-facebook-fill text-2xl"
                        style={{ color: "#1877F2" }}
                      ></i>
                    </a>
                    <a
                      href="https://www.instagram.com/menumitra/"
                      className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <i
                        className="ri-instagram-fill text-2xl"
                        style={{ color: "#E4405F" }}
                      ></i>
                    </a>
                    <a
                      href="https://www.youtube.com/@menumitra"
                      className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <i
                        className="ri-youtube-fill text-2xl"
                        style={{ color: "#FF0000" }}
                      ></i>
                    </a>
                    <a
                      href="https://www.google.com/@menumitra"
                      className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <i
                        className="ri-google-fill text-2xl"
                        style={{ color: "#34A853" }}
                      ></i>
                    </a>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Version 2.0</span>
                    <span>|</span>
                    <span>13 Aug 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative items-center hidden w-full bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="flex items-end justify-center z-1 w-full h-full">
              <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
                <img src={grid01} alt="grid" />
              </div>
              <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
                <img src={grid01} alt="grid" />
              </div>

              <div className="flex flex-col items-center max-w-xs">
                <a href="index.html" className="block mb-4">
                  <img src={Logo} alt="Logo" />
                </a>
                <h2 className="text-2xl font-semibold mb-2 text-white">
                  Admin Dashboard
                </h2>
              </div>
            </div>
            {/* Video below the right panel content */}
            <div className="w-full flex items-center justify-center">
              <div className="w-full max-w-md px-6">
                <YouTubePlayer videoId="j2e2stCcICo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;