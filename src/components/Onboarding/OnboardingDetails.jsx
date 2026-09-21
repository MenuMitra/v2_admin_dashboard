import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPenToSquare,
  faTrash,
  faRotate,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import AuditInfo from "../common/AuditInfo";
import { useOnboardingDetails } from "../../lib/react-query/hooks/useOnboardingDetails";

const toTitleCase = (str) =>
  str
    ? String(str).replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function InfoItem({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
        {value}
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function OnboardingDetails() {
  const { onboardingId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const {
    onboarding,
    isLoading,
    error,
    deleteOnboarding,
    isDeleting,
    activateOnboarding,
    isActivating,
    refetch,
  } = useOnboardingDetails(onboardingId);

  const handleDelete = async () => {
    await deleteOnboarding();
    setIsDeleteModalOpen(false);
    navigate("/onboarding");
  };

  const handleActivate = async () => {
    const result = await activateOnboarding();
    setIsActivateModalOpen(false);
    await refetch();
    const data = result?.data;
    if (data?.outlet_id) {
      navigate(`/view-outlet/${data.outlet_id}`);
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Onboarding", path: "/onboarding" },
    { label: "View" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error || !onboarding) {
    return (
      <div className="p-4 text-center text-red-500">
        {error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch onboarding details"}
      </div>
    );
  }

  const isPending = onboarding.status === "pending";
  const company = onboarding.company_data || {};
  const outlet = onboarding.outlet_data || {};
  const owners = Array.isArray(onboarding.owners_data)
    ? onboarding.owners_data
    : [];
  const subscription = onboarding.subscription_data || {};

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {toTitleCase(outlet.name) || "Onboarding Details"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-theme-xs"
                title="Reload"
              >
                <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
              </button>
              {isPending && (
                <>
                  <button
                    onClick={() => setIsActivateModalOpen(true)}
                    disabled={isActivating}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-success-500 hover:bg-success-600 shadow-theme-xs disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                    <span className="hidden sm:inline">Activate</span>
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/edit-onboarding/${onboarding.onboarding_id}`)
                    }
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 hover:bg-warning-600 shadow-theme-xs"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 hover:bg-error-600 shadow-theme-xs disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-6 mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem
                label="Status"
                value={toTitleCase(onboarding.status)}
              />
              <InfoItem
                label="Onboarding ID"
                value={onboarding.onboarding_id}
              />
              {onboarding.company_id && (
                <div>
                  <h4 className="text-sm font-normal text-gray-800">
                    <Link
                      to={`/company-details/${onboarding.company_id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {onboarding.company_id}
                    </Link>
                  </h4>
                  <p className="text-sm text-gray-500">Company ID</p>
                </div>
              )}
              {onboarding.outlet_id && (
                <div>
                  <h4 className="text-sm font-normal text-gray-800">
                    <Link
                      to={`/view-outlet/${onboarding.outlet_id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {onboarding.outlet_id}
                    </Link>
                  </h4>
                  <p className="text-sm text-gray-500">Outlet ID</p>
                </div>
              )}
              <InfoItem label="Activated On" value={onboarding.activated_on} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Company
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem
                label="Company Name"
                value={toTitleCase(company.company_name)}
              />
              <InfoItem
                label="Company Type"
                value={
                  company.company_type
                    ? toTitleCase(String(company.company_type).replace(/_/g, " "))
                    : null
                }
              />
              <InfoItem label="PAN" value={company.pan} />
              <InfoItem label="FSSAI" value={company.fssai} />
              <InfoItem label="TAN" value={company.tan} />
              <InfoItem label="CIN" value={company.cin} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Outlet
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem label="Name" value={toTitleCase(outlet.name)} />
              <InfoItem
                label="Outlet Type"
                value={toTitleCase(outlet.outlet_type)}
              />
              <InfoItem label="Mobile" value={outlet.mobile} />
              <InfoItem label="Address" value={toTitleCase(outlet.address)} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Owners ({owners.length})
            </h2>
            {owners.length === 0 ? (
              <p className="text-sm text-gray-500">No owners provided.</p>
            ) : (
              <div className="space-y-4">
                {owners.map((owner, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      <InfoItem label="Name" value={toTitleCase(owner.name)} />
                      <InfoItem label="Mobile" value={owner.mobile} />
                      <InfoItem label="Email" value={owner.email} />
                      <InfoItem label="Aadhar" value={owner.aadhar} />
                      <InfoItem label="PAN" value={owner.pan} />
                      <InfoItem
                        label="Address"
                        value={toTitleCase(owner.address)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Subscription
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem
                label="Plan Name"
                value={toTitleCase(subscription.name)}
              />
              <InfoItem
                label="Price"
                value={
                  subscription.price !== undefined &&
                  subscription.price !== null
                    ? `₹${subscription.price}`
                    : null
                }
              />
              <InfoItem label="Tenure" value={subscription.tenure} />
              <InfoItem
                label="Module IDs"
                value={
                  Array.isArray(subscription.module_ids) &&
                  subscription.module_ids.length
                    ? subscription.module_ids.join(", ")
                    : null
                }
              />
            </div>
          </div>

          <AuditInfo
            createdOn={onboarding.created_on}
            updatedOn={onboarding.updated_on}
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this onboarding?"
      />

      <DeleteConfirmModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onDelete={handleActivate}
        title="Confirm Activate"
        message="Activate this onboarding? This will create the company, outlet, and owner accounts."
        confirmLabel="Activate"
      />
    </>
  );
}

export default OnboardingDetails;
