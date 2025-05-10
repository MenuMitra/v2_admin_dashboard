"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Trigger animation on mount
    setAnimateIn(true);
  }, []);

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
        
        {/* 404 Card with animation */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* 404 Text */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">404</h1>
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mt-6 mb-2">Page Not Found</h2>
            <p className="text-gray-300">The page you are looking for doesn't exist or has been moved.</p>
          </div>

          {/* Animated Spaceship */}
          <div className="flex justify-center my-8">
            <div className="relative w-32 h-32">
              <div className="absolute top-10 left-0 right-0 mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse shadow-lg shadow-purple-500/30">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-t-2xl"></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full"></div>
                
                {/* Windows */}
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
                
                {/* Flames */}
                <div className="flame-animation absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-5 h-16 opacity-80">
                  <div className="absolute bottom-0 left-0 right-0 w-5 h-12 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full"></div>
                </div>
                
                {/* Small stars */}
                <div className="absolute -top-20 -left-20 w-full h-full">
                  <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-700"></div>
                  <div className="absolute top-2/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping animation-delay-1500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link href="/" className="flex-1 group">
              <button className="w-full group flex justify-center items-center py-4 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <Home size={18} className="mr-2" />
                  Go to Home
                </span>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/0 via-white/20 to-purple-600/0 transform -skew-x-30 translate-x-[-150%] group-hover:translate-x-[150%] transition-all duration-1000"></div>
              </button>
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="flex-1 py-4 px-4 rounded-xl text-base font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] flex justify-center items-center group"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animated background and elements */}
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
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        
        .animation-delay-1500 {
          animation-delay: 1500ms;
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
        
        .flame-animation {
          animation: flame 1.5s ease-in-out infinite alternate;
        }
        
        @keyframes flame {
          0% { height: 16px; opacity: 0.8; }
          100% { height: 22px; opacity: 0.6; }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
} 