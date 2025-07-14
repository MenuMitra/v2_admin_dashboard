import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faTrash, faPenToSquare, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import Modal from '../common/Modal';
import { toastController } from "../../utils/toastController";
import { API_CONFIG } from '../../config/appConfig';

function Customer() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [outletName, setOutletName] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Add new state for modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customerId: null
  });

  // Keep only this one useEffect that handles everything
  useEffect(() => {
    fetchCustomers(selectedOutlet);
  }, [selectedOutlet, statusFilter]); // This will handle both initial load and all subsequent changes


  // Modify fetchCustomers to handle all cases
  const fetchCustomers = async (outlet_id = null) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const requestData = {
        user_id: adminData?.user_id,
        app_source: "admin_app"
      };

      // Only add outlet_id if it's provided and not empty
      if (outlet_id && outlet_id !== '') {
        requestData.outlet_id = outlet_id;
      }

      // Only add status filter if it's not 'all'
      if (statusFilter !== 'all') {
        requestData.is_active = statusFilter === 'active' ? 1 : 0;
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/customer_listview`,
        requestData,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      setCustomers(response.data.customers || []);
      setOutletName(response.data.outlet_name || '');
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer_id) => {
    // Open delete confirmation modal
    setDeleteModal({
      isOpen: true,
      customerId: customer_id
    });
  };

  const confirmDelete = async () => {
    const customer_id = deleteModal.customerId;
    try {
      setLoading(true);
      await axios.delete(
        `${BASE_URL}/${API_VERSION}/admin/customer_delete`,
        {
          headers: {
            Authorization: getToken(),
          },
          data: {
            user_id: adminData?.user_id,
            customer_id: customer_id,
            app_source: "admin_app"
          }
        }
      );
      
      setDeleteModal({ isOpen: false, customerId: null });
      fetchCustomers(selectedOutlet);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      setLoading(true);
      await axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_customer_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          customer_ids: selectedIds
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      fetchCustomers(selectedOutlet);
      setSelectedItems([]);
      
    } catch (error) {
      setError(error.response?.data?.detail || `Failed to perform ${action} action`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setSearchTerm('');
    setStatusFilter(status.toLowerCase());
  };

  const columns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true
    },
    {
      field: 'mobile',
      header: 'Mobile',
      sortable: true
    },
    {
      field: 'total_orders_all_outlets',
      header: 'Total Orders',
      sortable: true,
      render: (value) => value ?? '0'
    },
    {
      field: 'is_active',
      header: 'Status',
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
      ),
    },
    {
      field: 'action',
      header: 'Action',
      sortable: false,
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/customer-details/${row.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate(`/edit-customer/${row.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Customer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteCustomer(row.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Customer"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Update columns to include the view action
  if (loading && !customers.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Customers' }
        ]} 
      />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={customers}
        columns={columns}
        title={`Customers${outletName ? ` - ${outletName}` : ''}`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: customers.length,
          active: customers.filter(c => c.is_active === 1).length,
          inactive: customers.filter(c => c.is_active !== 1).length
        }}
        createButton={{
          show: false
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[50, 100, 200]}
        onItemsPerPageChange={(value) => setItemsPerPage(Number(value))}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        enableStatusFilter={true}
        onStatusFilterChange={handleStatusFilterChange}
        statusFilter={statusFilter}
        isLoading={loading}
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        onReload={fetchCustomers}
      />

      {/* Add Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customerId: null })}
        title="Delete Customer"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => setDeleteModal({ isOpen: false, customerId: null })}
              className="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex h-11 items-center justify-center rounded-lg bg-error-500 px-6 text-sm font-medium text-white transition hover:bg-error-600"
            >
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
      </Modal>
    </>
  );
}

export default Customer;