import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { TextInput, PasswordInput } from "../forms/FormElements";
import axios from "axios";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function CreateAdmin() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [adminData, setAdminData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Admins", path: "/admins" },
    { label: "Create Admin", path: "/create-admin" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation for name field
    if (name === "name") {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, name: "Name is required" }));
      } else if (!nameRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          name: "Name should only contain alphabets and spaces. Numbers and symbols are not allowed.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
    }

    if (name === "mobile") {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, "");
      const firstDigit = numbersOnly.charAt(0);

      // If starts with 1-5, clear the field
      if (firstDigit && ["1", "2", "3", "4", "5"].includes(firstDigit)) {
        setAdminData((prev) => ({
          ...prev,
          [name]: "", // Clear the field
        }));
        setErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must start with 6, 7, 8, or 9",
        }));
      } else {
        // For valid numbers (6-9) or empty field
        setAdminData((prev) => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10),
        }));
        setErrors((prev) => ({
          ...prev,
          mobile: "",
        }));
      }
    } else {
      // Clear error when user starts typing
      if (name in errors) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!adminData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (!nameRegex.test(adminData.name)) {
      newErrors.name =
        "Name should only contain alphabets and spaces. Numbers and symbols are not allowed.";
      isValid = false;
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    const numericMobileRegex = /^\d+$/;
    if (!adminData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!numericMobileRegex.test(adminData.mobile)) {
      newErrors.mobile = "Mobile number should only contain digits";
      isValid = false;
    } else if (!mobileRegex.test(adminData.mobile)) {
      newErrors.mobile =
        "Mobile number must start with 6, 7, 8, or 9 and be 10 digits";
      isValid = false;
    }

    // Email validation
    if (!adminData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    // Password validation
    if (!adminData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (adminData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/create_admin",
        adminData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Check for successful status code (200)
      if (response.status === 201) {
        // Redirect to admins list
        navigate("/admins");
      } else {
        throw new Error("Failed to create admin");
      }
    } catch (err) {
      setApiError(err.response?.data?.detail || "Failed to create admin");
      console.error("Error creating admin:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Breadcrumb here */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Create */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <svg
                  className="fill-current"
                  width="8"
                  height="12"
                  viewBox="0 0 8 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6.70994 2.11997L2.82994 5.99997L6.70994 9.87997C7.09994 10.27 7.09994 10.9 6.70994 11.29C6.31994 11.68 5.68994 11.68 5.29994 11.29L0.709941 6.69997C0.319941 6.30997 0.319941 5.67997 0.709941 5.28997L5.29994 0.699971C5.68994 0.309971 6.31994 0.309971 6.70994 0.699971C7.08994 1.08997 7.09994 1.72997 6.70994 2.11997Z" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Create New Admin
            </div>

            {/* Right Side - Create Button */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                form="createAdminForm"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-success-500 hover:bg-success-600 shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isSubmitting ? "Creating..." : "Create"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="px-6 py-6">
          {apiError && (
            <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-500/10">
              {apiError}
            </div>
          )}

          <form
            id="createAdminForm"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Form fields container with responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <TextInput
                  label="Name"
                  name="name"
                  value={adminData.name}
                  onChange={handleChange}
                  placeholder="Enter admin name"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.name ? "border-error-500" : "border-gray-300"}
                  `}
                />
                {errors.name && (
                  <p className="text-error-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  value={adminData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.mobile ? "border-error-500" : "border-gray-300"}
                  `}
                />
                {errors.mobile && (
                  <p className="text-error-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <div>
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={adminData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.email ? "border-error-500" : "border-gray-300"}
                  `}
                />
                {errors.email && (
                  <p className="text-error-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <TextInput
                  label="Password"
                  name="password"
                  type="password"
                  value={adminData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.password ? "border-error-500" : "border-gray-300"}
                  `}
                />
                {errors.password && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.password}
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

export default CreateAdmin;
