import React from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';

function Profile() {
  const { adminData } = useAdmin();
  const navigate = useNavigate();

  // Early return if no admin data
  if (!adminData) {
    return (
      <div className="p-4 mx-auto">
        <div className="text-center py-8">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* DataTable-style header */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Profile
              </h2>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-5 dark:border-gray-800 lg:p-6">
          {/* Personal Information Section */}
          <div className="rounded-2xl dark:border-gray-800 lg:p-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <InfoField label="Name" value={adminData.name} />
                <InfoField label="Email address" value={adminData.email} />
                <InfoField label="Phone" value={adminData.mobile} />
                <InfoField label="Role" value={adminData.role} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
const InfoField = ({ label, value }) => (
  <div>
    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || 'N/A'}
    </p>
  </div>
);

export default Profile;