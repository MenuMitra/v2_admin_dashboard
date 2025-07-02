import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronLeft as faBack, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../Breadcrumb';

function RoleFunctionalitiesMapping() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { BASE_URL, API_VERSION } = API_CONFIG;

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
                onClick={() => navigate(`/edit-role/${roleId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
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
    </div>
  );
}

export default RoleFunctionalitiesMapping;