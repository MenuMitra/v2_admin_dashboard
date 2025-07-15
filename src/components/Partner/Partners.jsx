import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";

function Partners() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  // Add status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (adminData?.user_id) {
      fetchPartners();
    }
  }, [adminData?.user_id]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_partner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setPartners(response.data);

      // Calculate stats from the response
      // const total = response.data.length;
      // const active = response.data.filter(
      //   (partner) => partner.is_active === 1
      // ).length;

      // setStats({
      //   total,
      //   active,
      //   inactive,
      // });
    } catch (err) {
      setError("Failed to fetch partners");
      console.error("Error fetching partners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await axios.delete("https://men4u.xyz/v2/admin/delete_partner", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          partner_id: partnerToDelete.user_id,
          user_id: adminData.user_id,
        },
      });

      setIsDeleteModalOpen(false);
      setPartnerToDelete(null);
      fetchPartners(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete partner");
      console.error("Error deleting partner:", err);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Show confirmation modal first
      // const { title, message } = getConfirmationDetails(action);
      // setConfirmModal({
      //   isOpen: true,
      //   action,
      //   title,
      //   message,
      // });

    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} partners`);
      console.error("Error performing bulk action:", err);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value === 1 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value === 1 ? "text-success-500" : "text-error-500"
            }`}
          />
          <span
            className={`text-base font-medium ${
              value === 1 ? "text-success-700" : "text-error-700"
            }`}
          >
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, partner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/partner-details/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Partner"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-partner/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Partner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPartnerToDelete({ user_id: partner.user_id });
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Partner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Add this breadcrumb configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Partners", path: "/partners" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Replace the manual breadcrumb with */}
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={partners.filter((partner) => {
          if (statusFilter === "all") return true;
          const isActive = partner.is_active === 1;
          return statusFilter === "active" ? isActive : !isActive;
        })}
        columns={columns}
        title="Partners"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: partners.length,
          active: partners.filter((partner) => partner.is_active === 1).length,
          inactive: partners.filter((partner) => partner.is_active === 0)
            .length,
        }}
        createButton={{
          label: "Create",
          onClick: () => navigate("/create-partner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false,
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        enableSelection={true}
        onSelectionChange={() => {}}
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        onReload={fetchPartners}
      />

      {/* Use reusable DeleteConfirmModal for single delete */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure ?"
      />

      {/* The Modal component was removed from imports, so it's removed here. */}
      {/* If you need a confirmation modal, you'll need to re-add it or use a different component. */}
      {/* For now, I'm removing the Modal component as it's no longer imported. */}
    </>
  );
}

export default Partners;
