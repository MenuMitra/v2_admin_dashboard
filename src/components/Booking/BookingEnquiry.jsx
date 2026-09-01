import React, { useEffect, useState } from "react";
import Breadcrumb from "../Breadcrumb";
import { useNavigate } from "react-router-dom";
import DataTable from "../common/DataTable";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? String(str).replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

const BookingEnquiry = () => {
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      // Using public endpoint from user-provided API — no token required, fall back to GET
      const url = `${BASE_URL}/website_api/listview_website_booking`;
      const resp = await axios.get(url, {
        headers: token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" },
      });

      if (resp.data && Array.isArray(resp.data.data)) {
        setBookings(resp.data.data || []);
      } else if (resp.data && resp.data.data?.data) {
        setBookings(resp.data.data.data || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      String(b.booking_id).includes(q) ||
      (b.name || "").toLowerCase().includes(q) ||
      (b.mobile || "").toLowerCase().includes(q) ||
      (b.outlet_name || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => toTitleCase(value),
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
    { field: "email", header: "Email", sortable: true },
    { field: "created_on", header: "Created On", sortable: true },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Bookings", path: "/bookings" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={filtered}
        title="Website Bookings"
        columns={columns}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[25, 50, 100, 200]}
        onItemsPerPageChange={setItemsPerPage}
        onBackClick={handleBack}
        enablePagination={true}
        showSearch={true}
        createButton={{ show: false, label: "", onClick: () => {} }}
        showBulkActions={false}
        enableStatusFilter={false}
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
        counts={{
          total: filtered.length,
          active: null,
          inactive: null,
        }}
      />
    </>
  );
};

export default BookingEnquiry;
