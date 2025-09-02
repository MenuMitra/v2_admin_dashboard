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
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [countdown, setCountdown] = useState(0);
  const { getToken } = useAuth();

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
    e.preventDefault();
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
        const authData = {
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_at: response.data.expires_at || response.data.expires_on,
        };
        localStorage.setItem("auth", JSON.stringify(authData));

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
        <div className="relative flex flex-col justify-center w-full h-screen dark:bg-gray-900 sm:p-0 lg:flex-row">
          <div className="flex flex-col flex-1 w-full lg:w-1/2">
            {isOtpSent && (
              <div className="w-full max-w-md pt-10 mx-auto">
                <a
                  onClick={handleBackToLogin}
                  className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                >
                  <svg
                    className="stroke-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  Back to Login
                </a>
              </div>
            )}
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              {!isOtpSent && (
                <div>
                  <div className="pb-10 size-full">
                    <YouTubePlayer videoId="j2e2stCcICo" />
                  </div>
                  <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                      Login
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enter your mobile number to sign in!
                    </p>
                  </div>
                  <div>
                    <form onSubmit={handleLogin}>
                      <div className="space-y-5">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Mobile Number
                            <span className="text-error-500">*</span>
                          </label>
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
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          />
                          {mobileError && (
                            <p className="mt-1 text-sm text-error-500">
                              {mobileError}
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            type="submit"
                            disabled={loading || mobile.length !== 10}
                            className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs ${
                              loading || mobile.length !== 10
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-brand-500 hover:bg-brand-600"
                            } disabled:opacity-70`}
                          >
                            {loading ? "Sending OTP..." : "Get OTP"}
                          </button>
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-10">
                          <div className="flex items-center gap-2">
                            <img
                              src={Logo}
                              alt="MenuMitra"
                              className="w-12 h-12 object-contain"
                            />
                            <span className="text-lg font-normal text-gray-700 dark:text-white">
                              MenuMitra
                            </span>
                          </div>
 
  {/* Fixed Social Icons Section */}
                          <div className="flex justify-center gap-4 mt-6">
                            <a 
                              href="https://www.facebook.com/people/Menu-Mitra/61565082412478/" 
                              className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <i className="ri-facebook-fill text-2xl" style={{ color: "#1877F2" }}></i>
                            </a>
                            <a 
                              href="https://www.instagram.com/menumitra/" 
                              className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <i className="ri-instagram-fill text-2xl" style={{ color: "#E4405F" }}></i>
                            </a>
                            <a 
                              href="https://www.youtube.com/@menumitra" 
                              className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <i className="ri-youtube-fill text-2xl" style={{ color: "#FF0000" }}></i>
                            </a>
                            <a 
                              href="https://www.google.com/@menumitra" 
                              className="social-btn flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 bg-white transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <i className="ri-google-fill text-2xl" style={{ color: "#34A853" }}></i>
                            </a>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Version 2.0</span>
                            <span>|</span>
                            <span>13 Aug 2025</span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}


              {isOtpSent && (
                <div>
                  <div className="mb-5 sm:mb-8">
                    <div className="pb-10 size-full">
                      <YouTubePlayer videoId="j2e2stCcICo" />
                    </div>
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                      Verify OTP
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      A verification code has been sent to your mobile. Please
                      enter it in the field below.
                    </p>
                  </div>
                  <div>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Type your 4 digits security code
                        </label>
                        <div className="flex gap-2 sm:gap-4" id="otp-container">
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
                              className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={handleVerifyOTP}
                          disabled={
                            verifyLoading || otp.some((digit) => digit === "")
                          }
                          className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs ${
                            verifyLoading || otp.some((digit) => digit === "")
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-brand-500 hover:bg-brand-600"
                          } disabled:opacity-70`}
                        >
                          {verifyLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="mt-4 text-sm text-error-500">
                        The OTP you entered is incorrect. Please try again.
                      </div>
                    )}
                    <div className="mt-5">
                      <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                        Didn't get the code?
                        <a
                          onClick={handleResendOTP}
                          className={`pl-2 cursor-pointer ${
                            countdown > 0
                              ? "text-error-500 cursor-not-allowed"
                              : "text-error-500 hover:text-error-600 dark:text-error-400"
                          }`}
                        >
                          Resend {countdown > 0 ? `(${countdown}s)` : ""}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative items-center hidden w-full h-full bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="flex items-center justify-center z-1">
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;