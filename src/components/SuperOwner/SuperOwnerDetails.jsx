import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../Breadcrumb';
import DeleteConfirmModal from '../common/DeleteConfirmModal/DeleteConfirmModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from '../../hooks/useAdmin';
function SuperOwnerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    superOwnerData, 
    assignedOutlets, 
    assignedFunctionalities,
    totalOutlets,
    totalFunctionalities 
  } = location.state || {};

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/home' },
    { label: 'Super Owners', path: '/super-owners' },
    { label: 'Details' }
  ];

  if (!superOwnerData) {
    return (
      <div className="p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No super owner data available
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete(
        'https://men4u.xyz/v2/admin/delete_super_owner',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          data: {
            user_id: adminData.user_id, // You might want to get this from adminData
            super_owner_id: superOwnerData.super_owner_id,
            app_source: 'admin_app'
          }
        }
      );

      // Close modal and navigate back to list
      setIsModalOpen(false);
      navigate('/super-owners');
    } catch (error) {
      console.error('Error deleting super owner:', error);
      alert('Failed to delete super owner');
    }
  };

  return (
    <>
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Replace the existing header with DataTable-style header */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button 
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-left" className="svg-inline--fa fa-chevron-left w-4 h-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"></path>
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Super Owner Details
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center justify-end order-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/edit-super-owner/${superOwnerData.super_owner_id}`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
                  style={{ backgroundColor: '#f7941d' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 hover:bg-error-600 shadow-theme-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white p-6">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.name}</p>
                <p className="text-sm text-gray-500">Name</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.email}</p>
                <p className="text-sm text-gray-500">Email</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.mobile}</p>
                <p className="text-sm text-gray-500">Mobile</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.aadhar_number}</p>
                <p className="text-sm text-gray-500">Aadhar Number</p>
              </div>
            </div>
          </div>

          {/* Assigned Outlets Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Assigned Outlets ({totalOutlets})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {assignedOutlets.map((outlet) => (
                <Link
                  key={outlet.outlet_id}
                  to={`/view-outlet/${outlet.outlet_id}`}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <h4 className="text-sm font-medium mb-1 text-gray-800 hover:text-brand-600">
                    {outlet.outlet_name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>

          {/* Assigned Functionalities Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Assigned Functionalities ({totalFunctionalities})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {assignedFunctionalities.map((func) => (
                <div key={func.functionality_id} className="p-4">
                  <p className="text-sm font-medium mb-1">{func.functionality_name}</p>
                  <p className="text-sm text-gray-500">Functionality</p>
                </div>
              ))}
            </div>
          </div>
          

          {/* Status Information Section */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-4">Status Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="p-4">
                <div className="mt-1 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={superOwnerData.is_active ? faCircleCheck : faCircleXmark}
                    className={`w-5 h-5 ${
                      superOwnerData.is_active ? "text-success-500" : "text-error-500"
                    }`}
                  />
                  <span
                    className={`text-base font-medium ${
                      superOwnerData.is_active ? "text-success-700" : "text-error-700"
                    }`}
                  >
                    {superOwnerData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Account Status</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.created_on}</p>
                <p className="text-sm text-gray-500">Created On</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">{superOwnerData.updated_on}</p>
                <p className="text-sm text-gray-500">Last Updated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use reusable DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you ?."
      />
    </>
  );
}

export default SuperOwnerDetails;