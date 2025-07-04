import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { API_CONFIG } from '../../config/appConfig';
import { toastController } from '../../utils/toastController';

function Features() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Features', path: '/features' }
  ];

  // Define columns for DataTable
  const columns = [
    {
      field: 'feature_id',
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
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90 capitalize">
            {value.split('_').join(' ')}
          </span>
        </div>
      )
    }
  ];

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/list_features`,
          {
            user_id: adminData.user_id,
            app_source: "admin_app"
          },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Loading features...',
          success: 'Features loaded successfully!',
          error: 'Failed to load features'
        }
      );

      if (response.data.detail === "Feature list fetched successfully") {
        setFeatures(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      toastController.error(error.response?.data?.detail || 'Failed to fetch features');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminData?.user_id) {
      fetchFeatures();
    }
  }, [adminData?.user_id]);

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
        data={features}
        columns={columns}
        title="Features"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search features"
        enableSort={true}
        enablePagination={false}
        enableSearch={false}
        enableStatusFilter={false}
        showSearch={false}
        itemsPerPage={50}
        showCreateButton={false}
      />
    </>
  );
}

export default Features;