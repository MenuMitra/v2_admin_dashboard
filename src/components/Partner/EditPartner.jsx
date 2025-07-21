import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
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
// import MultiSelectDropdown from "../common/MultiSelectDropdown";
import {
  isNameValid,
  isEmailValid,
  isMobileValid,
  isDobValid,
  isAadharValid,
  isAddressValid,
} from "../../utils/validations";
import { toastController } from "../../utils/toastController";

function EditPartner() {
  const navigate = useNavigate();
  const { partnerId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [outlets, setOutlets] = useState([]);

  const [partnerDetails, setPartnerDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    aadhar_number: "",
    address: "",
    is_active: 0,
    functionality_ids: [],
    role: "",
    outlet_id: "", // Add outlet_id field
  });

  useEffect(() => {
    if (adminData?.user_id && partnerId) {
      fetchPartnerDetails();
    }
  }, [adminData?.user_id, partnerId]);

  useEffect(() => {
    fetchFunctionalities();
    fetchRoles();
    fetchOutlets();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        "https://men4u.xyz/v2/admin/get_ubac_functionalities",
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setFunctionalities(response.data);
    } catch (err) {
      console.error("Error fetching functionalities:", err);
      setError("Failed to load functionalities");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "https://men4u.xyz/v2/common/get_list/roles",
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles");
    }
  };

  // Uncomment and modify fetchOutlets function
  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        "https://men4u.xyz/v2/common/get_list/outlets",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const outletArray = Object.entries(response.data.outlet_list).map(([name, id]) => ({
          outlet_name: name,
          outlet_id: id
        }));
        setOutlets(outletArray);
      }
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setError("Failed to load outlets");
    }
  };

  // Modify fetchPartnerDetails to include outlet_id
  const fetchPartnerDetails = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/admin/view_partner",
        {
          partner_id: Number(partnerId), // Changed back to partner_id to match usePartnerDetails.js
          user_id: adminData.user_id,
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const funcIds = response.data.functionalities.map(
        (f) => f.functionality_id
      );
      setSelectedFunctionalities(funcIds);

      setPartnerDetails({
        name: response.data.name,
        email: response.data.email,
        mobile: response.data.mobile,
        dob: response.data.dob,
        aadhar_number: response.data.aadhar_number,
        address: response.data.address,
        is_active: response.data.is_active,
        functionality_ids: funcIds,
        role: response.data.role || "",
        outlet_id: response.data.outlet_id || "",
      });
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch partner details");
      console.error("Error fetching partner details:", err);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for mobile number
    if (name === "mobile") {
      // Only allow digits
      const onlyDigits = value.replace(/\D/g, "");

      // Check if number starts with 0-5
      if (onlyDigits.length > 0 && /^[0-5]/.test(onlyDigits)) {
        // Clear the field and show error
        setPartnerDetails((prev) => ({
          ...prev,
          [name]: "",
        }));
        setValidationErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must start with 6, 7, 8, or 9",
        }));
        return;
      }

      // Check for length validation
      if (onlyDigits.length > 0 && onlyDigits.length !== 10) {
        setValidationErrors((prev) => ({
          ...prev,
          mobile: "Mobile number must be exactly 10 digits",
        }));
      } else {
        // Clear validation error if valid
        setValidationErrors((prev) => ({
          ...prev,
          mobile: "",
        }));
      }

      setPartnerDetails((prev) => ({
        ...prev,
        [name]: onlyDigits,
      }));
      return;
    }

    // Handle other fields
    setPartnerDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error for other fields when they change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameValidation = isNameValid(partnerDetails.name);
    const emailValidation = isEmailValid(partnerDetails.email);
    const mobileValidation = isMobileValid(partnerDetails.mobile);
    const dobValidation = isDobValid(partnerDetails.dob);
    const aadharValidation = isAadharValid(partnerDetails.aadhar_number);
    const addressValidation = isAddressValid(partnerDetails.address);

    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!emailValidation.isValid) errors.email = emailValidation.message;
    if (!mobileValidation.isValid) errors.mobile = mobileValidation.message;
    if (!dobValidation.isValid) errors.dob = dobValidation.message;
    if (!aadharValidation.isValid)
      errors.aadhar_number = aadharValidation.message;
    if (!addressValidation.isValid) errors.address = addressValidation.message;

    // Mobile validation
    if (!partnerDetails.mobile) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(partnerDetails.mobile)) {
      errors.mobile = "Enter a valid 10-digit mobile number starting with 6-9";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add handleOutletChange function
  // Comment out handleOutletChange function
  /*
  const handleOutletChange = (newOutletIds) => {
    setSelectedOutlets(newOutletIds);
    setPartnerDetails(prev => ({
      ...prev,
      outlet_ids: newOutletIds
    }));
  };
  */

  // Modify handleSubmit with correct payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
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

      const response = await axios.patch(
        "https://men4u.xyz/v2/admin/update_partner",
        {
          name: partnerDetails.name,
          email: partnerDetails.email,
          mobile: partnerDetails.mobile,
          dob: formattedDate,
          aadhar_number: partnerDetails.aadhar_number,
          address: partnerDetails.address,
          is_active: partnerDetails.is_active,
          functionality_ids: selectedFunctionalities,
          role: partnerDetails.role,
          user_id: Number(partnerId),
          update_user_id: adminData.user_id,
          outlet_id: Number(partnerDetails.outlet_id),
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Partner updated successfully") {
        // Handle navigation based on role
        const roleNavigationMap = {
          // Staff roles that require outlet_id
          captain: `/captain-details/${partnerDetails.outlet_id}/${partnerId}`,
          waiter: `/waiter-details/${partnerDetails.outlet_id}/${partnerId}`,
          chef: `/chef-details/${partnerDetails.outlet_id}/${partnerId}`,
          manager: `/manager-details/${partnerDetails.outlet_id}/${partnerId}`,
          
          // Roles with their own details pages
          owner: `/owner-details/${partnerId}`,
          partner: `/partner-details/${partnerId}`,
          customer: `/customer-details/${partnerId}`,
        };

        const navigationPath = roleNavigationMap[partnerDetails.role];
        if (navigationPath) {
          navigate(navigationPath);
        } else {
          // If role not found in map, show warning and navigate to partners list
          toastController.warning(`No specific view found for role: ${partnerDetails.role}`);
          navigate('/partners');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update partner");
      console.error("Error updating partner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Partners", path: "/partners" },
    { label: "Edit Partner" },
  ];

  if (isLoading) {
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
              Edit Partner
            </h1>

            {/* Save Button */}
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
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
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
                error={validationErrors.name}
              />

              <TextInput
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={partnerDetails.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                pattern="[6-9][0-9]{9}"
                maxLength="10"
                error={validationErrors.mobile}
              />

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={partnerDetails.email}
                onChange={handleChange}
                placeholder="Enter email address"
                error={validationErrors.email}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={partnerDetails.dob}
                onChange={handleChange}
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
                error={validationErrors.aadhar_number}
              />

              {/* Active Partner Checkbox */}
              <SelectInput
                label="Partner Status"
                name="is_active"
                value={partnerDetails.is_active}
                onChange={handleChange}
                required
                options={[
                  { value: 1, label: "Active" },
                  { value: 0, label: "Inactive" },
                ]}
                placeholder="Select Status"
              />

              {/* Role */}
              <SelectInput
                label="Role"
                name="role"
                value={partnerDetails.role}
                onChange={handleChange}
                required
                options={roles.map((role) => ({
                  value: role.role_name,
                  label: role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1),
                }))}
                placeholder="Select Role"
              />

              {/* Address */}
              <div className="sm:col-span-1">
                <Textarea
                  label="Address"
                  name="address"
                  value={partnerDetails.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              {/* Add Outlet Selection to Form */}
              <SelectInput
                label="Outlet"
                name="outlet_id"
                value={partnerDetails.outlet_id}
                onChange={handleChange}
                required
                options={[
                  { value: "", label: "Select Outlet" },
                  ...outlets.map(outlet => ({
                    value: outlet.outlet_id,
                    label: outlet.outlet_name
                  }))
                ]}
                placeholder="Select Outlet"
              />
            </div>

            {/* Functionalities Section */}
            <div>
              <label className={labelStyles}>
                <span className="text-error-600 text-red-500 mr-1">*</span>
                Functionalities
              </label>
              <div className="mt-2 rounded-lg p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  {functionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="min-w-[200px] flex-1"
                    >
                      <Checkbox
                        label={func.functionality_name}
                        value={func.functionality_id}
                        checked={selectedFunctionalities.includes(
                          func.functionality_id
                        )}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setSelectedFunctionalities((prev) =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter((id) => id !== value)
                          );
                          setPartnerDetails((prev) => ({
                            ...prev,
                            functionality_ids: e.target.checked
                              ? [...prev.functionality_ids, value]
                              : prev.functionality_ids.filter(
                                  (id) => id !== value
                                ),
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outlets Section - Commented out for now */}
            {/*
            <div>
              <div className="mt-2">
                <MultiSelectDropdown
                  label="Select Outlets"
                  options={outlets}
                  selectedValues={selectedOutlets}
                  onChange={handleOutletChange}
                  displayKey="outlet_name"
                  valueKey="outlet_id"
                  searchKeys={['outlet_name']}
                  required={true}
                  placeholder="Select outlets"
                  searchPlaceholder="Search outlets..."
                />
              </div>
            </div>
            */}

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

export default EditPartner;
