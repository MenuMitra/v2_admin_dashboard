import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../utils/toastController";
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
  SelectInput,
} from "./forms/FormElements.jsx";
import Breadcrumb from "./Breadcrumb";
import { API_CONFIG } from "../config/appConfig";
import MultiSelectDropdown from './common/MultiSelectDropdown';

function CreateOwner() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);

  const [ownerData, setOwnerData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    aadhar_number: "",
    address: "",
    outlet_ids: [], // Add outlet_ids
    account_type: "live", // Default to live
    is_active: 1, // Default to active
  });

  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: "",
    aadhar_number: true,
    aadharMessage: "",
    address: true,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  // Add Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Owners", path: "/owners" },
    { label: "Create Owner", path: "/create-owner" },
  ];

  useEffect(() => {
    fetchFunctionalities();
    fetchOutlets(); // Add fetchOutlets
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
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
      const errorMsg =
        err.response?.data?.detail || "Failed to load functionalities";
      setError(errorMsg);
      toastController.error(errorMsg);
    }
  };

  // Add fetchOutlets function
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

  // Add handleOutletChange function
  const handleOutletChange = (newOutletIds) => {
    setSelectedOutlets(newOutletIds);
    setOwnerData(prev => ({
      ...prev,
      outlet_ids: newOutletIds
    }));
  };

  const isMobileValid = (mobile) => {
    if (!mobile)
      return { isValid: false, message: "Mobile number is required" };
    const numbersOnly = mobile.replace(/[^0-9]/g, "");
    const firstDigit = numbersOnly.charAt(0);

    if (["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
      return {
        isValid: false,
        message: "Mobile number must start with 6, 7, 8, or 9",
      };
    }

    if (numbersOnly.length !== 10) {
      return { isValid: false, message: "Mobile number must be 10 digits" };
    }

    return { isValid: true, message: "" };
  };

  const isAadharValid = (aadhar) => {
    if (!aadhar)
      return { isValid: false, message: "Aadhar number is required" };
    const numbersOnly = aadhar.replace(/[^0-9]/g, "");
    if (numbersOnly.length !== 12) {
      return {
        isValid: false,
        message: "Aadhar number must be exactly 12 digits",
      };
    }
    return { isValid: true, message: "" };
  };

  // Update address validation function to only allow alphabets and spaces
  const isAddressValid = (address) => {
    // Only allow letters and spaces
    const alphabetOnly = /^[A-Za-z\s]+$/.test(address);
    return (
      address && address.length >= 5 && address.length <= 50 && alphabetOnly
    );
  };

  // Update handleChange to include address validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "address") {
      // Filter out numbers and special characters, only allow letters and spaces
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));

      // Real-time address validation - only check length since we filter characters
      if (filteredValue && filteredValue.length < 5) {
        setValidationStates((prev) => ({ ...prev, [name]: true }));
      } else {
        setValidationStates((prev) => ({ ...prev, [name]: false }));
      }
    } else if (name === "name") {
      // Allow only alphabets and spaces
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));

      // Validate name
      if (!filteredValue.trim()) {
        setValidationStates(prev => ({
          ...prev,
          nameMessage: "Name is required"
        }));
      } else if (filteredValue.length < 2) {
        setValidationStates(prev => ({
          ...prev,
          nameMessage: "Minimum 2 characters required"
        }));
      } else {
        setValidationStates(prev => ({
          ...prev,
          nameMessage: ""
        }));
      }
      return;
    } else if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: false,
          mobileMessage: "Number must start with 6, 7, 8, or 9",
        }));
        return;
      } else if (name === "name") {
        // Allow only alphabets and spaces
        const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
        setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));

        // Mark as invalid if too short or empty
        let errorMsg = "";
        if (value !== filteredValue) {
          errorMsg = "Only alphabets and spaces are allowed.";
          setValidationStates((prev) => ({
            ...prev,
            [name]: true,
            [`${name}Message`]: errorMsg,
          }));
          // Show error for 1 second
          if (nameErrorTimeout.current) clearTimeout(nameErrorTimeout.current);
          nameErrorTimeout.current = setTimeout(() => {
            setValidationStates((prev) => ({
              ...prev,
              [name]: false,
              [`${name}Message`]: "",
            }));
          }, 1000);
        } else if (filteredValue.length > 0 && filteredValue.length < 2) {
          errorMsg = "Minimum 2 characters required.";
          setValidationStates((prev) => ({
            ...prev,
            [name]: true,
            [`${name}Message`]: errorMsg,
          }));
        } else {
          setValidationStates((prev) => ({
            ...prev,
            [name]: false,
            [`${name}Message`]: "",
          }));
        }
        return;
      }

      setOwnerData((prev) => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message,
      }));
    } else if (name === "aadhar_number") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 12);
      const { isValid, message } = isAadharValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        aadhar_number: isValid,
        aadharMessage: message,
      }));
      setOwnerData((prev) => ({ ...prev, aadhar_number: numbersOnly }));
    } else {
      setOwnerData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleValidation = (field) => (isValid) => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  // Modify isFormValid to include outlet validation
  const isFormValid = () => {
    return (
      ownerData.name?.trim() &&
      ownerData.mobile?.trim() &&
      ownerData.aadhar_number?.trim() &&
      ownerData.outlet_ids.length > 0 && // Add outlet validation
      !validationStates.nameMessage &&
      validationStates.mobile &&
      validationStates.aadhar_number
    );
  };

  // Modify handleSubmit to include outlet_ids
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Format date as DD MMM YYYY
      const formattedDate = ownerData.dob ? new Date(ownerData.dob).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : '';

      const payload = {
        user_id: adminData.user_id,
        name: ownerData.name,
        mobile: ownerData.mobile,
        email: ownerData.email,
        address: ownerData.address,
        aadhar_number: ownerData.aadhar_number,
        dob: formattedDate,
        outlet_ids: ownerData.outlet_ids, // Add outlet_ids to payload
        account_type: ownerData.account_type,
        is_active: ownerData.is_active,
        app_source: "admin",
      };

      await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/common/create_owner`, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating owner...",
          success: "Owner created successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to create owner",
        }
      );

      navigate(-1);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create owner";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !ownerData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Add Breadcrumb here */}
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
              Create Owner
            </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${
                  isLoading || !isFormValid()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-success-500 hover:bg-success-600"
                }
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
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
                validationType="name"
                onValidation={handleValidation("name")}
                isSubmitAttempted={isSubmitAttempted}
              />
              {validationStates.name && validationStates.nameMessage && (
                <p className="text-error-500 text-sm -mt-1">
                  {validationStates.nameMessage}
                </p>
              )}

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
                    ${
                      !validationStates.mobile
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {!validationStates.mobile && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
              </div>

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={ownerData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                validationType="email"
                onValidation={handleValidation("email")}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={ownerData.dob}
                onChange={handleChange}
                placeholder="Select Date of birth"
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
                    ${
                      !validationStates.aadhar_number
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {!validationStates.aadhar_number && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.aadharMessage}
                  </p>
                )}
              </div>
               {/* Address */}
           
              <div className="sm:col-span-1">
                <Textarea
                  label="Address"
                  name="address"
                  value={ownerData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
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
              <div className="sm:col-span-1">
                {/*Outlets Section */}
            

{/* Outlets Dropdown */}
<div className="sm:col-span-1 xl:col-span-2 flex flex-col">
  <MultiSelectDropdown
    label="Select Outlets"
    options={outlets}
    selectedValues={selectedOutlets}
    onChange={handleOutletChange}
    displayKey="outlet_name"
    valueKey="outlet_id"
    searchKeys={['outlet_name']}
    required={true}
    placeholder="Select outlets"
    searchPlaceholder="Search outlets..."
  />
</div>
</div>
              </div>
           
            

            {/* Add Account Type */}
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

            {/* Add Owner Status */}
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

              

            {/* Error Message */}
            {error && (
              <div className="text-error-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateOwner;
