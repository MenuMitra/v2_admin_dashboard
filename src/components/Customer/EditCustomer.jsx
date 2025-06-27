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
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import { TextInput, SelectInput, DateInput } from "../forms/FormElements";
import { toastController } from "../../utils/toastController";

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState({
    name: "",
    mobile: "",
    email: "",
    role: "customer",
    address: "",
    dob: "",
    is_active: true,
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/admin/customer_view",
        {
          user_id: Number(customerId),
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      const { customer_details } = response.data;
      setCustomerData({
        name: customer_details.name || "",
        mobile: customer_details.mobile || "",
        email: customer_details.email || "",
        role: customer_details.role || "customer",
        address: customer_details.address || "",
        dob: customer_details.dob || "",
        is_active: customer_details.is_active === 1,
      });
    } catch (err) {
      toastController.error(
        err.response?.data?.msg || "Failed to fetch customer details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.patch(
        "https://men4u.xyz/v2/admin/customer_update",
        {
          user_id: adminData?.user_id,
          customer_id: Number(customerId),
          name: customerData.name,
          email: customerData.email,
          mobile: customerData.mobile,
          address: customerData.address,
          dob: customerData.dob,
          is_active: customerData.is_active ? 1 : 0,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
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
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Customers", path: "/customer" },
    { label: "Edit Customer" },
  ];

  if (loading) {
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
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
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
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={loading ? faCheck : faSave}
                  className="w-4 h-4"
                />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
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

            <TextInput
              label="Email"
              name="email"
              value={customerData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              validationType="email"
            />

            <TextInput
              label="Address"
              name="address"
              value={customerData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
            />

            <DateInput
              label="Date of Birth"
              name="dob"
              value={customerData.dob}
              onChange={handleInputChange}
              placeholder="Select date of birth"
              required
            />

            <SelectInput
              label="Role"
              name="role"
              value={customerData.role}
              onChange={handleInputChange}
              options={[
                { value: "customer", label: "Customer" }
              ]}
            />

            <SelectInput
              label="Status"
              name="is_active"
              value={customerData.is_active ? "1" : "0"}
              onChange={(e) =>
                setCustomerData((prev) => ({
                  ...prev,
                  is_active: e.target.value === "1",
                }))
              }
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
