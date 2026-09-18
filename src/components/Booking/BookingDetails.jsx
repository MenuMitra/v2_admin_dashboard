import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPenToSquare,
  faTrash,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useWebsiteBookingDetails } from "../../lib/react-query/hooks/useWebsiteBookingDetails";

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

function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { booking, isLoading, error, deleteBooking, isDeleting, refetch } =
    useWebsiteBookingDetails(bookingId);

  const handleDelete = async () => {
    await deleteBooking();
    setIsDeleteModalOpen(false);
    navigate("/bookings");
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Bookings", path: "/bookings" },
    { label: "View" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-4 text-center text-red-500">
        {error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch booking details"}
      </div>
    );
  }

  const isActive =
    booking.is_active === true || Number(booking.is_active) === 1;

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
                {toTitleCase(booking.name) || "Booking Details"}
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
                onClick={() =>
                  navigate(`/edit-booking/${booking.booking_id}`)
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
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-6 mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Booking Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InfoItem label="Name" value={toTitleCase(booking.name)} />
              <InfoItem label="Mobile" value={booking.mobile} />
              <InfoItem label="Email" value={booking.email} />
              <InfoItem
                label="Outlet"
                value={toTitleCase(booking.outlet_name)}
              />
              <InfoItem
                label="Outlet Type"
                value={toTitleCase(booking.outlet_type)}
              />
              <InfoItem label="City" value={toTitleCase(booking.city)} />
              <InfoItem
                label="Status"
                value={isActive ? "Active" : "Inactive"}
              />
              <InfoItem label="Created On" value={booking.created_on} />
            </div>
          </div>

          {booking.notes && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {booking.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this website booking?"
      />
    </>
  );
}

export default BookingDetails;
