import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useAdmin } from "../hooks/useAdmin";
import { queryKeys } from "../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPlus,
  faTimes,
  faLayerGroup,
  faCog,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles,
} from "./forms/FormElements.jsx";
import { YES_NO_OPTIONS } from "../utils/validationPatterns";
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
import CustomDropdown from "./common/CustomDropdown";
import MultiSelectDropdown from "./common/MultiSelectDropdown";
import SingleSelectDropdown from "./common/SingleSelectDropdown";

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
  const queryClient = useQueryClient();
  const [outletTypes, setOutletTypes] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscriptions removed
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Subscription plan fields for Assign Subscription
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [tenureMonths, setTenureMonths] = useState(null);
  const ALLOWED_TENURES = [1, 3, 6, 12, 18, 24];

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
    feature_ids: [],
    action_ids: [],
    has_combo: 0,
    has_denomination: 0,
    reserve_table: 0,
    company_id: "",
  });

  const [validationStates, setValidationStates] = useState({
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

  const [isFormValid, setIsFormValid] = useState(false);

  const [apiErrors, setApiErrors] = useState({
    mobile: "",
    // Add other fields that might have API errors
  });

  // Modules for Assign Subscription
  const [modules, setModules] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    { label: "Create Outlet" },
  ];

  useEffect(() => {
    fetchOutletTypes();
    fetchOwners();
    fetchCompanies();
    // fetch modules for subscription assign
    (async () => {
      try {
        setLoadingModules(true);
        const token = getToken();
        const resp = await axios.get(
          `${BASE_URL}/admin/get_modules`,
          {
            headers: { Authorization: token },
          }
        );
        const modList = Array.isArray(resp.data)
          ? resp.data
          : resp.data?.data || [];
        setModules(modList);
        // Select all modules by default when creating an outlet
        if (modList.length > 0) {
          setSelectedModuleIds(modList.map((m) => m.module_id));
        }
      } catch (err) {

      } finally {
        setLoadingModules(false);
      }
    })();
  }, []);



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
    outletData.has_combo,
    outletData.has_denomination,
    outletData.reserve_table,
    outletData.company_id,
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
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
      company_id: !!outletData.company_id,
      subscription_end_date:
        outletData.subscription_id && outletData.subscription_id !== ""
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
        `${BASE_URL}/common/get_list/outlet_type`,
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
        `${BASE_URL}/common/listview_owner/${adminData.user_id}`,
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

    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/list_companies`,
        {
          user_id: 440
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract companies from the response
      const companies = response.data.companies || [];
      
      if (Array.isArray(companies)) {
        setAllCompanies(companies);
      }
    } catch (error) {

    }
  };

  // fetchSubscriptions removed

  const handleImagesChange = (images) => {
    // Don't set to null if no new image is provided
    const base64String = images[0]?.url;
    if (base64String) {

      setOutletData((prev) => ({
        ...prev,
        image: base64String,
      }));
    }
  };

  const handleModuleToggle = (moduleId) => {
    setSelectedModuleIds((prev) => {
      const exists = prev.includes(moduleId);
      if (exists) return prev.filter((id) => id !== moduleId);
      return [...prev, moduleId];
    });
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
          [`${name}Message`]: `${name === "mobile" ? "Mobile" : "WhatsApp"
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

      // Require at least one module selected
      if (!Array.isArray(selectedModuleIds) || selectedModuleIds.length === 0) {
        toastController.error(
          "Please select at least one module for subscription"
        );
        return;
      }

      // Require plan fields
      if (!planName || planName.trim().length === 0) {
        toastController.error("Please enter plan name");
        return;
      }
      if (!planPrice || isNaN(Number(planPrice)) || Number(planPrice) <= 0) {
        toastController.error("Please enter a valid price");
        return;
      }
      if (!tenureMonths || !ALLOWED_TENURES.includes(Number(tenureMonths))) {
        toastController.error("Please select a valid tenure");
        return;
      }

      const payload = {
        // Only include owner_ids if at least one owner is selected
        ...(outletData.owner_id.length > 0
          ? { owner_ids: outletData.owner_id }
          : {}),
        user_id: parseInt(adminData.user_id),
        name: outletData.name,
        mobile: outletData.mobile,
        address: outletData.address,
        outlet_type: outletData.outlet_type,
        outlet_mode: outletData.outlet_mode,
        veg_nonveg: outletData.veg_nonveg,
        upi_id: outletData.upi_id,
        has_combo: outletData.has_combo,
        has_denomination: outletData.has_denomination,
        reserve_table: outletData.reserve_table,
        company_id: parseInt(outletData.company_id),
      };

      // Attach selected module ids as subscription assignment
      payload.module_ids = selectedModuleIds.map((id) => Number(id));

      // Attach subscription plan details
      payload.subscription = {
        name: planName,
        price: Number(planPrice),
        tenure_months: Number(tenureMonths),
      };

      // Also include selected module ids inside subscription object for backend compatibility
      if (Array.isArray(selectedModuleIds) && selectedModuleIds.length > 0) {
        payload.subscription.module_ids = selectedModuleIds.map((id) =>
          Number(id)
        );
      }

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
        payload.opening_time = `${hours}:${minutes}:00 ${period}`;
      }

      if (outletData.closing_time) {
        const [timeStr, period] = outletData.closing_time.split(" ");
        const [hours, minutes] = timeStr.split(":");
        payload.closing_time = `${hours}:${minutes}:00 ${period}`;
      }

      if (
        outletData.image &&
        typeof outletData.image === "string" &&
        outletData.image.startsWith("data:")
      ) {
        payload.image = outletData.image;
      }

      // Subscription creation removed: the server will handle subscription
      // assignment when `subscription` object is provided in the outlet payload.
      // We keep the `payload.subscription` object but DO NOT call
      // the `admin/create_subscription` API from the client.
      // However the backend still validates for legacy top-level subscription
      // fields (`subscription_name`, `subscription_price`, `subscription_tenure`),
      // so include them for backward compatibility.
      const formatTenure = (months) => {
        if (!months) return "";
        if (months % 12 === 0)
          return `${months / 12} year${months / 12 > 1 ? "s" : ""}`;
        return `${months} months`;
      };

      if (planName) payload.subscription_name = planName;
      if (planPrice !== "" && planPrice != null)
        payload.subscription_price = Number(planPrice);
      payload.subscription_description = planName || "";
      if (tenureMonths)
        payload.subscription_tenure = formatTenure(Number(tenureMonths));
      // Keep app_source for compatibility with older endpoints
      payload.app_source = "admin_app";




      const response = await toastController.promise(
        axios.post(`${BASE_URL}/common/create_outlet`, payload, {
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
        // Invalidate outlets cache to refresh the list
        queryClient.invalidateQueries({ queryKey: queryKeys.outlets.all });
        navigate(-1);
      }
    } catch (error) {


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

  const isNameValid = (name) => {
    return name && name.length >= 3 && name.length <= 50;
  };

  const handleFocus = (fieldName) => {
    setValidationStates((prev) => ({
      ...prev,
      [fieldName]: false,
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
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
      company_id: !!outletData.company_id,
      // Subscription validation: if subscription_id exists, subscription_end_date should exist
      subscription_end_date:
        outletData.subscription_id && outletData.subscription_id !== ""
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

  // Subscription popup removed

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

            <div className="flex items-center gap-3">
              {/* Subscription button removed */}

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 
                  text-sm font-medium text-white rounded-full
                  transition shadow-sm
                  ${!isFormValid || isLoading
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
          {/* Outlet Image Section - Moved to Top */}
          <div className="mb-8">
            <section className="bg-white rounded-lg shadow p-6">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Outlet Image
              </h2>
              <ImageUploader
                maxImages={1}
                onImagesChange={handleImagesChange}
                existingImages={
                  outletData.image ? [{ url: outletData.image }] : []
                }
                label="Upload Outlet Image"
                className="w-full"
                isOutletImage={true}
                preserveImageOnValidation={true}
              />
            </section>
          </div>

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
                      rounded-lg focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.name
                          ? "border-error-500"
                          : "border-gray-300"
                        }
                    `}
                    />
                  </div>
                  <div className="flex flex-col">
                    <MultiSelectDropdown
                      label="Select Owners"
                      options={allOwners}
                      selectedValues={outletData.owner_id}
                      onChange={(newOwnerIds) => {
                        setOutletData((prev) => ({
                          ...prev,
                          owner_id: newOwnerIds,
                        }));
                      }}
                      displayKey="name"
                      valueKey="user_id"
                      searchKeys={["name", "mobile", "email"]}
                      placeholder="Select owners"
                      searchPlaceholder="Search by name, mobile or email..."
                      className="rounded-lg"
                    />
                  </div>

                  <div className="flex flex-col">
                    <SingleSelectDropdown
                      label="Select Company"
                      options={allCompanies}
                      selectedValue={outletData.company_id}
                      onChange={(companyId) => {
                        setOutletData((prev) => ({
                          ...prev,
                          company_id: companyId,
                        }));
                      }}
                      displayKey="company_name"
                      valueKey="company_id"
                      searchKeys={["company_name", "company_code"]}
                      placeholder="Select company"
                      searchPlaceholder="Search by company name or code..."
                      className="rounded-lg"
                      required={true}
                    />
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
                      rounded-lg focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.mobile || apiErrors.mobile
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
                    className="rounded-lg"
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
                      rounded-lg focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.upi
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

                  <CustomDropdown
                    label="Outlet Type"
                    name="outlet_type"
                    value={outletData.outlet_type}
                    onChange={handleInputChange}
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

                  <CustomDropdown
                    label="Food Type"
                    name="veg_nonveg"
                    value={outletData.veg_nonveg}
                    onChange={handleInputChange}
                    error={validationStates.food_type && !outletData.veg_nonveg}
                    required
                    options={[
                      { value: "veg", label: "Veg" },
                      { value: "nonveg", label: "Non-Veg" },
                    ]}
                    placeholder="Select Food Type"
                  />

                  <CustomDropdown
                    label="Outlet Mode"
                    name="outlet_mode"
                    value={outletData.outlet_mode}
                    onChange={handleInputChange}
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
                      maxLength={50}
                      className="rounded-lg"
                    />
                    {validationStates.address && (
                      <p className="text-error-500 text-sm mt-1">
                        {!outletData.address
                          ? "Address is required"
                          : outletData.address.length < 3
                            ? "Minimum 3 characters required"
                            : "Address must not exceed 50 characters"}
                      </p>
                    )}
                  </div>
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
                    className="focus:border-brand-500 rounded-lg focus:ring-brand-500 border-gray-300"
                  />
                </div>

                <TextInput
                  label="FSSAI Number"
                  name="fssainumber"
                  value={outletData.fssainumber}
                  onChange={handleInputChange}
                  maxLength={14}
                  placeholder="Enter FSSAI Number"
                  className="rounded-lg"
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
                    className="rounded-lg focus:border-brand-500 focus:ring-brand-500 border-gray-300"
                  />
                </div>
                <TextInput
                  label="GST Number"
                  name="gstnumber"
                  value={outletData.gstnumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST Number"
                  maxLength={15}
                  className="rounded-lg"
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
                      <CustomDropdown
                        className="w-22"
                        value={openingHour}
                        onChange={(e) =>
                          handleOpeningTimeChange("hour", e.target.value)
                        }
                        options={[
                          { value: "", label: "HH" },
                          ...[...Array(12)].map((_, i) => {
                            const val = (i + 1).toString().padStart(2, "0");
                            return { value: val, label: val };
                          })
                        ]}
                        placeholder="HH"
                      />
                      {/* Minute Dropdown */}
                      <CustomDropdown
                        className="w-22"
                        value={openingMinute}
                        onChange={(e) =>
                          handleOpeningTimeChange("minute", e.target.value)
                        }
                        options={[
                          { value: "", label: "MM" },
                          ...["00", "15", "30", "45"].map((min) => ({
                            value: min,
                            label: min
                          }))
                        ]}
                        placeholder="MM"
                      />
                      {/* AM/PM Dropdown */}
                      <CustomDropdown
                        className="w-22"
                        value={openingPeriod}
                        onChange={(e) =>
                          handleOpeningTimeChange("period", e.target.value)
                        }
                        options={[
                          { value: "AM", label: "AM" },
                          { value: "PM", label: "PM" }
                        ]}
                        placeholder="AM/PM"
                      />
                    </div>
                  </div>
                  {/* Closing Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <div className="flex gap-2">
                      {/* Hour Dropdown */}
                      <CustomDropdown
                        className="w-22"
                        value={closingHour}
                        onChange={(e) =>
                          handleClosingTimeChange("hour", e.target.value)
                        }
                        options={[
                          { value: "", label: "HH" },
                          ...[...Array(12)].map((_, i) => {
                            const val = (i + 1).toString().padStart(2, "0");
                            return { value: val, label: val };
                          })
                        ]}
                        placeholder="HH"
                      />
                      {/* Minute Dropdown */}
                      <CustomDropdown
                        className="w-22"
                        value={closingMinute}
                        onChange={(e) =>
                          handleClosingTimeChange("minute", e.target.value)
                        }
                        options={[
                          { value: "", label: "MM" },
                          ...["00", "15", "30", "45"].map((min) => ({
                            value: min,
                            label: min
                          }))
                        ]}
                        placeholder="MM"
                      />
                      {/* AM/PM Dropdown */}
                      <CustomDropdown
                        className="w-22"
                        value={closingPeriod}
                        onChange={(e) =>
                          handleClosingTimeChange("period", e.target.value)
                        }
                        options={[
                          { value: "AM", label: "AM" },
                          { value: "PM", label: "PM" }
                        ]}
                        placeholder="AM/PM"
                      />
                    </div>
                  </div>
                  {/* New boolean dropdowns: combo, denomination, reserve_table */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Has Combo
                    </label>
                    <CustomDropdown
                      name="has_combo"
                      className="w-22"
                      value={
                        outletData.has_combo === null ||
                          outletData.has_combo === undefined
                          ? ""
                          : String(outletData.has_combo)
                      }
                      onChange={(e) =>
                        setOutletData((prev) => ({
                          ...prev,
                          has_combo: Number(e.target.value),
                        }))
                      }
                      options={[
                        { value: "", label: "Select" },
                        ...YES_NO_OPTIONS.map((opt) => ({
                          value: String(opt.value),
                          label: opt.label
                        }))
                      ]}
                      placeholder="Select"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Has Denomination
                    </label>
                    <CustomDropdown
                      name="has_denomination"
                      className="w-22"
                      value={
                        outletData.has_denomination === null ||
                          outletData.has_denomination === undefined
                          ? ""
                          : String(outletData.has_denomination)
                      }
                      onChange={(e) =>
                        setOutletData((prev) => ({
                          ...prev,
                          has_denomination: Number(e.target.value),
                        }))
                      }
                      options={[
                        { value: "", label: "Select" },
                        ...YES_NO_OPTIONS.map((opt) => ({
                          value: String(opt.value),
                          label: opt.label
                        }))
                      ]}
                      placeholder="Select"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reserve Table
                    </label>
                    <CustomDropdown
                      name="reserve_table"
                      className="w-22"
                      value={
                        outletData.reserve_table === null ||
                          outletData.reserve_table === undefined
                          ? ""
                          : String(outletData.reserve_table)
                      }
                      onChange={(e) =>
                        setOutletData((prev) => ({
                          ...prev,
                          reserve_table: Number(e.target.value),
                        }))
                      }
                      options={[
                        { value: "", label: "Select" },
                        ...YES_NO_OPTIONS.map((opt) => ({
                          value: String(opt.value),
                          label: opt.label
                        }))
                      ]}
                      placeholder="Select"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Assign Subscription Section (moved below Business Details) */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className=" border-b border-gray-200 dark:border-gray-800 pb-5">
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 mr-2" />
                Assign Subscription{" "}

              </h2>
              {/* Plan fields - first row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Plan Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter plan name"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tenure (months) <span className="text-error-500">*</span>
                  </label>
                  <CustomDropdown
                    value={tenureMonths || ""}
                    onChange={(e) =>
                      setTenureMonths(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="mt-1 block w-full"
                    options={[
                      { value: "", label: "Select months" },
                      ...ALLOWED_TENURES.map((m) => ({
                        value: m,
                        label: `${m} month${m > 1 ? "s" : ""}`
                      }))
                    ]}
                    placeholder="Select months"
                  />
                </div>
              </div>

              {/* Modules row - next row */}
              {loadingModules ? (
                <div className="text-sm text-gray-500">Loading modules...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Modules
                    </h3>
                    <span className="text-error-500 ml-2">*</span>
                    <label className="inline-flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={
                          modules.length > 0 &&
                          selectedModuleIds.length === modules.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModuleIds(
                              modules.map((m) => m.module_id)
                            );
                          } else {
                            setSelectedModuleIds([]);
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded-lg mr-2"
                      />
                      Check All
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {modules.map((m) => {
                      const checked = selectedModuleIds.includes(m.module_id);
                      return (
                        <div
                          key={m.module_id}
                          onClick={() => handleModuleToggle(m.module_id)}
                          className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer select-none transition-all duration-200 ease-in-out ${checked
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleModuleToggle(m.module_id)}
                              onClick={(e) => e.stopPropagation()}
                              className="form-checkbox h-4 w-4 mt-0.5 text-blue-600 border-gray-300 rounded-lg"
                            />
                            <span className="text-xs font-medium uppercase text-gray-800">
                              {m.name?.split("_").join(" ")}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
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
                    rounded-lg focus:border-brand-500  focus:ring-brand-500
                    ${validationStates.website
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
                    rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.whatsapp
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
                  className={`rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.facebook
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
                    rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.instagram
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
                  className={`rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.google_business_link
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
                  className={`rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.google_review
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

      {/* Subscription popup removed */}
    </>
  );
}

export default CreateOutlet;