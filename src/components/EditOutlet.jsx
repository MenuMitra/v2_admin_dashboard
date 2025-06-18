import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack, faSave } from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  SelectInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles
} from './forms/FormElements.jsx';

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { outletId } = useParams();
  
  const [formData, setFormData] = useState({
    outlet_id: '',
    user_id: '',
    owner_id: '',
    name: '',
    outlet_type: '',
    fssainumber: '',
    gstnumber: '',
    mobile: '',
    veg_nonveg: '',
    service_charges: '',
    gst: '',
    address: '',
    is_open: true,
    outlet_status: true,
    upi_id: '',
    website: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    google_business_link: '',
    google_review: '',
    email: '',
    opening_time: '',
    closing_time: '',
    outlet_mode: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch outlet data when component mounts
  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchOutletTypes();
      fetchFoodTypes();
      fetchOwners();
      fetchOutletData();
    }
  }, [adminData?.user_id, outletId]);

  const fetchOutletData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/common/view_outlet",
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet details") {
        const data = response.data.data;
        
        // Update form data with fetched data
        setFormData({
          outlet_id: outletId,
          user_id: data.owner_id,
          owner_id: data.owner_id,
          name: data.name,
          outlet_type: data.outlet_type,
          fssainumber: data.fssainumber,
          gstnumber: data.gstnumber,
          mobile: data.mobile,
          veg_nonveg: data.veg_nonveg,
          service_charges: data.service_charges,
          gst: data.gst,
          address: data.address,
          is_open: data.is_open === 1,
          outlet_status: data.outlet_status === 1,
          upi_id: data.upi_id,
          website: data.website || '',
          whatsapp: data.whatsapp?.replace(/\D/g, '') || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          google_business_link: data.google_business_link || '',
          google_review: data.google_review || '',
          email: data.email || '',
          opening_time: data.opening_time ? data.opening_time.split(' ')[1] : '',
          closing_time: data.closing_time ? data.closing_time.split(' ')[1] : '',
          outlet_mode: data.outlet_mode || ''
        });

        // If there's an image URL, set it as preview
        if (data.image) {
          setPreviewUrl(data.image);
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching outlet data:', error);
      navigate(-1);
    }
  };

  const fetchOutletTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/common/get_outlet_type',
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet types") {
        setOutletTypes(response.data.outlet_type_list);
      }
    } catch (error) {
      console.error('Error fetching outlet types:', error);
    }
  };

  const fetchFoodTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/common/get_food_type_list',
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.food_type_list) {
        setFoodTypes(response.data.food_type_list);
      }
    } catch (error) {
      console.error('Error fetching food types:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData.user_id}`,
        { headers: { Authorization: token } }
      );

      if (Array.isArray(response.data)) {
        setAllOwners(response.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const filteredOwners = allOwners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.mobile.includes(searchTerm) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'whatsapp') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly.slice(0, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare API data with updated owner_id fields
      const apiData = {
        outlet_id: parseInt(outletId),
        user_id: parseInt(adminData.user_id),
        curr_owner_id: parseInt(formData.user_id), // Current owner ID
        new_owner_id: parseInt(formData.owner_id), // New selected owner ID
        name: formData.name,
        outlet_type: formData.outlet_type,
        fssainumber: formData.fssainumber,
        gstnumber: formData.gstnumber,
        mobile: formData.mobile,
        veg_nonveg: formData.veg_nonveg,
        service_charges: formData.service_charges.toString(),
        gst: formData.gst.toString(),
        address: formData.address,
        is_open: formData.is_open ? 1 : 0,
        outlet_status: formData.outlet_status ? 1 : 0,
        upi_id: formData.upi_id,
        website: formData.website || '',
        whatsapp: formData.whatsapp || '',
        facebook: formData.facebook || '',
        instagram: formData.instagram || '',
        google_business_link: formData.google_business_link || '',
        google_review: formData.google_review || '',
        outlet_mode: formData.outlet_mode,
        app_source: "admin_dashboard"
      };

      const response = await axios.patch(
        'https://men4u.xyz/v2/common/update_outlet',
        apiData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Outlet information updated successfully") {
        navigate(-1);
      } else {
        throw new Error('Failed to update outlet');
      }
    } catch (error) {
      console.error('Error updating outlet:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Outlet
            </h1>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-brand-500 hover:bg-brand-600 
                transition shadow-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Owner Selection */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  <span className="text-error-600">*</span> Select Owner
                </label>
                
                <div className="border rounded-lg shadow-sm bg-white">
                  {/* Selected Owner Display or Search Bar */}
                  {formData.owner_id && !isDropdownOpen ? (
                    // Selected Owner Display
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {allOwners.find(o => o.user_id === formData.owner_id)?.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {allOwners.find(o => o.user_id === formData.owner_id)?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {allOwners.find(o => o.user_id === formData.owner_id)?.mobile}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    // Search and Dropdown
                    <>
                      {/* Search Bar */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full rounded-md border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Search owners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={() => setIsDropdownOpen(true)}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Owners List - Only show if dropdown is open */}
                      {isDropdownOpen && (
                        <div className="max-h-[400px] overflow-y-auto" style={{ maxHeight: filteredOwners.length > 10 ? '400px' : 'auto' }}>
                          {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner, index) => (
                              <div
                                key={owner.user_id}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, owner_id: owner.user_id }));
                                  setIsDropdownOpen(false);
                                  setSearchTerm('');
                                }}
                                className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  formData.owner_id === owner.user_id ? 'bg-blue-50' : ''
                                } ${index !== filteredOwners.length - 1 ? 'border-b border-gray-200' : ''}`}
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Owner Avatar */}
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-lg font-medium text-blue-600">
                                        {owner.name.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Owner Details */}
                                  <div>
                                    <div className="font-medium text-sm text-gray-900">
                                      {owner.name}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <span>{owner.mobile}</span>
                                      {owner.account_type && (
                                        <>
                                          <span className="mx-1.5">•</span>
                                          <span className={`capitalize px-1.5 py-0.5 rounded-full text-xs ${
                                            owner.account_type === 'live' 
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-orange-100 text-orange-700'
                                          }`}>
                                            {owner.account_type}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {owner.email && (
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {owner.email}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Selection Indicator */}
                                {formData.owner_id === owner.user_id && (
                                  <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {allOwners.length === 0 ? (
                                'No owners available'
                              ) : (
                                `No owners found matching "${searchTerm}"`
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show count if more than 10 items and dropdown is open */}
                      {isDropdownOpen && filteredOwners.length > 10 && (
                        <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
                          Showing {filteredOwners.length} owners
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Image Selection */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Outlet Image
                </label>
                <div className="border rounded-lg shadow-sm bg-white">
                  <div className="p-3 flex items-center justify-between">
                    {/* Image Preview */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg 
                              className="w-5 h-5 text-gray-400" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {imageFile?.name || 'No image selected'}
                        </div>
                        <div className="text-xs text-gray-500">
                          JPG, PNG, or GIF up to 5MB
                        </div>
                      </div>
                    </div>

                    {/* Upload Button */}
                    <label 
                      htmlFor="outlet-image"
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      {previewUrl ? 'Change' : 'Select'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="outlet-image"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  UPI ID *
                </label>
                <input
                  type="text"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Outlet Type *
                </label>
                <select
                  name="outlet_type"
                  value={formData.outlet_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Outlet Type</option>
                  {Object.entries(outletTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Food Type *
                </label>
                <select
                  name="veg_nonveg"
                  value={formData.veg_nonveg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Food Type</option>
                  {Object.entries(foodTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Outlet Mode
              </label>
              <SelectInput
                name="outlet_mode"
                value={formData.outlet_mode}
                onChange={handleInputChange}
                required
                options={[
                  { value: 'offline', label: 'Offline' },
                  { value: 'online', label: 'Online' }
                ]}
                placeholder="Select Outlet Mode"
              />
            </div>
          </section>

          {/* Business Details Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Business Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Service Charges (%)
                </label>
                <input
                  type="number"
                  name="service_charges"
                  value={formData.service_charges}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  GST (%)
                </label>
                <input
                  type="number"
                  name="gst"
                  value={formData.gst}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  FSSAI Number
                </label>
                <input
                  type="text"
                  name="fssainumber"
                  value={formData.fssainumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstnumber"
                  value={formData.gstnumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Social Media Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Social Media & Web Presence
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Enter 10 digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourhandle"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Google Business Link
                </label>
                <input
                  type="url"
                  name="google_business_link"
                  value={formData.google_business_link}
                  onChange={handleInputChange}
                  placeholder="https://business.google.com/yourpage"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Google Review Link
                </label>
                <input
                  type="url"
                  name="google_review"
                  value={formData.google_review}
                  onChange={handleInputChange}
                  placeholder="https://g.page/r/yourreviewpage"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Outlet Status Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Outlet Status
            </h2>

            <div className="space-y-4">
              <Checkbox
                label="Outlet is currently open"
                name="is_open"
                checked={formData.is_open}
                onChange={handleInputChange}
              />

              <Checkbox
                label="Outlet is active"
                name="outlet_status"
                checked={formData.outlet_status}
                onChange={handleInputChange}
              />
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}

export default EditOutlet;