import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

function PartnerDetails() { 
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (adminData?.user_id && partnerId) {
      fetchPartnerDetails();
    }
  }, [adminData?.user_id, partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_partner',
        {
          partner_id: Number(partnerId),
          user_id: adminData.user_id
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setPartner(response.data);
    } catch (err) {
      setError('Failed to fetch partner details');
      console.error('Error fetching partner details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Partners', path: '/partners' },
    { label: 'View', path: '#' }
  ];

  return (
    <>
      {/* Replace manual breadcrumb with Breadcrumb component */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Edit */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Partner Details
            </div>

            {/* Right Side - Status and Edit */}
            <div className="flex items-center gap-4 order-3">
              <button
                onClick={() => navigate(`/edit-partner/${partnerId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rest of the content */}
        {partner && (
          <>
            {/* Personal Information */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.email}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.mobile}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.address}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.dob}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.aadhar_number}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aadhar Number</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Account Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.role}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                </div>

                {/* Account Status */}
                <div>
                  <div className="mt-1 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={partner.account_status === 1 ? faCircleCheck : faCircleXmark}
                      className={`w-5 h-5 ${
                        partner.account_status === 1 ? "text-success-500" : "text-error-500"
                      }`}
                    />
                    <span
                      className={`text-base font-medium ${
                        partner.account_status === 1 ? "text-success-700" : "text-error-700"
                      }`}
                    >
                      {partner.account_status === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                </div>

                {/* Active Status */}
                <div>
                  <div className="mt-1 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={partner.is_active === 1 ? faCircleCheck : faCircleXmark}
                      className={`w-5 h-5 ${
                        partner.is_active === 1 ? "text-success-500" : "text-error-500"
                      }`}
                    />
                    <span
                      className={`text-base font-medium ${
                        partner.is_active === 1 ? "text-success-700" : "text-error-700"
                      }`}
                    >
                      {partner.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Status</p>
                </div>

                {/* <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.is_staff === 1 ? 'Yes' : 'No'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Staff Status</p>
                </div> */}

                {/* <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.is_superuser === 1 ? 'Yes' : 'No'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Superuser Status</p>
                </div> */}
              </div>
            </div>

            {/* Audit Information */}
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Audit Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.created_on}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.created_by}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.updated_on}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Updated On</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    {partner.updated_by}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Updated By</p>
                </div>
              </div>
            </div>

            {/* Functionalities */}
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Functionalities
              </h2>
              <div className="flex flex-wrap gap-2">
                {partner.functionalities.map(func => (
                  <span 
                    key={func.functionality_id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {func.functionality_name.replace(/_/g, ' ').toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default PartnerDetails;