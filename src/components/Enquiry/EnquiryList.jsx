import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useEnquiries } from "../../lib/react-query/hooks/useEnquiries";
import Breadcrumb from "../Breadcrumb";
import DataTable from "../common/DataTable";

const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "-";

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return `₹${number.toLocaleString("en-IN")}`;
};

const EnquiryList = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { enquiries, isLoading, refetch, activateEnquiry, isActivating } =
    useEnquiries(getToken(), {
      status: "all",
      page: 1,
      page_size: 200,
    });

  const visibleEnquiries =
    statusFilter === "all"
      ? enquiries
      : enquiries.filter((item) => item.status === statusFilter);

  const counts = {
    total: enquiries.length,
    pending: enquiries.filter((item) => item.status === "pending").length,
    enquiryActive: enquiries.filter((item) => item.status === "active").length,
    rejected: enquiries.filter((item) => item.status === "rejected").length,
  };

  const handleActivate = async (enquiry) => {
    if (enquiry.status !== "pending") return;
    if (
      !window.confirm(
        `Activate onboarding for ${enquiry.company_name || "this enquiry"}? This will create the company and outlet.`
      )
    ) {
      return;
    }

    try {
      await activateEnquiry(enquiry.enquiry_id);
    } catch {
      // Error toast is handled in the mutation
    }
  };

  const columns = [
    {
      field: "company_name",
      header: "Company",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-800">{toTitleCase(value)}</span>
      ),
    },
    {
      field: "owner_name",
      header: "Owner",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-gray-800">{toTitleCase(value)}</p>
          <p className="text-xs text-gray-500">{row.owner_number || "-"}</p>
        </div>
      ),
    },
    {
      field: "outlet_name",
      header: "Outlet",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-gray-800">{toTitleCase(value)}</p>
          <p className="text-xs text-gray-500">
            {toTitleCase(row.outlet_type)} · {row.outlet_mobile || "-"}
          </p>
        </div>
      ),
    },
    {
      field: "subscription_name",
      header: "Subscription",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-gray-800">{value || "-"}</p>
          <p className="text-xs text-gray-500">
            {formatPrice(row.subscription_price)} · {row.subscription_tenure || "-"}
          </p>
        </div>
      ),
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (value, row) => {
        const status = (value || "").toLowerCase();
        let statusClass = "bg-gray-100 text-gray-700";
        if (status === "pending") statusClass = "bg-warning-100 text-warning-500";
        if (status === "active") statusClass = "bg-success-100 text-success-700";
        if (status === "rejected") statusClass = "bg-error-100 text-error-700";

        return (
          <div>
            <span className={`font-medium px-2 py-1 rounded ${statusClass}`}>
              {toTitleCase(value)}
            </span>
            {row.enquiry_status && (
              <p className="mt-1 text-xs text-gray-500">{row.enquiry_status}</p>
            )}
          </div>
        );
      },
    },
    {
      field: "created_on",
      header: "Created",
      sortable: true,
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      field: "action",
      header: "Action",
      sortable: false,
      render: (_, enquiry) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/view-enquiry/${enquiry.enquiry_id}`)}
            className="flex items-center justify-center w-8 h-8 text-white transition bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs"
            title="View Enquiry"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-enquiry/${enquiry.enquiry_id}`)}
            className="flex items-center justify-center w-8 h-8 text-white transition bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs"
            title="Update Enquiry"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          {enquiry.status === "pending" && (
            <button
              onClick={() => handleActivate(enquiry)}
              disabled={isActivating}
              className="flex items-center justify-center w-8 h-8 text-white transition bg-success-500 hover:bg-success-600 rounded-3xl shadow-theme-xs disabled:opacity-60"
              title="Activate Enquiry"
            >
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Enquiry", path: "/enquiries" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={visibleEnquiries}
        title="Enquiry"
        columns={columns}
        counts={counts}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search company, owner, outlet or mobile..."
        onBackClick={() => navigate(-1)}
        createButton={{ show: false, label: "", onClick: () => {} }}
        enableStatusFilter={false}
        enableEnquiry={true}
        enquiryFilter={statusFilter}
        onEnquiryFilterChange={setStatusFilter}
        showSearch={true}
        enableSelection={false}
        showPagination={true}
        onReload={refetch}
        emptyStateMessage="No enquiries found."
        getRowId={(item) => item.enquiry_id}
      />
    </>
  );
};

export default EnquiryList;
