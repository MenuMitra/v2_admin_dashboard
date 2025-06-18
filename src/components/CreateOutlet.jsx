import React, { useState, useEffect } from 'react';
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
    owner_id: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchOutletTypes();
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

      const formDataToSend = new FormData();
      
      // Required fields with exact names
      formDataToSend.append('owner_id', formData.owner_id);
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
        // opening_time comes as "HH:MM AM/PM"
        const [timeStr, period] = formData.opening_time.split(' ');
        const [hours, minutes] = timeStr.split(':');
        const formattedOpeningTime = `${currentDate} ${hours}:${minutes}:00 ${period}`;
        formDataToSend.append('opening_time', formattedOpeningTime);
      }

      if (formData.closing_time) {
        // closing_time comes as "HH:MM AM/PM"
        const [timeStr, period] = formData.closing_time.split(' ');
        const [hours, minutes] = timeStr.split(':');
        const formattedClosingTime = `${currentDate} ${hours}:${minutes}:00 ${period}`;
        formDataToSend.append('closing_time', formattedClosingTime);
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.detail.includes("Outlet created successfully")) {
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
    <div className="p-4">
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

            <div className="grid grid-cols-1 gap-6">
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
                              className={`
                                w-full rounded-md 
                                border-gray-300 
                                pl-9 pr-3 py-2 
                                text-sm 
                                focus:border-blue-500 
                                focus:ring-blue-500
                                appearance-none
                                [-webkit-appearance:none]
                                [-moz-appearance:none]
                                [&::-ms-expand]{display:none}
                                [&::-webkit-calendar-picker-indicator]{display:none}
                                [&::-webkit-dropdown-button]{display:none}
                                bg-none
                              `}
                              style={{
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none'
                              }}
                              placeholder="Search owners..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onClick={() => setIsDropdownOpen(true)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg 
                                className="h-4 w-4 text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
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

              {/* Basic Information Fields */}
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  label="Outlet Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Outlet Name"
                  required
                />

                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter Mobile Number"
                  required
                  pattern="[0-9]{10}"
                />

                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email Address"
                />

                <TextInput
                  label="UPI ID"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                  required
                />

                <SelectInput
                  label="Outlet Type"
                  name="outlet_type"
                  value={formData.outlet_type}
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
                  value={formData.veg_nonveg}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'veg', label: 'Veg' },
                    { value: 'nonveg', label: 'Non-Veg' }
                  ]}
                  placeholder="Select Food Type"
                />
              </div>

              <Textarea
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                required
                rows={3}
              />

              <SelectInput
                label="Outlet Mode"
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

            <div className="grid grid-cols-2 gap-6">
              <TextInput
                label="Service Charges (%)"
                name="service_charges"
                type="number"
                value={formData.service_charges}
                onChange={handleInputChange}
                placeholder="Enter Service Charges"
              />

              <TextInput
                label="GST (%)"
                name="gst"
                type="number"
                value={formData.gst}
                onChange={handleInputChange}
                placeholder="Enter GST"
              />

              <TimePickerInput
                label="Opening Time"
                name="opening_time"
                value={formData.opening_time}
                onChange={handleInputChange}
                required
                placeholder="Select opening time"
              />

              <TimePickerInput
                label="Closing Time"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleInputChange}
                required
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

            <div className="grid grid-cols-2 gap-6">
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

export default CreateOutlet;