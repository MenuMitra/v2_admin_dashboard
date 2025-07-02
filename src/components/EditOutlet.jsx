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
import Breadcrumb from './Breadcrumb';
import ImageUploader from './common/ImageUploader';
import { API_CONFIG } from "../config/appConfig";
import { isValidSocialMediaLinks, isMobileValid, isWhatsappValid } from '../utils/validations';

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { outletId } = useParams();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [outletData, setOutletData] = useState({
    outlet_id: '',
    user_id: '',
    owner_ids: [],
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
    outlet_mode: '',
    image: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationStates, setValidationStates] = useState({
    website: false,
    facebook: false,
    instagram: false,
    google_business_link: false,
    google_review: false,
    mobile: false,
    mobileMessage: '',
    whatsapp: false,
    whatsappMessage: '',
  });

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
        `${BASE_URL}/${API_VERSION}/common/view_outlet`,
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
        setOutletData({
          outlet_id: outletId,
          user_id: adminData?.user_id,
          owner_ids: data.owners.map(owner => owner.owner_id),
          name: data.name,
          outlet_type: data.outlet_type,
          fssainumber: data.fssainumber === 'None' ? '' : data.fssainumber,
          gstnumber: data.gstnumber || '',
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
          outlet_mode: data.outlet_mode || '',
          image: data.image
        });

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
        `${BASE_URL}/${API_VERSION}/common/get_outlet_type`,
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
        `${BASE_URL}/${API_VERSION}/common/get_food_type_list`,
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
        `${BASE_URL}/${API_VERSION}/common/listview_owner/${adminData.user_id}`,
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

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Edit Outlet' }
  ];

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleImagesChange = (images) => {
    if (Array.isArray(images) && images[0]) {
      setOutletData(prev => ({
        ...prev,
        image: images[0]
      }));
    } else {
      setOutletData(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'mobile' || name === 'whatsapp') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      const firstDigit = numbersOnly.charAt(0);
      
      if (firstDigit && ['0','1','2','3','4','5'].includes(firstDigit)) {
        setOutletData(prev => ({
          ...prev,
          [name]: ''
        }));
        setValidationStates(prev => ({
          ...prev,
          [name]: true,
          [`${name}Message`]: `${name === 'mobile' ? 'Mobile' : 'WhatsApp'} number must start with 6, 7, 8, or 9`
        }));
      } else {
        setOutletData(prev => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10)
        }));
        
        // Validate the number
        const { isValid, message } = name === 'mobile' 
          ? isMobileValid(numbersOnly.slice(0, 10))
          : isWhatsappValid(numbersOnly.slice(0, 10));
          
        setValidationStates(prev => ({
          ...prev,
          [name]: !isValid,
          [`${name}Message`]: message
        }));
      }
    } else {
      setOutletData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Validate social media links
      const socialMediaLinks = {
        website: outletData.website,
        facebook: outletData.facebook,
        instagram: outletData.instagram,
        google_business_link: outletData.google_business_link,
        google_review: outletData.google_review
      };

      const { isValid: isSocialValid, errors: socialErrors } = isValidSocialMediaLinks(socialMediaLinks);

      if (!isSocialValid) {
        setValidationStates(prev => ({
          ...prev,
          website: !!socialErrors.website,
          facebook: !!socialErrors.facebook,
          instagram: !!socialErrors.instagram,
          google_business_link: !!socialErrors.google_business_link,
          google_review: !!socialErrors.google_review
        }));

        Object.values(socialErrors).forEach(error => {
          toastController.error(error);
        });
        return;
      }

      // Prepare API data with new_owner_ids as array
      const apiData = {
        outlet_id: parseInt(outletId),
        user_id: parseInt(adminData.user_id),
        new_owner_ids: outletData.owner_ids, // Changed from owner_ids to new_owner_ids
        name: outletData.name,
        outlet_type: outletData.outlet_type,
        fssainumber: outletData.fssainumber,
        gstnumber: outletData.gstnumber,
        mobile: outletData.mobile,
        veg_nonveg: outletData.veg_nonveg,
        service_charges: outletData.service_charges.toString(),
        gst: outletData.gst.toString(),
        address: outletData.address,
        is_open: outletData.is_open ? 1 : 0,
        outlet_status: outletData.outlet_status ? 1 : 0,
        upi_id: outletData.upi_id,
        website: outletData.website || '',
        whatsapp: outletData.whatsapp || '',
        facebook: outletData.facebook || '',
        instagram: outletData.instagram || '',
        google_business_link: outletData.google_business_link || '',
        google_review: outletData.google_review || '',
        outlet_mode: outletData.outlet_mode,
        image: outletData.image || '',
        app_source: "admin_dashboard"
      };

      const response = await axios.patch(
        `${BASE_URL}/${API_VERSION}/common/update_outlet`,
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
    <>
      {/* Add Breadcrumb */}
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
              Edit Outlet
            </h1>

            {/* Save Button */}
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

            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 gap-6">
              {/* Select Owner and Image Upload in same grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Select Owner */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    <span className="text-error-600">*</span> Select Owner(s)
                  </label>
                  
                  <div className="relative">
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      {outletData.owner_ids.length > 0 ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {outletData.owner_ids.length} Owner(s) Selected
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

                    {/* Selected Owners Display */}
                    {outletData.owner_ids.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {outletData.owner_ids.map(id => {
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
                                  setOutletData(prev => ({
                                    ...prev,
                                    owner_ids: prev.owner_ids.filter(ownerId => ownerId !== id)
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
                    )}

                    {/* Dropdown Panel */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                        style={{
                          width: '100%',
                          minWidth: '300px',
                          maxHeight: '350px',
                          overflowY: 'auto'
                        }}
                      >
                        {/* Search Bar */}
                        <div className="sticky top-0 p-2 border-b bg-white">
                          <input
                            type="text"
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Search by name, mobile or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>

                        {/* Owners List */}
                        <div className="overflow-y-auto">
                          {filteredOwners.map((owner) => (
                            <div
                              key={owner.user_id}
                              className={`
                                p-3 cursor-pointer hover:bg-gray-50
                                ${outletData.owner_ids.includes(owner.user_id)
                                  ? 'bg-brand-50 border-l-4 border-brand-500' 
                                  : 'border-l-4 border-transparent'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={outletData.owner_ids.includes(owner.user_id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setOutletData(prev => ({
                                      ...prev,
                                      owner_ids: e.target.checked
                                        ? [...prev.owner_ids, owner.user_id]
                                        : prev.owner_ids.filter(id => id !== owner.user_id)
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative">
                  <ImageUploader
                    maxImages={1}
                    onImagesChange={handleImagesChange}
                    existingImages={outletData.image ? [outletData.image] : []}
                    label="Outlet Image"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rest of the form fields in their own grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Outlet Name"
                  name="name"
                  value={outletData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Outlet Name"
                  required
                />

                <div className="relative">
                  <TextInput
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={outletData.mobile}
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
                      {validationStates.mobileMessage}
                    </p>
                  )}
                </div>

                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={outletData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email Address"
                />

                <TextInput
                  label="UPI ID"
                  name="upi_id"
                  value={outletData.upi_id}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                  required
                />

                <SelectInput
                  label="Outlet Type"
                  name="outlet_type"
                  value={outletData.outlet_type}
                  onChange={handleInputChange}
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
                  value={outletData.veg_nonveg}
                  onChange={handleInputChange}
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
                  value={outletData.outlet_mode}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'offline', label: 'Offline' },
                    { value: 'online', label: 'Online' }
                  ]}
                  placeholder="Select Outlet Mode"
                />

                <SelectInput
                  label="Status"
                  name="outlet_status"
                  value={outletData.outlet_status ? "1" : "0"}
                  onChange={(e) => {
                    setOutletData(prev => ({
                      ...prev,
                      outlet_status: e.target.value === "1"
                    }));
                  }}
                  required
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" }
                  ]}
                  placeholder="Select Status"
                />

                <SelectInput
                  label="Open/Close"
                  name="is_open"
                  value={outletData.is_open ? "1" : "0"}
                  onChange={(e) => {
                    setOutletData(prev => ({
                      ...prev,
                      is_open: e.target.value === "1"
                    }));
                  }}
                  required
                  options={[
                    { value: "1", label: "Open" },
                    { value: "0", label: "Closed" }
                  ]}
                  placeholder="Select Open/Close Status"
                />

                <div className="relative">
                  <TextInput
                    label="WhatsApp Number"
                    name="whatsapp"
                    type="tel"
                    value={outletData.whatsapp}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('whatsapp')}
                    placeholder="Enter 10 digit mobile number"
                    maxLength={10}
                    className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.whatsapp ? 'border-error-500' : 'border-gray-300'}
                    `}
                  />
                  {validationStates.whatsapp && (
                    <p className="text-error-500 text-sm mt-1">
                      {validationStates.whatsappMessage}
                    </p>
                  )}
                </div>
              </div>

              <Textarea
                label="Address"
                name="address"
                value={outletData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                required
                rows={3}
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
                  value={outletData.service_charges}
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
                  value={outletData.gst}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <TimePickerInput
                label="Opening Time"
                  name="opening_time"
                  value={outletData.opening_time}
                  onChange={handleInputChange}
                required
                placeholder="Select opening time"
                />

              <TimePickerInput
                label="Closing Time"
                  name="closing_time"
                  value={outletData.closing_time}
                  onChange={handleInputChange}
                required
                placeholder="Select closing time"
                />

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  FSSAI Number
                </label>
                <input
                  type="text"
                  name="fssainumber"
                  value={outletData.fssainumber}
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
                  value={outletData.gstnumber}
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
              Social Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={outletData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.website ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={outletData.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.facebook ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={outletData.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourhandle"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.instagram ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Google Business Link
                </label>
                <input
                  type="url"
                  name="google_business_link"
                  value={outletData.google_business_link}
                  onChange={handleInputChange}
                  placeholder="https://business.google.com/yourpage"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.google_business_link ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Google Review Link
                </label>
                <input
                  type="url"
                  name="google_review"
                  value={outletData.google_review}
                  onChange={handleInputChange}
                  placeholder="https://g.page/r/yourreviewpage"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.google_review ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
              </div>
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

export default EditOutlet;