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
      setCustomers(response.data.customers || []);
      setOutletName(response.data.outlet_name || '');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataTable
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
      field: 'order_count',
      header: 'Order Count',
      sortable: true,
      render: (value) => value ?? '-'
    },
    // {
    //   field: 'actions',
    //   header: 'Actions',
    //   sortable: false,
    //   render: (_, customer) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         onClick={() => navigate(`/customer-details/${customer.user_id}`, { 
    //           state: { customerData: customer }
    //         })}
    //         className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
    //         title="View Details"
    //       >
    //         <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
    //       </button>
    //     </div>
    //   )
    // }
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

      {/* Outlet Dropdown */}
      <div className="mb-6">
        <select
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={selectedOutlet}
          onChange={e => setSelectedOutlet(e.target.value)}
        >
          <option value="">All Outlets</option>
          {outlets.map((outlet) => (
            <option key={outlet.outlet_id} value={outlet.outlet_id}>
              {outlet.outlet_name} ({outlet.outlet_code})
            </option>
          ))}
        </select>
      </div>

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
        itemsPerPage={10}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
      />
    </>
  );
}

export default Customer;