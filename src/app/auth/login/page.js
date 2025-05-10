"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Phone, ArrowRight } from 'lucide-react';
import { authService } from '@/api';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    // Trigger animation on mount
    setAnimateIn(true);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    console.log('Mobile number:', data.mobile);
    
    try {
      console.log('Sending login request to API...');
      const response = await authService.login(data.mobile);
      console.log('Login API response:', response);
      
      // Check if OTP was sent successfully
      if (response.detail === 'OTP sent successfully') {
        // Store mobile number for verification
        localStorage.setItem('mobileNumber', data.mobile);
        
        // Redirect to OTP verification
        router.push('/auth/verify-otp');
      } else {
        // Handle unsuccessful login
        setErrorMessage(response?.msg || response?.detail || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Login error details:', error);
      setErrorMessage('Error connecting to the server. Please try again later.');
    } finally {
      setIsLoading(false);
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
        
        {/* Login card with animation */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-300">Enter your mobile number to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-indigo-300 group-focus-within:text-white transition-colors duration-300" />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  {...register("mobile", { 
                    required: "Mobile number is required"
                  })}
                  className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-gray-300/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter your mobile number"
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-focus-within:w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 transition-all duration-500"></div>
              </div>
              {errors.mobile && <p className="mt-2 text-sm text-red-400 fade-in">{errors.mobile.message}</p>}
              {errorMessage && <p className="mt-2 text-sm text-red-400 fade-in">{errorMessage}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group flex justify-center items-center py-4 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:translate-y-[-2px] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 transform -skew-x-30 translate-x-[-150%] group-hover:translate-x-[150%] transition-all duration-1000"></div>
            </button>
          </form>
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
        
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shine {
          from { background-position: -200% center; }
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
} 