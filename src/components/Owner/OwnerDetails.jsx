import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPenToSquare,
  faTrash,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import AuditInfo from "../common/AuditInfo";
import { useOwnerDetails } from "../../lib/react-query/hooks/useOwnerDetails";

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

function OwnerDetails() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { owner, isLoading, error, deleteOwner, isDeleting, refetch } =
    useOwnerDetails(ownerId);

  const handleDelete = async () => {
    await deleteOwner();
    setIsDeleteModalOpen(false);
    navigate("/owners");
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Owners", path: "/owners" },
    { label: "View" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="p-4 text-center text-red-500">
        {error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch owner details"}
      </div>
    );
  }

  const sessions = Array.isArray(owner.sessions) ? owner.sessions : [];
  const outlets = Array.isArray(owner.outlets) ? owner.outlets : [];

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
                {toTitleCase(owner.name) || "Owner Details"}
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
              <button
                onClick={() => navigate(`/edit-owner/${owner.owner_id}`)}
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
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-6 mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem label="Name" value={toTitleCase(owner.name)} />
              <InfoItem label="Mobile" value={owner.mobile} />
              <InfoItem label="Email" value={owner.email} />
              <InfoItem label="Owner Code" value={owner.owner_code} />
              <InfoItem label="Aadhar" value={owner.aadhar} />
              <InfoItem label="PAN" value={owner.pan} />
              <InfoItem label="Address" value={toTitleCase(owner.address)} />
              <InfoItem
                label="Status"
                value={Number(owner.is_active) === 1 ? "Active" : "Inactive"}
              />
            </div>
          </div>

          {owner.company && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Company
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <h4 className="text-sm font-normal text-gray-800">
                    {owner.company.company_id ? (
                      <Link
                        to={`/company-details/${owner.company.company_id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {toTitleCase(owner.company.company_name)}
                      </Link>
                    ) : (
                      toTitleCase(owner.company.company_name)
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">Company Name</p>
                </div>
                <InfoItem
                  label="Company Type"
                  value={toTitleCase(owner.company.company_type)}
                />
                <InfoItem label="PAN" value={owner.company.pan} />
                <InfoItem label="FSSAI" value={owner.company.fssai} />
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Outlets ({outlets.length})
            </h2>
            {outlets.length === 0 ? (
              <p className="text-sm text-gray-500">No outlets mapped.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {outlets.map((outlet) => (
                  <button
                    key={outlet.outlet_id}
                    type="button"
                    onClick={() => navigate(`/view-outlet/${outlet.outlet_id}`)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${
                      outlet.is_primary
                        ? "bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    <span>{toTitleCase(outlet.outlet_name)}</span>
                    {outlet.is_primary && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full">
                        P
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Login Sessions ({sessions.length})
            </h2>
            {sessions.length === 0 ? (
              <div className="border border-gray-200 rounded-lg p-3 bg-white text-sm text-gray-500">
                No active sessions found.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-medium">App</th>
                      <th className="px-3 py-2 font-medium">Device</th>
                      <th className="px-3 py-2 font-medium">Public IP</th>
                      <th className="px-3 py-2 font-medium">Last Login</th>
                      <th className="px-3 py-2 font-medium">Last Activity</th>
                      <th className="px-3 py-2 font-medium">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.map((session, index) => (
                      <tr
                        key={session.user_session_id || index}
                        className="text-gray-700"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {toTitleCase(session.app_type || "Session")}
                        </td>
                        <td className="px-3 py-2">
                          {session.device_model || session.device_id || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {session.public_ip || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {session.last_login || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {session.last_activity || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {session.expires_on || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AuditInfo
            createdOn={owner.created_on}
            createdBy={
              owner.created_by_name
                ? toTitleCase(owner.created_by_name)
                : null
            }
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this owner?"
      />
    </>
  );
}

export default OwnerDetails;
