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

function CaptainDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [captainData, setCaptainData] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCaptainDetails();
  }, [outletId, userId]);

  const fetchCaptainDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/captain_view",
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId)
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setCaptainData(response.data.data); // Note: Changed from response.data.detail to response.data.data
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch captain details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.post(
        "https://men4u.xyz/v2/admin/captain_delete",
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId)
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete captain");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Captains", path: "/captains" },
    { label: "Captain Details" },
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

  const renderCaptainDetails = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <p className="text-gray-900">{captainData?.name || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
          <p className="text-gray-900">{captainData?.mobile || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="text-gray-900">{captainData?.email || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
          <p className="text-gray-900">{captainData?.aadhar_number || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <p className="text-gray-900">{captainData?.dob || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <p className="text-gray-900">{captainData?.address || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <p className={`text-gray-900 ${captainData?.is_active === 1 ? 'text-success-600' : 'text-error-600'}`}>
            {captainData?.is_active === 1 ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <p className="text-gray-900">{captainData?.created_by || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
          <p className="text-gray-900">{captainData?.created_on || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
          <p className="text-gray-900">{captainData?.updated_by || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated On</label>
          <p className="text-gray-900">{captainData?.updated_on || '-'}</p>
        </div>
      </div>
    );
  };

  const renderFunctionalities = () => {
    if (!captainData?.functionalities?.length) return null;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Functionalities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {captainData.functionalities.map((func) => (
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
              Captain Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-captain/${outletId}/${userId}`)}
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
              {renderCaptainDetails()}
              {renderFunctionalities()}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Captain</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this captain? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-error-600 rounded-lg hover:bg-error-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaptainDetails;