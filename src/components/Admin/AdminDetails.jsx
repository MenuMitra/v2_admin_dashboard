import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

function AdminDetails() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admins', path: '/admins' },
    { label: 'Admin Details', path: `/admin-details/${adminId}` }
  ];

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchAdminDetails();
  }, [adminId]);

  const fetchAdminDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_admin',
        { admin_id: parseInt(adminId) },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setAdmin(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch admin details');
      console.error('Error fetching admin details:', err);
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

  if (error) {
    return (
      <div className="p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-4xl mx-auto mt-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admins')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            Back to Admins
          </button>
        </div>

        {/* Admin Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden dark:border-gray-800 dark:bg-gray-900">
          {/* Basic Info Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
              Admin Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {admin.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {admin.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {admin.mobile}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <FontAwesomeIcon 
                    icon={admin.is_active ? faCircleCheck : faCircleXmark} 
                    className={`w-5 h-5 ${admin.is_active ? 'text-success-500' : 'text-error-500'}`} 
                  />
                  <span className={`text-base font-medium ${admin.is_active ? 'text-success-700' : 'text-error-700'}`}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {formatDate(admin.created_on)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {formatDate(admin.updated_on)}
                </p>
              </div>
            </div>
          </div>

          {/* Functionalities Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Assigned Functionalities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {admin.functionalities.map((functionality) => (
                <div
                  key={functionality.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <FontAwesomeIcon 
                    icon={faCircleCheck} 
                    className="w-4 h-4 text-success-500" 
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {functionality.name.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDetails;