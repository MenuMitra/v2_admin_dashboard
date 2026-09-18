import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import SaveButton from "../common/SaveButton";
import { Textarea, SelectInput } from "../forms/FormElements.jsx";
import { useWebsiteBookingDetails } from "../../lib/react-query/hooks/useWebsiteBookingDetails";

const toTitleCase = (str) =>
  str
    ? String(str).replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function EditBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const {
    booking,
    isLoading,
    error,
    updateBooking,
    isUpdating,
  } = useWebsiteBookingDetails(bookingId);

  const [form, setForm] = useState({
    is_active: "true",
    notes: "",
  });

  useEffect(() => {
    if (booking) {
      const isActive =
        booking.is_active === true || Number(booking.is_active) === 1;
      setForm({
        is_active: isActive ? "true" : "false",
        notes: booking.notes || "",
      });
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBooking({
        is_active: form.is_active === "true",
        notes: form.notes.trim(),
      });
      navigate(`/booking-details/${bookingId}`);
    } catch {
      // handled in hook
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Bookings", path: "/bookings" },
    { label: "Edit" },
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
          "Failed to load booking details"}
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Edit Booking
              </h2>
            </div>

            <div>
              <SaveButton
                onClick={handleSubmit}
                isLoading={isUpdating}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="border-t border-gray-200 pt-6 mt-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm text-gray-800">
                  {toTitleCase(booking.name) || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="text-sm text-gray-800">{booking.mobile || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm text-gray-800">{booking.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outlet</p>
                <p className="text-sm text-gray-800">
                  {toTitleCase(booking.outlet_name) || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Outlet Type</p>
                <p className="text-sm text-gray-800">
                  {toTitleCase(booking.outlet_type) || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-sm text-gray-800">
                  {toTitleCase(booking.city) || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Update Details
            </h2>
            <div className="max-w-md">
              <SelectInput
                label="Status"
                name="is_active"
                value={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: e.target.value,
                  }))
                }
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
              />
            </div>
            <Textarea
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Add follow-up notes..."
              rows={4}
            />
          </div>
        </form>
      </div>
    </>
  );
}

export default EditBooking;
