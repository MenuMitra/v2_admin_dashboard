import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../Breadcrumb';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

function AddRoleAssignFunctionalities() {
  const { roleId } = useParams();
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionality, setSelectedFunctionality] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { BASE_URL, API_VERSION } = API_CONFIG;

  const breadcrumbItems = [
    { label: 'Home', path: '/home' },
    // { label: 'Access Control', path: '/access-control' },
    { label: 'Roles', path: '/roles' },
    { label: 'Assign Functionalities' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFunctionality) {
      toastController.error('Please select a functionality');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/common/create_ubac_user_functionalities`,
          {
            functionality_id: parseInt(selectedFunctionality),
            user_id: parseInt(user_id),
            app_source: "admin",
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Assigning functionality...',
          success: 'Functionality assigned successfully!',
          error: 'Failed to assign functionality'
        }
      );

      setSuccess(true);
      setSelectedFunctionality('');
      
      // Navigate back after successful assignment
      setTimeout(() => {
        navigate(-1);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign functionality');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Assign Functionalities
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Assign functionalities to the selected user
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Functionality Selection */}
              <div>
                <label 
                  htmlFor="functionality" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Functionality
                </label>
                <select
                  id="functionality"
                  value={selectedFunctionality}
                  onChange={(e) => setSelectedFunctionality(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Select a functionality</option>
                  {/* Add your functionality options here */}
                  <option value="1">Functionality 1</option>
                  <option value="2">Functionality 2</option>
                  {/* Add more options as needed */}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedFunctionality}
                  className={`px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading ? 'cursor-wait' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Assigning...
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Assign Functionality
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRoleAssignFunctionalities;