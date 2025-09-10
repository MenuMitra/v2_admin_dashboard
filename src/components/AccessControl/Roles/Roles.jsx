import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPlus,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../../hooks/useAdmin";
import DataTable from "../../common/DataTable";
import Breadcrumb from "../../Breadcrumb";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";
import Modal from "../../common/Modal";
import { toastController } from "../../../utils/toastController";
import { useRoles } from "../../../lib/react-query/hooks/useRoles";

// Utility function to convert a string to title case
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function Roles() {
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const {
    roles,
    isLoading,
    createRole,
    isCreating,
    updateRole,
    isUpdating,
    deleteRole,
    isDeleting,
    refetchRoles,
    counts,
  } = useRoles();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    // { label: "Access Control", path: "/home" },
    { label: "Roles", path: "/roles" },
  ];

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toastController.error("Please enter a role name");
      return;
    }

    await createRole(newRoleName);
    setIsModalOpen(false);
    setNewRoleName("");
  };

  const handleUpdateRole = async () => {
    if (!editRoleName.trim() || !editingRole) {
      toastController.error("Please enter a role name");
      return;
    }

    await updateRole({
      roleId: editingRole.role_id,
      roleName: editRoleName,
    });
    setIsEditModalOpen(false);
    setEditingRole(null);
    setEditRoleName("");
  };

  const handleDeleteRole = async () => {
    await deleteRole(deletingRole.role_id);
    setIsDeleteModalOpen(false);
    setDeletingRole(null);
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "role_name",
      header: "Role",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90 capitalize">
            {toTitleCase(value)}
          </span>
        </div>
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
            onClick={() =>
              navigate(`/role-functionalities-mapping/${row.role_id}`)
            }
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingRole(row);
              setEditRoleName(row.role_name);
              setIsEditModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Role"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setDeletingRole(row);
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Role"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
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

      <DataTable
        data={roles}
        columns={columns}
        title="Roles"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={counts}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => setIsModalOpen(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new role",
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search roles"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        enableStatusFilter={false}
        showSearch={true}
        itemsPerPage={50}
        onReload={refetchRoles}
        isLoading={isLoading || isCreating || isUpdating || isDeleting}
      />

      {/* Create Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewRoleName("");
        }}
        title="Create New Role"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label
              htmlFor="roleName"
              className="block text-theme-sm font-medium text-left text-gray-700 mb-2"
            >
              Role Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
              placeholder="Enter role name"
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewRoleName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim() || isCreating}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition bg-success-500 hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRole(null);
          setEditRoleName("");
        }}
        title="Edit Role"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label
              htmlFor="editRoleName"
              className="block text-theme-sm font-medium text-left text-gray-700 mb-2"
            >
              Role Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="editRoleName"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-warning-500 focus:border-warning-500 text-gray-900"
              placeholder="Enter role name"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                setEditRoleName("");
              }}
              className="px-4 py-2 text-theme-sm font-medium text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={!editRoleName.trim() || isUpdating}
              className={`inline-flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white rounded-full transition-colors duration-200
                ${
                  !editRoleName.trim() || isUpdating
                    ? "bg-warning-500 cursor-not-allowed"
                    : "bg-warning-500 hover:bg-warning-600"
                }`}
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRole(null);
        }}
        onDelete={handleDeleteRole}
      />
    </>
  );
}

export default Roles;
