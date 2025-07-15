import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack, faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../Breadcrumb";
import { TextInput, DateInput, SelectInput } from "../../../forms/FormElements";
import { API_CONFIG } from "../../../../config/appConfig";
import { toastController } from "../../../../utils/toastController";

function EditCaptain() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const {BASE_URL, API_VERSION} = API_CONFIG;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableFunctionalities, setAvailableFunctionalities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [captainData, setCaptainData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    aadhar_number: "",
    dob: "",
    functionality_ids: [],
    role: "captain"
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [outletName, setOutletName] = useState('');
  const nameRegex = /^[A-Za-z ]+$/;
  const [validationStates, setValidationStates] = useState({
    name: true,
    nameMessage: '',
    email: true,
    mobile: true,
    mobileMessage: '',
    aadhar_number: true,
    aadharMessage: '',
    address: true,
    addressMessage: '',
    functionalities: true,
    functionalitiesMessage: ''
  });

  const dropdownRef = useRef(null);

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

  const fetchFunctionalities = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setAvailableFunctionalities(response.data);
    } catch (err) {
      toastController.error("Failed to load functionalities");
      setError("Failed to load functionalities");
    }
  };

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
      toastController.error("Failed to load roles");
      setError("Failed to load roles");
    }
  };

  useEffect(() => {
    Promise.all([fetchCaptainDetails(), fetchFunctionalities(), fetchRoles()]).finally(() => {
      setLoading(false);
    });
  }, [outletId, userId]);

  const fetchCaptainDetails = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/captain_view`,
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      
      const data = response.data.data;
      setCaptainData({
        name: data.name || "",
        mobile: data.mobile || "",
        email: data.email || "",
        address: data.address || "",
        aadhar_number: data.aadhar_number || "",
        dob: data.dob || "",
        functionality_ids: data.functionalities?.map(f => f.functionality_id) || [],
        role: "captain"
      });
      setOutletName(data.outlet_name);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to fetch captain details";
      toastController.error(errorMsg);
      setError(errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let valid = isFormValid();
    if (!captainData.functionality_ids || captainData.functionality_ids.length === 0) {
      setValidationStates(prev => ({ ...prev, functionalities: false, functionalitiesMessage: 'At least one functionality must be selected' }));
      valid = false;
    } else {
      setValidationStates(prev => ({ ...prev, functionalities: true, functionalitiesMessage: '' }));
    }
    if (!valid) {
      toastController.error("Please fill all required fields correctly");
      setSubmitting(false);
      return;
    }

    try {
      await toastController.promise(
        axios.patch(
          `${BASE_URL}/${API_VERSION}/common/captain_update`,
          {
            update_user_id: adminData?.user_id,
            user_id: Number(userId),
            outlet_id: Number(outletId),
            ...captainData,
            app_source: "admin_app"
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Updating captain details...",
          success: "Captain updated successfully",
          error: (err) => err.response?.data?.detail || err.response?.data?.msg || "An error occurred while updating captain"
        }
      );
      navigate(`/captain-details/${outletId}/${userId}`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.msg || "An error occurred while updating captain";
      setError(errorMsg);
      setSubmitting(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      if (!value.trim()) {
        setValidationStates(prev => ({ ...prev, name: false, nameMessage: '' }));
      } else if (!nameRegex.test(value)) {
        setValidationStates(prev => ({ ...prev, name: false, nameMessage: 'Name must contain only alphabets and spaces' }));
      } else {
        setValidationStates(prev => ({ ...prev, name: true, nameMessage: '' }));
      }
      setCaptainData(prev => ({ ...prev, name: value }));
    }
    else if (name === 'mobile') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      // Check first digit - only allow if it's empty or starts with valid digit
      if (numbersOnly.length > 0) {
        const firstDigit = numbersOnly.charAt(0);
        if (['0','1','2','3','4','5'].includes(firstDigit)) {
          setValidationStates(prev => ({
            ...prev,
            mobile: false,
            mobileMessage: 'Mobile number must start with 6, 7, 8, or 9'
          }));
          return; // Don't update the value if first digit is invalid
        }
      }
      
      const trimmedNumber = numbersOnly.slice(0, 10);
      const { isValid, message } = isMobileValid(trimmedNumber);
      setValidationStates(prev => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message
      }));
      setCaptainData(prev => ({ ...prev, mobile: trimmedNumber }));
    } 
    else if (name === 'aadhar_number') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 14);
      const { isValid, message } = isAadharValid(numbersOnly);
      setValidationStates(prev => ({
        ...prev,
        aadhar_number: isValid,
        aadharMessage: message
      }));
      setCaptainData(prev => ({ ...prev, aadhar_number: numbersOnly }));
    }
    else if (name === 'address') {
      setCaptainData(prev => ({ ...prev, address: value }));
    }
    else {
      setCaptainData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const isFormValid = () => {
    return (
      captainData.name?.trim() &&
      nameRegex.test(captainData.name) &&
      captainData.mobile?.trim() && 
      captainData.aadhar_number?.trim() &&
      captainData.aadhar_number.length >= 12 &&
      captainData.functionality_ids && captainData.functionality_ids.length > 0 &&
      validationStates.name &&
      validationStates.mobile &&
      validationStates.aadhar_number &&
      validationStates.email
    );
  };

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Outlets", path: "/outlets" },
    { label: outletName || 'Outlet', path: `/view-outlet/${outletId}` },
    { label: "Captains", path: `/captains/${outletId}` },
    { label: "Captain Details", path: `/captain-details/${outletId}/${userId}` },
    { label: "Edit Captain" },
  ];

  const filteredFunctionalities = availableFunctionalities.filter(func =>
    func.functionality_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
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
            <h1 className="text-xl font-semibold text-gray-800">
              Edit Captain
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${submitting || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-brand-500 hover:bg-brand-600"}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="relative">
              <TextInput
                label="Name"
                name="name"
                value={captainData.name}
                onChange={handleInputChange}
                required
              />
              {!validationStates.name && validationStates.nameMessage && (
                <p className="text-error-500 text-sm mt-1">
                  {validationStates.nameMessage}
                </p>
              )}
            </div>

            <div className="relative">
              <TextInput
                label="Mobile"
                name="mobile"
                value={captainData.mobile}
                onChange={handleInputChange}
                required={true}
                maxLength={10}
                className={`
                  focus:border-brand-500 focus:ring-brand-500
                  ${!validationStates.mobile ? 'border-error-500' : 'border-gray-300'}
                `}
              />
              {!validationStates.mobile && validationStates.mobileMessage && (
                <p className="text-error-500 text-sm mt-1">
                  {validationStates.mobileMessage}
                </p>
              )}
            </div>

            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="Enter Email"
              value={captainData.email}
              onChange={handleInputChange}
            />

            <div className="relative">
              <TextInput
                label="Address"
                name="address"
                placeholder="Enter Address"
                value={captainData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="relative">
              <TextInput
                label="Aadhar Number"
                name="aadhar_number"
                value={captainData.aadhar_number}
                onChange={handleInputChange}
                required={false}
                maxLength={14}
                className={`
                  focus:border-brand-500 focus:ring-brand-500
                  ${!validationStates.aadhar_number ? 'border-error-500' : 'border-gray-300'}
                `}
              />
              {!validationStates.aadhar_number && validationStates.aadharMessage && (
                <p className="text-error-500 text-sm mt-1">
                  {validationStates.aadharMessage}
                </p>
              )}
            </div>

            <DateInput
              label="Date of Birth"
              name="dob"
              value={captainData.dob}
              onChange={handleInputChange}
              required
            />

            <SelectInput
              label="Role"
              name="role"
              value={captainData.role}
              onChange={handleInputChange}
              required
              options={roles.map(role => ({
                value: role.role_name,
                label: role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)
              }))}
              placeholder="Select Role"
            />

            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <span className="text-error-600">*</span> Select Functionalities
              </label>
              
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  {captainData.functionality_ids.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {captainData.functionality_ids.length} Functionality(s) Selected
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-gray-500">Select Functionalities</div>
                  )}
                </div>

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
                        placeholder="Search functionalities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {/* Functionalities List */}
                    <div className="overflow-y-auto">
                      {filteredFunctionalities.map((func) => (
                        <div
                          key={func.functionality_id}
                          className={`
                            p-3 cursor-pointer hover:bg-gray-50
                            ${captainData.functionality_ids.includes(func.functionality_id)
                              ? 'bg-brand-50 border-l-4 border-brand-500' 
                              : 'border-l-4 border-transparent'
                            }
                          `}
                          onClick={() => {
                            const newIds = captainData.functionality_ids.includes(func.functionality_id)
                              ? captainData.functionality_ids.filter(id => id !== func.functionality_id)
                              : [...captainData.functionality_ids, func.functionality_id];
                            
                            setCaptainData(prev => ({
                              ...prev,
                              functionality_ids: newIds
                            }));
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={captainData.functionality_ids.includes(func.functionality_id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                setCaptainData(prev => ({
                                  ...prev,
                                  functionality_ids: e.target.checked
                                    ? [...prev.functionality_ids, func.functionality_id]
                                    : prev.functionality_ids.filter(id => id !== func.functionality_id)
                                }));
                              }}
                              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                            />
                            <div className="font-medium text-gray-900">
                              {func.functionality_name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {!validationStates.functionalities && validationStates.functionalitiesMessage && (
                <p className="text-error-500 text-sm mt-1">
                  {validationStates.functionalitiesMessage}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCaptain;