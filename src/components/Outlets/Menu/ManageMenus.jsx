import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';
import Breadcrumb from '../../Breadcrumb';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import Modal from '../../common/Modal';

function ManageMenus() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Menus' }
  ];

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getToken();
        const response = await axios.post(
          'https://men4u.xyz/v2/common/menu_list',
          {
            outlet_id: outletId,
            user_id: adminData?.user_id,
            app_source: 'admin_dashboard',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        setMenuData(response.data.detail || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu list');
      } finally {
        setLoading(false);
      }
    };

    if (adminData?.user_id && outletId) {
      fetchMenus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminData?.user_id, outletId]);

  // Action handlers with correct dynamic routes
  const handleView = (row) => {
    navigate(`/menu-details/${row.outlet_id}/${row.menu_id}`);
  };
  const handleEdit = (row) => {
    navigate(`/edit-menu/${row.outlet_id}/${row.menu_id}`);
  };
  const handleDelete = (row) => {
    setSelectedMenu(row);
    setShowDeleteModal(true);
  };
  const handleCreateMenu = () => {
    navigate(`/create-menu/${outletId}`);
  };

  // Add handleDeleteConfirm function
  const handleDeleteConfirm = async () => {
    try {
      const token = getToken();
      await axios.delete('https://men4u.xyz/v2/common/menu_delete', {
        data: {
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
          menu_id: selectedMenu.menu_id,
          app_source: 'admin_dashboard'
        },
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Refresh the menu list
      setMenuData(prevData => prevData.filter(menu => menu.menu_id !== selectedMenu.menu_id));
      setShowDeleteModal(false);
      setSelectedMenu(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu');
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      field: 'category_name',
      header: 'Category',
      sortable: true,
    },
    {
      field: 'food_type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: 'spicy_index',
      header: 'Spicy',
      sortable: true,
      render: (value) => value ? value : '-',
    },
    {
      field: 'is_active',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      field: 'portions',
      header: 'Portions',
      sortable: false,
      render: (value) => (
        <div className="flex flex-col gap-1">
          {value?.map((portion, idx) => (
            <span key={idx} className="text-xs">
              {portion.portion_name}: ₹{portion.price} ({portion.unit_value}{portion.unit_type})
            </span>
          ))}
        </div>
      ),
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
            onClick={() => handleView(row)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Menu"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Menu"
            onClick={() => handleDelete(row)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Place the actions column at the end
  const allColumns = [
    ...columns.slice(0, 6), // your 6 columns (removed rating column)
    columns[6] // actions column
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <DataTable
        data={menuData}
        columns={allColumns}
        title="Menu List"
        enableSort={true}
        enableSearch={true}
        enablePagination={true}
        searchPlaceholder="Search menus..."
        noDataMessage="No menus found."
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        backButtonLabel="Back"
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
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMenu(null);
        }}
        type="error"
        title="Confirm Deletion"
        size="small"
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedMenu(null);
              }}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover hover:text-gray-800 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete Menu
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete {selectedMenu?.name}? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this menu will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ManageMenus;