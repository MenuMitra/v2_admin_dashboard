'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiArrowLeft, FiPlus, FiAlertCircle } from 'react-icons/fi';
import partnerService from '@/api/services/partnerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';

export default function CreatePartnerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    aadhar_number: '',
    dob: '',
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
    }
  }, [router, mounted]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const createData = {
        user_id: userId,
        ...formData
      };
      
      const response = await partnerService.createPartner(createData);
      
      // Check if response contains a success message in the detail field
      if (response.detail && response.detail.includes("successfully")) {
        toast.success('Partner created successfully');
        // Go back to partners list
        router.push('/partners');
        return;
      }
      
      // If we have a detail field but not a user_id, it's likely an error
      if (response.detail && !response.user_id) {
        setError(response.detail || 'Failed to create partner');
        setSubmitting(false);
        return;
      }
      
      // If we get here with a user_id, it's a successful creation
      if (response.user_id) {
        toast.success('Partner created successfully');
        // Go back to partners list
        router.push('/partners');
        return;
      }
      
      // Default error handling
      setError('Failed to create partner: Unexpected response format');
      setSubmitting(false);
    } catch (error) {
      console.error('Failed to create partner:', error);
      setError(error.message || 'Failed to create partner');
      setSubmitting(false);
    }
  };

  const goBack = () => {
    router.push('/partners');
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl px-6">
        {/* Loading skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-24 h-10 bg-gray-200 rounded"></div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded col-span-1"></div>
                <div className="h-20 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded col-span-1"></div>
                <div className="h-20 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl px-6 h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
          <FiAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Creating Partner</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            suppressHydrationWarning
          >
            <FiArrowLeft className="mr-2" /> Go Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-gray-700 hover:text-indigo-600 transition-colors duration-200"
          suppressHydrationWarning
        >
          <FiArrowLeft className="mr-2" /> Back to Partners
        </button>
      </div>

      {/* Create form card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Add New Partner</h1>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter mobile number"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Aadhar Number */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
                  Aadhar Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="aadhar_number"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter 12-digit Aadhar number"
                    pattern="[0-9]{12}"
                    title="Please enter a valid 12-digit Aadhar number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter complete address"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200 mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                disabled={submitting}
                suppressHydrationWarning
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                suppressHydrationWarning
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                {submitting ? 'Creating...' : 'Create Partner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 