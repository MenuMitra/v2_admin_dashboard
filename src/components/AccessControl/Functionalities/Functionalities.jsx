import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../common/DataTable";
import Modal from "../../common/Modal";
import Breadcrumb from "../../Breadcrumb";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";
import { useFunctionalities } from "../../../lib/react-query/hooks/useFunctionalities";

function Functionalities() {
  const {
    functionalities,
    isLoading,
    error,
    createFunctionality,
    isCreating,
    updateFunctionality,
    isUpdating,
    deleteFunctionality,
    isDeleting,
    refetchFunctionalities,
    counts,
  } = useFunctionalities();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFunctionalityName, setNewFunctionalityName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFunctionality, setEditingFunctionality] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFunctionality, setDeletingFunctionality] = useState(null);

  const handleCreateFunctionality = async () => {
    if (!newFunctionalityName.trim()) return;

    await createFunctionality(newFunctionalityName);
    setShowCreateModal(false);
    setNewFunctionalityName("");
  };

  const handleEditFunctionality = async () => {
    if (!editingFunctionality?.functionality_name.trim()) return;

    await updateFunctionality({
      functionalityId: editingFunctionality.functionality_id,
      functionalityName: editingFunctionality.functionality_name,
    });
    setShowEditModal(false);
    setEditingFunctionality(null);
  };

  const handleDeleteFunctionality = async () => {
    await deleteFunctionality(deletingFunctionality.functionality_id);
    setShowDeleteModal(false);
    setDeletingFunctionality(null);
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "functionality_name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, functionality) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setEditingFunctionality(functionality);
              setShowEditModal(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Functionality"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingFunctionality(functionality);
              setShowDeleteModal(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Functionality"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    // { label: "Access Control", path: "/home" },
    { label: "Functionalities", path: "/functionalities" },
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
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={functionalities}
        columns={columns}
        counts={counts}
        title="Functionalities"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        
        createButton={{
          label: "Create",
          onClick: () => setShowCreateModal(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false,
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        enableStatusFilter={false}
        showSearch={true}
        itemsPerPage={50}
        onBackClick={() => window.history.back()}
        showBackButton={true}
        backButtonLabel="Back"
        onReload={refetchFunctionalities}
        isLoading={isLoading || isCreating || isUpdating || isDeleting}
      />

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewFunctionalityName("");
          }}
          title="Add New Functionality"
          size="small"
        >
          <div className="text-left">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Functionality Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFunctionalityName}
                onChange={(e) => setNewFunctionalityName(e.target.value)}
                placeholder="e.g., manage_orders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use underscores instead of spaces (e.g., manage_orders,
                view_reports)
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFunctionalityName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                onClick={handleCreateFunctionality}
                disabled={isCreating || !newFunctionalityName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingFunctionality(null);
          }}
          title="Edit Functionality"
          type="default"
          size="small"
        >
          <div className="w-full">
            <div className="mb-6">
              <label
                htmlFor="functionalityName"
                className="block text-sm font-medium text-left text-gray-700 mb-2"
              >
                {" "}
                <span className="text-error-500">*</span>
                Functionality Name
              </label>
              <input
                type="text"
                id="functionalityName"
                value={editingFunctionality?.functionality_name || ""}
                onChange={(e) =>
                  setEditingFunctionality((prev) => ({
                    ...prev,
                    functionality_name: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
                placeholder="Enter functionality name"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use underscores instead of spaces (e.g., manage_orders,
                view_reports)
              </p>
            </div>

            <div className="flex justify-between w-full items-center gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFunctionality(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFunctionality}
                disabled={
                  !editingFunctionality?.functionality_name.trim() || isUpdating
                }
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full transition-colors duration-200
                  ${
                    !editingFunctionality?.functionality_name.trim() ||
                    isUpdating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-success-500 hover:bg-success-600"
                  }`}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingFunctionality(null);
        }}
        onDelete={handleDeleteFunctionality}
      />
    </>
  );
}

export default Functionalities;
