import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "../Breadcrumb";

function CreateSuperOwner() {
  const { getToken, isAuthenticated } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();

  const [superOwnerDetails, setSuperOwnerDetails] = useState({
    user_id: adminData?.user_id || "",
    name: "",
    mobile: "",
    email: "",
    aadhar_number: "",
    app_source: "admin_dashboard",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/get_outlets_for_super_owner",
        {
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.data?.outlets) {
        setOutlets(response.data.data.outlets);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
      setError("Failed to fetch outlets");
    }
  };

  const handleOutletSelect = (outletId) => {
    setSelectedOutlets((prev) => {
      const newSelection = prev.includes(outletId)
        ? prev.filter((id) => id !== outletId)
        : [...prev, outletId];
      return newSelection;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuperOwnerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation for mobile field
    if (name === "mobile") {
      if (value && !/^[6-9]/.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must start with 6, 7, 8, or 9",
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          mobile: "",
        }));
      }
    }
  };

  const validate = () => {
    const errors = {};
    // Name: required, only alphabets and spaces
    if (!superOwnerDetails.name.trim()) {
      errors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(superOwnerDetails.name)) {
      errors.name = "Name should only contain alphabets and spaces";
    }
    // Mobile: required, 10 digits, starts with 6/7/8/9
    if (!superOwnerDetails.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(superOwnerDetails.mobile)) {
      errors.mobile = "Mobile must be 10 digits and start with 6, 7, 8, or 9";
    }
    // Email: required, valid format
    if (!superOwnerDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(superOwnerDetails.email)) {
      errors.email = "Invalid email address";
    }
    // Aadhar: required, 12 digits
    if (!superOwnerDetails.aadhar_number.trim()) {
      errors.aadhar_number = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(superOwnerDetails.aadhar_number)) {
      errors.aadhar_number = "Aadhar number must be 12 digits";
    }
    // Outlets: at least one selected
    if (selectedOutlets.length === 0) {
      errors.outlets = "Please select at least one outlet";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isAuthenticated()) {
      setError("You are not authenticated. Please login again.");
      return;
    }
    if (!validate()) {
      return;
    }
    setLoading(true);

    try {
      const token = getToken();
      const response = await axios.post(
        "https://men4u.xyz/v2/admin/create_super_owner",
        {
          ...superOwnerDetails,
          outlet_ids: selectedOutlets,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setSuccess("Super owner created successfully!");
        navigate("/super-owners");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Super Owners", path: "/super-owners" },
    { label: "Create Super Owner" },
  ];

  return (
    <>
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* DataTable-style header */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="relative flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="absolute left-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Create Super Owner
              </h2>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={superOwnerDetails.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {fieldErrors.name && (
                      <p className="text-error-500 text-sm mt-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={superOwnerDetails.mobile}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {fieldErrors.mobile && (
                      <p className="text-error-500 text-sm mt-1">
                        {fieldErrors.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={superOwnerDetails.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {fieldErrors.email && (
                      <p className="text-error-500 text-sm mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={superOwnerDetails.aadhar_number}
                      onChange={handleChange}
                      placeholder="Enter Aadhar number"
                      pattern="[0-9]{12}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {fieldErrors.aadhar_number && (
                      <p className="text-error-500 text-sm mt-1">
                        {fieldErrors.aadhar_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Outlets Grid */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-4">Select Outlets</h3>
                  {fieldErrors.outlets && (
                    <p className="text-error-500 text-sm mb-1">
                      {fieldErrors.outlets}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {outlets.map((outlet) => (
                      <div
                        key={outlet.outlet_id}
                        onClick={() => handleOutletSelect(outlet.outlet_id)}
                        className={`rounded-2xl border bg-white p-4 cursor-pointer transition-all ${
                          selectedOutlets.includes(outlet.outlet_id)
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">
                                {outlet.outlet_name}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {outlet.address}
                              </p>
                            </div>
                          </div>
                          {selectedOutlets.includes(outlet.outlet_id) && (
                            <div className="text-blue-600">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modified Buttons Section */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/super-owners")}
                    className="px-4 py-2 text-sm font-medium text-gray-600 transition rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isAuthenticated()}
                    className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition rounded-full ${
                      loading || !isAuthenticated()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-success-500 hover:bg-success-600"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Create</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateSuperOwner;
