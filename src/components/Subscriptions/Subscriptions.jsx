import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import Breadcrumb from "../Breadcrumb";
import { useSubscriptions } from "../../lib/react-query/hooks/useSubscriptions";

function Subscriptions() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const {
    subscriptions,
    isLoading,
    error,
    refetch,
    deleteSubscriptionMutation,
  } = useSubscriptions();

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Subscriptions", path: "/subscriptions" },
  ];

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value.toUpperCase()}
        </p>
      ),
    },
    {
      field: "price",
      header: "Price",
      sortable: true,
      render: (price) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          ₹{price}
        </p>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      headerClassName: "text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Subscription"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Subscription"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Subscription"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleView = (subscription) => {
    navigate(`/view-subscription/${subscription.subscription_id}`);
  };

  const handleEdit = (subscription) => {
    navigate(`/edit-subscription/${subscription.subscription_id}`);
  };

  const handleDelete = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubscription) return;
    try {
      await deleteSubscriptionMutation.mutateAsync(selectedSubscription.subscription_id);
      setShowDeleteModal(false);
      setSelectedSubscription(null);
    } catch {
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={subscriptions}
        columns={columns}
        title="Subscriptions"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search subscriptions"
        enableSort={true}
        enablePagination={false}
        enableSearch={true}
        enableStatusFilter={false}
        showSearch={true}
        itemsPerPage={50}
        counts={{
          total: subscriptions.length,
          active: null,
          inactive: null,
        }}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-subscription"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new subscription",
        }}
        
        onReload={refetch}
        isLoading={deleteSubscriptionMutation.isLoading}
      />

      {/* Delete Confirmation Modal using DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSubscription(null);
        }}
        onDelete={confirmDelete}
        title="Confirm Delete"
        message={"Are you sure ?"}
      />
    </>
  );
}

export default Subscriptions;
