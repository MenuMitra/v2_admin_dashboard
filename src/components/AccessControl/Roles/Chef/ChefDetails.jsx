import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronLeft as faBack,
  faSpinner,
  faPen as faEdit,
  faTrash as faDelete
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../Breadcrumb";
import { toastController } from "../../../../utils/toastController";
import Modal from "../../../common/Modal";
import { API_CONFIG } from "../../../../config/appConfig";

function ChefDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [chefData, setChefData] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {BASE_URL, API_VERSION} = API_CONFIG;

  useEffect(() => {
    fetchChefDetails();
  }, [outletId, userId]);

  const fetchChefDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/chef_view`,
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setChefData(response.data.detail);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to fetch chef details";
      toastController.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!token) {
        toastController.error("Authentication token not found");
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/chef_delete`, {
          data: {
            update_user_id: adminData?.user_id,
            user_id: Number(userId),
            outlet_id: Number(outletId),
            app_source: "admin_app"
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          }
        }),
        {
          loading: "Deleting chef...",
          success: "Chef deleted successfully",
          error: "Failed to delete chef"
        }
      );
      
      navigate(`/view-outlet/${outletId}`);
    } catch (err) {
      toastController.error(err.response?.data?.msg || "Failed to delete chef");
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Chefs", path: "/chefs" },
    { label: "Chef Details" },
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

  const renderChefDetails = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div>
          <p className="text-gray-900">{chefData?.name || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.mobile || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.email || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.aadhar_number || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.dob || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.address || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        </div>

        <div>
          <p className={`text-gray-900 ${chefData?.is_active === 1 ? 'text-success-600' : 'text-error-600'}`}>
            {chefData?.is_active === 1 ? 'Active' : 'Inactive'}
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.created_by || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.created_on || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.updated_by || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
        </div>

        <div>
          <p className="text-gray-900">{chefData?.updated_on || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated On</label>
        </div>
      </div>
    );
  };

  const renderFunctionalities = () => {
    if (!chefData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Functionalities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {chefData.functionalities.map((func) => (
            <div
              key={func.functionality_id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700">{func.functionality_name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Chef Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-chef/${outletId}/${userId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
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

        {/* Content Section */}
        <div className="p-6">
          {error ? (
            <div className="text-error-500 text-center">{error}</div>
          ) : (
            <>
              {renderChefDetails()}
              {renderFunctionalities()}
            </>
          )}
        </div>
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
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleDelete();
                setShowDeleteModal(false);
              }}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this chef? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this chef will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ChefDetails;