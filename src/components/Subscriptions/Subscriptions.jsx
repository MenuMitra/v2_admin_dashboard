import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { API_CONFIG } from '../../config/appConfig';
import { toastController } from '../../utils/toastController';

function Subscriptions() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Subscriptions', path: '/subscriptions' }
  ];

  // Define columns for DataTable
  const columns = [
    {
      field: 'subscription_id',
      header: 'ID',
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {value}
          </span>
        </div>
      )
    },
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {value}
          </span>
        </div>
      )
    },
    {
      field: 'price',
      header: 'Price',
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            ₹{value.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      field: 'subscription_start_date',
      header: 'Start Date',
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="text-gray-800 text-theme-sm dark:text-white/90">
            {value}
          </span>
        </div>
      )
    },
    {
      field: 'subscription_end_date',
      header: 'End Date',
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="text-gray-800 text-theme-sm dark:text-white/90">
            {value}
          </span>
        </div>
      )
    },
    {
      field: 'features',
      header: 'Features',
      sortable: false,
      headerClassName: "text-center",
      render: (features) => (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {features.map((feature) => (
            <span
              key={feature.feature_id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
            >
              {feature.name.split('_').join(' ')}
            </span>
          ))}
        </div>
      )
    }
  ];

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/list_subscriptions`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Subscription list fetched successfully") {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toastController.error(error.response?.data?.detail || 'Failed to fetch subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={subscriptions}
        columns={columns}
        title="Subscriptions"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={null}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search subscriptions"
        enableSort={true}
        enablePagination={false}
        enableSearch={false}
        enableStatusFilter={false}
        showSearch={false}
        itemsPerPage={50}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate('/create-subscription'),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new subscription"
        }}
      />
    </>
  );
}

export default Subscriptions;