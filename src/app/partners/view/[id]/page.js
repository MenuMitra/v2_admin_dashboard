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
  FiUserCheck, 
  FiLayers, 
  FiCheckCircle, 
  FiXCircle,
  FiClock,
  FiInfo
} from 'react-icons/fi';
import partnerService from '@/api/services/partnerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';
import Modal from '@/components/ui/Modal';

export default function ViewPartnerPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id: partnerId } = unwrappedParams;
  
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }

    // Fetch partner details
    if (mounted && partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId, router, mounted]);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const data = await partnerService.viewPartner(partnerId, userId);
      
      if (data.detail && typeof data.detail === 'string' && !data.name) {
        // This is likely an error message
        setError(data.detail);
        setLoading(false);
        return;
      }
      
      setPartner(data);
    } catch (error) {
      console.error('Failed to fetch partner details:', error);
      setError(error.message || 'Failed to load partner details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/partners/edit/${partnerId}`);
  };

  const goBack = () => {
    router.push('/partners');
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await partnerService.deletePartner(partnerId, userId);
      
      if (response.detail && response.detail.includes("successfully")) {
        toast.success('Partner deleted successfully');
        router.push('/partners');
      } else if (response.detail) {
        toast.error(response.detail);
        setShowDeleteModal(false);
      } else {
        toast.success('Partner deleted successfully');
        router.push('/partners');
      }
    } catch (error) {
      console.error('Failed to delete partner:', error);
      toast.error(error.message || 'Failed to delete partner');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Data field with value above and label below
  const InfoField = ({ icon, label, value }) => {
    return (
      <div className="mb-6">
        <div className="text-gray-900 font-medium text-base mb-1">
          {value || 'Not provided'}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          {icon && <span className="mr-2 text-gray-400">{icon}</span>}
          {label}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Loading skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden animate-pulse">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
              <div className="ml-4">
                <div className="h-7 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="max-w-6xl mx-auto px-6 py-6 h-screen flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 text-center max-w-lg">
          <FiAlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Partner</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors"
            suppressHydrationWarning
          >
            <FiArrowLeft className="mr-2" /> Go Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={goBack}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors mb-4 sm:mb-0"
          suppressHydrationWarning
        >
          <FiArrowLeft className="mr-2" /> Back to Partners
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            suppressHydrationWarning
          >
            <FiEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={confirmDelete}
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            suppressHydrationWarning
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Partner details */}
      {partner && (
        <div className="mb-8">
          {/* Partner header section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm mb-6 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    <FiUser className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium text-gray-900">{partner.name}</h1>
                    <div className="flex items-center text-gray-500 mt-1">
                      <FiUserCheck className="mr-2" /> {partner.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    partner.is_active 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {partner.is_active ? <FiCheckCircle className="mr-1.5" /> : <FiXCircle className="mr-1.5" />}
                    {partner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <FiMail className="mt-0.5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{partner.email || 'Not provided'}</div>
                    <div className="text-sm text-gray-500">Email Address</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiPhone className="mt-0.5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{partner.mobile || 'Not provided'}</div>
                    <div className="text-sm text-gray-500">Mobile Number</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMapPin className="mt-0.5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 line-clamp-1">{partner.address || 'Not provided'}</div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information Section */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiUser className="mr-2 text-gray-500" />
                  Personal Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    icon={<FiCalendar />}
                    label="Date of Birth"
                    value={partner.dob ? formatDate(partner.dob) : null}
                  />
                  <InfoField
                    icon={<FiCreditCard />}
                    label="Aadhar Number"
                    value={partner.aadhar_number}
                  />
                </div>
              </div>
            </div>
            
            {/* Account Information Section */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiInfo className="mr-2 text-gray-500" />
                  Account Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    icon={<FiClock />}
                    label="Created On"
                    value={partner.created_on}
                  />
                  <InfoField
                    icon={<FiUser />}
                    label="Created By"
                    value={partner.created_by}
                  />
                </div>
                {partner.updated_on && (
                  <InfoField
                    icon={<FiClock />}
                    label="Last Updated"
                    value={`${partner.updated_on} ${partner.updated_by ? `by ${partner.updated_by}` : ''}`}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Outlets Section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FiLayers className="mr-2 text-gray-500" />
                Associated Outlets
              </h2>
            </div>
            <div className="p-6">
              {partner.outlets && partner.outlets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partner.outlets.map((outlet, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded border border-gray-100">
                      <div className="font-medium text-gray-900 mb-1">{outlet.name}</div>
                      <div className="text-sm text-gray-500 flex items-start">
                        <FiMapPin className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{outlet.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-5 rounded border border-gray-100 text-center">
                  <p className="text-gray-500">No outlets associated with this partner</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!partner && !loading && !error && (
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mt-8">
          <div className="p-8 text-center">
            <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Partner Found</h3>
            <p className="text-gray-600 mb-6">The partner you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={goBack}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              suppressHydrationWarning
            >
              <FiArrowLeft className="mr-2" />
              Back to Partner List
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          title="Delete Partner"
          onClose={() => setShowDeleteModal(false)}
          showClose={true}
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-4 text-gray-500">
              <FiTrash2 size={48} />
            </div>
            <h3 className="text-lg text-center font-medium text-gray-900 mb-2">
              Are you sure you want to delete this partner?
            </h3>
            <p className="text-center text-gray-600 mb-6">
              This action cannot be undone. All data associated with this partner will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                suppressHydrationWarning
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                suppressHydrationWarning
              >
                {isDeleting ? 'Deleting...' : 'Delete Partner'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 