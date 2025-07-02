import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../Breadcrumb';

function RoleFunctionalitiesMapping() {
  const { roleId } = useParams();
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
      {/* Add Breadcrumb component */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Role Functionalities Mapping
        </h2>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {mappings.length > 0 && (
          <div>
            <div className="mb-6">
              <span className="text-lg font-medium text-gray-800">
                Role: <span className="capitalize bg-brand-50 text-brand-600 px-3 py-1 rounded-full">{mappings[0].role_name}</span>
              </span>
            </div>

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
                      Functionality ID: {mapping.functionality_id}
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
  );
}

export default RoleFunctionalitiesMapping;