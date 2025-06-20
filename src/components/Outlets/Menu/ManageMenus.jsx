import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';
import Breadcrumb from '../../Breadcrumb';

function ManageMenus() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Define columns for DataTable
  const columns = [
    {
      field: 'image',
      header: 'Image',
      sortable: false,
      render: (value, row) => (
        value ? (
          <img src={value} alt={row.name} className="h-10 w-10 object-cover rounded" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )
      ),
    },
    {
      field: 'name',
      header: 'Menu Name',
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
          columns={columns}
          title="Menus"
          enableSort={true}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder="Search menus..."
          noDataMessage="No menus found."
        />
      )}
    </div>
  );
}

export default ManageMenus;