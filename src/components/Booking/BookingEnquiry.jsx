import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DataTable from "../common/DataTable";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useWebsiteBookings } from "../../lib/react-query/hooks/useWebsiteBookings";
import { toastController } from "../../utils/toastController";

const toTitleCase = (str) =>
  str
    ? String(str).replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

const BookingEnquiry = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const {
    bookings,
    isLoading,
    error,
    refetch,
    deleteMutation,
    updateMutation,
    counts,
  } = useWebsiteBookings({
    status: statusFilter,
    page: 1,
    page_size: 200,
  });

  const isUpdating = updateMutation.isPending || updateMutation.isLoading;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(bookingToDelete.booking_id);
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch {
      // handled in hook
    }
  };

  const handleToggleActive = (booking) => {
    const isActive =
      booking.is_active === true || Number(booking.is_active) === 1;

    updateMutation.mutate(
      {
        booking_id: Number(booking.booking_id),
        is_active: !isActive,
        notes: booking.notes || "",
      },
      {
        onSuccess: () => {
          toastController.success(
            `Booking marked as ${!isActive ? "Active" : "Inactive"}`
          );
        },
      }
    );
  };

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {toTitleCase(value)}
        </p>
      ),
    },
    { field: "mobile", header: "Mobile", sortable: true },
    {
      field: "outlet_name",
      header: "Outlet",
      sortable: true,
      render: (value) => toTitleCase(value),
    },
    {
      field: "outlet_type",
      header: "Type",
      sortable: true,
      render: (value) => toTitleCase(value),
    },
    {
      field: "city",
      header: "City",
      sortable: true,
      render: (value) => toTitleCase(value),
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value, booking) => {
        const isActive = value === true || Number(value) === 1;
        return (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleToggleActive(booking)}
              disabled={isUpdating}
              className={`text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                isActive ? "text-success-600" : "text-error-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              title={`Click to mark as ${isActive ? "Inactive" : "Active"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>
        );
      },
    },
    { field: "created_on", header: "Created On", sortable: true },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, booking) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              navigate(`/booking-details/${booking.booking_id}`)
            }
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Booking"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-booking/${booking.booking_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Booking"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setBookingToDelete({ booking_id: booking.booking_id });
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Booking"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Bookings", path: "/bookings" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error?.response?.data?.detail ||
            error?.message ||
            "Failed to load website bookings"}
        </div>
      )}

      <DataTable
        data={bookings}
        title="Website Bookings"
        columns={columns}
        isLoading={
          isLoading ||
          deleteMutation.isPending ||
          deleteMutation.isLoading ||
          isUpdating
        }
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[25, 50, 100, 200]}
        onItemsPerPageChange={setItemsPerPage}
        onBackClick={() => navigate(-1)}
        enablePagination={true}
        showSearch={true}
        enableSort={true}
        createButton={{ show: false, label: "", onClick: () => {} }}
        showBulkActions={false}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReload={refetch}
        idField="booking_id"
        counts={counts}
        emptyStateMessage="No website bookings found."
        headerAction={
          <a
            href="https://menumitra.com/book-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full shadow-theme-xs bg-brand-500 hover:bg-brand-600"
          >
            Book a Demo
          </a>
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this website booking?"
      />
    </>
  );
};

export default BookingEnquiry;
