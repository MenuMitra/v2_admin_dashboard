import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/react-query/queryKeys";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSave,
  faTimes,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  SelectInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles,
} from "./forms/FormElements.jsx";
import Breadcrumb from "./Breadcrumb";
import ImageUploader from "./common/ImageUploader";
import { API_CONFIG } from "../config/appConfig";
import { YES_NO_OPTIONS } from "../utils/validationPatterns";
import { isMobileValid, isWhatsappValid } from "../utils/validations";
import { toastController } from "../utils/toastController";
import CustomSelectInput from "./common/CustomSelectInput";

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { outletId } = useParams();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [outletData, setOutletData] = useState({
    outlet_id: "",
    user_id: "",
    owner_ids: [],
    name: "",
    outlet_type: "",
    fssainumber: "",
    gstnumber: "",
    mobile: "",
    veg_nonveg: "",
    service_charges: "",
    gst: "",
    address: "",
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
    outlet_mode: "",
    image: null,
    subscription_id: "",
    subscription_details: null,
    has_combo: 0,
    has_denomination: 0,
    reserve_table: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [vegOrNonveg, setVegOrNonveg] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  // Modules for Assign Subscription edit
  const [modules, setModules] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  // Plan fields for Assign Subscription (edit)
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [tenureMonths, setTenureMonths] = useState(null);
  const ALLOWED_TENURES = [1, 3, 6, 12, 18, 24];
  const [searchTerm, setSearchTerm] = useState("");
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
    whatsapp: false,
    whatsappMessage: "",
  });
  const [originalOwnerIds, setOriginalOwnerIds] = useState([]);

  // Subscription-related state removed per request

  // Subscription popup removed; no subscription-specific effects

  // Add essential validation helper functions
  const isNameValid = (name) => name?.length >= 3 && name?.length <= 50;
  const isUpiValid = (upi) => /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upi);
  // Address validation function (relaxed for edit view: accept any non-empty value)
  const isAddressValid = (address) => {
    const len = address ? address.trim().length : 0;
    return len >= 1 && len <= 200;
  };

  // Add at the top of the component:
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

  // Fetch outlet data when component mounts
  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchOutletTypes();
      fetchVegOrNonveg();
      fetchOwners();
      fetchOutletData();
      // fetch modules for subscription edit
      (async () => {
        try {
          setLoadingModules(true);
          const token = getToken();
          const resp = await axios.get(
            `${BASE_URL}/admin/get_modules`,
            { headers: { Authorization: token } }
          );
          setModules(
            Array.isArray(resp.data) ? resp.data : resp.data?.data || []
          );
        } catch (err) {
          
        } finally {
          setLoadingModules(false);
        }
      })();
    }
  }, [adminData?.user_id, outletId]);

  const fetchOutletData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/common/view_outlet`,
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet details") {
        const data = response.data.data;

        // The API may return subscription info either in `data.subscription_details`,
        // `data.subscription`, or at the top-level `response.data.subscription` (created during outlet creation).
        const respSubscription =
          response.data.subscription ||
          data.subscription ||
          data.subscription_details ||
          null;

        // Ensure subscription_id is a string or null
        const subscriptionId = respSubscription?.subscription_id
          ? String(respSubscription.subscription_id)
          : data.subscription_id
          ? String(data.subscription_id)
          : null;

        const initialOwnerIds = data.owners?.map((owner) => owner.owner_id) || [];
        setOutletData({
          outlet_id: outletId,
          user_id: adminData?.user_id,
          owner_ids: initialOwnerIds,
          name: data.name || "",
          outlet_type: data.outlet_type || "",
          fssainumber:
            data.fssainumber === "None" ? "" : data.fssainumber || "",
          gstnumber: data.gstnumber || "",
          mobile: data.mobile || "",
          veg_nonveg: data.veg_nonveg || "",
          service_charges: data.service_charges || "",
          gst: data.gst || "",
          address: (data.address || "").trim(),
          is_open: data.is_open === 1,
          outlet_status: data.outlet_status === 1,
          upi_id: data.upi_id || "",
          website: data.website || "",
          whatsapp: data.whatsapp?.replace(/\D/g, "") || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          google_business_link: data.google_business_link || "",
          google_review: data.google_review || "",
          email: data.email || "",
          opening_time: data.opening_time || "",
          closing_time: data.closing_time || "",
          outlet_mode: data.outlet_mode || "",
          image: data.image || null,
          subscription_id: subscriptionId,
          subscription_end_date:
            respSubscription?.subscription_end_date ||
            data.subscription_details?.subscription_end_date ||
            "",
          subscription_details:
            respSubscription || data.subscription_details || null,
          has_combo: data.has_combo !== undefined ? data.has_combo : null,
          has_denomination: data.has_denomination !== undefined ? data.has_denomination : null,
          reserve_table: data.has_reserve_table !== undefined ? data.has_reserve_table : (data.reserve_table !== undefined ? data.reserve_table : null),
        });
        setOriginalOwnerIds(initialOwnerIds);

        // Set time picker values
        if (data.opening_time) {
          // Expecting formats like "HH:MM:SS AM" or "HH:MM AM" or "HH:MM:SS"
          const m = String(data.opening_time).match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
          );
          if (m) {
            const [, h, min, per] = m;
            setOpeningHour(h.padStart(2, "0"));
            setOpeningMinute(min);
            setOpeningPeriod((per || "AM").toUpperCase());
          }
        }
        if (data.closing_time) {
          const m2 = String(data.closing_time).match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
          );
          if (m2) {
            const [, h2, min2, per2] = m2;
            setClosingHour(h2.padStart(2, "0"));
            setClosingMinute(min2);
            setClosingPeriod((per2 || "AM").toUpperCase());
          }
        }

        // Populate selected modules for edit view (if present in response)
        const collectedModuleIds = [];
        if (Array.isArray(data.subscription_details?.modules)) {
          collectedModuleIds.push(
            ...data.subscription_details.modules.map((m) => m.module_id)
          );
        } else if (Array.isArray(data.modules)) {
          collectedModuleIds.push(...data.modules.map((m) => m.module_id));
        }
        if (collectedModuleIds.length > 0)
          setSelectedModuleIds(collectedModuleIds);

        // Prefill plan fields from subscription_details when available
        try {
          const sub = data.subscription_details || data.subscription || null;
          if (sub) {
            const name =
              sub.subscription_name || sub.name || sub.subscription_name;
            const price = sub.subscription_price ?? sub.price ?? null;
            setPlanName(name || "");
            setPlanPrice(
              price !== undefined && price !== null ? String(price) : ""
            );
            // parse tenure - could be months (number) or string like "1 year"
            const parseTenure = (t) => {
              if (!t && t !== 0) return null;
              if (typeof t === "number") return t;
              if (!isNaN(Number(t))) return Number(t);
              if (typeof t === "string") {
                const lower = t.toLowerCase();
                const m = lower.match(/(\d+)\s*month/);
                if (m) return Number(m[1]);
                const y = lower.match(/(\d+)\s*year/);
                if (y) return Number(y[1]) * 12;
              }
              return null;
            };
            const tenureVal = parseTenure(
              sub.tenure || sub.tenure_months || sub.tenure_months
            );
            if (tenureVal) setTenureMonths(tenureVal);
          }
        } catch (err) {
          // ignore
        }

        setIsLoading(false);
      }
    } catch (error) {
      
      toastController.error("Failed to fetch outlet data");
      navigate(-1);
    }
  };

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

  const fetchVegOrNonveg = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/common/get_list/veg_or_nonveg`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.veg_or_nonveg_list) {
        setVegOrNonveg(response.data.veg_or_nonveg_list);
      }
    } catch (error) {
      
    }
  };

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.get(
        `${BASE_URL}/common/listview_owner/${adminData.user_id}`,
        { headers: { Authorization: token } }
      );

      if (Array.isArray(response.data)) {
        setAllOwners(response.data);
      }
    } catch (error) {
      
    }
  };

  const handleModuleToggle = (moduleId) => {
    setSelectedModuleIds((prev) => {
      const exists = prev.includes(moduleId);
      if (exists) return prev.filter((id) => id !== moduleId);
      return [...prev, moduleId];
    });
  };

  // Subscription popup and related handlers removed

  const filteredOwners = allOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.mobile.includes(searchTerm) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    { label: "Edit Outlet" },
  ];

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "mobile" || name === "whatsapp") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          [name]: true,
          [`${name}Message`]: `Number must start with 6, 7, 8, or 9`,
        }));
        return;
      }

      setOutletData((prev) => ({ ...prev, [name]: numbersOnly }));
      setValidationStates((prev) => ({
        ...prev,
        [name]: numbersOnly.length !== 10,
        [`${name}Message`]:
          numbersOnly.length !== 10 ? "Must be 10 digits" : "",
      }));
    } else if (name === "address") {
      setOutletData((prev) => ({ ...prev, [name]: value }));

      // Real-time address validation
      if (value && value.length < 5) {
        setValidationStates((prev) => ({ ...prev, [name]: true }));
      } else {
        setValidationStates((prev) => ({ ...prev, [name]: false }));
      }
    } else {
      setOutletData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setValidationStates((prev) => ({
      ...prev,
      [fieldName]: false,
      [`${fieldName}Message`]: "",
    }));
  };

  // Add this helper function at the top of the file:
  function to12HourTime(hour, minute, period) {
    return `${hour}:${minute}:00 ${period}`;
  }

  // Helper to format date as 'DD MMM YYYY'
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation check
    const requiredFields = {
      name: isNameValid(outletData.name),
      mobile:
        outletData.mobile?.length === 10 && /^[6-9]/.test(outletData.mobile),
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
    };

    // Log validation results for debugging
    

    const fieldsValid = Object.entries(requiredFields).every(
      ([, value]) => value
    );

    if (!fieldsValid) {
      // Show specific validation errors
      const failedFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([field]) => field);

      
      toastController.error(
        `Please fix the following fields: ${failedFields.join(", ")}`
      );
      return;
    }

    // Require subscription plan and modules before updating
    if (!Array.isArray(selectedModuleIds) || selectedModuleIds.length === 0) {
      toastController.error(
        "Please select at least one module for subscription"
      );
      return;
    }
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

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Prepare image in server-expected format (pure base64 without data URI)
      let imagePayload = outletData.image || null;
      if (imagePayload) {
        if (
          typeof imagePayload === "string" &&
          imagePayload.startsWith("data:image/")
        ) {
          const commaIdx = imagePayload.indexOf(",");
          imagePayload =
            commaIdx !== -1 ? imagePayload.slice(commaIdx + 1) : imagePayload;
        } else if (/^https?:\/\//i.test(imagePayload)) {
          // Existing URL; avoid sending as base64 to prevent server error
          imagePayload = "";
        }
      }
      // If image is null/undefined, send empty string as per API expectation
      if (imagePayload == null) imagePayload = "";

      // Determine owner additions/removals relative to original owner set
      const currentOwnerIds = Array.isArray(outletData.owner_ids)
        ? outletData.owner_ids
        : [];
      const removedOwnerIds = originalOwnerIds.filter(
        (id) => !currentOwnerIds.includes(id)
      );
      const addedOwnerIds = currentOwnerIds.filter(
        (id) => !originalOwnerIds.includes(id)
      );

      // Prepare API data with new_owner_ids and remove_owner_ids
      const apiData = {
        outlet_id: parseInt(outletId),
        user_id: parseInt(adminData.user_id),
        new_owner_ids: addedOwnerIds,
        remove_owner_ids: removedOwnerIds,
        name: outletData.name,
        outlet_type: outletData.outlet_type,
        fssainumber: outletData.fssainumber || "",
        gstnumber: outletData.gstnumber || "",
        mobile: outletData.mobile,
        veg_nonveg: outletData.veg_nonveg,
        service_charges: outletData.service_charges
          ? outletData.service_charges.toString()
          : "0",
        gst: outletData.gst ? outletData.gst.toString() : "0",
        address: outletData.address,
        is_open: outletData.is_open ? 1 : 0,
        outlet_status: outletData.outlet_status ? 1 : 0,
        upi_id: outletData.upi_id,
        website: outletData.website || "",
        whatsapp: outletData.whatsapp || "",
        facebook: outletData.facebook || "",
        instagram: outletData.instagram || "",
        google_business_link: outletData.google_business_link || "",
        google_review: outletData.google_review || "",
        outlet_mode: outletData.outlet_mode,
        image: imagePayload,
        has_combo: outletData.has_combo,
        has_denomination: outletData.has_denomination,
        has_reserve_table: outletData.reserve_table,
        // subscription_id may be present in outletData or in the cached/view response
        subscription_id: outletData.subscription_id
          ? parseInt(outletData.subscription_id)
          : null,
        subscription_end_date: outletData.subscription_end_date || null,
        app_source: "admin_app",
      };

      // When constructing the payload for saving, format opening_time and closing_time as 'HH:mm:00 AM/PM'
      if (openingHour && openingMinute && openingPeriod) {
        apiData.opening_time = `${openingHour}:${openingMinute}:00 ${openingPeriod}`;
      }
      if (closingHour && closingMinute && closingPeriod) {
        apiData.closing_time = `${closingHour}:${closingMinute}:00 ${closingPeriod}`;
      }

      // Log the API payload for debugging
      

      // Ensure we include any subscription id available from the cached outlet detail
      // (the view_outlet response may contain the subscription object created during create_outlet)
      try {
        const cached = queryClient.getQueryData(
          queryKeys.outlets.detail(outletId)
        );
        const cachedSubscription =
          cached?.subscription ||
          cached?.data?.subscription ||
          cached?.data?.subscription_details ||
          null;
        const cachedSubscriptionId =
          cachedSubscription?.subscription_id ||
          cached?.data?.subscription_id ||
          null;
        if (!apiData.subscription_id && cachedSubscriptionId) {
          apiData.subscription_id = parseInt(cachedSubscriptionId);
        }
      } catch (err) {
        // ignore cache errors
      }

      // Include subscription payload: module ids + subscription details
      apiData.module_ids = selectedModuleIds.map((id) => Number(id));
      apiData.subscription = {
        name: planName,
        price: Number(planPrice),
        tenure_months: Number(tenureMonths),
      };

      // Remove client-side subscription update: backend will handle creating
      // or updating subscriptions when `subscription` or legacy top-level
      // subscription fields are present. For backward compatibility include
      // legacy top-level fields expected by the API.
      const formatTenure = (months) => {
        if (!months) return "";
        if (months % 12 === 0)
          return `${months / 12} year${months / 12 > 1 ? "s" : ""}`;
        return `${months} months`;
      };

      if (planName) apiData.subscription_name = planName;
      if (planPrice !== "" && planPrice != null)
        apiData.subscription_price = Number(planPrice);
      apiData.subscription_description = planName || "";
      if (tenureMonths)
        apiData.subscription_tenure = formatTenure(Number(tenureMonths));
      // Preserve any caller-provided app_source (e.g., 'pos_app') else default
      apiData.app_source = outletData.app_source || "admin_app";

      const response = await axios.patch(
        `${BASE_URL}/common/update_outlet`,
        apiData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Treat any 2xx response as success; backend may return different 'detail' text.
      if (response.status >= 200 && response.status < 300) {
        const successMessage =
          response.data?.detail ||
          response.data?.message ||
          "Outlet updated successfully";
        toastController.success(successMessage);
        try {
          queryClient.invalidateQueries(queryKeys.outlets.detail(outletId));
          queryClient.invalidateQueries(queryKeys.outlets.all);
        } catch (err) {
          
        }
        navigate(`/view-outlet/${outletId}`);
      } else {
        const msg =
          response.data?.detail ||
          response.data?.message ||
          "Failed to update outlet";
        toastController.error(msg);
      }
    } catch (error) {
      

      // Show more detailed error message
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update outlet";
      toastController.error(errorMessage);
    }
  };

  return (
    <>
      {/* Add Breadcrumb */}
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
              Edit Outlet
            </h1>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-brand-500 hover:bg-brand-600 
                transition shadow-sm
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              >
                <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow">
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

            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 gap-6">
              {/* Select Owner and Image Upload in same grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Select Owner */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Select Owner(s)
                  </label>

                  <div className="relative">
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      role="combobox"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      {outletData.owner_ids.length > 0 ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {outletData.owner_ids.length} Owner(s) Selected
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
                        <div className="text-gray-500">Select Owner(s)</div>
                      )}
                    </div>

                    {/* Selected Owners Display */}
                    {outletData.owner_ids.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {outletData.owner_ids.map((id) => {
                          const owner = allOwners.find((o) => o.user_id === id);
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
                                    owner_ids: prev.owner_ids.filter(
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
                    )}

                    {/* Dropdown Panel */}
                    {isDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 w-full min-w-[300px] max-h-[350px] overflow-y-auto"
                      >
                        {/* Search Bar */}
                        <div className="sticky top-0 p-2 border-b bg-white">
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-4 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                              placeholder="Search by name, mobile or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                            />
                            {searchTerm && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSearchTerm("");
                                  // Keep focus on the search input
                                  const searchInput = e.target
                                    .closest(".relative")
                                    .querySelector("input");
                                  if (searchInput) {
                                    searchInput.focus();
                                  }
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="w-4 h-4"
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Owners List */}
                        <div className="overflow-y-auto">
                          {filteredOwners.map((owner) => (
                            <div
                              key={owner.user_id}
                              className={`
                                p-3 cursor-pointer hover:bg-gray-50
                                ${
                                  outletData.owner_ids.includes(owner.user_id)
                                    ? "bg-brand-50 border-l-4 border-brand-500"
                                    : "border-l-4 border-transparent"
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={outletData.owner_ids.includes(
                                    owner.user_id
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newOwnerIds = e.target.checked
                                      ? [...outletData.owner_ids, owner.user_id]
                                      : outletData.owner_ids.filter(
                                          (id) => id !== owner.user_id
                                        );

                                    
                                    

                                    setOutletData((prev) => ({
                                      ...prev,
                                      owner_ids: newOwnerIds,
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
                                    {owner.email && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>{owner.email}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative">
                  <ImageUploader
                    maxImages={1}
                    onImagesChange={(images) => {
                      let base64String = images[0]?.url || null;
                      if (
                        base64String &&
                        !base64String.startsWith("data:image/")
                      ) {
                        // Default to PNG if type is not available
                        base64String = `data:image/png;base64,${base64String}`;
                      }
                      setOutletData((prev) => ({
                        ...prev,
                        image: base64String,
                      }));
                    }}
                    existingImages={
                      outletData.image ? [{ url: outletData.image }] : []
                    }
                    label="Outlet Image"
                    className="w-full"
                    isOutletImage={true}
                  />
                </div>
              </div>

              {/* Rest of the form fields in their own grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Outlet Name"
                  name="name"
                  value={outletData.name}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("name")}
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      validationStates.name
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />

                <div className="relative">
                  <TextInput
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={outletData.mobile}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("mobile")}
                    placeholder="Enter Mobile Number"
                    required
                    maxLength={10}
                    className={`
                      focus:border-brand-500 focus:ring-brand-500
                      ${
                        validationStates.mobile
                          ? "border-error-500"
                          : "border-gray-300"
                      }
                    `}
                  />
                  {validationStates.mobile && (
                    <p className="text-error-500 text-sm mt-1">
                      {validationStates.mobileMessage}
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

                <TextInput
                  label="UPI ID"
                  name="upi_id"
                  value={outletData.upi_id}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                  required
                />

                <SelectInput
                  label="Outlet Type"
                  name="outlet_type"
                  value={outletData.outlet_type}
                  onChange={handleInputChange}
                  required
                  options={Object.entries(outletTypes).map(([key, value]) => ({
                    value: key,
                    label:
                      value.charAt(0).toUpperCase() +
                      value.slice(1).replace(/_/g, " "),
                  }))}
                  placeholder="Select Outlet Type"
                />

                <SelectInput
                  label="Food Type"
                  name="veg_nonveg"
                  value={outletData.veg_nonveg}
                  onChange={handleInputChange}
                  required
                  options={Object.entries(vegOrNonveg).map(([key, value]) => ({
                    value: key,
                    label:
                      value.charAt(0).toUpperCase() +
                      value.slice(1).replace(/_/g, " "),
                  }))}
                  placeholder="Select Food Type"
                />

                <SelectInput
                  label="Outlet Mode"
                  name="outlet_mode"
                  value={outletData.outlet_mode}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "offline", label: "Offline" },
                    { value: "online", label: "Online" },
                  ]}
                  placeholder="Select Outlet Mode"
                />

                <SelectInput
                  label="Outlet Status"
                  name="outlet_status"
                  value={outletData.outlet_status ? "active" : "inactive"}
                  onChange={(e) => {
                    setOutletData((prev) => ({
                      ...prev,
                      outlet_status: e.target.value === "active",
                    }));
                  }}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  placeholder="Select Outlet Status"
                />

                <SelectInput
                  label="Open/Close Status"
                  name="is_open"
                  value={outletData.is_open ? "open" : "close"}
                  onChange={(e) => {
                    setOutletData((prev) => ({
                      ...prev,
                      is_open: e.target.value === "open",
                    }));
                  }}
                  options={[
                    { value: "open", label: "Open" },
                    { value: "close", label: "Close" },
                  ]}
                  placeholder="Select Open/Close Status"
                />

                <div className="sm:col-span-1">
                  <Textarea
                    label="Address"
                    name="address"
                    value={outletData.address}
                    onChange={handleInputChange}
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
              </div>
            </div>
          </section>

          {/* Business Details Section */}
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
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
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Service Charges (%)
                  </label>
                  <input
                    type="number"
                    name="service_charges"
                    value={outletData.service_charges}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    name="gst"
                    value={outletData.gst}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    name="fssainumber"
                    value={outletData.fssainumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstnumber"
                    value={outletData.gstnumber}
                    maxLength={15}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-3 xl:col-span-4 w-full space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Opening Time */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Time
                      </label>
                      <div className="grid grid-cols-3 gap-3 sm:max-w-sm w-full">
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Time
                      </label>
                      <div className="grid grid-cols-3 gap-3 sm:max-w-sm w-full">
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                        <select
                          className="w-full h-11 border border-gray-300 rounded-lg bg-white text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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

                  {/* Boolean dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Has Combo
                      </label>
                      <select
                        name="has_combo"
                        value={
                          outletData.has_combo !== null
                            ? String(outletData.has_combo)
                            : ""
                        }
                        onChange={(e) =>
                          setOutletData((prev) => ({
                            ...prev,
                            has_combo: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full h-11 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">Select</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Has Denomination
                      </label>
                      <select
                        name="has_denomination"
                        value={
                          outletData.has_denomination !== null
                            ? String(outletData.has_denomination)
                            : ""
                        }
                        onChange={(e) =>
                          setOutletData((prev) => ({
                            ...prev,
                            has_denomination: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full h-11 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">Select</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reserve Table
                      </label>
                      <select
                        name="reserve_table"
                        value={
                          outletData.reserve_table !== null
                            ? String(outletData.reserve_table)
                            : ""
                        }
                        onChange={(e) =>
                          setOutletData((prev) => ({
                            ...prev,
                            reserve_table: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full h-11 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">Select</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Assign Subscription Section (same as Create) */}
          <section className="bg-white p-4 rounded-lg shadow">
            <div className=" border-b border-gray-200 dark:border-gray-800 pb-5">
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 mr-2" />
                Assign Subscription{" "}
                <span className="text-error-500 ml-2">*</span>
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tenure (months) <span className="text-error-500">*</span>
                  </label>
                  <select
                    value={tenureMonths || ""}
                    onChange={(e) =>
                      setTenureMonths(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select months</option>
                    {ALLOWED_TENURES.map((m) => (
                      <option key={m} value={m}>
                        {m} month{m > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
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
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
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
                          className={`bg-white rounded-lg p-2 shadow-sm border cursor-pointer select-none ${
                            checked
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleModuleToggle(m.module_id)}
                              onClick={(e) => e.stopPropagation()}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span className="uppercase">
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

          {/* Social Media Section */}
          <section className="bg-white rounded-lg shadow">
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
              <TextInput
                label="Website"
                name="website"
                type="url"
                value={outletData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />

              <TextInput
                label="Facebook"
                name="facebook"
                type="url"
                value={outletData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
              />

              <TextInput
                label="Instagram"
                name="instagram"
                type="url"
                value={outletData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourhandle"
              />

              <TextInput
                label="Google Business Link"
                name="google_business_link"
                type="url"
                value={outletData.google_business_link}
                onChange={handleInputChange}
                placeholder="https://business.google.com/yourpage"
              />

              <TextInput
                label="Google Review Link"
                name="google_review"
                type="url"
                value={outletData.google_review}
                onChange={handleInputChange}
                placeholder="https://g.page/r/yourreviewpage"
              />
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

export default EditOutlet;
