import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faPlus, faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';

function Functionalities() {
  const { getToken } = useAuth();
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
        'https://men4u.xyz/v2/admin/get_ubac_functionalities',
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
        'https://men4u.xyz/v2/admin/create_ubac_functionality',
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
        'https://men4u.xyz/v2/admin/update_ubac_functionality',
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
        `https://men4u.xyz/v2/admin/delete_ubac_functionality/${deletingFunctionality.functionality_id}`,
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
      field: 'index',
      header: 'Sr',
      sortable: true,
      render: (value, item, index) => {
        // Ensure index is a number and add 1, fallback to array index if needed
        const displayIndex = typeof index === 'number' ? 
          index + 1 : 
          functionalities.indexOf(item) + 1;
        return displayIndex;
      }
    },
    {
      field: 'functionality_name',
      header: 'Functionality Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 capitalize">
          {value.replace(/_/g, ' ')}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <Link to="/access-control" className="text-gray-500 hover:text-gray-700">Access-control</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">Functionalities</span>
      </div>

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
          label: "Add Functionality",
          onClick: () => setShowCreateModal(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false
        }}
        searchPlaceholder="Search functionalities..."
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
        onBackClick={() => window.history.back()}
        showBackButton={true}
        backButtonLabel="Back"
      />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Functionality</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFunctionalityName('');
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Functionality'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Functionality</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFunctionality(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Functionality Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingFunctionality?.functionality_name || ''}
                onChange={(e) => setEditingFunctionality(prev => ({
                  ...prev,
                  functionality_name: e.target.value
                }))}
                placeholder="e.g., manage_orders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use underscores instead of spaces (e.g., manage_orders, view_reports)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingFunctionality(null);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isEditing}
              >
                Cancel
              </button>
              <button
                onClick={handleEditFunctionality}
                disabled={isEditing || !editingFunctionality?.functionality_name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isEditing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Functionality'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Functionality</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingFunctionality(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the functionality "{deletingFunctionality?.functionality_name.replace(/_/g, ' ')}"? This action cannot be undone.
              </p>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Functionalities;