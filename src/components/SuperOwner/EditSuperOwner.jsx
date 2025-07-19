import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";

function EditSuperOwner() {
  const { getToken, isAuthenticated } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { superOwnerId } = useParams();

  const [superOwnerDetails, setSuperOwnerDetails] = useState({
    user_id: adminData?.user_id || "",
    super_owner_id: superOwnerId,
    name: "",
    mobile: "",
    email: "",
    aadhar_number: "",
    app_source: "admin_app",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  // Add state for field errors
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchSuperOwnerDetails = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/view_super_owner",
        {
          user_id: adminData?.user_id,
          super_owner_id: parseInt(superOwnerId),
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.super_owner) {
        const { name, mobile, email, aadhar_number, is_active } =
          response.data.super_owner;
        setSuperOwnerDetails((prev) => ({
          ...prev,
          name,
          mobile,
          email,
          aadhar_number,
          is_active: Boolean(is_active),
          super_owner_id: parseInt(superOwnerId),
        }));
      }
    } catch (error) {
      console.error("Error fetching super owner details:", error);
      setError("Failed to fetch super owner details");
    }
  };

  useEffect(() => {
    if (superOwnerId) {
      fetchSuperOwnerDetails();
      fetchOutlets();
    }
  }, [superOwnerId]);

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/get_outlets_for_super_owner",
        {
          app_source: "admin_app",
          super_owner_id: parseInt(superOwnerId),
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
        setSelectedOutlets(
          response.data.data.outlets
            .filter((outlet) => outlet.is_currently_assigned === 1)
            .map((outlet) => outlet.outlet_id)
        );
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

  // Update handleChange for validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";
    if (name === "name") {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        error = "Name should only contain alphabets and spaces";
      }
    }
    if (name === "mobile") {
      // Only allow numbers, max 10 digits
      let numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      // Prevent first digit from being 0-5
      if (numbersOnly.length === 1 && !/[6-9]/.test(numbersOnly.charAt(0))) {
        setFieldErrors((prev) => ({
          ...prev,
          mobile:
            "Mobile must start with 6, 7, 8, or 9 and only digits allowed",
        }));
        return; // Do not update state if first digit is 0-5
      }
      setSuperOwnerDetails((prev) => ({ ...prev, [name]: numbersOnly }));
      setFieldErrors((prev) => ({ ...prev, mobile: "" }));
      return;
    }
    if (name === "email") {
      if (value && !/^([a-zA-Z0-9._%+-]+)@gmail\.com$/.test(value)) {
        error = "Email must be a valid @gmail.com address";
      }
    }
    if (name === "aadhar_number") {
      // Only allow numbers, max 12 digits
      let numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 12);
      if (value !== numbersOnly) {
        setFieldErrors((prev) => ({
          ...prev,
          aadhar_number: "Aadhar number must contain only digits",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, aadhar_number: "" }));
      }
      setSuperOwnerDetails((prev) => ({ ...prev, [name]: numbersOnly }));
      return;
    }
    setSuperOwnerDetails((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Update validation before submit
  const validate = () => {
    const errors = {};
    if (!superOwnerDetails.name.trim()) {
      errors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(superOwnerDetails.name)) {
      errors.name = "Name should only contain alphabets and spaces";
    }
    if (!superOwnerDetails.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[6-9][0-9]{9}$/.test(superOwnerDetails.mobile)) {
      errors.mobile = "Mobile must be 10 digits, start with 6, 7, 8, or 9";
    }
    if (
      superOwnerDetails.email &&
      !/^([a-zA-Z0-9._%+-]+)@gmail\.com$/.test(superOwnerDetails.email)
    ) {
      errors.email = "Email must be a valid @gmail.com address";
    }
    if (!superOwnerDetails.aadhar_number.trim()) {
      errors.aadhar_number = "Aadhar number is required";
    } else if (!/^[0-9]{12}$/.test(superOwnerDetails.aadhar_number)) {
      errors.aadhar_number = "Aadhar number must be 12 digits";
    }
    if (selectedOutlets.length === 0) {
      errors.outlets = "Please select at least one outlet";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      setError("You are not authenticated. Please login again.");
      return;
    }

    if (!validate()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      const response = await axios.put(
        "https://men4u.xyz/v2/admin/update_super_owner",
        {
          ...superOwnerDetails,
          super_owner_id: parseInt(superOwnerId),
          outlet_ids: selectedOutlets,
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setSuccess("Super owner updated successfully!");
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
    { label: "Home", path: "/home" },
    { label: "Super Owners", path: "/super-owners" },
    { label: "Edit Super Owner" },
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
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Edit Super Owner
              </h2>
            </div>

            {/* Right Side - Save Button */}
            <div className="absolute right-6">
              <button
                type="submit"
                form="superOwnerForm"
                disabled={loading || !isAuthenticated()}
                className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition rounded-full ${
                  loading || !isAuthenticated()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-success-500 hover:bg-success-600"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    <span className="hidden sm:inline">Updating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 pb-2">
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
              <form id="superOwnerForm" onSubmit={handleSubmit}>
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Name <span className="text-error-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={superOwnerDetails.name}
                      onChange={handleChange}
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
                      Mobile <span className="text-error-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={superOwnerDetails.mobile}
                      onChange={handleChange}
                      maxLength={10}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {fieldErrors.email && (
                      <p className="text-error-500 text-sm mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Aadhar Number <span className="text-error-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={superOwnerDetails.aadhar_number}
                      onChange={handleChange}
                      maxLength={12}
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

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      name="is_active"
                      value={superOwnerDetails.is_active}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Outlets Grid */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-4">Select Outlets</h3>
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditSuperOwner;
