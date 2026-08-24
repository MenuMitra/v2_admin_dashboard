import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faRotate,
  faBuilding,
  faUser,
  faPhone,
  faEnvelope,
  faIdCard,
  faLocationDot,
  faStore,
  faIndianRupeeSign,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import { useAuth } from "../../hooks/useAuth";
import { useEnquiryDetails } from "../../lib/react-query/hooks/useEnquiryDetails";

const toTitleCase = (str) =>
  str
    ? String(str).replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "-";

const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return `₹${number.toLocaleString("en-IN")}`;
};

function DetailItem({ icon, value, label, valueClassName = "" }) {
  return (
    <div className="flex items-center p-3 rounded-lg">
      <div className="flex items-center justify-center w-8 h-8">
        <FontAwesomeIcon icon={icon} className="w-5 h-5 text-gray-400" />
      </div>
      <div className="ml-3">
        <div className={`text-base font-medium ${valueClassName}`}>
          {displayValue(value)}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function ViewEnquiry() {
  const { enquiry_id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const {
    enquiry,
    isLoading,
    error,
    refetch,
    activateEnquiry,
    isActivating,
  } = useEnquiryDetails(enquiry_id, getToken());

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Enquiry", path: "/enquiries" },
    { label: "View Enquiry" },
  ];

  const handleActivate = async () => {
    if (
      !window.confirm(
        "Activate this onboarding? This will create the company and outlet."
      )
    ) {
      return;
    }

    try {
      await activateEnquiry(enquiry_id);
    } catch {
      // Error toast is handled in the mutation
    }
  };

  const status = (enquiry?.status || "").toLowerCase();
  const statusClass =
    status === "active"
      ? "text-success-700"
      : status === "rejected"
        ? "text-error-700"
        : "text-warning-600";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-brand-500"></div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6 text-center text-red-500">
          {error?.response?.data?.detail ||
            error?.message ||
            "No enquiry details found."}
        </div>
      </div>
    );
  }

  const company = enquiry.company || {};
  const owner = enquiry.owner || {};
  const outlet = enquiry.outlet || {};
  const subscription = enquiry.subscription || {};

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/enquiries")}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Enquiry Details
            </div>
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
                onClick={() => navigate(`/edit-enquiry/${enquiry_id}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <span className="hidden sm:inline">Edit</span>
              </button>
              {status === "pending" && (
                <button
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-60"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                  <span className="hidden sm:inline">Activate</span>
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            <h2 className="text-base font-medium mb-4 text-gray-800">Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <DetailItem
                icon={faHashtag}
                value={enquiry.enquiry_id}
                label="Enquiry ID"
              />
              <DetailItem
                icon={faCheckCircle}
                value={toTitleCase(enquiry.status)}
                label="Status"
                valueClassName={statusClass}
              />
              <DetailItem
                icon={faClock}
                value={enquiry.enquiry_status}
                label="Enquiry Status"
              />
              <DetailItem
                icon={faCalendarAlt}
                value={enquiry.created_on}
                label="Created On"
              />
              <DetailItem
                icon={faCalendarAlt}
                value={enquiry.activated_at}
                label="Activated At"
              />
              <DetailItem
                icon={faCalendarAlt}
                value={enquiry.updated_on}
                label="Updated On"
              />
            </div>

            <h2 className="text-base font-medium mb-4 mt-8 text-gray-800">
              Company
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <DetailItem
                icon={faBuilding}
                value={toTitleCase(company.company_name)}
                label="Company Name"
              />
              <DetailItem
                icon={faBuilding}
                value={toTitleCase((company.company_type || "").replace(/_/g, " "))}
                label="Company Type"
              />
              <DetailItem icon={faIdCard} value={company.pan} label="PAN" />
              <DetailItem icon={faIdCard} value={company.fssai} label="FSSAI" />
              <DetailItem icon={faIdCard} value={company.tan} label="TAN" />
              <DetailItem icon={faIdCard} value={company.cin} label="CIN" />
            </div>

            <h2 className="text-base font-medium mb-4 mt-8 text-gray-800">
              Owner
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <DetailItem icon={faUser} value={toTitleCase(owner.name)} label="Name" />
              <DetailItem icon={faPhone} value={owner.mobile} label="Mobile" />
              <DetailItem icon={faEnvelope} value={owner.email} label="Email" />
              <DetailItem icon={faIdCard} value={owner.aadhar} label="Aadhar" />
              <DetailItem icon={faIdCard} value={owner.pan} label="PAN" />
              <DetailItem icon={faLocationDot} value={owner.address} label="Address" />
            </div>

            <h2 className="text-base font-medium mb-4 mt-8 text-gray-800">
              Outlet
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <DetailItem icon={faStore} value={toTitleCase(outlet.name)} label="Name" />
              <DetailItem icon={faPhone} value={outlet.mobile} label="Mobile" />
              <DetailItem
                icon={faStore}
                value={toTitleCase(outlet.outlet_type)}
                label="Outlet Type"
              />
              <DetailItem
                icon={faStore}
                value={toTitleCase(outlet.veg_nonveg)}
                label="Food Type"
              />
              <DetailItem icon={faLocationDot} value={outlet.address} label="Address" />
              <DetailItem
                icon={faIdCard}
                value={outlet.fssainumber}
                label="FSSAI Number"
              />
              <DetailItem
                icon={faIdCard}
                value={outlet.gstnumber}
                label="GST Number"
              />
            </div>

            <h2 className="text-base font-medium mb-4 mt-8 text-gray-800">
              Subscription
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <DetailItem
                icon={faIndianRupeeSign}
                value={subscription.name}
                label="Plan"
              />
              <DetailItem
                icon={faIndianRupeeSign}
                value={formatPrice(subscription.price)}
                label="Price"
              />
              <DetailItem
                icon={faCalendarAlt}
                value={subscription.tenure}
                label="Tenure"
              />
              <DetailItem
                icon={faHashtag}
                value={
                  Array.isArray(subscription.module_ids) &&
                  subscription.module_ids.length
                    ? subscription.module_ids.join(", ")
                    : "-"
                }
                label="Module IDs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewEnquiry;
