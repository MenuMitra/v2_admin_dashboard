import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';

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

  // Fetch outlets on mount
  useEffect(() => {
    fetchOutlets();
    // Fetch customers immediately without waiting for outlet selection
    fetchCustomers();
  }, []);

  // Fetch customers when selectedOutlet changes
  useEffect(() => {
    if (selectedOutlet) { // Only fetch if an outlet is actually selected
      fetchCustomers(selectedOutlet);
    }
  }, [selectedOutlet]);

  const fetchOutlets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/common/listview_outlet',
        {
          user_id: adminData?.user_id,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setOutlets(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch outlets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (outlet_id = null) => {
    setLoading(true);
    setError(null);
    try {
      const requestData = {
        user_id: adminData?.user_id,
        app_source: "admin_dashboard"
      };

      // Only add outlet_id if it's explicitly provided and not empty
      if (outlet_id && outlet_id !== '') {
        requestData.outlet_id = outlet_id;
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/customer_listview',
        requestData,
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      // Update to use the new response format
      setCustomers(response.data.customers || []);
      setOutletName(response.data.outlet_name || '');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Update columns to include new fields
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
    // {
    //   field: 'total_orders_in_outlet',
    //   header: 'Orders in Outlet',
    //   sortable: true,
    //   render: (value) => value ?? '0'
    // },
    {
      field: 'total_orders_all_outlets',
      header: 'Total Orders',
      sortable: true,
      render: (value) => value ?? '0'
    },
    {
      field: 'created_on',
      header: 'Joined Date',
      sortable: true
    },
    {
      field: 'last_login',
      header: 'Last Login',
      sortable: true,
      render: (value) => value || '-'
    }
  ];

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
          total: customers.length, // or use response.data.total_customers if you want to store it
          active: customers.filter(c => c.is_active === true).length,  // Updated to handle boolean
          inactive: customers.filter(c => c.is_active !== true).length // Updated to handle boolean
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
        // Enable outlet selection in DataTable
        showOutletSelect={true}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={setSelectedOutlet}
        isLoading={loading}
      />
    </>
  );
}

export default Customer;