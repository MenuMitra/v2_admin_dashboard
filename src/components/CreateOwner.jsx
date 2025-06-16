import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import axios from 'axios';

function CreateOwner() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dob: '',
    aadhar_number: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const payload = {
        user_id: adminData.user_id,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        aadhar_number: formData.aadhar_number,
        dob: formData.dob,
        functionality_ids: [1] // Default functionality ID
      };

      await axios.post(
        'https://men4u.xyz/v2/admin/create_owner',
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Navigate back after successful creation
      navigate(-1);
      
    } catch (error) {
      console.error('Error creating owner:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <span className="mr-2">‹</span>
          Back
        </button>
        <h1 className="text-xl font-semibold">Create Owner</h1>
        <div className="w-[70px]"></div> {/* Spacer for alignment */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                required
                pattern="[0-9]{10}"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="date"
                name="dob"
                placeholder="dd-mm-yyyy"
                value={formData.dob}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Aadhar Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhar Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="text"
                name="aadhar_number"
                placeholder="Enter 12-digit Aadhar number"
                value={formData.aadhar_number}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                required
                pattern="[0-9]{12}"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3">
              </div>
              <textarea
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOwner;