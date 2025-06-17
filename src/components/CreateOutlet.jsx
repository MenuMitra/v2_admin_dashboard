import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { useAdmin } from '../hooks/useAdmin';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";

function CreateOutlet() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
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
    owner_id: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchOutletTypes();
    fetchFoodTypes();
    fetchOwners();
  }, []);

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
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setAllOwners(response.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Updated formatDateTime function to match required format
      const formatDateTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12; // Convert 24h to 12h format
        return `2024-01-01 ${formattedHour.toString().padStart(2, '0')}:${minutes}:00 ${ampm}`;
      };

      const formDataToSend = new FormData();
      
      // Required fields from the form
      formDataToSend.append('owner_id', formData.owner_id);
      formDataToSend.append('user_id', adminData.user_id.toString());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('outlet_type', formData.outlet_type);
      formDataToSend.append('veg_nonveg', formData.veg_nonveg);
      formDataToSend.append('service_charges', formData.service_charges || '0');
      formDataToSend.append('gst', formData.gst || '0');
      formDataToSend.append('upi_id', formData.upi_id);

      // Optional fields
      if (formData.fssainumber) formDataToSend.append('fssainumber', formData.fssainumber);
      if (formData.gstnumber) formDataToSend.append('gstnumber', formData.gstnumber);
      if (formData.whatsapp) formDataToSend.append('whatsapp', formData.whatsapp);
      if (formData.facebook) formDataToSend.append('facebook', formData.facebook);
      if (formData.instagram) formDataToSend.append('instagram', formData.instagram);
      if (formData.website) formDataToSend.append('website', formData.website);
      
      // Format and append times with AM/PM
      if (formData.opening_time) {
        formDataToSend.append('opening_time', formatDateTime(formData.opening_time));
      }
      if (formData.closing_time) {
        formDataToSend.append('closing_time', formatDateTime(formData.closing_time));
      }

      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/create_outlet',
        formDataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.detail === "Outlet created successfully") {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error creating outlet:', error);
    }
  };

  const filteredOwners = allOwners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.mobile.includes(searchTerm) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">
      <div className="rounded-lg md:rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-hidden pt-3 sm:pt-4 dark:border-gray-800">
          <div className="flex items-center px-3 sm:px-4 md:px-6 mb-3 sm:mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-sm sm:text-base md:text-xl font-semibold text-gray-800 dark:text-white/90">
                Create Outlet
              </h1>
            </div>

            <div className="w-8 sm:w-[42px] md:w-[70px]"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Basic Information Section */}
          <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>

            {/* Owner Selection */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Select Owner *
                </label>
                
                  <div className="border rounded-lg shadow-sm bg-white">
                    {/* Selected Owner Display or Search Bar */}
                  {formData.owner_id && !isDropdownOpen ? (
                      // Selected Owner Display
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                        {/* Owner Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-blue-600">
                                {allOwners.find(o => o.user_id === parseInt(formData.owner_id))?.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        
                        {/* Owner Details */}
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {allOwners.find(o => o.user_id === parseInt(formData.owner_id))?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {allOwners.find(o => o.user_id === parseInt(formData.owner_id))?.mobile}
                            </div>
                          </div>
                        </div>
                      
                      {/* Change Button */}
                        <button
                          type="button"
                        onClick={() => setIsDropdownOpen(true)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
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

                        {/* Owners List */}
                      {isDropdownOpen && (
                        <div className="max-h-[400px] overflow-y-auto">
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
                              {allOwners.length === 0 ? 'No owners available' : `No owners found matching "${searchTerm}"`}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Outlet Image */}
              <div className="col-span-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-40 object-contain" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Click to select image</p>
                      <p className="text-xs text-gray-400">JPG, PNG, or GIF up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="outlet-image"
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
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

              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700">
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
            </div>
          </section>

          {/* Business Details */}
          <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Business Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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

          {/* Social Media & Web Presence */}
          <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Social Media & Web Presence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700">
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

          {/* Outlet Status */}
          <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Outlet Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_open"
                  checked={formData.is_open}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Outlet is currently open
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="outlet_status"
                  checked={formData.outlet_status}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Outlet is active
                </label>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Outlet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOutlet;