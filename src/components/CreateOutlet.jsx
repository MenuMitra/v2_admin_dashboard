import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { useAdmin } from '../hooks/useAdmin';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  SelectInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles
} from './forms/FormElements.jsx';
import ImageUploader from './common/ImageUploader';
import Breadcrumb from './Breadcrumb';
import { toastController } from '../utils/toastController';

function CreateOutlet() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [outletTypes, setOutletTypes] = useState({});
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
    outlet_mode: '',
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
    owner_id: [],
    image: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationStates, setValidationStates] = useState({
    owner: false,
    name: false,
    mobile: false,
    upi: false,
    outlet_type: false,
    food_type: false,
    outlet_mode: false,
    address: false,
    service_charges: false,
    gst: false,
    fssainumber: false
  });

  const dropdownRef = useRef(null);

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Create Outlet' }
  ];

  useEffect(() => {
    fetchOutletTypes();
    fetchOwners();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/common/listview_owner/${adminData.user_id}`,
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

  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      image: Array.isArray(images) ? images[0] : null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'mobile') {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      const firstDigit = numbersOnly.charAt(0);
      
      // If starts with 1-5, clear the field and show validation
      if (firstDigit && ['1','2','3','4','5'].includes(firstDigit)) {
        setFormData(prev => ({
          ...prev,
          [name]: '' // Clear the field
        }));
        setValidationStates(prev => ({
          ...prev,
          mobile: true
        }));
      } else {
        // For valid numbers (6-9) or empty field
        setFormData(prev => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10)
        }));
        setValidationStates(prev => ({
          ...prev,
          mobile: false
        }));
      }
    } else if (name === 'fssainumber') {
      // Only allow numbers and limit to 14 characters
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 14);
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      
      // Validate FSSAI number length
      setValidationStates(prev => ({
        ...prev,
        fssainumber: numbersOnly.length > 0 && numbersOnly.length !== 14
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const isUpiValid = (upi) => {
    // UPI ID format: username@bankname or phonenumber@bankname
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upi && upiRegex.test(upi);
  };

  const isMobileValid = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    const startsWithInvalidNumber = /^[1-5]/;
    
    if (!mobile) return false;
    if (startsWithInvalidNumber.test(mobile)) return false;
    return mobileRegex.test(mobile);
  };

  const isAddressValid = (address) => {
    return address && address.length >= 3 && address.length <= 50;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setValidationStates({
      owner: formData.owner_id.length === 0,
      name: !isNameValid(formData.name),
      mobile: !isMobileValid(formData.mobile),
      upi: !isUpiValid(formData.upi_id),
      outlet_type: !formData.outlet_type,
      food_type: !formData.veg_nonveg,
      outlet_mode: !formData.outlet_mode,
      address: !isAddressValid(formData.address),
      service_charges: !formData.service_charges,
      gst: !formData.gst,
    });

    if (formData.owner_id.length === 0 || 
        !isNameValid(formData.name) || 
        !isMobileValid(formData.mobile) ||
        !isUpiValid(formData.upi_id) ||
        !formData.outlet_type ||
        !formData.veg_nonveg ||
        !formData.outlet_mode ||
        !isAddressValid(formData.address) ||
        !formData.service_charges ||
        !formData.gst) {
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formDataToSend = new FormData();
      
      // Required fields with exact names
      formDataToSend.append('owner_ids', formData.owner_id.join(','));
      formDataToSend.append('user_id', adminData.user_id.toString());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('outlet_type', formData.outlet_type);
      formDataToSend.append('outlet_mode', formData.outlet_mode);
      formDataToSend.append('veg_nonveg', formData.veg_nonveg);
      formDataToSend.append('service_charges', formData.service_charges || '0');
      formDataToSend.append('gst', formData.gst || '0');
      formDataToSend.append('upi_id', formData.upi_id);

      // Optional fields - only append if they have values
      if (formData.fssainumber) {
        formDataToSend.append('fssainumber', formData.fssainumber);
      }
      if (formData.gstnumber) {
        formDataToSend.append('gstnumber', formData.gstnumber);
      }
      if (formData.whatsapp) {
        formDataToSend.append('whatsapp', formData.whatsapp);
      }
      if (formData.facebook) {
        formDataToSend.append('facebook', formData.facebook);
      }
      if (formData.instagram) {
        formDataToSend.append('instagram', formData.instagram);
      }
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];

      // Fix the time formatting to match exactly "YYYY-MM-DD HH:MM:SS AM/PM"
      if (formData.opening_time) {
        const [timeStr, period] = formData.opening_time.split(' ');
        const [hours, minutes] = timeStr.split(':');
        const formattedOpeningTime = `${currentDate} ${hours}:${minutes}:00 ${period}`;
        formDataToSend.append('opening_time', formattedOpeningTime);
      }

      if (formData.closing_time) {
        const [timeStr, period] = formData.closing_time.split(' ');
        const [hours, minutes] = timeStr.split(':');
        const formattedClosingTime = `${currentDate} ${hours}:${minutes}:00 ${period}`;
        formDataToSend.append('closing_time', formattedClosingTime);
      }

      // Only append image if it exists
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await toastController.promise(
        axios.post(
          'https://men4u.xyz/v2/common/create_outlet',
          formDataToSend,
          {
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        ),
        {
          loading: 'Creating outlet...',
          success: 'Outlet created successfully!',
          error: 'Failed to create outlet'
        }
      );

      if (response.data.detail.includes("Outlet created successfully")) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error creating outlet:', error);
      toastController.error(error.response?.data?.detail || 'An unexpected error occurred');
    }
  };

  const filteredOwners = allOwners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.mobile.includes(searchTerm) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Optional: Add a helper function to check name validation
  const isNameValid = (name) => {
    return name && name.length >= 3 && name.length <= 50;
  };

  // Add this function to handle focus
  const handleFocus = (fieldName) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  // Add handler for owner dropdown click
  const handleOwnerClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    // Clear owner validation when clicked
    setValidationStates(prev => ({
      ...prev,
      owner: false
    }));
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Back Button */}
              <button 
                onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
              >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
              </button>

            {/* Title - Centered between buttons */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Create Outlet
              </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
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

            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 gap-6">
              {/* Select Owner and Image Upload in same grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Select Owner */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    <span className="text-error-600">*</span> Select Owner(s)
                  </label>
                  
                  <div className="relative" ref={dropdownRef}>
                    <div
                      onClick={handleOwnerClick}
                      className={`
                        w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                        focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                        ${validationStates.owner ? 'border-error-500' : 'border-gray-300'}
                      `}
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      {formData.owner_id.length > 0 ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {formData.owner_id.length} Owner(s) Selected
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="text-gray-500">Select Owner(s)</div>
                      )}
                    </div>

                    {/* Dropdown Panel */}
                    {isDropdownOpen && (
                      <div 
                        className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                        style={{
                          position: 'absolute',
                          width: '100%',
                          minWidth: '300px',
                          zIndex: 9999,
                          maxHeight: '350px',
                          overflowY: 'auto'
                        }}
                      >
                        {/* Selected Owners Display */}
                        {formData.owner_id.length > 0 && (
                          <div className="p-2 border-b bg-gray-50">
                            <div className="flex flex-wrap gap-2">
                              {formData.owner_id.map(id => {
                                const owner = allOwners.find(o => o.user_id === id);
                                return owner ? (
                                  <div 
                                    key={owner.user_id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                                  >
                                    <span>{owner.name}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData(prev => ({
                                          ...prev,
                                          owner_id: prev.owner_id.filter(ownerId => ownerId !== id)
                                        }));
                                      }}
                                      className="ml-1 text-brand-500 hover:text-brand-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Search Bar */}
                        <div className="sticky top-0 p-2 border-b bg-white">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            </span>
                            <input
                              type="text"
                              className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                              placeholder="Search by name, mobile or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Owners List */}
                        <div className="overflow-y-auto">
                          {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner) => (
                              <div
                                key={owner.user_id}
                                className={`
                                  p-3 cursor-pointer hover:bg-gray-50
                                  ${formData.owner_id.includes(owner.user_id)
                                    ? 'bg-brand-50 border-l-4 border-brand-500' 
                                    : 'border-l-4 border-transparent'
                                  }
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={formData.owner_id.includes(owner.user_id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setFormData(prev => ({
                                          ...prev,
                                          owner_id: e.target.checked 
                                            ? [...prev.owner_id, owner.user_id]
                                            : prev.owner_id.filter(id => id !== owner.user_id)
                                        }));
                                      }}
                                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                    />
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {owner.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        <span>{owner.mobile}</span>
                                        {owner.email && (
                                          <>
                                            <span className="mx-2">•</span>
                                            <span>{owner.email}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {allOwners.length === 0 ? 'No owners available' : `No owners found matching "${searchTerm}"`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative">
                  <ImageUploader
                    maxImages={1}
                    outputFormat="formData"
                    onImagesChange={handleImagesChange}
                    label="Outlet Image"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rest of the form fields in their own grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="relative">
                  <TextInput
                    label="Outlet Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('name')}
                    placeholder="Enter Outlet Name"
                    required
                    className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.name ? 'border-error-500' : 'border-gray-300'}
                    `}
                  />
                  {validationStates.name && (
                    <p className="text-error-500 text-sm mt-1">
                      {!formData.name ? 'Outlet name is required' : 
                       formData.name.length < 3 ? 'Outlet name must be at least 3 characters' : 
                       'Outlet name must not exceed 50 characters'}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <TextInput
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('mobile')}
                    placeholder="Enter Mobile Number"
                    required
                    maxLength={10}
                    className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.mobile ? 'border-error-500' : 'border-gray-300'}
                    `}
                  />
                  {validationStates.mobile && (
                    <p className="text-error-500 text-sm mt-1">
                      Mobile number must start with 6, 7, 8, or 9
                    </p>
                  )}
                </div>

                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email Address"
                />

                <div className="relative">
                  <TextInput
                    label="UPI ID"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('upi')}
                    placeholder="username@bankname"
                    required
                    className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.upi ? 'border-error-500' : 'border-gray-300'}
                    `}
                  />
                  {validationStates.upi && (
                    <p className="text-error-500 text-sm mt-1">
                      {!formData.upi_id ? 'UPI ID is required' : 
                       'Please enter a valid UPI ID (e.g., username@bankname)'}
                    </p>
                  )}
                </div>

                <SelectInput
                  label="Outlet Type"
                  name="outlet_type"
                  value={formData.outlet_type}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('outlet_type')}
                  error={validationStates.outlet_type && !formData.outlet_type}
                  required
                  options={Object.entries(outletTypes).map(([key, value]) => ({
                    value: key,
                    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
                  }))}
                  placeholder="Select Outlet Type"
                />

                <SelectInput
                  label="Food Type"
                  name="veg_nonveg"
                  value={formData.veg_nonveg}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('food_type')}
                  error={validationStates.food_type && !formData.veg_nonveg}
                  required
                  options={[
                    { value: 'veg', label: 'Veg' },
                    { value: 'nonveg', label: 'Non-Veg' }
                  ]}
                  placeholder="Select Food Type"
                />

                <SelectInput
                  label="Outlet Mode"
                  name="outlet_mode"
                  value={formData.outlet_mode}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('outlet_mode')}
                  error={validationStates.outlet_mode && !formData.outlet_mode}
                  required
                  options={[
                    { value: 'offline', label: 'Offline' },
                    { value: 'online', label: 'Online' }
                  ]}
                  placeholder="Select Outlet Mode"
                />
              </div>

              <div className="relative">
                <TextInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('address')}
                  placeholder="Enter Address"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.address ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {validationStates.address && (
                  <p className="text-error-500 text-sm mt-1">
                    {!formData.address ? 'Address is required' : 
                     formData.address.length < 3 ? 'Address must be at least 3 characters' : 
                     'Address must not exceed 50 characters'}
                  </p>
                )}
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="relative">
                <TextInput
                  label="Service Charges (%)"
                  name="service_charges"
                  type="number"
                  value={formData.service_charges}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('service_charges')}
                  placeholder="Enter Service Charges"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.service_charges ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {validationStates.service_charges && (
                  <p className="text-error-500 text-sm mt-1">
                    Service Charges is required
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="GST (%)"
                  name="gst"
                  type="number"
                  value={formData.gst}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('gst')}
                  placeholder="Enter GST"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.gst ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {validationStates.gst && (
                  <p className="text-error-500 text-sm mt-1">
                    GST is required
                  </p>
                )}
              </div>

              <TimePickerInput
                label="Opening Time"
                name="opening_time"
                value={formData.opening_time}
                onChange={handleInputChange}
                // required
                placeholder="Select opening time"
              />

              <TimePickerInput
                label="Closing Time"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleInputChange}
                // required
                placeholder="Select closing time"
              />

              <TextInput
                label="FSSAI Number"
                name="fssainumber"
                value={formData.fssainumber}
                onChange={handleInputChange}
                placeholder="Enter FSSAI Number"
              />

              <TextInput
                label="GST Number"
                name="gstnumber"
                value={formData.gstnumber}
                onChange={handleInputChange}
                placeholder="Enter GST Number"
              />
            </div>
          </section>

          {/* Social Media Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Social Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />

              <TextInput
                label="WhatsApp Number"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="Enter 10 digit mobile number"
                pattern="[0-9]{10}"
                maxLength={10}
              />

              <TextInput
                label="Facebook"
                name="facebook"
                type="url"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
              />

              <TextInput
                label="Instagram"
                name="instagram"
                type="url"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourhandle"
              />

              <TextInput
                label="Google Business Link"
                name="google_business_link"
                type="url"
                value={formData.google_business_link}
                onChange={handleInputChange}
                placeholder="https://business.google.com/yourpage"
              />

              <TextInput
                label="Google Review Link"
                name="google_review"
                type="url"
                value={formData.google_review}
                onChange={handleInputChange}
                placeholder="https://g.page/r/yourreviewpage"
              />
            </div>
          </section>

          {/* Outlet Status Section */}
          {/* <section className="bg-white p-6 rounded-lg shadow">
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
          </section> */}
        </form>
      </div>
    </>
  );
}

export default CreateOutlet;