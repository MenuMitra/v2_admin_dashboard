import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronLeft as faBack, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../Breadcrumb';
import Modal from '../../common/Modal';

function RoleFunctionalitiesMapping() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [showEditModal, setShowEditModal] = useState(false);
  const [allFunctionalities, setAllFunctionalities] = useState([]);
  const [isLoadingFunctionalities, setIsLoadingFunctionalities] = useState(false);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Access Control', path: '/dashboard' },
    { label: 'Roles', path: '/roles' },
    { label: 'Role Functionalities', path: '#' }
  ];

  useEffect(() => {
    fetchRoleFunctionalityMappings();
  }, [roleId]);

  useEffect(() => {
    if (showEditModal) {
      setSelectedFunctionalities(mappings.map(m => m.functionality_id));
    }
  }, [showEditModal, mappings]);

  const fetchRoleFunctionalityMappings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/listview_ubac_role_functionality_mapping`,
        { role_id: parseInt(roleId) },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setMappings(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch role functionality mappings');
      console.error('Error fetching mappings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFunctionalities = async () => {
    try {
      setIsLoadingFunctionalities(true);
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

      setAllFunctionalities(response.data);
    } catch (err) {
      console.error('Error fetching functionalities:', err);
    } finally {
      setIsLoadingFunctionalities(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        `${BASE_URL}/${API_VERSION}/common/create_ubac_user_functionalities`,
        {
          functionality_id: selectedFunctionalities,
          user_id: parseInt(roleId) // Using roleId as user_id
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Close modal and refresh the mappings
      setShowEditModal(false);
      fetchRoleFunctionalityMappings();
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to save functionalities');
      console.error('Error saving functionalities:', err);
    } finally {
      setIsSaving(false);
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
    <div className="">
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Edit */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title with Role Name */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              {mappings.length > 0 ? (
                <>
                  Role Functionalities: <span className="capitalize text-brand-600">{mappings[0].role_name}</span>
                </>
              ) : (
                'Role Functionalities Mapping'
              )}
            </div>

            {/* Right Side - Edit */}
            <div className="flex items-center gap-4 order-3">
              <button
                onClick={() => {
                  fetchAllFunctionalities();
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                <span className="hidden sm:inline">Assign</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {mappings.length > 0 && (
            <div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.functionality_id}
                    className="p-4 border border-gray-200 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-2">
                        {mapping.functionality_name.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        ID: {mapping.functionality_id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mappings.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">No functionalities mapped to this role.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Functionalities : ${mappings[0]?.role_name || 'Role'}`}
          size="large"
        >
          <div className="w-full">
            {isLoadingFunctionalities ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-error-600 text-red-500 mr-1">*</span>
                    Select Functionalities
                  </label>

                  <div className="relative">

                    {/* Functionalities List */}
                    <div className="border rounded-lg" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                        {allFunctionalities.map((functionality) => (
                          <div
                            key={functionality.functionality_id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50 border rounded-lg
                              ${selectedFunctionalities.includes(functionality.functionality_id)
                                ? 'bg-brand-50 border-brand-500' 
                                : 'border-gray-200'
                              }
                            `}
                            onClick={() => {
                              const isSelected = selectedFunctionalities.includes(functionality.functionality_id);
                              setSelectedFunctionalities(prev => 
                                isSelected
                                  ? prev.filter(id => id !== functionality.functionality_id)
                                  : [...prev, functionality.functionality_id]
                              );
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedFunctionalities.includes(functionality.functionality_id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (e.target.checked) {
                                    setSelectedFunctionalities([...selectedFunctionalities, functionality.functionality_id]);
                                  } else {
                                    setSelectedFunctionalities(selectedFunctionalities.filter(id => id !== functionality.functionality_id));
                                  }
                                }}
                                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {functionality.functionality_name.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {functionality.functionality_id}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  {saveError && (
                    <div className="flex-1 text-sm text-red-500">
                      {saveError}
                    </div>
                  )}
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RoleFunctionalitiesMapping;