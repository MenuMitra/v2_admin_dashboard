import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useSubscriptionDetails } from "../../lib/react-query/hooks/useSubscriptionDetails";

function ViewSubscription() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { subscription, isLoading, error, deleteSubscription, isDeleting } =
    useSubscriptionDetails(subscriptionId);

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Subscriptions", path: "/subscriptions" },
    {
      label: "Subscription Details",
      path: `/view-subscription/${subscriptionId}`,
    },
  ];

  const handleDelete = async () => {
    await deleteSubscription();
    setIsDeleteModalOpen(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {error.message || "Failed to fetch subscription details"}
        </div>
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
                style={{ backgroundColor: "#f7941d" }}
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
                disabled={isDeleting}
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
                  <div className="text-base font-medium text-gray-900">
                    {subscription.name.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Name</div>
                </div>
                <div className="p-3 rounded-lg">
                  <div className="text-base font-medium text-gray-900">
                    ₹{subscription.price}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                </div>
              </div>
            </div>

            {/* Modules -> Features -> Actions */}
            <div>
              <h2 className="text-base font-medium mb-4 text-gray-800">
                Modules
              </h2>
              <div className="space-y-4">
                {(subscription.modules || []).map((module) => (
                  <div
                    key={module.module_id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div className="mb-2 text-sm font-semibold text-gray-800">
                      {module.name.replace(/_/g, " ").toUpperCase()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {(module.features || []).map((feature) => (
                        <div
                          key={feature.feature_id}
                          className="p-3 rounded-lg border border-gray-100 bg-white"
                        >
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {feature.name.replace(/_/g, " ").toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {feature.description || ""}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(feature.actions || []).map((action) => (
                              <span
                                key={action.action_id}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200"
                              >
                                {action.name.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
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
        title="Confirm Delete"
        message="Are you sure you want to delete this subscription?"
      />
    </>
  );
}

export default ViewSubscription;
