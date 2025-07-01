import React, { useState, useEffect } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAuth } from "../../../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faLocationDot,
  faCalendarDays,
  faClock,
  faCircleCheck,
  faShoppingCart,
  faCreditCard,
  faBan,
  faKitchenSet,
  faClipboardList,
  faCheck,
  faMoneyBill,
  faChartLine,
  faSpinner,
  faArrowLeft,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";
import Modal from "../../common/Modal";
import { toastController } from "../../../utils/toastController";
import { API_CONFIG } from "../../../config/appConfig";

const { BASE_URL, API_VERSION } = API_CONFIG;

// Role-specific components
const CustomerDetails = ({ data }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Name</p>
      </div>
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.mobile}</p>
        <p className="text-xs sm:text-sm text-gray-500">Mobile</p>
      </div>
      {/* Keep existing customer fields */}
    </div>
    {/* Keep existing order statistics section */}
  </div>
);

const CaptainDetails = ({ data }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Name</p>
      </div>
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.total_orders_served}</p>
        <p className="text-xs sm:text-sm text-gray-500">Orders Served</p>
      </div>
      {/* Add captain-specific fields */}
    </div>
  </div>
);

const WaiterDetails = ({ data }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Name</p>
      </div>
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.tables_assigned}</p>
        <p className="text-xs sm:text-sm text-gray-500">Tables Assigned</p>
      </div>
      {/* Add waiter-specific fields */}
    </div>
  </div>
);

const ChefDetails = ({ data }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Name</p>
      </div>
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.orders_prepared}</p>
        <p className="text-xs sm:text-sm text-gray-500">Orders Prepared</p>
      </div>
      {/* Add chef-specific fields */}
    </div>
  </div>
);

const ManagerDetails = ({ data }) => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.name}</p>
        <p className="text-xs sm:text-sm text-gray-500">Name</p>
      </div>
      <div>
        <p className="text-base sm:text-lg font-medium text-gray-800">{data.outlets_managed}</p>
        <p className="text-xs sm:text-sm text-gray-500">Outlets Managed</p>
      </div>
      {/* Add manager-specific fields */}
    </div>
  </div>
);

function RoleDetails() {
  const { userId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userId && adminData?.user_id) {
      fetchStaffDetails();
    }
  }, [userId, adminData?.user_id]);

  const fetchStaffDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/user_view`,
        {
          user_id: adminData?.user_id,
          staff_id: userId,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      setStaffData(response.data);
    } catch (error) {
      toastController.error(error.response?.data?.msg || "Failed to fetch staff details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/${API_VERSION}/admin/customer_delete`,
        {
          headers: {
            Authorization: getToken(),
          },
          data: {
            user_id: adminData?.user_id,
            customer_id: userId,
            app_source: "admin_dashboard"
          }
        }
      );

      toastController.success("Customer deleted successfully");
      navigate(-1);
    } catch (error) {
      toastController.error(error.response?.data?.msg || "Failed to delete customer");
      setShowDeleteModal(false); // Close the modal on error
    }
  };

  // Update getRoleTitle to use staff_details
  const getRoleTitle = (role) => {
    if (!role) return 'Details';
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Details`;
  };

  // Update breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: staffData?.staff_details?.role || "Role", path: "/staff" },
    { label: getRoleTitle(staffData?.staff_details?.role) }
  ];

  const renderRoleSpecificDetails = () => {
    if (!staffData) return null;

    const roleComponents = {
      customer: CustomerDetails,
      captain: CaptainDetails,
      waiter: WaiterDetails,
      chef: ChefDetails,
      manager: ManagerDetails
    };

    const RoleComponent = roleComponents[staffData.staff_details?.role?.toLowerCase()] || CustomerDetails;
    return <RoleComponent data={staffData.staff_details} />;
  };

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
              {getRoleTitle(staffData?.staff_details?.role)}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-staff/${userId}`)}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
        {renderRoleSpecificDetails()}
      </div>

      {/* Add Delete Confirmation Modal at the end of the component */}
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

// Updated StatCard component with swapped label and value positions
const StatCard = ({ icon, label, value, className }) => (
  <div className={`bg-gray-50 rounded-lg p-3 sm:p-4 ${className}`}>
    {/* Value on top */}
    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
        {value}
      </p>
      <FontAwesomeIcon
        icon={icon}
        className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500"
      />
    </div>
    {/* Label below */}
    <span className="text-xs sm:text-sm text-gray-500 line-clamp-1">
      {label}
    </span>
  </div>
);

export default RoleDetails;
