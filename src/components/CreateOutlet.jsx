import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  SelectInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles,
} from "./forms/FormElements.jsx";
import ImageUploader from "./common/ImageUploader";
import Breadcrumb from "./Breadcrumb";
import { toastController } from "../utils/toastController";
import { API_CONFIG } from "../config/appConfig";
import {
  isValidSocialMediaLinks,
  isMobileValid,
  isWhatsappValid,
} from "../utils/validations";
import CustomSelectInput from "./common/CustomSelectInput";

function formatDateToDDMMMYYYY(dateStr) {
  if (!dateStr) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month, day] = dateStr.split("-");
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function CreateOutlet() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [outletTypes, setOutletTypes] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const [outletData, setOutletData] = useState({
    name: "",
    outlet_type: "",
    fssainumber: "",
    gstnumber: "",
    mobile: "",
    veg_nonveg: "",
    service_charges: "",
    gst: "",
    address: "",
    outlet_mode: "",
    is_open: true,
    outlet_status: true,
    upi_id: "",
    website: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    google_business_link: "",
    google_review: "",
    email: "",
    opening_time: "",
    closing_time: "",
    owner_id: [],
    image: null,
    subscription_id: "",
    subscription_end_date: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationStates, setValidationStates] = useState({
    owner: false,
    name: false,
    mobile: false,
    mobileMessage: "",
    upi: false,
    outlet_type: false,
    food_type: false,
    outlet_mode: false,
    address: false,
    fssainumber: false,
    website: false,
    facebook: false,
    instagram: false,
    google_business_link: false,
    google_review: false,
    whatsapp: false,
    whatsappMessage: "",
  });

  const dropdownRef = useRef(null);

  const [isFormValid, setIsFormValid] = useState(false);

  const [apiErrors, setApiErrors] = useState({
    mobile: "",
    // Add other fields that might have API errors
  });

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    { label: "Create Outlet" },
  ];

  useEffect(() => {
    fetchOutletTypes();
    fetchOwners();
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    checkFormValidity();
  }, [
    outletData.name,
    outletData.mobile,
    outletData.owner_id,
    outletData.upi_id,
    outletData.outlet_type,
    outletData.veg_nonveg,
    outletData.outlet_mode,
    outletData.address,
    outletData.subscription_end_date,
  ]);

  useEffect(() => {
    // Validate mobile number
    if (outletData.mobile) {
      const numbersOnly = outletData.mobile.replace(/[^0-9]/g, "");
      const firstDigit = numbersOnly.charAt(0);

      if (numbersOnly.length !== 10) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: true,
          mobileMessage: "Mobile number must be 10 digits",
        }));
      } else if (["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: true,
          mobileMessage: "Mobile number must start with 6, 7, 8, or 9",
        }));
      } else {
        setValidationStates((prev) => ({
          ...prev,
          mobile: false,
          mobileMessage: "",
        }));
      }
    }
  }, [outletData.mobile]);

  useEffect(() => {
    // Validate name
    if (outletData.name) {
      const isValid = isNameValid(outletData.name);
      setValidationStates((prev) => ({
        ...prev,
        name: !isValid,
      }));
    }
  }, [outletData.name]);

  useEffect(() => {
    // Validate UPI ID
    if (outletData.upi_id) {
      const isValid = isUpiValid(outletData.upi_id);
      setValidationStates((prev) => ({
        ...prev,
        upi: !isValid,
      }));
    }
  }, [outletData.upi_id]);

  useEffect(() => {
    // Validate address
    if (outletData.address) {
      const isValid = isAddressValid(outletData.address);
      setValidationStates((prev) => ({
        ...prev,
        address: !isValid,
      }));
    }
  }, [outletData.address]);

  useEffect(() => {
    // Validate required select inputs
    setValidationStates((prev) => ({
      ...prev,
      outlet_type: !outletData.outlet_type && prev.outlet_type,
      food_type: !outletData.veg_nonveg && prev.food_type,
      outlet_mode: !outletData.outlet_mode && prev.outlet_mode,
    }));
  }, [outletData.outlet_type, outletData.veg_nonveg, outletData.outlet_mode]);

  useEffect(() => {
    // Overall form validation
    const requiredFields = {
      name: isNameValid(outletData.name),
      mobile:
        outletData.mobile.length === 10 && /^[6-9]/.test(outletData.mobile),
      owner: outletData.owner_id.length > 0,
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
      subscription_end_date: outletData.subscription_id
        ? !!outletData.subscription_end_date
        : true,
    };

    // Check if there are any API errors
    const hasApiErrors = Object.values(apiErrors).some((error) => error !== "");

    // Check if all required fields are valid and there are no API errors
    const isValid =
      Object.values(requiredFields).every((field) => field === true) &&
      !hasApiErrors;
    setIsFormValid(isValid);
  }, [outletData, apiErrors, validationStates]);

  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates after unmount
      setOutletData((prev) => ({
        ...prev,
        image: prev.image, // Preserve image state
      }));
    };
  }, []);

  const fetchOutletTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlet_type`,
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
      console.error("Error fetching outlet types:", error);
    }
  };

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/listview_owner/${adminData.user_id}`,
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
      console.error("Error fetching owners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/list_subscriptions`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.data.detail === "Subscription list fetched successfully") {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleImagesChange = (images) => {
    // Don't set to null if no new image is provided
    const base64String = images[0]?.url;
    if (base64String) {
      console.log("Image received:", base64String.substring(0, 50) + "...");
      setOutletData((prev) => ({
        ...prev,
        image: base64String,
      }));
    }
  };

  const handleInputChange = (e) => {
    // Support react-select's { target: { name, value } } and native events
    const name = e.target?.name || e.name;
    const value = e.target?.value ?? e.value;
    const type = e.target?.type;
    const checked = e.target?.checked;

    if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setOutletData((prev) => ({
          ...prev,
          [name]: "",
        }));
        setValidationStates((prev) => ({
          ...prev,
          mobile: true,
          mobileMessage: "Mobile number must start with 6, 7, 8, or 9",
        }));
      } else {
        setOutletData((prev) => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10),
        }));

        if (numbersOnly.length > 0) {
          if (numbersOnly.length !== 10) {
            setValidationStates((prev) => ({
              ...prev,
              mobile: true,
              mobileMessage: "Mobile number must be 10 digits",
            }));
          } else {
            setValidationStates((prev) => ({
              ...prev,
              mobile: false,
              mobileMessage: "",
            }));
          }
        } else {
          setValidationStates((prev) => ({
            ...prev,
            mobile: false,
            mobileMessage: "",
          }));
        }
      }
    } else if (name === "whatsapp") {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setOutletData((prev) => ({
          ...prev,
          [name]: "",
        }));
        setValidationStates((prev) => ({
          ...prev,
          [name]: true,
          [`${name}Message`]: `${
            name === "mobile" ? "Mobile" : "WhatsApp"
          } number must start with 6, 7, 8, or 9`,
        }));
      } else {
        setOutletData((prev) => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10),
        }));

        const { isValid, message } =
          name === "mobile"
            ? isMobileValid(numbersOnly.slice(0, 10))
            : isWhatsappValid(numbersOnly.slice(0, 10));

        setValidationStates((prev) => ({
          ...prev,
          [name]: !isValid,
          [`${name}Message`]: message,
        }));
      }
    } else if (name === "fssainumber") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 14);
      setOutletData((prev) => ({
        ...prev,
        [name]: numbersOnly,
      }));

      setValidationStates((prev) => ({
        ...prev,
        fssainumber: numbersOnly.length > 0 && numbersOnly.length !== 14,
      }));
    } else {
      setOutletData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Check form validity after state updates
    setTimeout(() => checkFormValidity(), 0);
  };

  const isUpiValid = (upi) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upi && upiRegex.test(upi);
  };

  const isAddressValid = (address) => {
    return address && address.length >= 3 && address.length <= 50;
  };

  // GST Number validation function
  const isGSTNumberValid = (gstnumber) => {
    // 15-character alphanumeric (uppercase letters and digits)
    return /^[0-9A-Z]{15}$/.test(gstnumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const currentDate = new Date().toISOString().split("T")[0];

      const payload = {
        owner_ids: outletData.owner_id,
        user_id: adminData.user_id.toString(),
        name: outletData.name,
        mobile: outletData.mobile,
        address: outletData.address,
        outlet_type: outletData.outlet_type,
        outlet_mode: outletData.outlet_mode,
        veg_nonveg: outletData.veg_nonveg,
        upi_id: outletData.upi_id,
        subscription_id: outletData.subscription_id, // <-- added
        subscription_end_date: outletData.subscription_end_date,
      };

      if (outletData.service_charges !== "") {
        payload.service_charges = outletData.service_charges.toString();
      }
      if (outletData.gst !== "") {
        payload.gst = outletData.gst.toString();
      }

      const optionalFields = [
        "fssainumber",
        "gstnumber",
        "whatsapp",
        "facebook",
        "instagram",
        "website",
        "google_business_link",
        "google_review",
      ];

      optionalFields.forEach((field) => {
        if (outletData[field]) {
          payload[field] = outletData[field];
        }
      });

      if (outletData.opening_time) {
        const [timeStr, period] = outletData.opening_time.split(" ");
        const [hours, minutes] = timeStr.split(":");
        payload.opening_time = `${currentDate} ${hours}:${minutes}:00 ${period}`;
      }

      if (outletData.closing_time) {
        const [timeStr, period] = outletData.closing_time.split(" ");
        const [hours, minutes] = timeStr.split(":");
        payload.closing_time = `${currentDate} ${hours}:${minutes}:00 ${period}`;
      }

      if (
        outletData.image &&
        typeof outletData.image === "string" &&
        outletData.image.startsWith("data:")
      ) {
        payload.image = outletData.image;
      }

      console.log("Sending payload:", {
        ...payload,
        image: payload.image ? "base64_string_present" : null,
      });

      const response = await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/common/create_outlet`, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating outlet...",
          success: "Outlet created successfully!",
          error: "Failed to create outlet",
        }
      );

      if (response.data.detail.includes("Outlet created successfully")) {
        // Clear any existing API errors
        setApiErrors({});
        navigate(-1);
      }
    } catch (error) {
      console.error("Error creating outlet:", error);

      // Handle specific API errors without clearing the image
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail;

        if (errorMessage.includes("mobile")) {
          setApiErrors((prev) => ({
            ...prev,
            mobile: errorMessage,
          }));
          setValidationStates((prev) => ({
            ...prev,
            mobile: true,
            mobileMessage: errorMessage,
          }));
        }

        toastController.error(errorMessage);
      } else {
        toastController.error("An unexpected error occurred");
      }
    }
  };

  const filteredOwners = allOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.mobile.includes(searchTerm) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isNameValid = (name) => {
    return name && name.length >= 3 && name.length <= 50;
  };

  const handleFocus = (fieldName) => {
    setValidationStates((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
  };

  const handleOwnerClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setValidationStates((prev) => ({
      ...prev,
      owner: false,
    }));
  };

  const validationRules = {
    name: {
      simple: {
        minLength: 3,
        maxLength: 50,
        patternMessage: "Name must be between 3 and 50 characters",
      },
      complex: {
        pattern: /^[a-zA-Z0-9\s-_]+$/,
        patternMessage:
          "Name can only contain letters, numbers, spaces, hyphens and underscores",
      },
    },
    mobile: {
      pattern: /^[6-9]\d{9}$/,
      patternMessage: "Mobile number must be 10 digits and start with 6-9",
    },
    upi: {
      pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/,
      patternMessage: "Please enter a valid UPI ID (e.g., username@bankname)",
    },
  };

  const customValidators = {
    mobile: (value) => {
      const numbersOnly = value.replace(/[^0-9]/g, "");
      const firstDigit = numbersOnly.charAt(0);

      if (!numbersOnly) {
        return { isValid: false, message: "Mobile number is required" };
      }

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
    },
  };

  // Add this function to check all required fields
  const checkFormValidity = () => {
    const requiredFields = {
      name: isNameValid(outletData.name),
      mobile:
        outletData.mobile.length === 10 && /^[6-9]/.test(outletData.mobile),
      owner: outletData.owner_id.length > 0,
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
      subscription_end_date: outletData.subscription_id
        ? !!outletData.subscription_end_date
        : true,
    };

    // Check if all required fields are valid
    const isValid = Object.values(requiredFields).every(
      (field) => field === true
    );
    setIsFormValid(isValid);
    return isValid;
  };

  const resetForm = () => {
    setOutletData((prev) => ({
      ...prev,
      // Reset other fields but keep the image
      name: "",
      outlet_type: "",
      // ... other fields
      image: prev.image, // Preserve the image
    }));
  };

  const [openingHour, setOpeningHour] = useState("");
  const [openingMinute, setOpeningMinute] = useState("");
  const [openingPeriod, setOpeningPeriod] = useState("AM");
  const [closingHour, setClosingHour] = useState("");
  const [closingMinute, setClosingMinute] = useState("");
  const [closingPeriod, setClosingPeriod] = useState("AM");

  const handleOpeningTimeChange = (type, value) => {
    if (type === "hour") setOpeningHour(value);
    if (type === "minute") setOpeningMinute(value);
    if (type === "period") setOpeningPeriod(value);
    const hour = type === "hour" ? value : openingHour;
    const minute = type === "minute" ? value : openingMinute;
    const period = type === "period" ? value : openingPeriod;
    if (hour && minute && period) {
      setOutletData((prev) => ({
        ...prev,
        opening_time: `${hour}:${minute} ${period}`,
      }));
    }
  };

  const handleClosingTimeChange = (type, value) => {
    if (type === "hour") setClosingHour(value);
    if (type === "minute") setClosingMinute(value);
    if (type === "period") setClosingPeriod(value);
    const hour = type === "hour" ? value : closingHour;
    const minute = type === "minute" ? value : closingMinute;
    const period = type === "period" ? value : closingPeriod;
    if (hour && minute && period) {
      setOutletData((prev) => ({
        ...prev,
        closing_time: `${hour}:${minute} ${period}`,
      }));
    }
  };

  const [tenure, setTenure] = useState("");
  const [calculatedEndDate, setCalculatedEndDate] = useState("");

  // Reset tenure and end date when subscription changes
  useEffect(() => {
    setTenure("");
    setCalculatedEndDate("");
    setOutletData((prev) => ({
      ...prev,
      subscription_end_date: "",
    }));
  }, [outletData.subscription_id]);

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Outlet
            </h1>

            <div className="relative">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 
                  text-sm font-medium text-white rounded-full
                  transition shadow-sm
                  ${
                    !isFormValid || isLoading
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "bg-success-500 hover:bg-success-600"
                  }
                `}
                title={!isFormValid ? "Please fill all required fields" : ""}
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className=" border-b border-gray-200 dark:border-gray-800 pb-5">
            <section className="bg-white rounded-lg shadow ">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Basic Information
              </h2>
              <ImageUploader
                maxImages={1}
                onImagesChange={handleImagesChange}
                existingImages={
                  outletData.image ? [{ url: outletData.image }] : []
                }
                label="Outlet Image"
                className="w-full"
                isOutletImage={true}
                preserveImageOnValidation={true}
              />

              <div className="grid grid-cols-1 gap-6">
                <div className="relative"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  <div className="relative">
                    <TextInput
                      label="Outlet Name"
                      name="name"
                      value={outletData.name}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus("name")}
                      placeholder="Enter Outlet Name"
                      required={true}
                      validationType="simple"
                      validationRules={validationRules.name.simple}
                      className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${
                        validationStates.name
                          ? "border-error-500"
                          : "border-gray-300"
                      }
                    `}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      <span className="text-error-600">*</span> Select Owners
                    </label>

                    <div className="relative" ref={dropdownRef}>
                      <div
                        onClick={handleOwnerClick}
                        className={`
                        w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                        focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                        ${
                          validationStates.owner
                            ? "border-error-500"
                            : "border-gray-300"
                        }
                      `}
                        role="combobox"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="listbox"
                      >
                        {outletData.owner_id.length > 0 ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {outletData.owner_id.length} Owner Selected
                              </div>
                            </div>
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="text-gray-500">Select Owner</div>
                        )}
                      </div>

                      {isDropdownOpen && (
                        <div
                          className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                          style={{
                            position: "absolute",
                            width: "100%",
                            minWidth: "300px",
                            zIndex: 9999,
                            maxHeight: "350px",
                            overflowY: "auto",
                          }}
                        >
                          {outletData.owner_id.length > 0 && (
                            <div className="p-2 border-b bg-gray-50">
                              <div className="flex flex-wrap gap-2">
                                {outletData.owner_id.map((id) => {
                                  const owner = allOwners.find(
                                    (o) => o.user_id === id
                                  );
                                  return owner ? (
                                    <div
                                      key={owner.user_id}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                                    >
                                      <span>{owner.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOutletData((prev) => ({
                                            ...prev,
                                            owner_id: prev.owner_id.filter(
                                              (ownerId) => ownerId !== id
                                            ),
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

                          <div className="sticky top-0 p-2 border-b bg-white">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
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

                          <div className="overflow-y-auto">
                            {filteredOwners.length > 0 ? (
                              filteredOwners.map((owner) => (
                                <div
                                  key={owner.user_id}
                                  className={`
                                  p-3 cursor-pointer hover:bg-gray-50
                                  ${
                                    outletData.owner_id.includes(owner.user_id)
                                      ? "bg-brand-50 border-l-4 border-brand-500"
                                      : "border-l-4 border-transparent"
                                  }
                                `}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={outletData.owner_id.includes(
                                          owner.user_id
                                        )}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setOutletData((prev) => ({
                                            ...prev,
                                            owner_id: e.target.checked
                                              ? [
                                                  ...prev.owner_id,
                                                  owner.user_id,
                                                ]
                                              : prev.owner_id.filter(
                                                  (id) => id !== owner.user_id
                                                ),
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
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-gray-500">
                                {allOwners.length === 0
                                  ? "No owners available"
                                  : `No owners found matching "${searchTerm}"`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <TextInput
                      label="Mobile Number"
                      name="mobile"
                      type="tel"
                      value={outletData.mobile}
                      onChange={handleInputChange}
                      onFocus={() => {
                        handleFocus("mobile");
                        // Clear API error when user starts typing again
                        setApiErrors((prev) => ({ ...prev, mobile: "" }));
                      }}
                      required={true}
                      maxLength={10}
                      placeholder="Enter 10 digit mobile number"
                      className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${
                        validationStates.mobile || apiErrors.mobile
                          ? "border-error-500"
                          : "border-gray-300"
                      }
                    `}
                    />
                    {(validationStates.mobile || apiErrors.mobile) && (
                      <p className="text-error-500 text-sm mt-1">
                        {apiErrors.mobile || validationStates.mobileMessage}
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

                  <div className="relative">
                    <TextInput
                      label="UPI ID"
                      name="upi_id"
                      value={outletData.upi_id}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus("upi")}
                      required={true}
                      validationRules={validationRules.upi}
                      placeholder="username@bankname"
                      className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${
                        validationStates.upi
                          ? "border-error-500"
                          : "border-gray-300"
                      }
                    `}
                    />
                    {validationStates.upi && (
                      <p className="text-error-500 text-sm mt-1">
                        {validationRules.upi.patternMessage}
                      </p>
                    )}
                  </div>

                  <SelectInput
                    label="Outlet Type"
                    name="outlet_type"
                    value={outletData.outlet_type}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("outlet_type")}
                    error={
                      validationStates.outlet_type && !outletData.outlet_type
                    }
                    required
                    options={Object.entries(outletTypes).map(
                      ([key, value]) => ({
                        value: key,
                        label:
                          value.charAt(0).toUpperCase() +
                          value.slice(1).replace(/_/g, " "),
                      })
                    )}
                    placeholder="Select Outlet Type"
                  />

                  <SelectInput
                    label="Food Type"
                    name="veg_nonveg"
                    value={outletData.veg_nonveg}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("food_type")}
                    error={validationStates.food_type && !outletData.veg_nonveg}
                    required
                    options={[
                      { value: "veg", label: "Veg" },
                      { value: "nonveg", label: "Non-Veg" },
                    ]}
                    placeholder="Select Food Type"
                  />

                  <SelectInput
                    label="Outlet Mode"
                    name="outlet_mode"
                    value={outletData.outlet_mode}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("outlet_mode")}
                    error={
                      validationStates.outlet_mode && !outletData.outlet_mode
                    }
                    required
                    options={[
                      { value: "offline", label: "Offline" },
                      { value: "online", label: "Online" },
                    ]}
                    placeholder="Select Outlet Mode"
                  />

                  <div className="sm:col-span-1">
                    <Textarea
                      label="Address"
                      name="address"
                      value={outletData.address}
                      onChange={handleInputChange}
                      onFocus={() => handleFocus("address")}
                      placeholder="Enter Address"
                      required
                      rows={3}
                    />
                    {validationStates.address && (
                      <p className="text-error-500 text-sm mt-1">
                        {!outletData.address
                          ? "Address is required"
                          : outletData.address.length < 5
                          ? "Minimum 5 characters required"
                          : "Address must not exceed 50 characters"}
                      </p>
                    )}
                  </div>

                  <CustomSelectInput
                    label="Subscription Plan"
                    name="subscription_id"
                    value={outletData.subscription_id || ""}
                    onChange={handleInputChange}
                    required
                    options={subscriptions.map((sub) => ({
                      value: sub.subscription_id.toString(),
                      label: `${sub.name} - ₹${sub.price} (${
                        sub.features?.length || 0
                      } features)`,
                    }))}
                    placeholder="Select Subscription Plan"
                  />
                  {outletData.subscription_id && (
                    <div className="relative">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        <span className="text-error-600">*</span> Tenure
                        (Months)
                      </label>
                      <select
                        name="tenure"
                        value={tenure || ""}
                        onChange={(e) => {
                          const months = parseInt(e.target.value, 10);
                          setTenure(e.target.value);
                          if (!months) {
                            setCalculatedEndDate("");
                            setOutletData((prev) => ({
                              ...prev,
                              subscription_end_date: "",
                            }));
                            return;
                          }
                          const today = new Date();
                          // Calculate the target month and year
                          let targetMonth = today.getMonth() + months;
                          let targetYear = today.getFullYear();
                          while (targetMonth > 11) {
                            targetMonth -= 12;
                            targetYear += 1;
                          }
                          // Get the last day of the target month
                          const lastDayOfTargetMonth = new Date(
                            targetYear,
                            targetMonth + 1,
                            0
                          ).getDate();
                          // Use the same day if possible, otherwise use the last day of the month
                          const targetDay = Math.min(
                            today.getDate(),
                            lastDayOfTargetMonth
                          );
                          const endDate = new Date(
                            targetYear,
                            targetMonth,
                            targetDay
                          );
                          if (isNaN(endDate.getTime())) {
                            setCalculatedEndDate("");
                            setOutletData((prev) => ({
                              ...prev,
                              subscription_end_date: "",
                            }));
                            return;
                          }
                          const day = String(endDate.getDate()).padStart(
                            2,
                            "0"
                          );
                          const monthNames = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          const monthIdx = endDate.getMonth();
                          const month = monthNames[monthIdx];
                          const year = endDate.getFullYear();
                          const formatted = `${day} ${month} ${year}`;
                          setCalculatedEndDate(formatted);
                          setOutletData((prev) => ({
                            ...prev,
                            subscription_end_date: formatted,
                          }));
                        }}
                        required
                        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select tenure</option>
                        <option value="1">1 Month</option>
                        <option value="2">2 Months</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                      {/* {calculatedEndDate && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Subscription End Date
                        </label>
                        <input
                          type="text"
                          value={calculatedEndDate}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg shadow-sm bg-gray-100"
                    />
                  </div>
                    )} */}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <section className="bg-white p-2 rounded-lg shadow mt-5">
            <div className=" border-b border-gray-200 dark:border-gray-800 pb-5">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Business Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="relative">
                  <TextInput
                    label="Service Charges (%)"
                    name="service_charges"
                    type="number"
                    value={outletData.service_charges}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("service_charges")}
                    placeholder="Enter Service Charges"
                    className="focus:border-brand-500 focus:ring-brand-500 border-gray-300"
                  />
                </div>

                <TextInput
                  label="FSSAI Number"
                  name="fssainumber"
                  value={outletData.fssainumber}
                  onChange={handleInputChange}
                  maxLength={14}
                  placeholder="Enter FSSAI Number"
                />
                <div className="relative">
                  <TextInput
                    label="GST (%)"
                    name="gst"
                    type="number"
                    value={outletData.gst}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("gst")}
                    placeholder="Enter GST"
                    className="focus:border-brand-500 focus:ring-brand-500 border-gray-300"
                  />
                </div>
                <TextInput
                  label="GST Number"
                  name="gstnumber"
                  value={outletData.gstnumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST Number"
                  maxLength={15}
                />
                {validationStates.gstnumber && (
                  <p className="text-error-500 text-sm mt-1">
                    {!outletData.gstnumber
                      ? "GST Number is required"
                      : !isGSTNumberValid(outletData.gstnumber)
                      ? "GST Number must be a 15-digit alphanumeric code"
                      : ""}
                  </p>
                )}
                {/* Opening Time */}
                <div className="flex flex-row flex-nowrap items-end gap-10 mb-4">
                  {/* Opening Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <div className="flex gap-2">
                      {/* Hour Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        value={openingHour}
                        onChange={(e) =>
                          handleOpeningTimeChange("hour", e.target.value)
                        }
                      >
                        <option value="">HH</option>
                        {[...Array(12)].map((_, i) => {
                          const val = (i + 1).toString().padStart(2, "0");
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                      {/* Minute Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        value={openingMinute}
                        onChange={(e) =>
                          handleOpeningTimeChange("minute", e.target.value)
                        }
                      >
                        <option value="">MM</option>
                        {["00", "15", "30", "45"].map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>
                      {/* AM/PM Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={openingPeriod}
                        onChange={(e) =>
                          handleOpeningTimeChange("period", e.target.value)
                        }
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  {/* Closing Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <div className="flex gap-2">
                      {/* Hour Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        value={closingHour}
                        onChange={(e) =>
                          handleClosingTimeChange("hour", e.target.value)
                        }
                      >
                        <option value="">HH</option>
                        {[...Array(12)].map((_, i) => {
                          const val = (i + 1).toString().padStart(2, "0");
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
                      </select>
                      {/* Minute Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        value={closingMinute}
                        onChange={(e) =>
                          handleClosingTimeChange("minute", e.target.value)
                        }
                      >
                        <option value="">MM</option>
                        {["00", "15", "30", "45"].map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>
                      {/* AM/PM Dropdown */}
                      <select
                        className="w-22 h-11 border border-gray-300 rounded-lg bg-white text-lg text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={closingPeriod}
                        onChange={(e) =>
                          handleClosingTimeChange("period", e.target.value)
                        }
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-2 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Social Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="relative">
                <TextInput
                  label="Website"
                  name="website"
                  type="url"
                  value={outletData.website}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("website")}
                  placeholder="https://example.com"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.website
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.website && (
                  <p className="text-error-500 text-sm mt-1">
                    Please enter a valid website URL starting with http:// or
                    https://
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="WhatsApp Number"
                  name="whatsapp"
                  type="tel"
                  value={outletData.whatsapp}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("whatsapp")}
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.whatsapp
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.whatsapp && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.whatsappMessage}
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Facebook"
                  name="facebook"
                  type="url"
                  value={outletData.facebook}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("facebook")}
                  placeholder="https://facebook.com/yourpage"
                  className={`                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.facebook
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.facebook && (
                  <p className="text-error-500 text-sm mt-1">
                    Please enter a valid Facebook URL
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Instagram"
                  name="instagram"
                  type="url"
                  value={outletData.instagram}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("instagram")}
                  placeholder="https://instagram.com/yourhandle"
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.instagram
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.instagram && (
                  <p className="text-error-500 text-sm mt-1">
                    Please enter a valid Instagram URL
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Google Business Link"
                  name="google_business_link"
                  type="url"
                  value={outletData.google_business_link}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("google_business_link")}
                  placeholder="https://business.google.com/yourpage"
                  className={`                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.google_business_link
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.google_business_link && (
                  <p className="text-error-500 text-sm mt-1">
                    Please enter a valid Google Business URL
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Google Review Link"
                  name="google_review"
                  type="url"
                  value={outletData.google_review}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("google_review")}
                  placeholder="https://g.page/r/yourreviewpage"
                  className={`                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.google_review
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {validationStates.google_review && (
                  <p className="text-error-500 text-sm mt-1">
                    Please enter a valid Google Review URL
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

export default CreateOutlet;
