'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import ownerService from '@/api/services/ownerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';

export default function EditOwnerPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    aadhar_number: '',
    dob: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    
    fetchOwnerDetails();
  }, []);

  const fetchOwnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerId = params.id;
      const ownerDetails = await ownerService.viewOwner(ownerId);
      
      if (ownerDetails.detail && typeof ownerDetails.detail === 'string' && !ownerDetails.name) {
        // This is likely an error
        setError(ownerDetails.detail);
        return;
      }
      
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = ownerDetails.dob ? 
        new Date(ownerDetails.dob).toISOString().split('T')[0] : '';
      
      setFormData({
        name: ownerDetails.name || '',
        mobile: ownerDetails.mobile || '',
        email: ownerDetails.email || '',
        address: ownerDetails.address || '',
        aadhar_number: ownerDetails.aadhar_number || '',
        dob: formattedDate,
      });
    } catch (error) {
      console.error('Failed to fetch owner details:', error);
      setError(error.message || 'Failed to load owner details');
    } finally {
      setLoading(false);
    }
  };

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
    
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const updateData = {
        update_user_id: userId,
        user_id: parseInt(params.id),
        ...formData
      };
      
      const response = await ownerService.updateOwner(updateData);
      
      if (response.detail && !response.detail.includes('success')) {
        // This is likely an error message
        setError(response.detail);
        setSubmitting(false);
        return;
      }
      
      toast.success('Owner updated successfully');
      router.push(`/owners/view/${params.id}`);
    } catch (error) {
      console.error('Failed to update owner:', error);
      setError(error.message || 'Failed to update owner');
      setSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/owners/view/${params.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl px-6 h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
          <FiAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Owner</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/owners')}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <FiArrowLeft className="mr-2" /> Go Back to Owners
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
          className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" /> Back to Owner Details
        </button>
      </div>

      {/* Edit form card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Edit Owner</h1>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter mobile number"
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
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
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
              >
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 