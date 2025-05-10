"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '@/api';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds countdown instead of 120
  const [isResending, setIsResending] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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
    
    // Auto-focus the first input on component mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
    
    // Trigger animation on mount
    setAnimateIn(true);
    
    // Set up the countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

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
      
      // Check if verification was successful
      if (response.detail === 'Login successful' && response.access_token) {
        // Token storage is handled in authService.verifyOtp
        
        // Show success message briefly before redirect
        setSuccessMessage('Login successful! Redirecting...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Handle unsuccessful verification
        setErrorMessage(response?.detail || 'Invalid OTP. Please try again.');
        // Clear OTP fields on error
        setOtp(['', '', '', '']);
        // Focus first input
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrorMessage('Error connecting to the server. Please try again later.');
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
        // Reset timer to 15 seconds
        setTimeLeft(15);
        setSuccessMessage('OTP sent successfully! Please check your phone.');
      } else {
        // Handle unsuccessful resend
        setErrorMessage(response?.msg || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrorMessage('Error connecting to the server. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="glowing-stars"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand logo with animation */}
        <div className="flex items-center justify-center mb-10">
          <div className={`w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 transition-all duration-1000 ${animateIn ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <span className="text-white font-bold text-3xl">A</span>
          </div>
        </div>
        
        {/* OTP verification card with animation */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center mb-8">
            <Link href="/auth/login" className="text-gray-300 hover:text-white inline-flex items-center group">
              <ArrowLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Back</span>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
            <p className="text-gray-300">Enter the 4-digit code sent to your mobile</p>
            {mobileNumber && <p className="text-gray-400 text-sm mt-1">{mobileNumber}</p>}
          </div>

          <div className="space-y-8">
            <div className="flex justify-center space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : null}
                  className={`w-14 h-14 text-center text-xl font-semibold bg-white/5 border border-gray-300/20 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 transform delay-${index*100}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? 'translateY(0)' : 'translateY(20px)'
                  }}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="text-center">
                <p className="text-sm text-red-400 fade-in">{errorMessage}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="text-center">
                <p className="text-sm text-green-400 fade-in">{successMessage}</p>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 4 || isLoading}
              className="w-full group flex justify-center items-center py-4 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
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
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 transform -skew-x-30 translate-x-[-150%] group-hover:translate-x-[150%] transition-all duration-1000"></div>
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">
                Didn't receive the code? {timeLeft > 0 ? (
                  <span className="text-yellow-400 font-medium">Resend in {formatTime(timeLeft)}</span>
                ) : 'Resend now'}
              </p>
              <button
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || isResending}
                className={`inline-flex items-center text-sm font-medium ${
                  timeLeft > 0 ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-white hover:text-purple-300 group'
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
      
      {/* Custom CSS for animated background */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(-30px, -20px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 10s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .glowing-stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-image: radial-gradient(2px 2px at 40px 60px, rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0)),
                          radial-gradient(2px 2px at 20px 50px, rgba(255, 255, 255, 0.4), rgba(0, 0, 0, 0)),
                          radial-gradient(2px 2px at 30px 100px, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0)),
                          radial-gradient(2px 2px at 40px 60px, rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0)),
                          radial-gradient(2px 2px at 110px 70px, rgba(255, 255, 255, 0.4), rgba(0, 0, 0, 0)),
                          radial-gradient(2px 2px at 190px 150px, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0));
          background-repeat: repeat;
          background-size: 200px 200px;
        }
      `}</style>
    </div>
  );
} 