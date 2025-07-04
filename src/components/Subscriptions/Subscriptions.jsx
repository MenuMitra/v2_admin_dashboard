import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faPlus, faPencil, faTrash, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
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
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      )
    },
    {
      field: 'price',
      header: 'Price',
      sortable: true,
      render: (price) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          ₹{price}
        </p>
      )
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: "text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Subscription"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Subscription"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Subscription"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
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

  const handleView = (subscription) => {
    // Navigate to view subscription page
    navigate(`/subscriptions/${subscription.subscription_id}`);
  };

  const handleEdit = (subscription) => {
    // Navigate to edit subscription page
    navigate(`/subscriptions/edit/${subscription.subscription_id}`);
  };

  const handleDelete = async (subscription) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const token = getToken();
        if (!token) throw new Error('No authentication token available');

        const response = await axios.post(
          `${BASE_URL}/${API_VERSION}/admin/delete_subscription`,
          {
            subscription_id: subscription.subscription_id,
            user_id: adminData.user_id,
            app_source: "admin_app"
          },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.detail === "Subscription deleted successfully") {
          toastController.success('Subscription deleted successfully');
          // Refresh the subscriptions list
          fetchSubscriptions();
        }
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toastController.error(error.response?.data?.detail || 'Failed to delete subscription');
      }
    }
  };

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