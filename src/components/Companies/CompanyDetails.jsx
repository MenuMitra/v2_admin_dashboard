import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faChevronRight,
  faUser,
  faEnvelope,
  faPhone,
  faIdCard,
  faLocationDot,
  faUserTag,
  faCalendarPlus,
  faRotate,
  faHashtag,
  faStore
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import Breadcrumb from "../Breadcrumb";
import StatusToggleButton from "../common/StatusToggleButton";
import { useCompanyDetails } from "../../lib/react-query/hooks/useCompanyDetails";
import { useAuth } from "../../hooks/useAuth";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    : "";

function CompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { getToken, getUserId } = useAuth();

  const {
    company: companyData,
    isLoading,
    error,
    deleteCompany,
    updateOwnerStatus,
    isUpdatingOwner,
    refetch
  } = useCompanyDetails(companyId, getToken(), getUserId());

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Companies", path: "/companies" },
    { label: "Company Details", path: `/company-details/${companyId}` },
  ];

  const handleDeleteOwner = async () => {
    await deleteCompany();
    navigate(-1);
  };

  const handleToggleOwnerActive = (owner) => {
    updateOwnerStatus({ ownerUserId: owner.user_id });
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
      <div className="p-6">
        <div className="text-center text-error-500">Error loading company details</div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No company data found</div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section - Matching DataTable.jsx style */}
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
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Company Details
            </div>
            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-theme-xs disabled:opacity-60"
                title="Reload"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => navigate(`/edit-company/${companyId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
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
                onClick={() => setShowDeleteModal(true)}
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
          <div className="px-6 py-4">
            {/* Company Information Card */}
            <h2 className="text-base font-medium mb-4 text-gray-800">Company Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Company Name */}
              {companyData.company_name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{toTitleCase(companyData.company_name)}</div>
                    <div className="text-sm text-gray-500">Company Name</div>
                  </div>
                </div>
              )}
              {/* Company Type */}
              {companyData.company_type && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{toTitleCase(companyData.company_type.replace('_', ' '))}</div>
                    <div className="text-sm text-gray-500">Company Type</div>
                  </div>
                </div>
              )}
              {/* PAN */}
              {companyData.pan && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.pan}</div>
                    <div className="text-sm text-gray-500">PAN</div>
                  </div>
                </div>
              )}
              {/* FSSAI */}
              {companyData.fssai && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.fssai}</div>
                    <div className="text-sm text-gray-500">FSSAI</div>
                  </div>
                </div>
              )}
              {/* TAN */}
              {companyData.tan && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.tan}</div>
                    <div className="text-sm text-gray-500">TAN</div>
                  </div>
                </div>
              )}
              {/* CIN */}
              {companyData.cin && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.cin}</div>
                    <div className="text-sm text-gray-500">CIN</div>
                  </div>
                </div>
              )}
              {/* Created On */}
              {companyData.created_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.created_on}</div>
                    <div className="text-sm text-gray-500">Created On</div>
                  </div>
                </div>
              )}
              {/* Created By */}
              {companyData.created_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{toTitleCase(companyData.created_by)}</div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>
              )}
              {/* Updated On */}
              {companyData.updated_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{companyData.updated_on}</div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
              )}
              {/* Created By */}
              {companyData.updated_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{toTitleCase(companyData.updated_by)}</div>
                    <div className="text-sm text-gray-500">Updated By</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Details Section */}
            {companyData.contact_details && companyData.contact_details.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-medium mb-4 text-gray-800">Contact Details</h2>
                <div className="space-y-4">
                  {companyData.contact_details.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Contact {index + 1} - {toTitleCase(contact.type?.replace('_', ' '))}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {contact.email && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{contact.email}</div>
                              <div className="text-sm text-gray-500">Email</div>
                            </div>
                          </div>
                        )}
                        {contact.contact_number && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{contact.contact_number}</div>
                              <div className="text-sm text-gray-500">Contact Number</div>
                            </div>
                          </div>
                        )}
                        {contact.address_line1 && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">
                                {contact.address_line1
                                  ? toTitleCase(contact.address_line1)
                                  : ""}
                                {contact.address_line2 &&
                                  `, ${toTitleCase(contact.address_line2)}`}
                              </div>
                              <div className="text-sm text-gray-500">Address</div>
                            </div>
                          </div>
                        )}
                        {contact.city && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">
                                {toTitleCase(contact.city)}, {toTitleCase(contact.state)} - {contact.pin}
                              </div>
                              <div className="text-sm text-gray-500">City, State, PIN</div>
                            </div>
                          </div>
                        )}
                        {contact.landmark && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{toTitleCase(contact.landmark)}</div>
                              <div className="text-sm text-gray-500">Landmark</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Owners Section */}
            {companyData.owners && companyData.owners.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-medium mb-4 text-gray-800">Company Owners</h2>
                <div className="space-y-4">
                  {companyData.owners.map((owner, index) => (
                    <div key={owner.user_id || owner.owner_id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Owner {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <StatusToggleButton
                            isActive={[1, "1", true].includes(owner.is_active)}
                            onToggle={() => handleToggleOwnerActive(owner)}
                            disabled={isUpdatingOwner}
                            activeLabel="Active"
                            inactiveLabel="Inactive"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {owner.name && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{toTitleCase(owner.name)}</div>
                              <div className="text-sm text-gray-500">Name</div>
                            </div>
                          </div>
                        )}
                        {owner.owner_code && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faHashtag}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{owner.owner_code}</div>
                              <div className="text-sm text-gray-500">Owner Code</div>
                            </div>
                          </div>
                        )}
                        {owner.mobile && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{owner.mobile}</div>
                              <div className="text-sm text-gray-500">Mobile</div>
                            </div>
                          </div>
                        )}
                        {owner.email && (
                          <div className="flex items-start p-3 rounded-lg bg-white w-full min-w-0">
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                              <div
                                className="text-base font-medium whitespace-normal"
                                style={{
                                  wordBreak: 'break-all',
                                  overflowWrap: 'anywhere'
                                }}
                              >
                                {owner.email}
                              </div>
                              <div className="text-sm text-gray-500">Email</div>
                            </div>
                          </div>
                        )}
                        {owner.aadhar && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faIdCard}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{owner.aadhar}</div>
                              <div className="text-sm text-gray-500">Aadhar</div>
                            </div>
                          </div>
                        )}
                        {owner.pan && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faIdCard}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{owner.pan}</div>
                              <div className="text-sm text-gray-500">PAN</div>
                            </div>
                          </div>
                        )}
                        {owner.address && (
                          <div className="flex items-center p-3 rounded-lg bg-white">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className="w-5 h-5 text-gray-400"
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium">{toTitleCase(owner.address)}</div>
                              <div className="text-sm text-gray-500">Address</div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Owner's Outlets Section */}
                      {owner.outlets && owner.outlets.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-3">Owner's Outlets</h4>
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                              {owner.outlets.map((outlet, outletIndex) => (
                                <div key={outlet.outlet_code || outletIndex} className="border border-gray-200 rounded-lg p-3 bg-white">
                                  {outlet.outlet_name && (
                                    <div
                                      className="flex items-center p-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors relative"
                                      onClick={() => navigate(`/view-outlet/${outlet.outlet_id}`)}
                                    >
                                      <div className="w-6 h-6 flex items-center justify-center">
                                        <FontAwesomeIcon
                                          icon={faStore}
                                          className="w-4 h-4 text-gray-400"
                                        />
                                      </div>
                                      <div className="ml-2 flex-1">
                                        <div className="text-sm font-medium">
                                          {toTitleCase(outlet.outlet_name)} ({outlet.outlet_code && (outlet.outlet_code)})
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {toTitleCase(outlet.outlet_address) || "-"}
                                        </div>
                                      </div>
                                      <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="w-3 h-3 text-gray-400"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteOwner}
        />
      </div>
    </>
  );
}

export default CompanyDetails;