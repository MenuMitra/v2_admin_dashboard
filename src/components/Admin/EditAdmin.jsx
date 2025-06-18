import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TextInput } from '../forms/FormElements';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';

function EditAdmin() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    is_active: true
  });
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admins', path: '/admins' },
    { label: 'Edit Admin', path: `/edit-admin/${adminId}` }
  ];

  useEffect(() => {
    fetchAdminDetails();
  }, [adminId]);

  const fetchAdminDetails = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
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

      // Set form data directly from response
      setFormData({
        name: response.data.name,
        mobile: response.data.mobile,
        email: response.data.email,
        is_active: response.data.is_active
      });
    } catch (err) {
      setApiError(err.response?.data?.detail || err.message || 'Failed to fetch admin details');
      console.error('Error fetching admin details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.put(
        `https://men4u.xyz/v2/admin/update_admin/${adminId}`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        navigate('/admins');
      } else {
        throw new Error('Failed to update admin');
      }
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to update admin');
      console.error('Error updating admin:', err);
    } finally {
      setIsSubmitting(false);
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
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
            Edit Admin
          </h2>

          {apiError && (
            <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-500/10">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TextInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter admin name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <TextInput
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10 digit mobile number"
                pattern="[0-9]{10}"
                required
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div>
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admins')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 ${
                  isSubmitting ? 'cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAdmin;