import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faTrash,
  faCircleCheck,
  faCircleXmark,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../../hooks/useAdmin";
import { useOfflineCategories, SyncStatusBadge } from "../../../offline";
import Breadcrumb from "../../Breadcrumb";
import DataTable from "../../common/DataTable";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";

function ManageCategories() {
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const normaliseData = (categories) =>
    categories.map((category) => ({
      ...category,
      user_id: category.menu_cat_id,
    }));

  const {
    categoriesQuery,
    deleteMutation,
    bulkActionMutation,
  } = useOfflineCategories(outletId, adminData?.user_id);

  const {
    data: categoryResponse,
    isLoading: categoryLoading,
    error: categoryError,
  } = categoriesQuery;

  const categoryData = categoryResponse?.data?.menucat_details
    ? normaliseData(
        categoryResponse.data.menucat_details.filter(
          (cat) =>
            cat.menu_cat_id && cat.category_name && cat.category_name !== "all"
        )
      )
    : [];

  const outletInfo = categoryResponse?.data?.outlet_info || null;

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(
      {
        menuCatIdOrUuid:
          categoryToDelete.sync_uuid || categoryToDelete.menu_cat_id,
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        },
      }
    );
  };

  const handleBulkAction = (action, selectedIds) => {
    bulkActionMutation.mutate(
      { action, selectedIds },
      {
        onSuccess: () => setSelectedItems([]),
      }
    );
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const counts = {
    total: categoryData.length,
    active: categoryData[0]?.total_active_categories || 0,
    inactive: categoryData[0]?.total_inactive_categories || 0,
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    {
      label: outletInfo?.outlet_name || "Loading...",
      path: `/view-outlet/${outletId}`,
    },
    { label: "Categories" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb items={breadcrumbItems} />
        <SyncStatusBadge outletId={outletId} />
      </div>

      <div className="grid grid-cols-1">
        {categoryLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : categoryError ? (
          <div className="col-span-full text-center py-8 text-error-500">
            {categoryError.message || "Failed to fetch category details"}
          </div>
        ) : (
          <div className="col-span-full">
            <MenuCategoryTable
              data={{ menucat_details: categoryData }}
              counts={counts}
              onDelete={(row) => {
                setCategoryToDelete(row);
                setShowDeleteModal(true);
              }}
              noDataMessage="No categories found. Create your first category to get started."
              onCreateCategory={() => navigate(`/create-category/${outletId}`)}
              onBulkAction={handleBulkAction}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              enableStatusFilter={true}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onDelete={handleDeleteCategory}
      />
    </>
  );
}

function MenuCategoryTable({
  data,
  counts,
  onDelete,
  noDataMessage,
  onCreateCategory,
  onBulkAction,
  selectedItems,
  onSelectionChange,
  enableStatusFilter,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
}) {
  const navigate = useNavigate();

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

  const filteredData = {
    ...data,
    menucat_details: data.menucat_details.filter((item) => {
      if (!item.menu_cat_id || !item.category_name) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return item.is_active === 1;
      if (statusFilter === "inactive") return item.is_active === 0;
      return true;
    }),
  };

  const handleView = (row) => {
    navigate(
      `/category-details/${row.outlet_id}/${row.menu_cat_id || row.sync_uuid}`
    );
  };

  const handleDelete = (row) => {
    if (onDelete) onDelete(row);
  };

  const columns = [
    {
      field: "category_name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-3">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {value}
          </span>
          {row.dirty ? (
            <span className="text-[10px] uppercase tracking-wide text-amber-600">
              pending
            </span>
          ) : null}
        </div>
      ),
    },
    {
      field: "menu_count",
      header: "Menu Items",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center justify-center rounded-full  px-2.5 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-white/90">
          {value}
        </span>
      ),
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
            {value === 1 ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
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
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Category"
            onClick={() => handleDelete(row)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={filteredData.menucat_details}
      columns={columns}
      title="Menu Categories"
      counts={counts}
      enableSort={true}
      enableSearch={true}
      enablePagination={true}
      searchPlaceholder="Search categories"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      darkMode={false}
      showBackButton={true}
      onBackClick={() => navigate(-1)}
      backButtonLabel="Back"
      enableSelection={true}
      onBulkAction={onBulkAction}
      onSelectionChange={onSelectionChange}
      selectedItems={selectedItems}
      enableStatusFilter={enableStatusFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      createButton={{
        show: true,
        label: "Create",
        position: "right",
        className: "bg-success-500 hover:bg-success-600",
        onClick: onCreateCategory,
        icon: faPlus,
      }}
      noDataMessage={noDataMessage}
      bulkActionOptions={bulkActionOptions}
    />
  );
}

export default ManageCategories;
