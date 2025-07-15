import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faUser,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faIdCard,
  faLocationDot,
  faUserTag,
  faUserCheck,
  faCalendarPlus,
  faCalendarCheck,
  faCircleCheck,
  faCircleXmark,
  faStore,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import Breadcrumb from "./Breadcrumb";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";

function OwnerDetails() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Owners", path: "/owners" },
    { label: "Owner Details", path: `/owner-details/${ownerId}` },
  ];

  useEffect(() => {
    if (adminData?.user_id && ownerId) {
      fetchOwnerDetails();
    }
  }, [adminData?.user_id, ownerId]);

  const fetchOwnerDetails = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/view_owner`,
          {
            user_id: adminData.user_id,
            owner_id: parseInt(ownerId),
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: 'Loading owner details...',
          success: 'Owner details loaded successfully!',
          error: 'Failed to load owner details'
        }
      );

      setOwnerData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching owner details:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteOwner = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/delete_owner`, {
          data: {
            owner_id: parseInt(ownerId),
            user_id: adminData.user_id,
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: 'Deleting owner...',
          success: 'Owner deleted successfully!',
          error: 'Failed to delete owner'
        }
      );

      navigate(-1);
    } catch (error) {
      console.error("Error deleting owner:", error);
      // toastController.error("Failed to delete owner: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No owner data found</div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section - Matching DataTable.jsx style */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Owner Details
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-owner/${ownerId}`)}
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

          {/* Content Section */}
          <div className="px-6 py-4">
            {/* Personal Information Card */}
              <h2 className="text-base font-medium mb-4 text-gray-800">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Name */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{ownerData.name}</div>
                    <div className="text-sm text-gray-500">Name</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{ownerData.email}</div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.mobile}
                    </div>
                    <div className="text-sm text-gray-500">Mobile</div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBirthdayCake}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{ownerData.dob}</div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                  </div>
                </div>

                {/* Aadhar Number */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.aadhar_number}
                    </div>
                    <div className="text-sm text-gray-500">Aadhar Number</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.address}
                    </div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              </div>
            

            {/* Account Information Card */}
            
              <h2 className="text-base font-medium mb-4 text-gray-800">
                Account Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Role */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{ownerData.role}</div>
                    <div className="text-sm text-gray-500">Role</div>
                  </div>
                </div>

                {/* Account Type */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.account_type?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">Account Type</div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="mt-1 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={
                          ownerData.is_active === 1
                            ? faCircleCheck
                            : faCircleXmark
                        }
                        className={`w-5 h-5 ${
                          ownerData.is_active === 1
                            ? "text-success-500"
                            : "text-error-500"
                        }`}
                      />
                      <span
                        className={`text-base font-medium ${
                          ownerData.is_active === 1
                            ? "text-success-700"
                            : "text-error-700"
                        }`}
                      >
                        {ownerData.is_active === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Account Status</div>
                  </div>
                </div>

                {/* Created On */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.created_on || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created On</div>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.created_by?.toUpperCase() || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>

                {/* Updated On */}
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.updated_on}
                    </div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {ownerData.updated_by?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">Updated By</div>
                  </div>
                </div>
              </div>
            

            {/* Add new Outlets section */}
            {ownerData?.outlets && ownerData.outlets.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Associated Outlets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ownerData.outlets.map((outlet) => (
                    <div
                      key={outlet.outlet_id}
                      onClick={() => navigate(`/view-outlet/${outlet.outlet_id}`)}
                      className="group flex items-center p-4 rounded-xl border border-gray-200 
                        hover:border-brand-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg 
                        bg-gray-100 group-hover:bg-brand-50"
                      >
                        <FontAwesomeIcon
                          icon={faStore}
                          className="w-5 h-5 text-gray-600 group-hover:text-brand-500"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-base font-medium text-gray-900 group-hover:text-brand-600 
                          flex items-center justify-between"
                        >
                          {outlet.name}
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="w-4 h-4 text-gray-400 group-hover:text-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new Functionalities section */}
            {ownerData?.functionalities && ownerData.functionalities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Access Functionalities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ownerData.functionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm
                        bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {func.functionality_name.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteOwner}
        />
      </div>
    </>
  );
}

export default OwnerDetails;
