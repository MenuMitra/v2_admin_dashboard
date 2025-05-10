'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiClock, FiPercent, FiHash, FiInfo, FiArrowLeft, FiImage, FiUser, FiDollarSign } from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import commonService from '@/api/services/commonService';
import ownerService from '@/api/services/ownerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';

export default function CreateOutletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    outlet_type: '',
    veg_nonveg: '',
    service_charges: '',
    gst: '',
    upi_id: '',
    fssainumber: '',
    gstnumber: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    website: '',
    opening_time: '',
    closing_time: '',
    owner_id: '', // Changed from hardcoded to empty
    image: null
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Check authentication and fetch dropdowns on component mount
  React.useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    
    // Fetch dropdown options
    fetchOutletTypes();
    fetchFoodTypes();
    fetchOwners();
  }, [router]);

  // Fetch outlet types from API
  const fetchOutletTypes = async () => {
    try {
      const response = await commonService.getOutletTypes();
      if (response?.outlet_type_list) {
        setOutletTypes(response.outlet_type_list);
        // Set default value to first item if available
        if (Object.keys(response.outlet_type_list).length > 0) {
          setFormData(prev => ({
            ...prev,
            outlet_type: Object.keys(response.outlet_type_list)[0]
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch outlet types:', error);
      toast.error('Failed to load outlet types');
    }
  };

  // Fetch food types from API
  const fetchFoodTypes = async () => {
    try {
      const response = await commonService.getFoodTypes();
      if (response?.food_type_list) {
        setFoodTypes(response.food_type_list);
        // Set default value to first item if available
        if (Object.keys(response.food_type_list).length > 0) {
          setFormData(prev => ({
            ...prev,
            veg_nonveg: Object.keys(response.food_type_list)[0]
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch food types:', error);
      toast.error('Failed to load food types');
    }
  };

  // Fetch owners list
  const fetchOwners = async () => {
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await ownerService.listOwners(userId);
      if (Array.isArray(response)) {
        setOwners(response);
        // Set default owner if available
        if (response.length > 0) {
          setFormData(prev => ({
            ...prev,
            owner_id: response[0].user_id.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      toast.error('Failed to load owners');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Only validate mandatory fields
    if (!formData.name.trim()) newErrors.name = 'Outlet name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.owner_id) newErrors.owner_id = 'Owner selection is required';
    if (!formData.upi_id.trim()) newErrors.upi_id = 'UPI ID is required';
    
    if (!formData.veg_nonveg) newErrors.veg_nonveg = 'Food type selection is required';
    
    // For optional fields, only validate if they have values
    if (formData.opening_time) {
      // Time format is already correct from the HTML time input
    }
    
    if (formData.closing_time) {
      // Time format is already correct from the HTML time input
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      
      // Add endpoint directly to FormData - using admin endpoint instead of common
      formDataObj.append('endpoint', '/admin/create_outlet');
      
      // Process form data before sending
      const processedFormData = { ...formData };
      
      // Format times if they exist - convert from HTML time inputs (HH:MM) to the API format
      if (processedFormData.opening_time) {
        // Keep the HH:MM format for opening_time
        console.log("Original opening time:", processedFormData.opening_time);
      }
      
      if (processedFormData.closing_time) {
        // Keep the HH:MM format for closing_time
        console.log("Original closing time:", processedFormData.closing_time);
      }
      
      // Append all form fields including the image
      Object.keys(processedFormData).forEach(key => {
        if (key === 'image') {
          if (processedFormData[key]) {
            formDataObj.append(key, processedFormData[key]);
          }
        } else {
          formDataObj.append(key, processedFormData[key]);
        }
      });
      
      // Add user_id
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      formDataObj.append('user_id', userId.toString());
      
      const response = await outletService.createOutlet(formDataObj);
      console.log('Outlet creation response:', response);
      
      if (response.detail && response.detail.includes('successfully')) {
        toast.success('Outlet created successfully');
        router.push('/outlets');
      } else if (response.detail) {
        toast.error(response.detail);
      } else {
        toast.success('Outlet created successfully');
        router.push('/outlets');
      }
    } catch (error) {
      console.error('Failed to create outlet:', error);
      toast.error('Failed to create outlet: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Outlet</h1>
          <p className="mt-1 text-sm text-gray-600">Add a new food outlet to your business network</p>
        </div>
        <button
          onClick={() => router.push('/outlets')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Outlets
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Outlet Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new outlet. All fields marked with * are required.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiInfo className="mr-2 text-blue-600" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Outlet Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm text-sm text-black placeholder-gray-400 bg-white focus:bg-white focus:bg-opacity-100 ${
                        formData.name ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Enter outlet name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.mobile ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-blue-50`}
                      placeholder="Enter mobile number"
                    />
                  </div>
                  {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="owner_id"
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.owner_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm text-sm text-black bg-white`}
                    >
                      <option value="">Select Owner</option>
                      {owners.map((owner) => (
                        <option key={owner.user_id} value={owner.user_id.toString()}>
                          {owner.name} {owner.is_active ? '(Active)' : '(Inactive)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.owner_id && <p className="mt-1 text-sm text-red-600">{errors.owner_id}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-blue-50`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="upi_id"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.upi_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm text-sm text-black bg-white`}
                      placeholder="Enter UPI ID"
                    />
                  </div>
                  {errors.upi_id && <p className="mt-1 text-sm text-red-600">{errors.upi_id}</p>}
                </div>

                {/* Image Upload */}
                <div className="col-span-1 md:col-span-3">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Outlet Image
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className={`flex justify-center items-center px-6 pt-5 pb-6 border-2 ${errors.image ? 'border-red-300' : 'border-gray-300'} border-dashed rounded-md w-full max-w-xs`}>
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative w-full h-40 mb-4">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({...formData, image: null});
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                              title="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>{imagePreview ? 'Change image' : 'Upload a file'}</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          {!imagePreview && <p className="pl-1">or drag and drop</p>}
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {imagePreview && (
                      <div>
                        <p className="text-sm text-gray-500">Image uploaded successfully</p>
                        <p className="text-xs text-gray-400 mt-1">Click on the image to change or remove it</p>
                      </div>
                    )}
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`block w-full pl-10 pr-3 py-2 border ${errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-blue-50`}
                      placeholder="Enter complete address"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiHash className="mr-2 text-blue-600" />
                Business Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="outlet_type" className="block text-sm font-medium text-gray-700">
                    Outlet Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="outlet_type"
                      name="outlet_type"
                      value={formData.outlet_type}
                      onChange={handleInputChange}
                      className={`block w-full py-2.5 px-3 border ${
                        errors.outlet_type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm text-sm text-black bg-white`}
                    >
                      <option value="">Select Outlet Type</option>
                      {Object.entries(outletTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.outlet_type && (
                    <p className="mt-2 text-sm text-red-600">{errors.outlet_type}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="food_type" className="block text-sm font-medium text-gray-700">
                    Food Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="food_type"
                      name="food_type"
                      value={formData.food_type}
                      onChange={handleInputChange}
                      className={`block w-full py-2.5 px-3 border ${
                        errors.food_type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm text-sm text-black bg-white`}
                    >
                      <option value="">Select Food Type</option>
                      {Object.entries(foodTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.food_type && (
                    <p className="mt-2 text-sm text-red-600">{errors.food_type}</p>
                  )}
                </div>

                <div className="col-span-1">
                  <label htmlFor="service_charges" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Charges (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="service_charges"
                      name="service_charges"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.service_charges}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.service_charges ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-blue-50`}
                      placeholder="Enter service charges"
                    />
                  </div>
                  {errors.service_charges && <p className="mt-1 text-sm text-red-600">{errors.service_charges}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
                    GST (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="gst"
                      name="gst"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.gst}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.gst ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white focus:bg-blue-50`}
                      placeholder="Enter GST percentage"
                    />
                  </div>
                  {errors.gst && <p className="mt-1 text-sm text-red-600">{errors.gst}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.opening_time ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 bg-white focus:bg-blue-50`}
                      placeholder="09:00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 24-hour (HH:MM)</p>
                  {errors.opening_time && <p className="mt-1 text-sm text-red-600">{errors.opening_time}</p>}
                </div>

                <div className="col-span-1">
                  <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.closing_time ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm text-sm text-gray-900 bg-white focus:bg-blue-50`}
                      placeholder="21:00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 24-hour (HH:MM)</p>
                  {errors.closing_time && <p className="mt-1 text-sm text-red-600">{errors.closing_time}</p>}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FiInfo className="mr-2 text-blue-600" />
                Additional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label htmlFor="fssainumber" className="block text-sm font-medium text-gray-700 mb-1">
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    id="fssainumber"
                    name="fssainumber"
                    value={formData.fssainumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter FSSAI number"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="gstnumber" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gstnumber"
                    name="gstnumber"
                    value={formData.gstnumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter WhatsApp number"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter Facebook URL"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter Instagram URL"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 bg-white focus:bg-blue-50"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/outlets')}
              className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Outlet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 