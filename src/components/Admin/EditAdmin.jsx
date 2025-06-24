import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { TextInput, SelectInput } from '../forms/FormElements';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';

function EditAdmin() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    is_active: 1
  });
  const [validationStates, setValidationStates] = useState({
    is_active: false
  });
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    email: ''
  });

  // Status options for the select input
  const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' }
  ];

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

      // Set form data with numeric is_active value
      setFormData({
        name: response.data.name,
        mobile: response.data.mobile,
        email: response.data.email,
        is_active: response.data.is_active ? 1 : 0
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
    
    if (name === 'mobile') {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      const firstDigit = numbersOnly.charAt(0);
      
      // If starts with 1-5, clear the field
      if (firstDigit && ['1','2','3','4','5'].includes(firstDigit)) {
        setFormData(prev => ({
          ...prev,
          [name]: '' // Clear the field
        }));
        setErrors(prev => ({
          ...prev,
          mobile: 'Mobile number must start with 6, 7, 8, or 9'
        }));
      } else {
        // For valid numbers (6-9) or empty field
        setFormData(prev => ({
          ...prev,
          [name]: numbersOnly.slice(0, 10)
        }));
        setErrors(prev => ({
          ...prev,
          mobile: ''
        }));
      }
    } else if (name === 'is_active') {
      // Handle status changes
      if (value === '') {
        setValidationStates(prev => ({
          ...prev,
          is_active: true
        }));
      } else {
        setValidationStates(prev => ({
          ...prev,
          is_active: false
        }));
      }
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user starts typing
      if (name in errors) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleFocus = (fieldName) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: false
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
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must start with 6, 7, 8, or 9 and be 10 digits';
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

    // Status validation - Check if status is empty or undefined
    if (formData.is_active === undefined || formData.is_active === '') {
      setValidationStates(prev => ({
        ...prev,
        is_active: true
      }));
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

      const response = await axios.patch(
        'https://men4u.xyz/v2/admin/update_admin',
        {
          user_id: adminData.user_id,
          admin_id: parseInt(adminId),
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          is_active: formData.is_active
        },
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
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Title - Centered between buttons */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Admin
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {apiError && (
            <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-500/10">
              {apiError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <TextInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter admin name"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.name ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {errors.name && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  required
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.mobile ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {errors.mobile && (
                  <p className="text-error-500 text-sm mt-1">
                    {errors.mobile}
                  </p>
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
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${errors.email   ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {errors.email && (
                  <p className="text-error-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <SelectInput
                  label="Status"
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  onFocus={() => handleFocus('is_active')}
                  error={validationStates.is_active}
                  errorMessage="Please select a status"
                  required
                  options={statusOptions}
                  placeholder="Select Status"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditAdmin;