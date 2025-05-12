"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '@/api';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const [mobileNumber, setMobileNumber] = useState('');
  const [maskedNumber, setMaskedNumber] = useState('');
  const router = useRouter();
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    // Get the mobile number from localStorage
    const storedMobile = localStorage.getItem('mobileNumber');
    if (!storedMobile) {
      // If mobile number is not found, redirect back to login
      router.push('/auth/login');
      return;
    }
    
    setMobileNumber(storedMobile);
    
    // Create masked version of mobile number (e.g., "xxxxxxxx90")
    if (storedMobile.length > 2) {
      const lastTwoDigits = storedMobile.slice(-2);
      const masked = 'x'.repeat(storedMobile.length - 2) + lastTwoDigits;
      setMaskedNumber(masked);
    } else {
      setMaskedNumber(storedMobile);
    }
    
    // Auto-focus the first input on component mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [router]);

  // Separate useEffect for timer to ensure it runs properly
  useEffect(() => {
    let timerId;
    if (timeLeft > 0) {
      timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timeLeft]);

  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleInputChange = (index, value) => {
    // Only allow numeric inputs
    if (!/^\d*$/.test(value)) return;
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
    
    // Update the OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // If a digit is entered and there is a next input, focus it
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 4-digit number
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      // Focus the last input
      inputRefs[3].current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join('').length !== 4) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const verificationData = {
        mobile: mobileNumber,
        otp: otp.join('')
      };
      
      console.log('Sending OTP verification:', verificationData);
      const response = await authService.verifyOtp(verificationData);
      console.log('OTP verification response:', response);
      
      // Check for successful login with either access_token or "Login successful" message
      if (response.access_token || response.detail === 'Login successful') {
        // Token storage is handled in authService.verifyOtp
        
        // Show success message
        setSuccessMessage('Login successful! Redirecting...');
        showToastNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Handle unsuccessful verification
        const errorMsg = response?.detail || 'Invalid OTP. Please try again.';
        setErrorMessage(errorMsg);
        showToastNotification(errorMsg, 'error');
        
        // Clear OTP fields on error
        setOtp(['', '', '', '']);
        // Focus first input
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMsg = 'Error connecting to the server. Please try again later.';
      setErrorMessage(errorMsg);
      showToastNotification(errorMsg, 'error');
      
      // Clear OTP fields on error
      setOtp(['', '', '', '']);
      // Focus first input
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      console.log('Resending OTP to:', mobileNumber);
      const response = await authService.resendOtp(mobileNumber);
      console.log('Resend OTP response:', response);
      
      // Check if resend was successful
      if (response && (response.detail || response.st === 1)) {
        // Reset timer to 60 seconds
        setTimeLeft(60);
        const successMsg = 'OTP sent successfully! Please check your phone.';
        setSuccessMessage(successMsg);
        showToastNotification(successMsg, 'success');
      } else {
        // Handle unsuccessful resend
        const errorMsg = response?.msg || 'Failed to resend OTP. Please try again.';
        setErrorMessage(errorMsg);
        showToastNotification(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMsg = 'Error connecting to the server. Please try again later.';
      setErrorMessage(errorMsg);
      showToastNotification(errorMsg, 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Toast notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform duration-300 ${
          toastType === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center">
            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
              toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {toastType === 'success' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
            </div>
            <p className={`text-sm font-medium ${toastType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4">
            <img 
              src="/images/logo.png" 
              alt="MM Outlet Management" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 inline-flex items-center group">
              <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back to login</span>
            </Link>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Verify OTP</h2>
            <p className="text-gray-600 text-sm">Enter the 4-digit code sent to your mobile</p>
            {maskedNumber && (
              <div className="mt-2 py-1 px-3 bg-gray-100 inline-block rounded-full">
                <p className="text-gray-700 text-sm font-medium tracking-wider">{maskedNumber}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between space-x-2 sm:space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : null}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold bg-white border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                />
              ))}
            </div>

            {errorMessage && (
              <div className="text-sm text-red-600">{errorMessage}</div>
            )}
            
            {successMessage && (
              <div className="text-sm text-green-600">{successMessage}</div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 4 || isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code? {timeLeft > 0 ? (
                  <span className="text-gray-800 font-medium">Resend in {formatTime(timeLeft)}</span>
                ) : 'Resend now'}
              </p>
              <button
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className={`inline-flex items-center text-sm font-medium ${
                  timeLeft > 0 ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-gray-800 hover:text-gray-600'
                }`}
              >
                {isResending ? (
                  <>
                    <RefreshCw size={16} className="mr-1 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-1 group-hover:rotate-180 transition-transform duration-700" />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 