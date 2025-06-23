import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/images/logo/logo.png";
import grid01 from "../assets/images/shape/grid-01.svg";
import toast, { Toaster } from 'react-hot-toast';

function Auth() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [mobileError, setMobileError] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/admin/admin_login",
        {
          mobile: mobile,
        }
      );

      if (response.data.detail === "OTP sent successfully") {
        setIsOtpSent(true);
        toast.success('OTP sent successfully!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
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
      const response = await axios.post(
        "https://men4u.xyz/v2/admin/admin_verify_otp",
        {
          mobile: mobile,
          otp: parseInt(otpString),
        }
      );

      if (response.data.detail === "Login successful") {
        // Store auth related data
        const authData = {
          access_token: response.data.access_token,
          token_type: response.data.token_type,
          expires_at: response.data.expires_at,
        };
        localStorage.setItem("auth", JSON.stringify(authData));

        // Store admin related data
        const adminData = {
          user_id: response.data.user_id,
          name: response.data.name,
          mobile: response.data.mobile,
          email: response.data.email,
          role: response.data.role,
        };
        localStorage.setItem("adminData", JSON.stringify(adminData));
        toast.success('Login successful!');
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to verify OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    setIsOtpSent(false);
    setOtp(["", "", "", ""]); // Reset OTP input
    setError(""); // Clear any errors
  };

  // Add this new function to handle enter key for OTP verification
  const handleOtpKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !otp.some((digit) => digit === "") &&
      !verifyLoading
    ) {
      handleVerifyOTP(e);
    }
  };

  // Add this new function to handle enter key for login
  const handleMobileKeyPress = (e) => {
    if (e.key === "Enter" && !loading && mobile.length === 10) {
      handleLogin(e);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <div className="relative flex flex-col justify-center w-full h-screen dark:bg-gray-900 sm:p-0 lg:flex-row">
          {/* <!-- Form --> */}
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
                  <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                      Login In
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
                                  "12345".includes(value[0])
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
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {isOtpSent && (
                <div>
                  <div className="mb-5 sm:mb-8">
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
                          onClick={handleLogin}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 pl-2 cursor-pointer"
                        >
                          Resend
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
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
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
          {/* <!-- Toggler --> */}
          {/* <div className="fixed z-50 bottom-6 right-6">
            <button className="inline-flex items-center justify-center text-white transition-colors rounded-full size-14 bg-brand-500 hover:bg-brand-600">
              <svg
                className="hidden fill-current dark:block"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.99998 1.5415C10.4142 1.5415 10.75 1.87729 10.75 2.2915V3.5415C10.75 3.95572 10.4142 4.2915 9.99998 4.2915C9.58577 4.2915 9.24998 3.95572 9.24998 3.5415V2.2915C9.24998 1.87729 9.58577 1.5415 9.99998 1.5415ZM10.0009 6.79327C8.22978 6.79327 6.79402 8.22904 6.79402 10.0001C6.79402 11.7712 8.22978 13.207 10.0009 13.207C11.772 13.207 13.2078 11.7712 13.2078 10.0001C13.2078 8.22904 11.772 6.79327 10.0009 6.79327ZM5.29402 10.0001C5.29402 7.40061 7.40135 5.29327 10.0009 5.29327C12.6004 5.29327 14.7078 7.40061 14.7078 10.0001C14.7078 12.5997 12.6004 14.707 10.0009 14.707C7.40135 14.707 5.29402 12.5997 5.29402 10.0001ZM15.9813 5.08035C16.2742 4.78746 16.2742 4.31258 15.9813 4.01969C15.6884 3.7268 15.2135 3.7268 14.9207 4.01969L14.0368 4.90357C13.7439 5.19647 13.7439 5.67134 14.0368 5.96423C14.3297 6.25713 14.8045 6.25713 15.0974 5.96423L15.9813 5.08035ZM18.4577 10.0001C18.4577 10.4143 18.1219 10.7501 17.7077 10.7501H16.4577C16.0435 10.7501 15.7077 10.4143 15.7077 10.0001C15.7077 9.58592 16.0435 9.25013 16.4577 9.25013H17.7077C18.1219 9.25013 18.4577 9.58592 18.4577 10.0001ZM14.9207 15.9806C15.2135 16.2735 15.6884 16.2735 15.9813 15.9806C16.2742 15.6877 16.2742 15.2128 15.9813 14.9199L15.0974 14.036C14.8045 13.7431 14.3297 13.7431 14.0368 14.036C13.7439 14.3289 13.7439 14.8038 14.0368 15.0967L14.9207 15.9806ZM9.99998 15.7088C10.4142 15.7088 10.75 16.0445 10.75 16.4588V17.7088C10.75 18.123 10.4142 18.4588 9.99998 18.4588C9.58577 18.4588 9.24998 18.123 9.24998 17.7088V16.4588C9.24998 16.0445 9.58577 15.7088 9.99998 15.7088ZM5.96356 15.0972C6.25646 14.8043 6.25646 14.3295 5.96356 14.0366C5.67067 13.7437 5.1958 13.7437 4.9029 14.0366L4.01902 14.9204C3.72613 15.2133 3.72613 15.6882 4.01902 15.9811C4.31191 16.274 4.78679 16.274 5.07968 15.9811L5.96356 15.0972ZM4.29224 10.0001C4.29224 10.4143 3.95645 10.7501 3.54224 10.7501H2.29224C1.87802 10.7501 1.54224 10.4143 1.54224 10.0001C1.54224 9.58592 1.87802 9.25013 2.29224 9.25013H3.54224C3.95645 9.25013 4.29224 9.58592 4.29224 10.0001ZM4.9029 5.9637C5.1958 6.25659 5.67067 6.25659 5.96356 5.9637C6.25646 5.6708 6.25646 5.19593 5.96356 4.90303L5.07968 4.01915C4.78679 3.72626 4.31191 3.72626 4.01902 4.01915C3.72613 4.31204 3.72613 4.78692 4.01902 5.07981L4.9029 5.9637Z"
                  fill=""
                ></path>
              </svg>
              <svg
                className="fill-current dark:hidden"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4547 11.97L18.1799 12.1611C18.265 11.8383 18.1265 11.4982 17.8401 11.3266C17.5538 11.1551 17.1885 11.1934 16.944 11.4207L17.4547 11.97ZM8.0306 2.5459L8.57989 3.05657C8.80718 2.81209 8.84554 2.44682 8.67398 2.16046C8.50243 1.8741 8.16227 1.73559 7.83948 1.82066L8.0306 2.5459ZM12.9154 13.0035C9.64678 13.0035 6.99707 10.3538 6.99707 7.08524H5.49707C5.49707 11.1823 8.81835 14.5035 12.9154 14.5035V13.0035ZM16.944 11.4207C15.8869 12.4035 14.4721 13.0035 12.9154 13.0035V14.5035C14.8657 14.5035 16.6418 13.7499 17.9654 12.5193L16.944 11.4207ZM16.7295 11.7789C15.9437 14.7607 13.2277 16.9586 10.0003 16.9586V18.4586C13.9257 18.4586 17.2249 15.7853 18.1799 12.1611L16.7295 11.7789ZM10.0003 16.9586C6.15734 16.9586 3.04199 13.8433 3.04199 10.0003H1.54199C1.54199 14.6717 5.32892 18.4586 10.0003 18.4586V16.9586ZM3.04199 10.0003C3.04199 6.77289 5.23988 4.05695 8.22173 3.27114L7.83948 1.82066C4.21532 2.77574 1.54199 6.07486 1.54199 10.0003H3.04199ZM6.99707 7.08524C6.99707 5.52854 7.5971 4.11366 8.57989 3.05657L7.48132 2.03522C6.25073 3.35885 5.49707 5.13487 5.49707 7.08524H6.99707Z"
                  fill=""
                ></path>
              </svg>
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Auth;
