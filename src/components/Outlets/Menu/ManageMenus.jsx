import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../../../hooks/useAdmin";
import { useOfflineMenus, SyncStatusBadge } from "../../../offline";
import { toastController } from "../../../utils/toastController";
import DataTable from "../../common/DataTable";
import Breadcrumb from "../../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faPlus,
  faCircleCheck,
  faCircleXmark,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    : "";

function ManageMenus() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const normaliseData = React.useCallback(
    (menus) =>
      menus.map((menu) => ({
        ...menu,
        user_id: menu.menu_id,
      })),
    []
  );

  const {
    menusQuery,
    deleteMutation: offlineDeleteMutation,
    bulkActionMutation: offlineBulkMutation,
  } = useOfflineMenus(outletId, adminData?.user_id);

  const {
    data: menuResponse,
    isLoading,
    error,
  } = menusQuery;

  const deleteMutation = {
    isPending: offlineDeleteMutation.isPending,
    mutate: () => {
      if (!selectedMenu) return;
      offlineDeleteMutation.mutate(
        {
          menuIdOrUuid: selectedMenu.sync_uuid || selectedMenu.menu_id,
        },
        {
          onSuccess: () => {
            toastController.success("Menu deleted (will sync when online)");
            setShowDeleteModal(false);
            setSelectedMenu(null);
          },
          onError: (err) => {
            toastController.error(err.message || "Failed to delete menu");
          },
        }
      );
    },
  };

  const bulkActionMutation = {
    mutate: ({ action, selectedIds }) => {
      offlineBulkMutation.mutate(
        { action, selectedIds },
        {
          onSuccess: () => {
            toastController.success("Bulk action saved locally");
            setSelectedItems([]);
          },
          onError: (err) => {
            toastController.error(err.message || "Failed to perform bulk action");
          },
        }
      );
    },
  };

  // Memoized data processing
  const menuData = React.useMemo(
    () => normaliseData(menuResponse?.detail || []),
    [menuResponse, normaliseData]
  );

  const outletName = React.useMemo(
    () => menuData[0]?.outlet_name || "",
    [menuData]
  );

  // Memoized filtered data
  const filteredData = React.useMemo(() => {
    if (!menuData.length) return [];

    return menuData.filter((item) => {
      if (statusFilter !== "all") {
        const isActive = item.is_active === 1;
        if (statusFilter === "active" && !isActive) return false;
        if (statusFilter === "inactive" && isActive) return false;
      }

      if (searchTerm) {
        const searchFields = ["name", "category_name", "food_type"];
        return searchFields.some((field) =>
          item[field]
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });
  }, [menuData, statusFilter, searchTerm]);

  // Memoized breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName, path: `/view-outlet/${outletId}` },
      { label: "Menus" },
    ],
    [outletName, outletId]
  );

  // Handlers
  const handleView = React.useCallback(
    (row) => {
      navigate(`/menu-details/${row.outlet_id}/${row.menu_id}`);
    },
    [navigate]
  );

  const handleEdit = React.useCallback(
    (row) => {
      navigate(`/edit-menu/${row.outlet_id}/${row.menu_id}`);
    },
    [navigate]
  );

  const handleDelete = React.useCallback((row) => {
    setSelectedMenu(row);
    setShowDeleteModal(true);
  }, []);

  const handleCreateMenu = React.useCallback(() => {
    navigate(`/create-menu/${outletId}`, {
      state: { outletName },
    });
  }, [navigate, outletId, outletName]);

  const handleDeleteConfirm = React.useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleBulkAction = React.useCallback(
    (action, selectedIds) => {
      bulkActionMutation.mutate({ action, selectedIds });
    },
    [bulkActionMutation]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-500 text-center p-4">
        {error.response?.data?.message || "Failed to load menus"}
      </div>
    );
  }

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => toTitleCase(value),
    },
    {
      field: "category_name",
      header: "Category",
      sortable: true,
      render: (value) => toTitleCase(value),
    },
    {
      field: "price",
      header: "Price",
      sortable: true,
      render: (value, row) => {
        const price = value || row.portions?.[0]?.price || 0;
        return `₹${price}`;
      },
    },
    {
      field: "food_type",
      header: "Type",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === "veg"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {value?.toUpperCase()}
        </span>
      ),
    },
    // {
    //   field: 'spicy_index',
    //   header: 'Spicy',
    //   sortable: true,
    //   render: (value) => value ? value : '-',
    // },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value === 1 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${value === 1 ? "text-success-500" : "text-error-500"
              }`}
          />
        </div>
      ),
    },
    // {
    //   field: 'portions',
    //   header: 'Portions',
    //   sortable: false,
    //   render: (value) => (
    //     <div className="flex flex-col gap-1">
    //       {value?.map((portion, idx) => (
    //         <span key={idx} className="text-xs">
    //           {portion.portion_name}: ₹{portion.price} ({portion.unit_value}{portion.unit_type})
    //         </span>
    //       ))}
    //     </div>
    //   ),
    // },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Details"
            onClick={() => handleView(row)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          {/* <button
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Menu"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button> */}
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Menu"
            onClick={() => handleDelete(row)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Remove the separate selection column definition and let DataTable handle it internally
  const allColumns = [...columns];

  // Before the return, define the allowed bulk actions for menus:
  const bulkActionOptions = [
    {
      key: "active",
      label: "Active",
      icon: faCheck,
      className: "hover:bg-gray-100",
      customIcon: (
        <div className="flex items-center gap-2" style={{ color: "#059669" }}>
          <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
          <span>Active</span>
        </div>
      ),
    },
    {
      key: "inactive",
      label: "Inactive",
      icon: faXmark,
      className: "hover:bg-gray-100",
      customIcon: (
        <div className="flex items-center gap-2" style={{ color: "#ea580c" }}>
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          <span>Inactive</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb items={breadcrumbItems} />
        <SyncStatusBadge outletId={outletId} />
      </div>
      <DataTable
        data={filteredData}
        columns={allColumns}
        title="Menu List"
        counts={{
          total: menuData.length,
          active: menuData.filter((menu) => menu.is_active === 1).length,
          inactive: menuData.filter((menu) => menu.is_active === 0).length,
        }}
        enableSort={true}
        enableSearch={true}
        enablePagination={true}
        paginationOptions={[50, 100, 200]}
        defaultPageSize={50}
        searchPlaceholder="Search menus..."
        emptyStateMessage="No menus found."
        emptyStateMessageByStatus={{
          all: "No menus found.",
          active: "No active menus found.",
          inactive: "No inactive menus found.",
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        backButtonLabel="Back"
        enableSelection={true}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        statusField="is_active"
        isItemSelectable={(item) => {
          if (statusFilter === "all") return true;
          return statusFilter === "active"
            ? item.is_active === 1
            : item.is_active === 0;
        }}
        createButton={{
          show: true,
          label: (
            <>
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
              Create
            </>
          ),
          position: "right",
          className: "bg-success-500 hover:bg-success-600",
          onClick: handleCreateMenu,
        }}
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        bulkActionOptions={bulkActionOptions}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMenu(null);
        }}
        onDelete={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ManageMenus;
