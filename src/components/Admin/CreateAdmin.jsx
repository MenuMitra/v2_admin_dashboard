import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { TextInput } from "../forms/FormElements";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../utils/toastController";
import { useAdmins } from "../../lib/react-query/hooks/useAdmins";
import { validatePin } from "../../utils/validationPatterns";

function CreateAdmin() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { createAdmin, isCreating: isSubmitting } = useAdmins(getToken());
  const [adminData, setAdminData] = useState({
    name: "",
    mobile: "",
    email: "",
    pin: "",
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: '',
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [emailApiError, setEmailApiError] = useState("");
  const [pinError, setPinError] = useState("");

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

    if (['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
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

      if (firstDigit && ['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
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
    } else if (name === 'pin') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
      setAdminData(prev => ({ ...prev, pin: numbersOnly }));
      if (pinError) setPinError('');
      return;
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
      validationStates.name &&
      validationStates.mobile &&
      validationStates.email
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    setEmailApiError("");
    setPinError("");

    const pinValidation = validatePin(adminData.pin, { required: true });
    if (!pinValidation.isValid) {
      setPinError(pinValidation.message);
      toastController.error(pinValidation.message);
      return;
    }

    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }
    try {
      const payload = {
        name: adminData.name.trim(),
        mobile: adminData.mobile.trim(),
        email: adminData.email.trim(),
        pin: adminData.pin,
      };

      createAdmin(payload, {
        onSuccess: (data) => {
          toastController.success(
            data?.detail || "Admin created successfully"
          );
          navigate("/admins");
        },
        onError: (err) => {
          if (err.response?.data?.detail === "Email format is incorrect") {
            setEmailApiError("Email format is incorrect");
          }
          toastController.error(err.response?.data?.detail || "Failed to create admin");
        }
      });
    } catch (error) {
      console.error("Create admin error:", error);
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
              Create Admin
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
                  className="rounded-lg"
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
                    rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${!validationStates.mobile ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
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
                  className="rounded-lg"
                />
                {emailApiError && (
                  <p className="text-error-500 text-sm mt-1">{emailApiError}</p>
                )}
              </div>

              <TextInput
                label="PIN"
                name="pin"
                type="password"
                value={adminData.pin}
                onChange={handleChange}
                placeholder="4-digit PIN"
                required
                maxLength={4}
                autoComplete="new-password"
                inputMode="numeric"
                validateOnChange={false}
                isSubmitAttempted={isSubmitAttempted}
                error={!!pinError}
                errorMessage={pinError}
                className="rounded-lg"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateAdmin;
