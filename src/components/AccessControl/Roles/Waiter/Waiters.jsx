import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
  faExclamationTriangle,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from '../../../Breadcrumb';
import DataTable from '../../../common/DataTable';
import Modal from '../../../common/Modal';
import { toastController } from "../../../../utils/toastController";

function Waiters() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  
  const [waiters, setWaiters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [waiterToDelete, setWaiterToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [outletName, setOutletName] = useState('');

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchWaiters();
    }
  }, [adminData?.user_id, outletId]);

  const fetchWaiters = async () => {
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/waiter_listview",
        {
          user_id: adminData.user_id,
          outlet_id: Number(outletId),
          app_source: "admin_app"
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      setWaiters(response.data.data || []);
      
      if (response.data.data && response.data.data.length > 0) {
        setOutletName(response.data.data[0].outlet_name);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching waiters:", error);
      setIsLoading(false);
    }
  };

  const handleViewWaiter = (user_id) => {
    navigate(`/waiter-details/${outletId}/${user_id}`);
  };

  const handleEditWaiter = (user_id) => {
    navigate(`/edit-waiter/${outletId}/${user_id}`);
  };

  const handleDeleteWaiter = async () => {
    try {
      await axios.delete("https://men4u.xyz/v2/common/waiter_delete", {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: waiterToDelete.toString(),
          app_source: "admin_app",
        },
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });

      setShowDeleteModal(false);
      setWaiterToDelete(null);
      fetchWaiters();
    } catch (error) {
      console.error("Error deleting waiter:", error);
    }
  };

  const openDeleteModal = (user_id) => {
    setWaiterToDelete(user_id);
    setShowDeleteModal(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: outletName || 'Outlet', path: `/view-outlet/${outletId}` },
    { label: 'Waiters' }
  ];

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
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
      )
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, waiter) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewWaiter(waiter.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditWaiter(waiter.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Waiter"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(waiter.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Waiter"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => waiters.length;
  const getActiveCount = () => waiters.filter((waiter) => waiter.is_active).length;
  const getInactiveCount = () => waiters.filter((waiter) => !waiter.is_active).length;

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const actionMessages = {
        active: {
          loading: "Activating selected waiters...",
          success: "Successfully activated selected waiters",
          error: "Failed to activate waiters"
        },
        inactive: {
          loading: "Deactivating selected waiters...",
          success: "Successfully deactivated selected waiters",
          error: "Failed to deactivate waiters"
        },
        delete: {
          loading: "Deleting selected waiters...",
          success: "Successfully deleted selected waiters",
          error: "Failed to delete waiters"
        }
      };

      const response = await toastController.promise(
        axios.post(
          "https://men4u.xyz/v2/common/bulk_waiter_action",
          {
            user_id: adminData.user_id,
            action: action,
            app_source: "admin_app",
            waiter_ids: selectedIds
          },
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        ),
        actionMessages[action]
      );

      fetchWaiters();
      
      setSelectedItems([]);
      
      toastController.success(response.data.detail);
      
    } catch (error) {
      toastController.error(
        error.response?.data?.detail || 
        `Failed to perform ${action} action on selected waiters`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={waiters}
        columns={columns}
        enablePagination={true}
        itemsPerPage={10}
        itemsPerPageOptions={[10, 20, 30, 40, 50]}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        
        title="Waiters"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search waiters..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-waiter/${outletId}`),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setWaiterToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setWaiterToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteWaiter}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Waiter
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="h-8 w-8 text-error-500"
          />
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this waiter? <br/>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Waiters;