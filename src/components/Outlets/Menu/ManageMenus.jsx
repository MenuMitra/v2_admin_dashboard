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
  faTrash
} from "@fortawesome/free-solid-svg-icons";

function ManageMenus() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    alert(`Delete menu: ${row.name}`);
  };
  const handleCreateMenu = () => {
    navigate(`/create-menu/${outletId}`);
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
      field: 'rating',
      header: 'Rating',
      sortable: true,
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
    ...columns.slice(0, 7), // your 7 columns (removed image column)
    columns[7] // actions column
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <h2 className="text-xl font-semibold mb-4">Menu List</h2>
      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-error-500">{error}</div>
      ) : (
        <DataTable
          data={menuData}
          columns={allColumns}
          title="Menus"
          enableSort={true}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder="Search menus..."
          noDataMessage="No menus found."
          createButton={{
            show: true,
            label: "Add Menu",
            position: "right",
            className: "bg-brand-500 hover:bg-brand-600",
            onClick: handleCreateMenu,
          }}
        />
      )}
    </div>
  );
}

export default ManageMenus;