import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  DateInput,
  Textarea,
  SelectInput,
  Checkbox,
  labelStyles,
} from "../forms/FormElements.jsx";
import Breadcrumb from "../Breadcrumb";

function CreatePartner() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [partnerDetails, setPartnerDetails] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    aadhar_number: "",
    address: "",
  });
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Mobile number validation: not starting with 0-5, max length 10
    if (name === "mobile") {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, "");
      // Prevent starting with 0-5
      if (numericValue.length > 0 && /^[0-5]/.test(numericValue)) {
        return; // Do not update state if first digit is 0-5
      }
      // Limit to 10 digits
      if (numericValue.length > 10) {
        return;
      }
      setPartnerDetails((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    // Email validation
    if (name === "email") {
      // Basic email regex and must end with @gmail.com
      const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !emailPattern.test(value)) {
        setEmailError("Email format is incorrect.");
      } else {
        setEmailError("");
      }
    }
    setPartnerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const date = new Date(partnerDetails.dob);
      const formattedDate = date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, " ");

      const requestData = {
        user_id: adminData?.user_id,
        name: partnerDetails.name,
        mobile: partnerDetails.mobile,
        email: partnerDetails.email,
        dob: formattedDate,
        aadhar_number: partnerDetails.aadhar_number,
        address: partnerDetails.address,
        // functionality_ids: partnerDetails.functionality_ids,
        app_source: "admin_app",
      };

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/create_partner",
        requestData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Partner created successfully") {
        navigate("/partners");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create partner");
      console.error("Error creating partner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Partners", path: "/partners" },
    { label: "Create Partner" },
  ];

  if (isLoading && !partnerDetails.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4">
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
              Create Partner
            </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={partnerDetails.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <TextInput
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={partnerDetails.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                maxLength={10}
              />

              <div>
                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={partnerDetails.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
                {emailError && (
                  <div className="text-error-500 text-sm mt-1">
                    {emailError}
                  </div>
                )}
              </div>

              <DateInput
                label="Date of Birth"
                name="dob"
                value={partnerDetails.dob}
                onChange={handleChange}
                required
                placeholder="Select date of birth"
              />

              <TextInput
                label="Aadhar Number"
                name="aadhar_number"
                value={partnerDetails.aadhar_number}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhar number"
                required
                maxLength="12"
              />

              <div className="sm:col-span-1">
                <Textarea
                  label="Address"
                  name="address"
                  value={partnerDetails.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePartner;
