import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faCalendarDays,
  faCircleCheck,
  faSpinner,
  faChevronLeft as faBack,
  faShoppingCart,
  faCreditCard,
  faMoneyBill,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import Modal from "../common/Modal";
import { toastController } from "../../utils/toastController";

function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      setCustomerData(response.data);
    } catch (err) {
      toastController.error(err.response?.data?.msg || "Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(
        "https://men4u.xyz/v2/admin/customer_delete",
        {
          headers: {
            Authorization: getToken(),
          },
          data: {
            user_id: adminData?.user_id,
            customer_id: customerId,
            app_source: "admin_dashboard"
          }
        }
      );
      toastController.success("Customer deleted successfully");
      navigate(-1);
    } catch (error) {
      toastController.error(error.response?.data?.msg || "Failed to delete customer");
      setShowDeleteModal(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Customers", path: "/customer" },
    { label: "Customer Details" }
  ];

  const renderCustomerDetails = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Name */}
        <div>
          <p className="text-base font-medium text-gray-800">
            {customerData?.customer_details?.name}
          </p>
          <p className="text-sm text-gray-500">Name</p>
        </div>

        {/* Mobile */}
        <div>
          <p className="text-base font-medium text-gray-800">
            {customerData?.customer_details?.mobile}
          </p>
          <p className="text-sm text-gray-500">Mobile</p>
        </div>

        {/* Email */}
        {customerData?.customer_details?.email && customerData.customer_details.email !== "null" && (
          <div>
            <p className="text-base font-medium text-gray-800 truncate">
              {customerData.customer_details.email}
            </p>
            <p className="text-sm text-gray-500">Email</p>
          </div>
        )}

        {/* Created On */}
        <div>
          <p className="text-base font-medium text-gray-800">
            {customerData?.customer_details?.created_on}
          </p>
          <p className="text-sm text-gray-500">Created On</p>
        </div>

        {/* Last Login */}
        {customerData?.customer_details?.last_login && (
          <div>
            <p className="text-base font-medium text-gray-800">
              {customerData.customer_details.last_login}
            </p>
            <p className="text-sm text-gray-500">Last Login</p>
          </div>
        )}

        {/* Account Status */}
        <div>
          <p className={`text-base font-medium ${
            customerData?.customer_details?.is_active ? "text-green-600" : "text-red-600"
          }`}>
            {customerData?.customer_details?.is_active ? "Active" : "Inactive"}
          </p>
          <p className="text-sm text-gray-500">Account Status</p>
        </div>
      </div>
    </div>
  );

  const renderOrderStatistics = () => (
    <div className="p-6 border-t">
      <h2 className="text-xl font-medium mb-6 text-gray-800">Order Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-base font-medium text-gray-800">
              {customerData?.order_statistics?.total_orders}
            </p>
            <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-sm text-gray-500">Total Orders</span>
        </div>

        {/* Paid Orders */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-base font-medium text-gray-800">
              {customerData?.order_statistics?.paid_orders}
            </p>
            <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-sm text-gray-500">Paid Orders</span>
        </div>

        {/* Total Spent */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-base font-medium text-gray-800">
              ₹{customerData?.order_statistics?.total_spent}
            </p>
            <FontAwesomeIcon icon={faMoneyBill} className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-sm text-gray-500">Total Spent</span>
        </div>

        {/* Average Order Value */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-base font-medium text-gray-800">
              ₹{customerData?.order_statistics?.average_order_value}
            </p>
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-sm text-gray-500">Avg. Order Value</span>
        </div>
      </div>
    </div>
  );

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
            {/* Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Customer Details
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-customer/${customerId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Updated Content Sections */}
        {renderCustomerDetails()}
        {renderOrderStatistics()}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="error"
        title="Confirm Deletion"
        size="small"
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteCustomer}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete Customer
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this customer will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CustomerDetails;
