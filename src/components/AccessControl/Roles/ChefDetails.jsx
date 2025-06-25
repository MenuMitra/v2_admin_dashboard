import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronLeft as faBack,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";

function ChefDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [chefData, setChefData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChefDetails();
  }, [outletId, userId]);

  const fetchChefDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/chef_view",
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setChefData(response.data.detail);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch chef details");
    } finally {
      setLoading(false);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <p className="text-gray-900">{chefData?.name || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
          <p className="text-gray-900">{chefData?.mobile || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="text-gray-900">{chefData?.email || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
          <p className="text-gray-900">{chefData?.aadhar_number || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <p className="text-gray-900">{chefData?.dob || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <p className="text-gray-900">{chefData?.address || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <p className={`text-gray-900 ${chefData?.is_active === 1 ? 'text-success-600' : 'text-error-600'}`}>
            {chefData?.is_active === 1 ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <p className="text-gray-900">{chefData?.created_by || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
          <p className="text-gray-900">{chefData?.created_on || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
          <p className="text-gray-900">{chefData?.updated_by || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Updated On</label>
          <p className="text-gray-900">{chefData?.updated_on || '-'}</p>
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
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Chef Details
            </div>
            <div className="w-20"></div>
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
    </div>
  );
}

export default ChefDetails;