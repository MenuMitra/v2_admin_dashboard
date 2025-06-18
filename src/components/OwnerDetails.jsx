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
  faUserTie,
  faCalendarPlus,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./common/Modal";

function OwnerDetails() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      const response = await axios.post(
        "https://men4u.xyz/v2/common/view_owner",
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

      await axios.delete("https://men4u.xyz/v2/admin/delete_owner", {
        data: {
          owner_id: parseInt(ownerId),
          user_id: adminData.user_id,
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      navigate(-1);
    } catch (error) {
      console.error("Error deleting owner:", error);
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
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-xs mb-6">
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
                  <div className="text-base font-medium">{ownerData.mobile}</div>
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
                  <div className="text-base font-medium">{ownerData.aadhar_number}</div>
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
                  <div className="text-base font-medium">{ownerData.address}</div>
                  <div className="text-sm text-gray-500">Address</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-theme-xs">
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

              {/* Account Status */}
              <div className="flex items-center p-3 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <div className="ml-3">
                  <div>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        ownerData.is_active === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ownerData.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                    <div className="text-sm text-gray-500">Account Status</div>
                  </div>
                </div>
              </div>

              {/* Staff Status */}
              <div className="flex items-center p-3 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUserTie}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <div className="ml-3">
                  <div>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        ownerData.is_staff === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ownerData.is_staff === 1 ? "Yes" : "No"}
                    </span>
                    <div className="text-sm text-gray-500">Staff Status</div>
                  </div>
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
                  <div className="text-base font-medium">{ownerData.created_on}</div>
                  <div className="text-sm text-gray-500">Created On</div>
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
                  <div className="text-base font-medium">{ownerData.updated_on}</div>
                  <div className="text-sm text-gray-500">Updated On</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              onClick={handleDeleteOwner}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete Owner
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this owner? This action cannot be
              undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this owner will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default OwnerDetails;
