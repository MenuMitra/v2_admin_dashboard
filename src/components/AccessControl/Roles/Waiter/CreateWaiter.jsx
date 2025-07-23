import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../../../utils/toastController";
import { API_CONFIG } from "../../../../config/appConfig";
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
} from "../../../forms/FormElements";
import Breadcrumb from "../../../Breadcrumb";

function CreateWaiter() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const outletName = location.state?.outletName || "Outlet";
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [waiterData, setWaiterData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    aadhar_number: "",
    address: "",
    functionality_ids: [],
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    nameMessage: "",
    email: true,
    mobile: true,
    mobileMessage: "",
    aadhar_number: true,
    aadharMessage: "",
    address: true,
    addressMessage: "",
    functionalities: true,
    functionalitiesMessage: "",
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const nameRegex = /^[A-Za-z ]+$/;

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Outlets", path: "/outlets" },
    { label: outletName, path: `/view-outlet/${outletId}` },
    { label: "Waiters", path: `/waiters/${outletId}` },
    { label: "Create Waiter" },
  ];

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        toastController.error("No authentication token available");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      setFunctionalities(
        Array.isArray(response.data.functionalities)
          ? response.data.functionalities
          : []
      );
      // Do NOT check all checkboxes by default
      setSelectedFunctionalities([]);
      setWaiterData((prev) => ({
        ...prev,
        functionality_ids: [],
      }));
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg || "Failed to load functionalities";
      setError(errorMsg);
      toastController.error(errorMsg);
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      if (!value.trim()) {
        setValidationStates((prev) => ({
          ...prev,
          name: false,
          nameMessage: "",
        }));
      } else if (!nameRegex.test(value)) {
        setValidationStates((prev) => ({
          ...prev,
          name: false,
          nameMessage: "Name must contain only alphabets and spaces",
        }));
      } else {
        setValidationStates((prev) => ({
          ...prev,
          name: true,
          nameMessage: "",
        }));
      }
      setWaiterData((prev) => ({ ...prev, name: value }));
    } else if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      if (numbersOnly.length > 0) {
        const firstDigit = numbersOnly.charAt(0);
        if (["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
          setValidationStates((prev) => ({
            ...prev,
            mobile: false,
            mobileMessage: "Mobile number must start with 6, 7, 8, or 9",
          }));
          return;
        }
      }
      const trimmedNumber = numbersOnly.slice(0, 10);
      const { isValid, message } = isMobileValid(trimmedNumber);
      setValidationStates((prev) => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message,
      }));
      setWaiterData((prev) => ({ ...prev, mobile: trimmedNumber }));
    } else if (name === "aadhar_number") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 14);
      if (!numbersOnly) {
        setValidationStates((prev) => ({
          ...prev,
          aadhar_number: false,
          aadharMessage: "Aadhar number is required",
        }));
      } else if (numbersOnly.length < 12) {
        setValidationStates((prev) => ({
          ...prev,
          aadhar_number: false,
          aadharMessage: "Aadhar number must be at least 12 digits",
        }));
      } else if (numbersOnly.length > 14) {
        setValidationStates((prev) => ({
          ...prev,
          aadhar_number: false,
          aadharMessage: "Aadhar number cannot exceed 14 digits",
        }));
      } else {
        setValidationStates((prev) => ({
          ...prev,
          aadhar_number: true,
          aadharMessage: "",
        }));
      }
      setWaiterData((prev) => ({ ...prev, aadhar_number: numbersOnly }));
    } else if (name === "address") {
      if (value && value.trim().length > 0 && value.trim().length < 5) {
        setValidationStates((prev) => ({
          ...prev,
          address: false,
          addressMessage: "Address must be at least 5 characters",
        }));
      } else {
        setValidationStates((prev) => ({
          ...prev,
          address: true,
          addressMessage: "",
        }));
      }
      setWaiterData((prev) => ({ ...prev, address: value }));
    } else {
      setWaiterData((prev) => ({
        ...prev,
        [name]: value,
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
      waiterData.name?.trim() &&
      nameRegex.test(waiterData.name) &&
      waiterData.mobile?.trim() &&
      waiterData.aadhar_number?.trim() &&
      waiterData.aadhar_number.length >= 12 &&
      selectedFunctionalities.length > 0 &&
      validationStates.name &&
      validationStates.mobile &&
      validationStates.aadhar_number &&
      validationStates.address &&
      validationStates.email
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    let valid = isFormValid();
    if (selectedFunctionalities.length === 0) {
      setValidationStates((prev) => ({
        ...prev,
        functionalities: false,
        functionalitiesMessage: "At least one functionality must be selected",
      }));
      valid = false;
    } else {
      setValidationStates((prev) => ({
        ...prev,
        functionalities: true,
        functionalitiesMessage: "",
      }));
    }
    if (!valid) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    const token = getToken();
    if (!token) {
      toastController.error("No authentication token available");
      return;
    }

    setIsLoading(true);

    // Format dob to "DD MMM YYYY" if present
    let formattedDob = waiterData.dob;
    if (waiterData.dob) {
      const dateObj = new Date(waiterData.dob);
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = dateObj.toLocaleString("en-US", { month: "short" });
        const year = dateObj.getFullYear();
        formattedDob = `${day} ${month} ${year}`;
      }
    }

    try {
      const payload = {
        user_id: adminData.user_id,
        outlet_id: Number(outletId),
        name: waiterData.name,
        mobile: waiterData.mobile,
        email: waiterData.email,
        address: waiterData.address,
        aadhar_number: waiterData.aadhar_number,
        dob: formattedDob, // <-- use formatted dob here
        functionality_ids: waiterData.functionality_ids,
        app_source: "admin_app",
      };

      await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/common/waiter_create`, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating waiter...",
          success: "Waiter created successfully!",
          error: (err) =>
            err.response?.data?.detail ||
            err.response?.data?.msg ||
            "Failed to create waiter",
        }
      );

      navigate(-1);
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (isLoading && !waiterData.name) {
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
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Waiter
            </h1>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={waiterData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                validationType="name"
                onValidation={() => {}}
                isSubmitAttempted={isSubmitAttempted}
              />
              {!validationStates.name && validationStates.nameMessage && (
                <p className="text-error-500 text-sm mt-1">
                  {validationStates.nameMessage}
                </p>
              )}

              <div className="relative">
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={waiterData.mobile}
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
                {!validationStates.mobile && validationStates.mobileMessage && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
              </div>

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={waiterData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                validationType="email"
                onValidation={handleValidation("email")}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={waiterData.dob}
                onChange={handleChange}
                placeholder="Select date of birth"
              />

              <div className="relative">
                <TextInput
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={waiterData.aadhar_number}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhar number"
                  required
                  maxLength={14}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      !validationStates.aadhar_number
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {!validationStates.aadhar_number &&
                  validationStates.aadharMessage && (
                    <p className="text-error-500 text-sm mt-1">
                      {validationStates.aadharMessage}
                    </p>
                  )}
              </div>
              <div className="sm:col-span-1">
                <Textarea
                  label="Address"
                  name="address"
                  value={waiterData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows={3}
                />
                {!validationStates.address &&
                  validationStates.addressMessage && (
                    <p className="text-error-500 text-sm mt-1">
                      {validationStates.addressMessage}
                    </p>
                  )}
              </div>
            </div>

            {/* Functionalities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelStyles}>Functionalities</label>
                {/* Check All Checkbox */}
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      functionalities.length > 0 &&
                      selectedFunctionalities.length === functionalities.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = functionalities.map(
                          (f) => f.functionality_id
                        );
                        setSelectedFunctionalities(allIds);
                        setWaiterData((prev) => ({
                          ...prev,
                          functionality_ids: allIds,
                        }));
                      } else {
                        setSelectedFunctionalities([]);
                        setWaiterData((prev) => ({
                          ...prev,
                          functionality_ids: [],
                        }));
                      }
                    }}
                  />
                  Check All
                </label>
              </div>
              <div className="mt-2 rounded-lg p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  {functionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="min-w-[200px] flex-1"
                    >
                      <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
                        <span>{func.functionality_name}</span>
                        <Checkbox
                          label=""
                          value={func.functionality_id}
                          checked={selectedFunctionalities.includes(
                            func.functionality_id
                          )}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setSelectedFunctionalities((prev) =>
                              e.target.checked
                                ? [...prev, value]
                                : prev.filter((id) => id !== value)
                            );
                            setWaiterData((prev) => ({
                              ...prev,
                              functionality_ids: e.target.checked
                                ? [...prev.functionality_ids, value]
                                : prev.functionality_ids.filter(
                                    (id) => id !== value
                                  ),
                            }));
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                {!validationStates.functionalities &&
                  validationStates.functionalitiesMessage && (
                    <p className="text-error-500 text-sm mt-1">
                      {validationStates.functionalitiesMessage}
                    </p>
                  )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateWaiter;
