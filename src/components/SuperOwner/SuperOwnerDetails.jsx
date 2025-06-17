import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../Breadcrumb';

function SuperOwnerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { 
    superOwnerData, 
    assignedOutlets, 
    assignedFunctionalities,
    totalOutlets,
    totalFunctionalities 
  } = location.state || {};

  // Add counts object for DataTable header
  const counts = {
    total: 1,  // Since we're viewing a single super owner
    active: superOwnerData?.account_status ? 1 : 0,
    inactive: superOwnerData?.account_status ? 0 : 1
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
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
    navigate('/super-owners');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
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
            user_id: 1, // You might want to get this from adminData
            super_owner_id: superOwnerData.super_owner_id,
            app_source: 'admin_dashboard'
          }
        }
      );

      // Close modal and navigate back to list
      setIsModalOpen(false);
      navigate('/super-owners');
    } catch (error) {
      console.error('Error deleting super owner:', error);
      alert('Failed to delete super owner');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
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

          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-4 sm:gap-6 text-sm overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
              <span className="font-medium text-gray-800">
                Total: {counts.total}
              </span>
              <span className="text-success-600">
                Active: {counts.active}
              </span>
              <span className="text-error-500">
                Inactive: {counts.inactive}
              </span>
            </div>
          </div>
        </div>

        {/* Existing content */}
        <div className="bg-white p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{superOwnerData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{superOwnerData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{superOwnerData.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aadhar Number</p>
                  <p className="font-medium">{superOwnerData.aadhar_number}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Status Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    superOwnerData.account_status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {superOwnerData.account_status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created On</p>
                  <p className="font-medium">{superOwnerData.created_on}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{superOwnerData.updated_on}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Assigned Outlets ({totalOutlets})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedOutlets.map((outlet) => (
                <div key={outlet.outlet_id} className="border rounded-lg p-4">
                  <h4 className="font-medium">{outlet.outlet_name}</h4>
                  <p className="text-sm text-gray-500">{outlet.address}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      outlet.outlet_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {outlet.outlet_status ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      outlet.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {outlet.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Assigned Functionalities ({totalFunctionalities})</h3>
            <div className="flex flex-wrap gap-2">
              {assignedFunctionalities.map((func) => (
                <span key={func.functionality_id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {func.functionality_name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this super owner? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 transition rounded-lg border border-gray-300 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-error-500 hover:bg-error-600 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperOwnerDetails;