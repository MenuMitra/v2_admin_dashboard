import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import Modal from '../common/Modal';
import { API_CONFIG } from '../../config/appConfig';
import { toastController } from '../../utils/toastController';

function Features() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleCreateFeature = async () => {
    if (!newFeatureName.trim()) {
      toastController.error('Please enter a feature name');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/create_feature`,
          {
            name: newFeatureName.toLowerCase().replace(/\s+/g, '_'),
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
          loading: 'Creating feature...',
          success: 'Feature created successfully!',
          error: 'Failed to create feature'
        }
      );

      // Reset form and close modal
      setNewFeatureName('');
      setIsModalOpen(false);
      
      // Refresh features list
      fetchFeatures();
    } catch (error) {
      console.error('Error creating feature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        counts={null}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search features"
        enableSort={true}
        enablePagination={false}
        enableSearch={false}
        enableStatusFilter={false}
        showSearch={false}
        itemsPerPage={50}
        showCreateButton={true}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => setIsModalOpen(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new feature"
        }}
      />

      {/* Create Feature Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewFeatureName('');
        }}
        title="Create New Feature"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label 
              htmlFor="featureName" 
              className="block text-xs sm:text-sm font-medium text-left text-gray-700 mb-2"
            >
              Feature Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="featureName"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
              placeholder="Enter feature name"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={handleCreateFeature}
              disabled={!newFeatureName.trim() || isSubmitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white rounded-full transition-colors duration-200
                ${!newFeatureName.trim() || isSubmitting
                  ? 'bg-success-500 cursor-not-allowed'
                  : 'bg-success-500 hover:bg-success-600'
                }`}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Features;