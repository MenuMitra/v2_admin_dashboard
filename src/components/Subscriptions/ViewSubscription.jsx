import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { toastController } from '../../utils/toastController';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";  
import Breadcrumb from '../Breadcrumb';
import DeleteConfirmModal from '../common/DeleteConfirmModal/DeleteConfirmModal';

function ViewSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscriptionId } = useParams();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Subscriptions", path: "/subscriptions" },
    { label: "Subscription Details", path: `/view-subscription/${subscriptionId}` },
  ];

  useEffect(() => {
    let isSubscribed = true;

    const fetchSubscription = async () => {
      try {
        const response = await toastController.promise(
          axios.post(
            'https://men4u.xyz/v2/admin/view_subscription',
            {
              subscription_id: Number(subscriptionId),
              user_id: adminData?.user_id,
              app_source: 'admin_app'
            },
            {
              headers: {
                Authorization: getToken()
              }
            }
          ),
          {
            loading: 'Loading subscription details...',
            success: 'Subscription details loaded successfully!',
            error: 'Failed to load subscription details'
          }
        );
        if (isSubscribed) {
          setSubscription(response.data.data);
          setLoading(false);
        }
      } catch (error) {
        if (isSubscribed) {
          toastController.error(error.response?.data?.detail || 'Failed to fetch subscription details');
          setLoading(false);
        }
      }
    };

    if (adminData?.user_id && subscriptionId) {
      fetchSubscription();
    }

    return () => {
      isSubscribed = false;
    };
  }, [subscriptionId]);

  // Delete handler using the same API as Subscriptions.jsx
  const handleDelete = async () => {
    try {
      const response = await toastController.promise(
        axios.post(
          'https://men4u.xyz/v2/admin/delete_subscription',
          {
            subscription_id: Number(subscriptionId),
            user_id: adminData.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: 'Deleting subscription...',
          success: 'Subscription deleted successfully!',
          error: 'Failed to delete subscription',
        }
      );
      if (response.data.detail === 'Subscription deleted successfully') {
        setIsDeleteModalOpen(false);
        navigate(-1);
      }
    } catch (error) {
      toastController.error(error.response?.data?.detail || 'Failed to delete subscription');
      console.error('Error deleting subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          No subscription data found
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
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
              Subscription Details
            </div>

            {/* Right Side - Action Buttons: Edit, Delete */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-subscription/${subscriptionId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                style={{ backgroundColor: '#f7941d' }}
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
                onClick={() => setIsDeleteModalOpen(true)}
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
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-base font-medium mb-4 text-gray-800">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg">
                  <div className="text-base font-medium text-gray-900">{subscription.name}</div>
                  <div className="text-sm text-gray-500 mb-1">Name</div>
                </div>
                <div className="p-3 rounded-lg">
                  <div className="text-base font-medium text-gray-900">₹{subscription.price}</div>
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                </div>
                
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-base font-medium mb-4 text-gray-800">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {subscription.features.map((feature) => (
                  <div
                    key={feature.feature_id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-brand-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-900 capitalize">
                        {feature.name.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
}

export default ViewSubscription;