import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faPenToSquare,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useCustomers } from "../../lib/react-query/hooks/useCustomers";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Customer() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [outletName, setOutletName] = useState("");

  // Add state for modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customerId: null,
  });

  const {
    customers,
    isLoading,
    error,
    refetch,
    deleteCustomer,
    isDeleting,
    bulkAction,
    isBulkActioning,
  } = useCustomers(statusFilter);

  const handleDeleteCustomer = async (customer_id) => {
    setDeleteModal({
      isOpen: true,
      customerId: customer_id,
    });
  };

  const confirmDelete = async () => {
    const customer_id = deleteModal.customerId;
    await deleteCustomer(customer_id);
    setDeleteModal({ isOpen: false, customerId: null });
  };

  const handleBulkAction = async (action, selectedIds) => {
    await bulkAction({ action, customerIds: selectedIds });
    setSelectedItems([]);
  };

  const handleStatusFilterChange = (status) => {
    setSearchTerm("");
    setStatusFilter(status.toLowerCase());
  };

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{toTitleCase(value)}</p>
      ),
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },
    {
      field: "total_orders_all_outlets",
      header: "Total Orders",
      sortable: true,
      render: (value) => value ?? "0",
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value ? "text-success-500" : "text-error-500"
            }`}
          />
        </div>
      ),
    },
    {
      field: "action",
      header: "Action",
      sortable: false,
      textAlign: "center",
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate(`/customer-details/${row.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-customer/${row.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Customer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(row.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Customer"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading && !customers.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Home", path: "/home" }, { label: "Customers" }]}
      />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={customers}
        columns={columns}
        title={`Customers${outletName ? ` - ${outletName}` : ""}`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: customers.length,
          active: customers.filter((c) => c.is_active === 1).length,
          inactive: customers.filter((c) => c.is_active !== 1).length,
        }}
        createButton={{
          show: false,
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[50, 100, 200]}
        onItemsPerPageChange={(value) => setItemsPerPage(Number(value))}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        enableStatusFilter={true}
        onStatusFilterChange={handleStatusFilterChange}
        statusFilter={statusFilter}
        isLoading={isLoading}
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        onReload={refetch}
        isReloading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customerId: null })}
        onDelete={confirmDelete}
      />
    </>
  );
}

export default Customer;
