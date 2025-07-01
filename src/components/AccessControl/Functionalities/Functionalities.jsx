import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';
import Modal from '../../common/Modal';
import Breadcrumb from '../../Breadcrumb';
import { API_CONFIG } from "../../../config/appConfig";

function Functionalities() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [functionalities, setFunctionalities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFunctionalityName, setNewFunctionalityName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFunctionality, setEditingFunctionality] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFunctionality, setDeletingFunctionality] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { BASE_URL, API_VERSION } = API_CONFIG;

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setFunctionalities(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch functionalities');
      console.error('Error fetching functionalities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFunctionality = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_ubac_functionality`,
        {
          functionality_name: newFunctionalityName
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh functionalities list
      fetchFunctionalities();
      setShowCreateModal(false);
      setNewFunctionalityName('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create functionality');
      console.error('Error creating functionality:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditFunctionality = async () => {
    try {
      setIsEditing(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.put(
        `${BASE_URL}/${API_VERSION}/admin/update_ubac_functionality`,
        {
          functionality_id: editingFunctionality.functionality_id,
          functionality_name: editingFunctionality.functionality_name
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh functionalities list
      fetchFunctionalities();
      setShowEditModal(false);
      setEditingFunctionality(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update functionality');
      console.error('Error updating functionality:', err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteFunctionality = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete(
        `${BASE_URL}/${API_VERSION}/admin/delete_ubac_functionality/${deletingFunctionality.functionality_id}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh functionalities list
      fetchFunctionalities();
      setShowDeleteModal(false);
      setDeletingFunctionality(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete functionality');
      console.error('Error deleting functionality:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns for DataTable
  const columns = [

    {
      field: 'functionality_name',
      header: 'Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value}
        </span>
      )
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, functionality) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setEditingFunctionality(functionality);
              setShowEditModal(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Functionality"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingFunctionality(functionality);
              setShowDeleteModal(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Functionality"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Add this breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Access Control', path: '/dashboard' },
    { label: 'Functionalities', path: '/functionalities' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Replace the manual breadcrumb with */}
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={functionalities}
        columns={columns}
        title="Functionalities"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: functionalities.length,
          active: functionalities.length,
          inactive: 0
        }}
        createButton={{
          label: "Create",
          onClick: () => setShowCreateModal(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
        onBackClick={() => window.history.back()}
        showBackButton={true}
        backButtonLabel="Back"
      />

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewFunctionalityName('');
            setError(null);
          }}
          title="Add New Functionality"
          size="small"
        >
          <div className="text-left">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Functionality Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newFunctionalityName}
                onChange={(e) => setNewFunctionalityName(e.target.value)}
                placeholder="e.g., manage_orders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use underscores instead of spaces (e.g., manage_orders, view_reports)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewFunctionalityName('');
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFunctionality}
              disabled={isCreating || !newFunctionalityName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <span>Creating...</span>
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingFunctionality(null);
            setError(null);
          }}
          title="Edit Functionality"
          type="default"
          size="small"
        >
          <div className="w-full">
            <div className="mb-6">
              <label 
                htmlFor="functionalityName" 
                className="block text-sm font-medium text-left text-gray-700 mb-2"
              >
                Functionality Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="functionalityName"
                value={editingFunctionality?.functionality_name || ''}
                onChange={(e) => setEditingFunctionality(prev => ({
                  ...prev,
                  functionality_name: e.target.value
                }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
                placeholder="Enter functionality name"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use underscores instead of spaces (e.g., manage_orders, view_reports)
              </p>
            </div>

            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFunctionality(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFunctionality}
                disabled={!editingFunctionality?.functionality_name.trim() || isEditing}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full transition-colors duration-200
                  ${!editingFunctionality?.functionality_name.trim() || isEditing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-success-500 hover:bg-success-600'
                  }`}
              >
                {isEditing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingFunctionality(null);
            setError(null);
          }}
          title="Delete Functionality"
          size="small"
          type="error"
        >
          <div className="text-left">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-500 text-left">
                Are you sure you want to delete the functionality "{deletingFunctionality?.functionality_name.replace(/_/g, ' ')}"? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingFunctionality(null);
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFunctionality}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                'Delete Functionality'
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Functionalities;