import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
  SelectInput
} from './forms/FormElements.jsx';
import Breadcrumb from './Breadcrumb';
import { API_CONFIG } from "../config/appConfig";
import MultiSelectDropdown from './common/MultiSelectDropdown';
import { toastController } from '../utils/toastController';

function EditOwner() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [roles, setRoles] = useState([]); // 1. Add roles state
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [originalRole, setOriginalRole] = useState(''); // Add state for original role
  const [staffOutletId, setStaffOutletId] = useState(''); // Add state for staff outlet
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    aadhar_number: '',
    address: '',
    account_type: '',
    is_active: 0,
    functionality_ids: [],
    role: '', // 2. Add role to ownerData
    outlet_ids: [], // Add outlet_ids to ownerData
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: '',
    aadhar_number: true,
    aadharMessage: ''
  });
  const [emailError, setEmailError] = useState("");

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Owners", path: "/owners" },
    { label: "Edit Owner", path: `/edit-owner/${ownerId}` },
  ];

  useEffect(() => {
    if (adminData?.user_id && ownerId) {
      fetchOwnerDetails();
    }
  }, [adminData?.user_id, ownerId]);

  useEffect(() => {
    fetchFunctionalities();
    fetchRoles(); // 3. Fetch roles on mount
    fetchOutlets(); // Add fetchOutlets to initial fetch
  }, []);

  // 4. Fetch roles function (same as EditCaptain.jsx)
  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/roles`,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setRoles(response.data);
    } catch (err) {
      setError('Failed to load roles');
    }
  };

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setFunctionalities(response.data);
    } catch (err) {
      console.error('Error fetching functionalities:', err);
      setError('Failed to load functionalities');
    }
  };

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlets`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const outletArray = Object.entries(response.data.outlet_list).map(([name, id]) => ({
          outlet_name: name,
          outlet_id: id
        }));
        setOutlets(outletArray);
      }
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setError("Failed to load outlets");
    }
  };

  const fetchOwnerDetails = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/view_owner`,
        {
          owner_id: Number(ownerId),
          user_id: adminData.user_id,
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      const funcIds = response.data.functionalities.map(f => f.functionality_id);
      setSelectedFunctionalities(funcIds);

      // Add outlet_ids handling
      const outletIds = response.data.outlets?.map(outlet => outlet.outlet_id) || [];
      setSelectedOutlets(outletIds);
      
      // Store original role
      setOriginalRole(response.data.role || '');

      setOwnerData({
        name: response.data.name,
        email: response.data.email,
        mobile: response.data.mobile,
        dob: response.data.dob,
        aadhar_number: response.data.aadhar_number,
        address: response.data.address,
        account_type: response.data.account_type,
        is_active: response.data.is_active,
        functionality_ids: funcIds,
        role: response.data.role || '',
        outlet_ids: outletIds,
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch owner details');
      console.error('Error fetching owner details:', err);
      setIsLoading(false);
    }
  };

  const isMobileValid = (mobile) => {
    if (!mobile) return { isValid: false, message: 'Mobile number is required' };
    const numbersOnly = mobile.replace(/[^0-9]/g, '');
    const firstDigit = numbersOnly.charAt(0);
    
    if (['0','1','2','3','4','5'].includes(firstDigit)) {
      return { isValid: false, message: 'Mobile number must start with 6, 7, 8, or 9' };
    }
    
    if (numbersOnly.length !== 10) {
      return { isValid: false, message: 'Mobile number must be 10 digits' };
    }
    
    return { isValid: true, message: '' };
  };

  const isAadharValid = (aadhar) => {
    if (!aadhar) return { isValid: false, message: 'Aadhar number is required' };
    const numbersOnly = aadhar.replace(/[^0-9]/g, '');
    if (numbersOnly.length !== 12) {
      return { isValid: false, message: 'Aadhar number must be exactly 12 digits' };
    }
    return { isValid: true, message: '' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'role' && value !== originalRole) {
      toastController.info('When changing role, only one outlet can be assigned as staff outlet');
      setOwnerData(prev => ({
        ...prev,
        role: value
      }));
      return;
    }

    if (name === 'mobile') {
      // Only allow numbers, max 10 digits
      let numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      // Prevent first digit from being 0-5
      if (numbersOnly.length === 1 && ['0','1','2','3','4','5'].includes(numbersOnly.charAt(0))) {
        setValidationStates(prev => ({
          ...prev,
          mobile: false,
          mobileMessage: 'Mobile number must start with 6, 7, 8, or 9'
        }));
        numbersOnly = '';
      } else {
        const { isValid, message } = isMobileValid(numbersOnly);
        setValidationStates(prev => ({
          ...prev,
          mobile: isValid,
          mobileMessage: message
        }));
      }
      setOwnerData(prev => ({ ...prev, [name]: numbersOnly }));
      return;
    } 
    else if (name === 'aadhar_number') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 12);
      const { isValid, message } = isAadharValid(numbersOnly);
      setValidationStates(prev => ({
        ...prev,
        aadhar_number: isValid,
        aadharMessage: message
      }));
      setOwnerData(prev => ({ ...prev, aadhar_number: numbersOnly }));
    } 
    else if (name === 'email') {
      const gmailPattern = /^[a-zA-Z0-9._%+-]+@\.com$/;
      if (value && !gmailPattern.test(value)) {
        setEmailError('Email format is incorrect.');
      } else {
        setEmailError('');
      }
      setOwnerData(prev => ({ ...prev, [name]: value }));
      return;
    } 
    else if (name === 'is_active') {
      setOwnerData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    }
    else {
      setOwnerData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStaffOutletChange = (e) => {
    const value = e.target.value;
    setStaffOutletId(value);
    // Keep selectedOutlets in sync for API payload
    setSelectedOutlets(value ? [Number(value)] : []);
    setOwnerData(prev => ({
      ...prev,
      outlet_ids: value ? [Number(value)] : []
    }));
  };

  const isOwnerRole = ownerData.role === 'owner';

  // Modify isFormValid to remove outlet validation
  const isFormValid = () => {
    // Check if all required fields are filled and valid
    return (
      ownerData.name?.trim() && 
      ownerData.mobile?.trim() && 
      ownerData.aadhar_number?.trim() &&
      ownerData.account_type &&
      ownerData.functionality_ids.length > 0 &&
      ownerData.role && // Keep role validation
      // Remove outlet_ids validation
      validationStates.name &&
      validationStates.mobile &&
      validationStates.aadhar_number
    );
  };

  // Modify handleSubmit to conditionally include role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare outlet data based on role
      let outletData = {};
      if (ownerData.role === 'owner' && ownerData.outlet_ids.length > 0) {
        outletData = { outlet_ids: ownerData.outlet_ids };
      } else if (ownerData.role === 'customer') {
        // Customer role doesn't need any outlet data
        outletData = {};
      } else if (staffOutletId) {
        // Only include staff_outlet_id if it's selected
        outletData = { staff_outlet_id: Number(staffOutletId) };
      }

      // Create base payload
      const basePayload = {
        update_user_id: adminData.user_id,
        user_id: parseInt(ownerId),
        name: ownerData.name,
        mobile: ownerData.mobile,
        address: ownerData.address,
        aadhar_number: ownerData.aadhar_number,
        dob: ownerData.dob,
        email: ownerData.email,
        account_type: ownerData.account_type,
        functionality_ids: ownerData.functionality_ids,
        is_active: Number(ownerData.is_active),
        app_source: "admin",
        ...outletData,
      };

      // Only add role to payload if it has changed
      if (ownerData.role !== originalRole) {
        basePayload.role = ownerData.role;
      }

      const response = await axios.patch(
        `${BASE_URL}/${API_VERSION}/common/update_owner`,
        basePayload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.detail === "Owner updated successfully") {
        // Handle navigation based on role
        const roleNavigationMap = {
          // Staff roles that require outlet_id
          captain: `/captain-details/${staffOutletId}/${ownerId}`,
          waiter: `/waiter-details/${staffOutletId}/${ownerId}`,
          chef: `/chef-details/${staffOutletId}/${ownerId}`,
          manager: `/manager-details/${staffOutletId}/${ownerId}`,
          
          // Roles with their own details pages
          owner: -1, // Navigate back for owner role
          partner: `/partner-details/${ownerId}`,
          customer: `/customer-details/${ownerId}`,
        };

        const navigationPath = roleNavigationMap[ownerData.role];
        
        if (navigationPath === -1) {
          navigate(-1);
        } else if (navigationPath) {
          navigate(navigationPath);
        } else {
          // If role not found in map, show warning and navigate to home
          toastController.warning(`No specific view found for role: ${ownerData.role}`);
          navigate('/home');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update owner');
      console.error('Error updating owner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutletChange = (newOutletIds) => {
    setSelectedOutlets(newOutletIds);
    setOwnerData(prev => ({
      ...prev,
      outlet_ids: newOutletIds
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              Edit Owner
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${isLoading || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-success-500 hover:bg-success-600"}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={ownerData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <div className="relative">
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={ownerData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  maxLength={10}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${!validationStates.mobile ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {!validationStates.mobile && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={ownerData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    border-gray-300
                  `}
                />
                {emailError && (
                  <p className="text-error-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <DateInput
                label="Date of Birth"
                name="dob"
                value={ownerData.dob}
                onChange={handleChange}
                placeholder="Select date of birth"
                className={`
                  focus:border-brand-500 focus:ring-brand-500
                  border-gray-300
                `}
              />

              <div className="relative">
                <TextInput
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={ownerData.aadhar_number}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhar number"
                  required
                  maxLength={12}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${!validationStates.aadhar_number ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {!validationStates.aadhar_number && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.aadharMessage}
                  </p>
                )}
              </div>

              {/* Owner Status - Added to the grid */}
              <SelectInput
                label="Owner Status"
                name="is_active"
                value={ownerData.is_active}
                onChange={handleChange}
                required
                options={[
                  { value: 1, label: 'Active' },
                  { value: 0, label: 'Inactive' }
                ]}
                placeholder="Select Status"
              />

              {/* Account Type - Modified for live/test options */}
              <SelectInput
                label="Account Type"
                name="account_type"
                value={ownerData.account_type}
                onChange={handleChange}
                required
                options={[
                  { value: 'live', label: 'Live' },
                  { value: 'test', label: 'Test' }
                ]}
                placeholder="Select Account Type"
              />

              {/* Role - Added to the grid */}
              <SelectInput
                label="Role"
                name="role"
                value={ownerData.role}
                onChange={handleChange}
                required
                options={roles.map(role => ({
                  value: role.role_name,
                  label: role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)
                }))}
                placeholder="Select Role"
              />
              
            </div>

            {/* Address and Outlets Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Address */}
              <div className="sm:col-span-1 xl:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  value={ownerData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows={3}
                />
                {validationStates.address && (
                  <p className="text-error-500 text-sm -mt-1">
                    {!ownerData.address
                      ? ""
                      : ownerData.address.length < 5
                      ? "Minimum 5 characters required"
                      : "Address must not exceed 50 characters"}
                  </p>
                )}
              </div>

              {/* Outlets Selection based on role */}
              <div className="sm:col-span-1 xl:col-span-2 flex flex-col">
                {isOwnerRole ? (
                  /* Multi-select dropdown for owner role */
                  <MultiSelectDropdown
                    label="Select Outlets"
                    options={outlets}
                    selectedValues={selectedOutlets}
                    onChange={handleOutletChange}
                    displayKey="outlet_name"
                    valueKey="outlet_id"
                    searchKeys={['outlet_name']}
                    // Remove required={true}
                    placeholder="Select outlets"
                    searchPlaceholder="Search outlets..."
                  />
                ) : (
                  /* Single-select dropdown for staff roles */
                  <SelectInput
                    label="Select Staff Outlet"
                    name="staff_outlet"
                    value={staffOutletId}
                    onChange={handleStaffOutletChange}
                    // Remove required={true}
                    options={outlets.map(outlet => ({
                      value: outlet.outlet_id.toString(),
                      label: outlet.outlet_name
                    }))}
                    placeholder="Select single outlet"
                  />
                )}
              </div>
            </div>

            {/* Functionalities */}
            <div>
              <label className={labelStyles}>
                <span className="text-error-600 text-red-500 mr-1">*</span>
                Functionalities
              </label>
              <div className="mt-2 rounded-lg p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  {functionalities.map((func) => (
                    <div key={func.functionality_id} className="min-w-[200px] flex-1">
                      <Checkbox
                        label={func.functionality_name}
                        value={func.functionality_id}
                        checked={selectedFunctionalities.includes(func.functionality_id)}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setSelectedFunctionalities(prev =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter(id => id !== value)
                          );
                          setOwnerData(prev => ({
                            ...prev,
                            functionality_ids: e.target.checked
                              ? [...prev.functionality_ids, value]
                              : prev.functionality_ids.filter(id => id !== value)
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Functionalities Tags */}
              {/* {selectedFunctionalities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFunctionalities.map(id => {
                    const func = functionalities.find(f => f.functionality_id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {func?.functionality_name}
                        <button
                          type="button"
                          className="ml-1 inline-flex items-center justify-center"
                          onClick={() => {
                            setSelectedFunctionalities(prev => prev.filter(fid => fid !== id));
                            setOwnerData(prev => ({
                              ...prev,
                              functionality_ids: prev.functionality_ids.filter(fid => fid !== id)
                            }));
                          }}
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )} */}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error-500 text-sm mt-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default EditOwner;