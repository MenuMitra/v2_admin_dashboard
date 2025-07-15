import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSave,
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
import {
  isValidSocialMediaLinks,
  isMobileValid,
  isWhatsappValid,
} from "../utils/validations";
import { toastController } from "../utils/toastController";
import CustomSelectInput from "./common/CustomSelectInput";

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
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
  });

  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [vegOrNonveg, setVegOrNonveg] = useState({});
  const [allOwners, setAllOwners] = useState([]);
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
    website: false,
    facebook: false,
    instagram: false,
    google_business_link: false,
    google_review: false,
    whatsapp: false,
    whatsappMessage: "",
  });

  // Add new state for subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  // Add state for subscription_end_date
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");

  // Add essential validation helper functions
  const isNameValid = (name) => name?.length >= 3 && name?.length <= 50;
  const isUpiValid = (upi) => /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upi);
  // Address validation function
  const isAddressValid = (address) => {
    return address && address.length >= 5 && address.length <= 50;
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
      fetchSubscriptions();
    }
  }, [adminData?.user_id, outletId]);

  const fetchOutletData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/view_outlet`,
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

        // Update form data with fetched data
        setOutletData({
          outlet_id: outletId,
          user_id: adminData?.user_id,
          owner_ids: data.owners.map((owner) => owner.owner_id),
          name: data.name,
          outlet_type: data.outlet_type,
          fssainumber: data.fssainumber === "None" ? "" : data.fssainumber,
          gstnumber: data.gstnumber || "",
          mobile: data.mobile,
          veg_nonveg: data.veg_nonveg,
          service_charges: data.service_charges,
          gst: data.gst,
          address: data.address,
          is_open: data.is_open === 1,
          outlet_status: data.outlet_status === 1,
          upi_id: data.upi_id,
          website: data.website || "",
          whatsapp: data.whatsapp?.replace(/\D/g, "") || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          google_business_link: data.google_business_link || "",
          google_review: data.google_review || "",
          email: data.email || "",
          opening_time: data.opening_time
            ? data.opening_time.split(" ")[1]
            : "",
          closing_time: data.closing_time
            ? data.closing_time.split(" ")[1]
            : "",
          outlet_mode: data.outlet_mode || "",
          image: data.image,
          subscription_id:
            data.subscription_details?.subscription_id?.toString() ||
            data.subscription_id?.toString() ||
            "",
        });

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching outlet data:", error);
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

  const fetchVegOrNonveg = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/veg_or_nonveg`,
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
      console.error("Error fetching veg or nonveg types:", error);
    }
  };

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/listview_owner/${adminData.user_id}`,
        { headers: { Authorization: token } }
      );

      if (Array.isArray(response.data)) {
        setAllOwners(response.data);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
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
      toastController.error("Failed to fetch subscriptions");
    }
  };

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
    } else if (
      [
        "website",
        "facebook",
        "instagram",
        "google_business_link",
        "google_review",
      ].includes(name)
    ) {
      setOutletData((prev) => ({ ...prev, [name]: value }));

      if (value) {
        const { isValid, errors } = isValidSocialMediaLinks({ [name]: value });
        setValidationStates((prev) => ({ ...prev, [name]: !isValid }));
        if (!isValid) toastController.error(errors[name]);
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
      owner_ids: outletData.owner_ids?.length > 0,
      upi_id: isUpiValid(outletData.upi_id),
      outlet_type: !!outletData.outlet_type,
      veg_nonveg: !!outletData.veg_nonveg,
      outlet_mode: !!outletData.outlet_mode,
      address: isAddressValid(outletData.address),
      subscription_id: true,
    };

    const fieldsValid = Object.entries(requiredFields).every(
      ([, value]) => value
    );

    if (!fieldsValid) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Validate social media links
      const socialMediaLinks = {
        website: outletData.website,
        facebook: outletData.facebook,
        instagram: outletData.instagram,
        google_business_link: outletData.google_business_link,
        google_review: outletData.google_review,
      };

      const { isValid: isSocialValid, errors: socialErrors } =
        isValidSocialMediaLinks(socialMediaLinks);

      if (!isSocialValid) {
        // Update validation states for all invalid fields
        const newValidationStates = { ...validationStates };
        Object.keys(socialErrors).forEach((key) => {
          newValidationStates[key] = true;
        });
        setValidationStates(newValidationStates);

        // Show error messages
        Object.values(socialErrors).forEach((error) => {
          toastController.error(error);
        });
        return;
      }

      // Add validation for subscription_end_date if subscription is selected
      if (outletData.subscription_id && !subscriptionEndDate) {
        toastController.error("Please select a subscription end date");
        return;
      }

      // Prepare API data with new_owner_ids as array
      const apiData = {
        outlet_id: parseInt(outletId),
        user_id: parseInt(adminData.user_id),
        new_owner_ids: outletData.owner_ids,
        name: outletData.name,
        outlet_type: outletData.outlet_type,
        fssainumber: outletData.fssainumber,
        gstnumber: outletData.gstnumber,
        mobile: outletData.mobile,
        veg_nonveg: outletData.veg_nonveg,
        service_charges: outletData.service_charges.toString(),
        gst: outletData.gst.toString(),
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
        image: outletData.image || "",
        subscription_id: outletData.subscription_id
          ? parseInt(outletData.subscription_id)
          : undefined,
        app_source: "admin_app",
      };

      // When constructing the payload for saving, format opening_time and closing_time as 'YYYY-MM-DD HH:mm:00 AM/PM'
      const currentDate =
        outletData?.date || new Date().toISOString().split("T")[0];
      if (openingHour && openingMinute && openingPeriod) {
        apiData.opening_time = `${currentDate} ${openingHour}:${openingMinute}:00 ${openingPeriod}`;
      }
      if (closingHour && closingMinute && closingPeriod) {
        apiData.closing_time = `${currentDate} ${closingHour}:${closingMinute}:00 ${closingPeriod}`;
      }

      if (outletData.subscription_id && subscriptionEndDate) {
        apiData.subscription_end_date =
          formatDateToDDMMMYYYY(subscriptionEndDate);
      }

      const response = await axios.patch(
        `${BASE_URL}/${API_VERSION}/common/update_outlet`,
        apiData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Outlet information updated successfully") {
        navigate(-1);
      } else {
        throw new Error("Failed to update outlet");
      }
    } catch (error) {
      console.error("Error updating outlet:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to update outlet"
      );
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
                    <span className="text-error-600">*</span> Select Owner(s)
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
                        className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                        style={{
                          width: "100%",
                          minWidth: "300px",
                          maxHeight: "350px",
                          overflowY: "auto",
                        }}
                      >
                        {/* Search Bar */}
                        <div className="sticky top-0 p-2 border-b bg-white">
                          <input
                            type="text"
                            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Search by name, mobile or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
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
                                    setOutletData((prev) => ({
                                      ...prev,
                                      owner_ids: e.target.checked
                                        ? [...prev.owner_ids, owner.user_id]
                                        : prev.owner_ids.filter(
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
                      const base64String = images[0]?.url || null;
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
                  <div className="mt-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      <span className="text-error-600">*</span> Subscription End
                      Date
                    </label>
                    <input
                      type="date"
                      name="subscription_end_date"
                      value={subscriptionEndDate}
                      onChange={(e) => setSubscriptionEndDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}
                
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              {/* Opening Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Time
                </label>
                <div className="flex gap-2">
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Time
                </label>
                <div className="flex gap-2">
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
            </div>
          </section>

          {/* Social Media Section */}
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Social Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <TextInput
                label="Website"
                name="website"
                type="url"
                value={outletData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className={validationStates.website ? "border-error-500" : ""}
              />

              <TextInput
                label="Facebook"
                name="facebook"
                type="url"
                value={outletData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
                className={validationStates.facebook ? "border-error-500" : ""}
              />

              <TextInput
                label="Instagram"
                name="instagram"
                type="url"
                value={outletData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourhandle"
                className={validationStates.instagram ? "border-error-500" : ""}
              />

              <TextInput
                label="Google Business Link"
                name="google_business_link"
                type="url"
                value={outletData.google_business_link}
                onChange={handleInputChange}
                placeholder="https://business.google.com/yourpage"
                className={
                  validationStates.google_business_link
                    ? "border-error-500"
                    : ""
                }
              />

              <TextInput
                label="Google Review Link"
                name="google_review"
                type="url"
                value={outletData.google_review}
                onChange={handleInputChange}
                placeholder="https://g.page/r/yourreviewpage"
                className={
                  validationStates.google_review ? "border-error-500" : ""
                }
              />
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

export default EditOutlet;
