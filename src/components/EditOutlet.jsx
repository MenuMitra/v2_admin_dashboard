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
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  Textarea,
  Checkbox,
  TimePickerInput,
  labelStyles,
} from "./forms/FormElements.jsx";
import Breadcrumb from "./Breadcrumb";
import ImageUploader from "./common/ImageUploader";
import { API_CONFIG } from "../config/appConfig";
import { YES_NO_OPTIONS } from "../utils/validationPatterns";
import { isMobileValid } from "../utils/validations";
import { toastController } from "../utils/toastController";
import CustomSelectInput from "./common/CustomSelectInput";
import CustomDropdown from "./common/CustomDropdown";
import SaveButton from "./common/SaveButton";
import MultiSelectDropdown from "./common/MultiSelectDropdown";
import SingleSelectDropdown from "./common/SingleSelectDropdown";

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { outletId } = useParams();
  const { BASE_URL } = API_CONFIG;
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
    has_udhari: 0,
    reserve_table: 0,
    company_id: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [vegOrNonveg, setVegOrNonveg] = useState({});
  const [allOwners, setAllOwners] = useState([]);
  const [companyOwners, setCompanyOwners] = useState([]);
  const [primaryOwnerId, setPrimaryOwnerId] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [isLoadingCompanyOwners, setIsLoadingCompanyOwners] = useState(false);
  // Modules for Assign Subscription edit
  const [modules, setModules] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  // Plan fields for Assign Subscription (edit)
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [tenureMonths, setTenureMonths] = useState(null);
  const ALLOWED_TENURES = [1, 3, 6, 12, 18, 24];
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
  });
  console.log(tenureMonths)
  const [originalOwnerIds, setOriginalOwnerIds] = useState([]);

  // Subscription-related state removed per request

  // Subscription popup removed; no subscription-specific effects

  // Add essential validation helper functions
  const isNameValid = (name) => name?.length >= 3 && name?.length <= 50;
  const isUpiValid = (upi) => /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upi);
  // Address validation function (consistent with CreateOutlet: 3-50 characters)
  const isAddressValid = (address) => {
    return address && address.length >= 3 && address.length <= 50;
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
      fetchCompanies();
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

  // Fetch company owners when outlet data is loaded and company is selected
  useEffect(() => {
    if (outletData.company_id && !isLoading) {
      fetchCompanyOwners(outletData.company_id);
    }
  }, [outletData.company_id, isLoading]);

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
          has_udhari: data.has_udhari !== undefined ? data.has_udhari : null,
          reserve_table: data.has_reserve_table !== undefined ? data.has_reserve_table : (data.reserve_table !== undefined ? data.reserve_table : null),
          company_id: data.company_id || "",
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

  const fetchCompanyOwners = async (companyId) => {
    try {
      setIsLoadingCompanyOwners(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/get_company_with_owners`,
        {
          user_id: adminData.user_id,
          company_id: parseInt(companyId)
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Company details retrieved successfully") {
        const owners = response.data.data.owners || [];
        setCompanyOwners(owners);
        // Clear selected owners when company changes (only if it's a new company selection)
        if (!outletData.owner_ids.length || companyId !== outletData.company_id) {
          setOutletData((prev) => ({
            ...prev,
            owner_ids: [],
          }));
          setPrimaryOwnerId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching company owners:", error);
      setCompanyOwners([]);
      toastController.error("Failed to fetch company owners");
    } finally {
      setIsLoadingCompanyOwners(false);
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

    if (name === "mobile") {
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

      // Real-time address validation (3-50 characters)
      const isValid = value && value.length >= 3 && value.length <= 50;
      setValidationStates((prev) => ({ ...prev, [name]: !isValid }));
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

      // Prepare API data matching the mandated payload structure
      const apiData = {
        user_id: parseInt(adminData.user_id),
        outlet_id: parseInt(outletId),
        new_owner_ids: outletData.owner_ids || [],
        ...(primaryOwnerId ? { primary_owner_id: primaryOwnerId } : {}),
        name: outletData.name,
        outlet_type: outletData.outlet_type,
        fssainumber: outletData.fssainumber || "",
        gstnumber: outletData.gstnumber || "",
        mobile: outletData.mobile,
        veg_nonveg: outletData.veg_nonveg,
        service_charges: outletData.service_charges ? outletData.service_charges.toString() : "0",
        gst: outletData.gst ? outletData.gst.toString() : "0",
        address: outletData.address,
        outlet_mode: outletData.outlet_mode || "offline",
        is_open: outletData.is_open ? 1 : 0,
        outlet_status: outletData.outlet_status ? 1 : 0,
        upi_id: outletData.upi_id,
        website: outletData.website || "",
        whatsapp: outletData.whatsapp || "",
        facebook: outletData.facebook || "",
        instagram: outletData.instagram || "",
        google_business_link: outletData.google_business_link || "",
        google_review: outletData.google_review || "",
        app_source: "pos_app",
        image: imagePayload,
        company_id: outletData.company_id ? parseInt(outletData.company_id) : null,
        subscription_id: outletData.subscription_id ? parseInt(outletData.subscription_id) : 11,
        subscription_name: planName || "Updated Mobile app",
        subscription_price: planPrice ? Number(planPrice) : 15000.0,
        subscription_description: "Owner app",
        subscription_tenure: tenureMonths ? `${Number(tenureMonths)} Months` : "",
        module_ids: selectedModuleIds.length > 0 ? selectedModuleIds.map(Number) : [1],
        has_denomination: outletData.has_denomination !== undefined ? outletData.has_denomination : 1,
        has_combo: outletData.has_combo !== undefined ? outletData.has_combo : 1,
        has_udhari: outletData.has_udhari !== undefined ? outletData.has_udhari : 1
      };

      // Format opening_time and closing_time if available
      if (openingHour && openingMinute && openingPeriod) {
        apiData.opening_time = `${openingHour}:${openingMinute}:00 ${openingPeriod}`;
      }
      if (closingHour && closingMinute && closingPeriod) {
        apiData.closing_time = `${closingHour}:${closingMinute}:00 ${closingPeriod}`;
      }

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
          queryClient.invalidateQueries(queryKeys.outlets.list());
          queryClient.invalidateQueries(queryKeys.outlets.detail(outletId));
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
              <SaveButton
                onClick={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
          {/* Basic Information Section */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow">
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
              {/* Select Company and Select Owner in same grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Select Company */}
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
                      // Fetch company-specific owners when company is selected
                      if (companyId) {
                        fetchCompanyOwners(companyId);
                      } else {
                        setCompanyOwners([]);
                        setOutletData((prev) => ({
                          ...prev,
                          owner_ids: [],
                        }));
                      }
                    }}
                    displayKey="company_name"
                    valueKey="company_id"
                    searchKeys={["company_name", "company_code"]}
                    placeholder="Select company"
                    searchPlaceholder="Search by company name or code..."
                    className="rounded-lg"
                  />
                </div>

                {/* Select Owner */}
                <div className="flex flex-col">
                  <MultiSelectDropdown
                    label={<span><span className="text-red-500">*</span> Select Owner(s)</span>}
                    options={companyOwners}
                    selectedValues={outletData.owner_ids}
                    onChange={(newOwnerIds) => {
                      setOutletData((prev) => ({
                        ...prev,
                        owner_ids: newOwnerIds,
                      }));
                      // Clear primary owner if it's no longer selected
                      if (!newOwnerIds.includes(primaryOwnerId)) {
                        setPrimaryOwnerId(null);
                      }
                    }}
                    displayKey="name"
                    valueKey="user_id"
                    searchKeys={["name", "mobile", "email"]}
                    placeholder={
                      !outletData.company_id 
                        ? "Please select a company first" 
                        : isLoadingCompanyOwners 
                          ? "Loading owners..." 
                          : "Select owners"
                    }
                    searchPlaceholder="Search by name, mobile or email..."
                    className="rounded-lg"
                    disabled={!outletData.company_id || isLoadingCompanyOwners}
                    primaryValue={primaryOwnerId}
                    onPrimaryChange={setPrimaryOwnerId}
                  />
                  {!outletData.company_id && (
                    <p className="text-sm text-gray-500 mt-1">
                      Select a company first to see available owners
                    </p>
                  )}
                </div>


              </div>

              {/* Rest of the form fields in their own grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <TextInput
                  label="Outlet Name"
                  name="name"
                  value={outletData.name}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("name")}
                  required
                  className={`
                    rounded-lg focus:border-brand-500 focus:ring-brand-500
                    ${validationStates.name
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
                      rounded-lg focus:border-brand-500 focus:ring-brand-500
                      ${validationStates.mobile
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
                  className="rounded-lg"
                />

                <TextInput
                  label="UPI ID"
                  name="upi_id"
                  value={outletData.upi_id}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                  required
                  className="rounded-lg"
                />

                <CustomDropdown
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

                <CustomDropdown
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

                <CustomDropdown
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

                <CustomDropdown
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

                <CustomDropdown
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
                    maxLength={50}
                    className="rounded-lg"
                  />
                  {validationStates.address && (
                    <p className="text-error-500 text-sm mt-1">
                      {(() => {
                        if (!outletData.address) return "Address is required";
                        if (outletData.address.length < 3) return "Minimum 3 characters required";
                        if (outletData.address.length > 50) return "Address must not exceed 50 characters";
                        return "";
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Business Details Section */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    name="fssainumber"
                    value={outletData.fssainumber}
                    onChange={handleInputChange}
                    placeholder="Enter FSSAI number"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    maxLength={14}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstnumber"
                    value={outletData.gstnumber}
                    maxLength={15}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Plan Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="Enter plan name"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="Enter price"
                  />
                </div>

                <div className="w-full">
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
                          className={`bg-white rounded-lg p-2 shadow-sm border cursor-pointer select-none ${checked
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
                              className="form-checkbox rounded-lg h-4 w-4 text-blue-600"
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
        </form>
      </div>
    </>
  );
}

export default EditOutlet;
