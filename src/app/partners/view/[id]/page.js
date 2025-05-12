'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiCreditCard, 
  FiArrowLeft, 
  FiEdit, 
  FiAlertCircle, 
  FiTrash2, 
  FiCheck, 
  FiClock, 
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import partnerService from '@/api/services/partnerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';
import Modal from '@/components/ui/Modal';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Info Item component with label below value
const InfoItem = ({ icon: Icon, label, value, iconClass = 'text-gray-600' }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center mb-1">
      <Icon className={`mr-2 ${iconClass}`} size={18} />
      <span className="text-base font-semibold text-gray-900">{value || 'N/A'}</span>
    </div>
    <div className="text-sm font-medium text-gray-500 pl-6">{label}</div>
  </div>
);

// Status badge component
const StatusBadge = ({ status, label }) => {
  const isActive = status;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          {label}
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
          {label === 'Active' ? 'Inactive' : 'Inactive'}
        </>
      )}
    </span>
  );
};

export default function ViewPartnerPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const partnerId = unwrappedParams.id;
  
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    
    fetchPartnerDetails();
  }, []);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const partnerDetails = await partnerService.viewPartner(partnerId, userId);
      
      if (partnerDetails.detail && typeof partnerDetails.detail === 'string' && !partnerDetails.name) {
        // This is an error response from the API
        setError(partnerDetails.detail);
        setLoading(false);
        return;
      }
      
      setPartner(partnerDetails);
    } catch (error) {
      console.error('Failed to fetch partner details:', error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || 'Failed to load partner details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/partners/edit/${partnerId}`);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await partnerService.deletePartner(partnerId, userId);
      
      if (response.detail) {
        if (response.detail.includes("successfully")) {
          toast.success(response.detail);
          router.push('/partners');
        } else {
          // Set error to the exact API error message
          setError(response.detail);
          setShowDeleteModal(false);
        }
      } else {
        toast.success('Partner deleted successfully');
        router.push('/partners');
      }
    } catch (error) {
      console.error('Failed to delete partner:', error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || 'Failed to delete partner');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const goBack = () => {
    router.push('/partners');
  };

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!partner) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete this partner? This action cannot be undone. All data associated with this partner will be permanently removed.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:bg-red-300"
          >
            {loading ? 'Deleting...' : 'Delete Partner'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-200 rounded-md mr-6"></div>
              <div className="flex-1">
                <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-60 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Partner Not Found</h2>
          <p className="text-gray-600 mb-6">The partner you are looking for could not be found or you don't have permission to view it.</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Partner Details</h1>
          <p className="text-gray-600">View detailed information about {partner.name}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Partners
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiEdit className="mr-2 h-4 w-4" />
            Edit Partner
          </button>
          <button
            onClick={confirmDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <FiTrash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Partner Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center mr-6 mb-4 md:mb-0">
            <FiUser className="text-gray-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{partner.name}</h2>
            {partner.email && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <FiMail className="mr-2 text-gray-400" />
                {partner.email}
              </div>
            )}
            {partner.mobile && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <FiPhone className="mr-2 text-gray-400" />
                {partner.mobile}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <StatusBadge status={partner.account_status} label="Active" />
            <StatusBadge status={partner.is_active} label="Active" />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem 
            icon={FiUser} 
            label="Name" 
            value={partner.name} 
          />
          <InfoItem 
            icon={FiMail} 
            label="Email Address" 
            value={partner.email} 
          />
          <InfoItem 
            icon={FiPhone} 
            label="Mobile Number" 
            value={partner.mobile} 
          />
          <InfoItem 
            icon={FiMapPin} 
            label="Address" 
            value={partner.address} 
          />
          <InfoItem 
            icon={FiCalendar} 
            label="Date of Birth" 
            value={formatDate(partner.dob)} 
          />
          <InfoItem 
            icon={FiCreditCard} 
            label="Aadhar Number" 
            value={partner.aadhar_number} 
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem 
            icon={FiShield} 
            label="Role" 
            value={partner.role} 
          />
          <InfoItem 
            icon={partner.account_status ? FiCheckCircle : FiXCircle} 
            label="Account Status" 
            value={partner.account_status ? 'Active' : 'Inactive'} 
            iconClass={partner.account_status ? 'text-green-600' : 'text-red-600'}
          />
          <InfoItem 
            icon={partner.is_active ? FiCheckCircle : FiXCircle} 
            label="Active Status" 
            value={partner.is_active ? 'Active' : 'Inactive'} 
            iconClass={partner.is_active ? 'text-green-600' : 'text-red-600'}
          />
          <InfoItem 
            icon={partner.is_staff ? FiCheckCircle : FiXCircle} 
            label="Staff Status" 
            value={partner.is_staff ? 'Yes' : 'No'} 
            iconClass={partner.is_staff ? 'text-green-600' : 'text-red-600'}
          />
          <InfoItem 
            icon={partner.is_superuser ? FiCheckCircle : FiXCircle} 
            label="Superuser Status" 
            value={partner.is_superuser ? 'Yes' : 'No'} 
            iconClass={partner.is_superuser ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>

      {/* Audit Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem 
            icon={FiCalendar} 
            label="Created On" 
            value={formatDate(partner.created_on)} 
          />
          <InfoItem 
            icon={FiUser} 
            label="Created By" 
            value={partner.created_by || 'N/A'} 
          />
          {partner.updated_on && (
            <>
              <InfoItem 
                icon={FiCalendar} 
                label="Updated On" 
                value={formatDate(partner.updated_on)} 
              />
              <InfoItem 
                icon={FiUser} 
                label="Updated By" 
                value={partner.updated_by || 'N/A'} 
              />
            </>
          )}
        </div>
      </div>

      {/* Outlets Section - if partner has outlets */}
      {partner.outlets && partner.outlets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Managed Outlets</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outlet Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partner.outlets.map((outlet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {outlet.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          outlet.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {outlet.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
} 