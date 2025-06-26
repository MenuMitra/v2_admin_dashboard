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

function Captains() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  
  const [captains, setCaptains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [captainToDelete, setCaptainToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchCaptains();
    }
  }, [adminData?.user_id, outletId]);

  const fetchCaptains = async () => {
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/captain_listview",
        {
          user_id: adminData.user_id,
          outlet_id: Number(outletId),
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      setCaptains(response.data.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching captains:", error);
      setIsLoading(false);
    }
  };

  const handleViewCaptain = (user_id) => {
    navigate(`/captain-details/${outletId}/${user_id}`);
  };

  const handleEditCaptain = (user_id) => {
    navigate(`/edit-captain/${outletId}/${user_id}`);
  };

  const handleDeleteCaptain = async () => {
    try {
      await axios.delete("https://men4u.xyz/v2/common/captain_delete", {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: captainToDelete.toString(),
          app_source: "admin_dashboard",
        },
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });

      setShowDeleteModal(false);
      setCaptainToDelete(null);
      fetchCaptains();
    } catch (error) {
      console.error("Error deleting captain:", error);
    }
  };

  const openDeleteModal = (user_id) => {
    setCaptainToDelete(user_id);
    setShowDeleteModal(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Captains' }
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
      field: "created_on",
      header: "Created On",
      sortable: true,
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          value ? 'text-success-700' : 'text-error-700'
        }`}>
          <FontAwesomeIcon icon={value ? faCircleCheck : faCircleXmark} className="w-3.5 h-3.5" />
          {/* {value ? 'Active' : 'Inactive'} */}
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, captain) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewCaptain(captain.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditCaptain(captain.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Captain"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(captain.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Captain"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => captains.length;
  const getActiveCount = () => captains.filter((captain) => captain.is_active).length;
  const getInactiveCount = () => captains.filter((captain) => !captain.is_active).length;

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
        data={captains}
        columns={columns}
        enablePagination={true}
        itemsPerPage={10}
        itemsPerPageOptions={[10, 20, 30, 40, 50]}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        
        // Enable selection and bulk actions
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        
        // Header props
        title="Captains"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search captains..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-captain/${outletId}`),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        
        // Add status filter props
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCaptainToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCaptainToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCaptain}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Captain
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
            Are you sure you want to delete this captain? <br/>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Captains;