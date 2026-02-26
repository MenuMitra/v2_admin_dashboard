import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";
import { queryKeys } from "../lib/react-query/queryKeys";
import Breadcrumb from "./Breadcrumb";
import SaveButton from "./common/SaveButton";
import CustomDropdown from "./common/CustomDropdown";

function toTitleCase(str) {
  return str
    ? str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    : "";
}

function OutletConfiguration() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL } = API_CONFIG;

  const [isSaving, setIsSaving] = useState(false);
  const [configFormData, setConfigFormData] = useState({
    service_charge_value: "",
    service_charge_type: "percent",
    gst: "",
    has_combo: null,
    has_denomination: null,
    has_udhari: null,
    has_reserve_table: null,
    show_customer_count: null,
    opening_time: "",
    closing_time: "",
    website: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    google_business_link: "",
    google_review: "",
    dynamic_pricing: null,
    order_number_sequence: "daily",
    reset_bill_number: null,
    reset_kot_number: null,
    is_open: null,
  });

  // Time state for dropdowns
  const [openingHour, setOpeningHour] = useState("");
  const [openingMinute, setOpeningMinute] = useState("");
  const [openingPeriod, setOpeningPeriod] = useState("AM");
  const [closingHour, setClosingHour] = useState("");
  const [closingMinute, setClosingMinute] = useState("");
  const [closingPeriod, setClosingPeriod] = useState("AM");

  // Fetch outlet details (for name display)
  const { data: outletResponse, isLoading: isLoadingOutlet } = useQuery({
    queryKey: queryKeys.outlets.detail(outletId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/common/view_outlet`,
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: Boolean(outletId) && Boolean(adminData?.user_id),
  });

  // Fetch outlet configuration
  const { data: configResponse, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["outletConfig", outletId],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/admin/get_outlet_config/${outletId}`,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: Boolean(outletId),
  });

  const outletData = outletResponse?.data || null;
  const configData = configResponse || null;

  // Helper function to parse time in HH:MM format to hour, minute, period
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: "", minute: "", period: "AM" };

    // Handle HH:MM format (24-hour)
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr ? minuteStr.substring(0, 2) : "00";

    let period = "AM";
    if (hour >= 12) {
      period = "PM";
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;

    return {
      hour: hour.toString().padStart(2, "0"),
      minute: minute,
      period: period,
    };
  };

  // Prefill form data from outlet config API response
  useEffect(() => {
    if (configData) {
      setConfigFormData({
        service_charge_value: configData.service_charge_value ?? "",
        service_charge_type: configData.service_charge_type === "percentage" ? "percent" : configData.service_charge_type || "percent",
        gst: configData.gst ?? "",
        has_combo: configData.has_combo === true ? 1 : configData.has_combo === false ? 0 : null,
        has_denomination: configData.has_denomination === true ? 1 : configData.has_denomination === false ? 0 : null,
        has_udhari: configData.has_udhari === true ? 1 : configData.has_udhari === false ? 0 : null,
        has_reserve_table: configData.has_reserve_table === true ? 1 : configData.has_reserve_table === false ? 0 : null,
        show_customer_count: configData.show_customer_count === true ? 1 : configData.show_customer_count === false ? 0 : null,
        opening_time: configData.opening_time || "",
        closing_time: configData.closing_time || "",
        website: configData.website || "",
        whatsapp: configData.whatsapp || "",
        facebook: configData.facebook || "",
        instagram: configData.instagram || "",
        google_business_link: configData.google_business_link || "",
        google_review: configData.google_review || "",
        dynamic_pricing: configData.dynamic_pricing === true ? 1 : configData.dynamic_pricing === false ? 0 : null,
        order_number_sequence: configData.order_number_sequence || "daily",
        reset_bill_number: configData.reset_bill_number ?? null,
        reset_kot_number: configData.reset_kot_number ?? null,
        is_open: configData.is_open === true ? 1 : configData.is_open === false ? 0 : null,
      });

      // Parse opening time
      if (configData.opening_time) {
        const parsed = parseTime(configData.opening_time);
        setOpeningHour(parsed.hour);
        setOpeningMinute(parsed.minute);
        setOpeningPeriod(parsed.period);
      }

      // Parse closing time
      if (configData.closing_time) {
        const parsed = parseTime(configData.closing_time);
        setClosingHour(parsed.hour);
        setClosingMinute(parsed.minute);
        setClosingPeriod(parsed.period);
      }
    }
  }, [configData]);

  const isLoading = isLoadingOutlet || isLoadingConfig;

  const handleConfigFormChange = (field, value) => {
    setConfigFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpeningTimeChange = (type, value) => {
    if (type === "hour") setOpeningHour(value);
    if (type === "minute") setOpeningMinute(value);
    if (type === "period") setOpeningPeriod(value);
    const hour = type === "hour" ? value : openingHour;
    const minute = type === "minute" ? value : openingMinute;
    const period = type === "period" ? value : openingPeriod;
    if (hour && minute && period) {
      setConfigFormData((prev) => ({
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
      setConfigFormData((prev) => ({
        ...prev,
        closing_time: `${hour}:${minute} ${period}`,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        user_id: adminData?.user_id,
        outlet_id: parseInt(outletId),
      };

      // Add is_open field
      if (configFormData.is_open !== null) {
        payload.is_open = configFormData.is_open === 1;
      }

      // Add time fields in HH:MM format (24-hour)
      if (closingHour && closingMinute) {
        let closingHourNum = parseInt(closingHour, 10);
        if (closingPeriod === "PM" && closingHourNum !== 12) {
          closingHourNum += 12;
        } else if (closingPeriod === "AM" && closingHourNum === 12) {
          closingHourNum = 0;
        }
        payload.closing_time = `${closingHourNum.toString().padStart(2, "0")}:${closingMinute}`;
      }
      if (openingHour && openingMinute) {
        let openingHourNum = parseInt(openingHour, 10);
        if (openingPeriod === "PM" && openingHourNum !== 12) {
          openingHourNum += 12;
        } else if (openingPeriod === "AM" && openingHourNum === 12) {
          openingHourNum = 0;
        }
        payload.opening_time = `${openingHourNum.toString().padStart(2, "0")}:${openingMinute}`;
      }

      // Add configuration fields
      if (configFormData.has_udhari !== null) {
        payload.has_udhari = configFormData.has_udhari === 1;
      }
      if (configFormData.whatsapp) {
        payload.whatsapp = configFormData.whatsapp;
      }
      if (configFormData.facebook) {
        payload.facebook = configFormData.facebook;
      }
      if (configFormData.instagram) {
        payload.instagram = configFormData.instagram;
      }
      if (configFormData.website) {
        payload.website = configFormData.website;
      }

      // Add other configuration fields
      if (configFormData.service_charge_value) {
        payload.service_charge_value = Number(configFormData.service_charge_value);
      }
      if (configFormData.service_charge_type) {
        payload.service_charge_type = configFormData.service_charge_type === "percent" ? "percentage" : configFormData.service_charge_type;
      }
      if (configFormData.gst) {
        payload.gst = Number(configFormData.gst);
      }
      if (configFormData.has_combo !== null) {
        payload.has_combo = configFormData.has_combo === 1;
      }
      if (configFormData.has_denomination !== null) {
        payload.has_denomination = configFormData.has_denomination === 1;
      }
      if (configFormData.has_reserve_table !== null) {
        payload.has_reserve_table = configFormData.has_reserve_table === 1;
      }
      if (configFormData.show_customer_count !== null) {
        payload.show_customer_count = configFormData.show_customer_count === 1;
      }
      if (configFormData.google_business_link) {
        payload.google_business_link = configFormData.google_business_link;
      }
      if (configFormData.google_review) {
        payload.google_review = configFormData.google_review;
      }
      if (configFormData.dynamic_pricing !== null) {
        payload.dynamic_pricing = configFormData.dynamic_pricing === 1;
      }
      if (configFormData.order_number_sequence) {
        payload.order_number_sequence = configFormData.order_number_sequence;
      }
      if (configFormData.reset_bill_number !== null) {
        payload.reset_bill_number = String(configFormData.reset_bill_number);
      }
      if (configFormData.reset_kot_number !== null) {
        payload.reset_kot_number = String(configFormData.reset_kot_number);
      }

      console.log("Outlet Configuration payload:", payload);

      const response = await axios.patch(
        `${BASE_URL}/admin/update_outlet_config`,
        payload,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      // Handle successful response
      if (response.data?.message) {
        toastController.success(response.data.message);

        // Log the response for debugging
        console.log("Outlet Configuration Response:", {
          message: response.data.message,
          outlet_configuration_id: response.data.outlet_configuration_id,
          updated_fields: response.data.updated_fields
        });

        // Refetch the outlet configuration cache to get fresh data
        await queryClient.refetchQueries({
          queryKey: ["outletConfig", outletId],
        });

        // Navigate back after successful update
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      } else if (response.status >= 200 && response.status < 300) {
        // Handle success even if message is not present
        toastController.success("Outlet configuration updated successfully");

        await queryClient.refetchQueries({
          queryKey: ["outletConfig", outletId],
        });

        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
      console.error("Update outlet config error:", error);
      console.error("Error response:", error.response?.data);

      toastController.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update outlet configuration"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Outlets", path: "/outlets" },
    { label: outletData?.name || "Outlet", path: `/view-outlet/${outletId}` },
    { label: "Configuration" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-brand-500" />
      </div>
    );
  }


  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="pt-4 overflow-hidden">
          {/* Top Row - Back, Title, Save Button */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                {toTitleCase(outletData?.name) || "Outlet"} - Configuration
              </h2>
            </div>

            {/* Right Side - Save Button */}
            <div>
              <SaveButton
                onClick={handleSave}
                disabled={isSaving}
                isLoading={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </SaveButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {/* Business Details Section */}
          <section className="p-4 bg-white rounded-lg shadow sm:p-6">
            <div className="pb-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="flex items-center mb-4 text-lg font-medium">
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

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Service Charge
                  </label>
                  <div className="flex overflow-hidden border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    {/* Toggle Section - 30% */}
                    <div className="w-[30%] border-r border-gray-300 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => handleConfigFormChange("service_charge_type", configFormData.service_charge_type === "percent" ? "fixed" : "percent")}
                        className="flex items-center justify-center w-full h-10 text-sm font-medium text-gray-900 transition-colors bg-blue-500 hover:bg-blue-600"
                      >
                        <span className="font-semibold text-black">
                          {configFormData.service_charge_type === "percent" ? "%" : "₹"}
                        </span>
                      </button>
                    </div>
                    {/* Input Section - 70% */}
                    <div className="w-[70%]">
                      <input
                        type="number"
                        name="service_charge_value"
                        value={configFormData.service_charge_value}
                        onChange={(e) => handleConfigFormChange("service_charge_value", e.target.value)}
                        placeholder="Enter amount"
                        className="w-full h-10 px-3 text-sm border-0 rounded-none focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    name="gst"
                    value={configFormData.gst}
                    onChange={(e) => handleConfigFormChange("gst", e.target.value)}
                    placeholder="Enter GST percentage"
                    className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Is Open */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Outlet Status
                  </label>
                  <CustomDropdown
                    name="is_open"
                    className="w-full h-10"
                    value={
                      configFormData.is_open !== null &&
                        configFormData.is_open !== undefined
                        ? String(configFormData.is_open)
                        : "1"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "is_open",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "Closed" },
                      { value: "1", label: "Open" },
                    ]}
                    placeholder="Open"
                  />
                </div>

                {/* Show Customer Count */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Show Customer Count
                  </label>
                  <CustomDropdown
                    name="show_customer_count"
                    className="w-full h-10"
                    value={
                      configFormData.show_customer_count !== null &&
                        configFormData.show_customer_count !== undefined
                        ? String(configFormData.show_customer_count)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "show_customer_count",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Opening Time */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Opening Time
                  </label>
                  <div className="flex h-10 gap-1">
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={openingHour}
                      onChange={(e) => handleOpeningTimeChange("hour", e.target.value)}
                      options={[
                        { value: "", label: "HH" },
                        ...[...Array(12)].map((_, i) => {
                          const val = (i + 1).toString().padStart(2, "0");
                          return { value: val, label: val };
                        }),
                      ]}
                      placeholder="HH"
                    />
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={openingMinute}
                      onChange={(e) => handleOpeningTimeChange("minute", e.target.value)}
                      options={[
                        { value: "", label: "MM" },
                        ...["00", "15", "30", "45"].map((min) => ({
                          value: min,
                          label: min,
                        })),
                      ]}
                      placeholder="MM"
                    />
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={openingPeriod}
                      onChange={(e) => handleOpeningTimeChange("period", e.target.value)}
                      options={[
                        { value: "AM", label: "AM" },
                        { value: "PM", label: "PM" },
                      ]}
                      placeholder="AM"
                    />
                  </div>
                </div>

                {/* Closing Time */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Closing Time
                  </label>
                  <div className="flex h-10 gap-1">
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={closingHour}
                      onChange={(e) => handleClosingTimeChange("hour", e.target.value)}
                      options={[
                        { value: "", label: "HH" },
                        ...[...Array(12)].map((_, i) => {
                          const val = (i + 1).toString().padStart(2, "0");
                          return { value: val, label: val };
                        }),
                      ]}
                      placeholder="HH"
                    />
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={closingMinute}
                      onChange={(e) => handleClosingTimeChange("minute", e.target.value)}
                      options={[
                        { value: "", label: "MM" },
                        ...["00", "15", "30", "45"].map((min) => ({
                          value: min,
                          label: min,
                        })),
                      ]}
                      placeholder="MM"
                    />
                    <CustomDropdown
                      className="flex-1 h-10"
                      value={closingPeriod}
                      onChange={(e) => handleClosingTimeChange("period", e.target.value)}
                      options={[
                        { value: "AM", label: "AM" },
                        { value: "PM", label: "PM" },
                      ]}
                      placeholder="AM"
                    />
                  </div>
                </div>

                {/* Has Combo */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Has Combo
                  </label>
                  <CustomDropdown
                    name="has_combo"
                    className="w-full h-10"
                    value={
                      configFormData.has_combo !== null &&
                        configFormData.has_combo !== undefined
                        ? String(configFormData.has_combo)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "has_combo",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Has Denomination */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Has Denomination
                  </label>
                  <CustomDropdown
                    name="has_denomination"
                    className="w-full h-10"
                    value={
                      configFormData.has_denomination !== null &&
                        configFormData.has_denomination !== undefined
                        ? String(configFormData.has_denomination)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "has_denomination",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Has Udhari */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Has Udhari
                  </label>
                  <CustomDropdown
                    name="has_udhari"
                    className="w-full h-10"
                    value={
                      configFormData.has_udhari !== null &&
                        configFormData.has_udhari !== undefined
                        ? String(configFormData.has_udhari)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "has_udhari",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Reserve Table */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Reserve Table
                  </label>
                  <CustomDropdown
                    name="has_reserve_table"
                    className="w-full h-10"
                    value={
                      configFormData.has_reserve_table !== null &&
                        configFormData.has_reserve_table !== undefined
                        ? String(configFormData.has_reserve_table)
                        : "1"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "has_reserve_table",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="Yes"
                  />
                </div>

                {/* Dynamic Pricing */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Dynamic Pricing
                  </label>
                  <CustomDropdown
                    name="dynamic_pricing"
                    className="w-full h-10"
                    value={
                      configFormData.dynamic_pricing !== null &&
                        configFormData.dynamic_pricing !== undefined
                        ? String(configFormData.dynamic_pricing)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "dynamic_pricing",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Order Number Sequence */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Order Number Sequence
                  </label>
                  <CustomDropdown
                    name="order_number_sequence"
                    className="w-full h-10"
                    value={configFormData.order_number_sequence || "daily"}
                    onChange={(e) =>
                      handleConfigFormChange("order_number_sequence", e.target.value)
                    }
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "since_opening", label: "Continuous" },
                    ]}
                    placeholder="Daily"
                  />
                </div>

                {/* Reset Bill Number */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Reset Bill Number
                  </label>
                  <CustomDropdown
                    name="reset_bill_number"
                    className="w-full h-10"
                    value={
                      configFormData.reset_bill_number !== null &&
                        configFormData.reset_bill_number !== undefined
                        ? String(configFormData.reset_bill_number)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "reset_bill_number",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>

                {/* Reset KOT Number */}
                <div className="w-full">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                    Reset KOT Number
                  </label>
                  <CustomDropdown
                    name="reset_kot_number"
                    className="w-full h-10"
                    value={
                      configFormData.reset_kot_number !== null &&
                        configFormData.reset_kot_number !== undefined
                        ? String(configFormData.reset_kot_number)
                        : "0"
                    }
                    onChange={(e) =>
                      handleConfigFormChange(
                        "reset_kot_number",
                        e.target.value !== "" ? Number(e.target.value) : null
                      )
                    }
                    options={[
                      { value: "0", label: "No" },
                      { value: "1", label: "Yes" },
                    ]}
                    placeholder="No"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Social Media Section */}
          <section className="p-4 mt-6 bg-white rounded-lg shadow sm:p-6">
            <h2 className="flex items-center mb-4 text-lg font-medium">
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={configFormData.website}
                  onChange={(e) => handleConfigFormChange("website", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={configFormData.whatsapp}
                  onChange={(e) => handleConfigFormChange("whatsapp", e.target.value)}
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={configFormData.facebook}
                  onChange={(e) => handleConfigFormChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={configFormData.instagram}
                  onChange={(e) => handleConfigFormChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  Google Business Link
                </label>
                <input
                  type="url"
                  name="google_business_link"
                  value={configFormData.google_business_link}
                  onChange={(e) => handleConfigFormChange("google_business_link", e.target.value)}
                  placeholder="https://business.google.com/yourpage"
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                  Google Review Link
                </label>
                <input
                  type="url"
                  name="google_review"
                  value={configFormData.google_review}
                  onChange={(e) => handleConfigFormChange("google_review", e.target.value)}
                  placeholder="https://g.page/r/yourreviewpage"
                  className="w-full h-10 px-3 text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default OutletConfiguration;
