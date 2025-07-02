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
import Modal from "../../../common/Modal";
import { toastController } from "../../../../utils/toastController";

function ManagerDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [managerData, setManagerData] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchManagerDetails();
  }, [outletId, userId]);

  const fetchManagerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/manager_view",
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
      setManagerData(response.data.detail);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch manager details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await axios.delete("https://men4u.xyz/v2/common/manager_delete", {
        data: {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_app"
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        },
      });
      toastController.success("Manager deleted successfully");
      navigate(`/view-outlet/${outletId}`);
    } catch (err) {
      toastController.error(err.response?.data?.msg || "Failed to delete manager");
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Managers", path: "/managers" },
    { label: "Manager Details" },
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

  const renderManagerDetails = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div>
          <p className="text-gray-900">{managerData?.name || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.mobile || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.email || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.aadhar_number || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.dob || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.address || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        </div>

        <div>
          <p className={`text-gray-900 ${managerData?.is_active ? 'text-success-600' : 'text-error-600'}`}>
            {managerData?.is_active ? 'Active' : 'Inactive'}
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.created_by || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.created_on || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.updated_by || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
        </div>

        <div>
          <p className="text-gray-900">{managerData?.updated_on || '-'}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated On</label>
        </div>
      </div>
    );
  };

  const renderFunctionalities = () => {
    if (!managerData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Functionalities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {managerData.functionalities.map((func) => (
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
              Manager Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-manager/${outletId}/${userId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <FontAwesomeIcon icon={faDelete} className="w-4 h-4" />
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
              {renderManagerDetails()}
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
              Delete Manager
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this manager? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this manager will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ManagerDetails;