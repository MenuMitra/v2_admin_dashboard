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

const INITIAL_CUSTOMER_STATE = {
  name: "",
  mobile: "",
  role: "customer",
  is_active: true,
};

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [customerData, setCustomerData] = useState(INITIAL_CUSTOMER_STATE);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [customerResponse, rolesResponse] = await Promise.all([
        axios.post(
          "https://men4u.xyz/v2/admin/customer_view",
          {
            user_id: Number(customerId),
            app_source: "admin_dashboard",
          },
          {
            headers: { Authorization: getToken() },
          }
        ),
        axios.get("https://men4u.xyz/v2/common/list_roles", {
          headers: { Authorization: getToken() },
        }),
      ]);

      const { customer_details } = customerResponse.data;
      setCustomerData({
        name: customer_details.name || "",
        mobile: customer_details.mobile || "",
        role: customer_details.role || "customer",
        is_active: customer_details.is_active === 1,
      });
      setRoles(rolesResponse.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await axios.patch(
        "https://men4u.xyz/v2/admin/customer_update",
        {
          user_id: adminData?.user_id,
          customer_id: Number(customerId),
          name: customerData.name,
          mobile: customerData.mobile,
          role: customerData.role,
          is_active: customerData.is_active ? 1 : 0,
          app_source: "admin_dashboard"
        },
        {
          headers: { Authorization: getToken() },
        }
      );

      if (response.data?.detail) {
        toastController.success("Customer updated successfully");
        navigate(-1);
      }
    } catch (error) {
      toastController.error(
        error.response?.data?.msg || "Failed to update customer"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "1" : value,
    }));
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
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
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
            />

            <TextInput
              label="Mobile"
              name="mobile"
              value={customerData.mobile}
              onChange={handleInputChange}
              required
              placeholder="Enter mobile number"
              validationType="phone"
            />

            <SelectInput
              label="Role"
              name="role"
              value={customerData.role}
              onChange={handleInputChange}
              options={roles.map(role => ({
                value: role.role_name,
                label: role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)
              }))}
            />

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
