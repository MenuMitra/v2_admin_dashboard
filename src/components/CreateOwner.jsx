import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { queryKeys } from "../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../utils/toastController";
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
  SelectInput,
} from "./forms/FormElements.jsx";
import Breadcrumb from "./Breadcrumb";
import { API_CONFIG } from "../config/appConfig";
import MultiSelectDropdown from "./common/MultiSelectDropdown";

function CreateOwner() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);

  const [ownerData, setOwnerData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    aadhar_number: "",
    address: "",
    outlet_ids: [],
    account_type: "live",
    is_active: 1,
  });

  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: "",
    aadhar_number: true,
    aadharMessage: "",
    address: true,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Owners", path: "/owners" },
    { label: "Create Owner", path: "/create-owner" },
  ];

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlets`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const outletArray = Object.entries(response.data.outlet_list).map(
          ([name, id]) => ({
            outlet_name: name,
            outlet_id: id,
          })
        );
        setOutlets(outletArray);
      }
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setError("Failed to load outlets");
    }
  };

  const handleOutletChange = (newOutletIds) => {
    setSelectedOutlets(newOutletIds);
    setOwnerData((prev) => ({
      ...prev,
      outlet_ids: newOutletIds,
    }));
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

  const isAddressValid = (address) => {
    const alphabetOnly = /^[A-Za-z\s]+$/.test(address);
    return (
      address && address.length >= 5 && address.length <= 50 && alphabetOnly
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "address") {
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));

      if (filteredValue && filteredValue.length < 5) {
        setValidationStates((prev) => ({ ...prev, [name]: true }));
      } else {
        setValidationStates((prev) => ({ ...prev, [name]: false }));
      }
    } else if (name === "name") {
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));

      if (!filteredValue.trim()) {
        setValidationStates((prev) => ({
          ...prev,
          nameMessage: "Name is required",
        }));
      } else if (filteredValue.length < 2) {
        setValidationStates((prev) => ({
          ...prev,
          nameMessage: "Minimum 2 characters required",
        }));
      } else {
        setValidationStates((prev) => ({
          ...prev,
          nameMessage: "",
        }));
      }
      return;
    } else if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: false,
          mobileMessage: "Number must start with 6, 7, 8, or 9",
        }));
        return;
      }

      setOwnerData((prev) => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message,
      }));
    } else if (name === "aadhar_number") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 12);
      const { isValid, message } = isAadharValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        aadhar_number: isValid,
        aadharMessage: message,
      }));
      setOwnerData((prev) => ({ ...prev, aadhar_number: numbersOnly }));
    } else {
      setOwnerData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
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
      ownerData.name?.trim() &&
      ownerData.mobile?.trim() &&
      ownerData.aadhar_number?.trim() &&
      !validationStates.nameMessage &&
      validationStates.mobile &&
      validationStates.aadhar_number
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const formattedDate = ownerData.dob
        ? new Date(ownerData.dob).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";

      const payload = {
        user_id: adminData.user_id,
        name: ownerData.name,
        mobile: ownerData.mobile,
        email: ownerData.email,
        address: ownerData.address,
        aadhar_number: ownerData.aadhar_number,
        dob: formattedDate,
        ...(ownerData.outlet_ids &&
          ownerData.outlet_ids.length > 0 && {
            outlet_ids: ownerData.outlet_ids,
          }),
        account_type: ownerData.account_type,
        is_active: ownerData.is_active,
        app_source: "admin",
      };

      await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/common/create_owner`, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating owner...",
          success: "Owner created successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to create owner",
        }
      );

      // Invalidate owners cache to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
      navigate(-1);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create owner";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !ownerData.name) {
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
              Create Owner
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

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={ownerData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                validationType="name"
                onValidation={handleValidation("name")}
                isSubmitAttempted={isSubmitAttempted}
              />

              <div className="relative">
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={ownerData.mobile}
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
                {!validationStates.mobile && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
              </div>

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={ownerData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                validationType="email"
                onValidation={handleValidation("email")}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={ownerData.dob}
                onChange={handleChange}
                placeholder="Select Date of birth"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="relative">
                <TextInput
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={ownerData.aadhar_number}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhar number"
                  required
                  maxLength={12}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${
                      !validationStates.aadhar_number
                        ? "border-error-500"
                        : "border-gray-300"
                    }
                  `}
                />
                {!validationStates.aadhar_number && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.aadharMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <MultiSelectDropdown
                  label="Select Outlets"
                  options={outlets}
                  selectedValues={selectedOutlets}
                  onChange={handleOutletChange}
                  displayKey="outlet_name"
                  valueKey="outlet_id"
                  searchKeys={["outlet_name"]}
                  placeholder="Select outlets"
                  searchPlaceholder="Search outlets..."
                />
              </div>
              <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3">
                <SelectInput
                  label="Owner Status"
                  name="is_active"
                  value={ownerData.is_active}
                  onChange={handleChange}
                  required
                  options={[
                    { value: 1, label: "Active" },
                    { value: 0, label: "Inactive" },
                  ]}
                  placeholder="Select Status"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="mt-6">
                <Textarea
                  label="Address"
                  name="address"
                  value={ownerData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
                {validationStates.address && (
                  <p className="text-error-500 text-sm mt-1">
                    {!ownerData.address
                      ? ""
                      : ownerData.address.length < 5
                      ? "Minimum 5 characters required"
                      : "Address must not exceed 50 characters"}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="text-error-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateOwner;
