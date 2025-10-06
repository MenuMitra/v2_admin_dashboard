import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSpinner,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import { TextInput, SelectInput } from "../forms/FormElements";
import { toastController } from "../../utils/toastController";
import { API_CONFIG } from "../../config/appConfig";

const INITIAL_CUSTOMER_STATE = {
  name: "",
  mobile: "",
  is_active: true,
  outlet_id: "",
};

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customerData, setCustomerData] = useState(INITIAL_CUSTOMER_STATE);
  const [validationStates, setValidationStates] = useState({
    name: true,
    mobile: true,
    mobileMessage: "",
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const { BASE_URL, API_VERSION } = API_CONFIG;

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const customerResponse = await axios.post(
        `${BASE_URL}/admin/customer_view`,
        {
          user_id: Number(customerId),
          app_source: "admin_app",
        },
        {
          headers: { Authorization: getToken() },
        }
      );

      const { customer_details } = customerResponse.data;
      setCustomerData({
        name: customer_details.name || "",
        mobile: customer_details.mobile || "",
        is_active: customer_details.is_active === 1,
        outlet_id: customer_details.outlet_id || "",
      });
    } catch (error) {
      toastController.error(
        error.response?.data?.msg || "Failed to fetch data"
      );
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  const handleValidation = (field) => (isValid) => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  const isFormValid = () => {
    return (
      customerData.name?.trim() &&
      customerData.mobile?.trim() &&
      validationStates.name &&
      validationStates.mobile
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);

    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.patch(
        `${BASE_URL}/admin/customer_update`,
        {
          user_id: adminData?.user_id,
          customer_id: Number(customerId),
          name: customerData.name,
          mobile: customerData.mobile,
          is_active: customerData.is_active ? 1 : 0,
          outlet_id: customerData.outlet_id,
          app_source: "admin_app",
        },
        {
          headers: { Authorization: getToken() },
        }
      );

      await toastController.promise(Promise.resolve(response), {
        loading: "Updating customer...",
        success: "Customer updated successfully",
        error: (err) => err.response?.data?.msg || "Failed to update customer",
      });

      // Navigate back to customers list after successful update
      navigate(-1);
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // role handling removed

    if (name === "mobile") {
      const numbersOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);

      if (firstDigit && ["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
        setValidationStates((prev) => ({
          ...prev,
          mobile: false,
          mobileMessage: "Mobile number must start with 6, 7, 8, or 9",
        }));
        return;
      }

      setCustomerData((prev) => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates((prev) => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message,
      }));
    } else if (name === "is_active") {
      setCustomerData((prev) => ({
        ...prev,
        [name]: value === "1",
      }));
    } else {
      setCustomerData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/" },
          { label: "Customers", path: "/customer" },
          { label: "Edit Customer" },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon
                  icon={faBack}
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Edit Customer
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                form="editCustomerForm"
                disabled={isSaving || !isFormValid()}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 
                  text-sm font-medium text-white rounded-full
                  transition shadow-theme-xs
                  ${
                    isSaving || !isFormValid()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-success-500 hover:bg-success-600"
                  }
                `}
              >
                {isSaving ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-4 h-4 animate-spin"
                  />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form id="editCustomerForm" onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <TextInput
              label="Name"
              name="name"
              value={customerData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter customer name"
              validationType="name"
              onValidation={handleValidation("name")}
              isSubmitAttempted={isSubmitAttempted}
            />

            <div className="relative">
              <TextInput
                label="Mobile"
                name="mobile"
                type="tel"
                value={customerData.mobile}
                onChange={handleInputChange}
                required
                maxLength={10}
                placeholder="Enter mobile number"
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

            {/* Role removed */}

            {/* Conditional Outlet Selection */}
            {/* Outlet selection removed */}

            <SelectInput
              label="Status"
              name="is_active"
              value={customerData.is_active ? "1" : "0"}
              onChange={handleInputChange}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomer;
