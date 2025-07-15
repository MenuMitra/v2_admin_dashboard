import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { TextInput } from "../forms/FormElements";
import { API_CONFIG } from "../../config/appConfig";
import axios from "axios";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../utils/toastController";

const { BASE_URL, API_VERSION } = API_CONFIG;

function CreateAdmin() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: '',
    password: true,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [emailApiError, setEmailApiError] = useState("");

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Admins", path: "/admins" },
    { label: "Create Admin", path: "/create-admin" },
  ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobile') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);
      
      if (firstDigit && ['0','1','2','3','4','5'].includes(firstDigit)) {
        setValidationStates(prev => ({
          ...prev,
          mobile: false,
          mobileMessage: 'Mobile number must start with 6, 7, 8, or 9'
        }));
        return;
      }

      setAdminData(prev => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates(prev => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message
      }));
    } else if (name === 'email') {
      // Gmail validation
      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !gmailPattern.test(value)) {
        setEmailApiError('Email format is incorrect.');
      } else {
        setEmailApiError('');
      }
      setAdminData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    } else if (name === 'name') {
      // Only allow alphabets and spaces
      const alphaOnly = value.replace(/[^A-Za-z ]/g, '');
      if (value !== alphaOnly) {
        setValidationStates(prev => ({
          ...prev,
          name: false,
        }));
      } else {
        setValidationStates(prev => ({
          ...prev,
          name: true,
        }));
      }
      setAdminData(prev => ({
        ...prev,
        [name]: alphaOnly
      }));
      return;
    } else {
      setAdminData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleValidation = (field) => (isValid) => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  const isFormValid = () => {
    return (
      adminData.name?.trim() && 
      adminData.mobile?.trim() && 
      adminData.email?.trim() &&
      adminData.password?.trim() &&
      validationStates.name &&
      validationStates.mobile &&
      validationStates.email &&
      validationStates.password
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    setEmailApiError("");
    
    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/create_admin`,
          adminData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Creating admin...",
          success: "Admin created successfully",
          error: (err) => {
            if (err.response?.data?.detail === "Email format is incorrect") {
              setEmailApiError("Email format is incorrect");
            }
            return err.response?.data?.detail || "Failed to create admin";
          }
        }
      );

      if (!emailApiError) {
        navigate("/admins");
      }
    } catch (error) {
      if (error.response?.data?.detail === "Email format is incorrect") {
        setEmailApiError("Email format is incorrect");
      }
      console.error("Error creating admin:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
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

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800">
              Create New Admin
            </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${isSubmitting || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-success-500 hover:bg-success-600"}
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="p-6">
          <form id="createAdminForm" className="space-y-6">
            {/* Form fields container with responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="relative">
                <TextInput
                  label="Name"
                  name="name"
                  value={adminData.name}
                  onChange={handleChange}
                  placeholder="Enter admin name"
                  required
                  validationType="name"
                  onValidation={handleValidation("name")}
                  isSubmitAttempted={isSubmitAttempted}
                />
                {!validationStates.name && (
                  <p className="text-error-500 text-sm mt-1">
                    Only alphabets and spaces are allowed in the name.
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={adminData.mobile}
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
                  label="Email"
                  name="email"
                  type="email"
                  value={adminData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  validationType="email"
                  onValidation={handleValidation("email")}
                  isSubmitAttempted={isSubmitAttempted}
                />
                {emailApiError && (
                  <p className="text-error-500 text-sm mt-1">{emailApiError}</p>
                )}
              </div>

              <TextInput
                label="Password"
                name="password"
                type="password"
                value={adminData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                validationType="password"
                onValidation={handleValidation("password")}
                isSubmitAttempted={isSubmitAttempted}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateAdmin;
