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
    role: "admin",
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: "",
    pin: false,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [emailApiError, setEmailApiError] = useState("");
  const [mobileApiError, setMobileApiError] = useState("");
  const [pinError, setPinError] = useState("");

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Admins", path: "/admins" },
    { label: "Create Admin", path: "/create-admin" },
  ];

  /** API returns e.g. "ADM_45965 - 400 - Mobile Number already exists" */
  const parseApiErrorMessage = (data) => {
    const raw =
      data?.message ||
      data?.detail ||
      data?.error ||
      (typeof data === "string" ? data : "");
    if (!raw) return "Failed to create admin";
    // Strip "ADM_xxxxx - 400 - " style prefixes for a cleaner UI message
    const cleaned = String(raw).replace(/^[A-Z]+_\d+\s*-\s*\d+\s*-\s*/i, "").trim();
    return cleaned || String(raw);
  };

  const isMobileValid = (mobile) => {
    if (!mobile) return { isValid: false, message: "Mobile number is required" };
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: false,
          mobileMessage: "Mobile number must start with 6, 7, 8, or 9",
        }));
        return;
      }

      setAdminData((prev) => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message,
      }));
      if (mobileApiError) setMobileApiError("");
    } else if (name === "email") {
      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !gmailPattern.test(value)) {
        setEmailApiError("Email format is incorrect.");
      } else {
        setEmailApiError("");
      }
      setAdminData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === "pin") {
      const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 4);
      setAdminData((prev) => ({ ...prev, pin: digitsOnly }));
      setValidationStates((prev) => ({
        ...prev,
        pin: digitsOnly.length === 4,
      }));
      if (pinError) setPinError("");
    } else if (name === "name") {
      const alphaOnly = value.replace(/[^A-Za-z ]/g, "");
      setValidationStates((prev) => ({
        ...prev,
        name: value === alphaOnly,
      }));
      setAdminData((prev) => ({
        ...prev,
        [name]: alphaOnly,
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
      adminData.pin?.trim() &&
      validationStates.name &&
      validationStates.mobile &&
      validationStates.email &&
      validationStates.pin
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    setEmailApiError("");
    setMobileApiError("");
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
            data?.detail || data?.message || "Admin created successfully"
          );
          navigate("/admins");
        },
        onError: (err) => {
          const apiMessage = parseApiErrorMessage(err.response?.data);
          const lower = apiMessage.toLowerCase();

          if (lower.includes("email")) {
            setEmailApiError(apiMessage);
          } else if (
            lower.includes("mobile") ||
            lower.includes("phone") ||
            lower.includes("already exists")
          ) {
            setMobileApiError(apiMessage);
            setValidationStates((prev) => ({
              ...prev,
              mobile: false,
              mobileMessage: apiMessage,
            }));
          }

          toastController.error(apiMessage);
        },
      });
    } catch (error) {
      console.error("Create admin error:", error);
      toastController.error("Failed to create admin");
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800">Create Admin</h1>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${
                  isSubmitting || !isFormValid()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-success-500 hover:bg-success-600"
                }
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form id="createAdminForm" className="space-y-6">
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
                  inputMode="numeric"
                  className={`
                    rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${!validationStates.mobile ? "border-error-500" : "border-gray-300"}
                  `}
                />
                {!validationStates.mobile && validationStates.mobileMessage && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
                {mobileApiError && validationStates.mobile && (
                  <p className="text-error-500 text-sm mt-1">{mobileApiError}</p>
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
                  className="rounded-lg"
                />
                {emailApiError && (
                  <p className="text-error-500 text-sm mt-1">{emailApiError}</p>
                )}
              </div>

              <TextInput
                label="PIN"
                name="pin"
                type="tel"
                value={adminData.pin}
                onChange={handleChange}
                placeholder="Enter 4-digit PIN"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
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
