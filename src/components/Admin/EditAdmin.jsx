import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { TextInput, SelectInput } from '../forms/FormElements';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import { toastController } from '../../utils/toastController';
import { API_CONFIG } from '../../config/appConfig';

const { BASE_URL, API_VERSION } = API_CONFIG;

function EditAdmin() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminDetails, setAdminDetails] = useState({
    name: '',
    mobile: '',
    email: '',
    is_active: true,
    role: 'admin'
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    mobileMessage: '',
    is_active: true
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [emailApiError, setEmailApiError] = useState('');

  // Status options for the select input
  const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
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
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/view_admin`,
        { admin_id: parseInt(adminId) },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setAdminDetails({
        name: response.data.name,
        mobile: response.data.mobile,
        email: response.data.email,
        is_active: response.data.is_active,
        role: 'admin'
      });
    } catch (error) {
      toastController.error(error.response?.data?.detail || 'Failed to fetch admin details');
      console.error('Error fetching admin details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobileValid = (mobile) => {
    if (!mobile) return { isValid: false, message: 'Mobile number is required' };
    const numbersOnly = mobile.replace(/[^0-9]/g, '');
    const firstDigit = numbersOnly.charAt(0);
    
    if (['0','1','2','3','4','5'].includes(firstDigit)) {
      return { isValid: false, message: 'Mobile number must start with 6, 7, 8, or 9' };
    }
    
    if (numbersOnly.length !== 10) {
      return { isValid: false, message: 'Mobile number must be 10 digits' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      const firstDigit = numbersOnly.charAt(0);
      
      if (firstDigit && ['0','1','2','3','4','5'].includes(firstDigit)) {
        setValidationStates(prev => ({
          ...prev,
          mobile: false,
          mobileMessage: 'Mobile number must start with 6, 7, 8, or 9'
        }));
        return;
      }

      setAdminDetails(prev => ({ ...prev, [name]: numbersOnly }));
      const { isValid, message } = isMobileValid(numbersOnly);
      setValidationStates(prev => ({
        ...prev,
        mobile: isValid,
        mobileMessage: message
      }));
    } 
    else if (name === 'email') {
      // Gmail validation
      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !gmailPattern.test(value)) {
        setEmailApiError('Email format is incorrect');
      } else {
        setEmailApiError('');
      }
      setAdminDetails(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    } 
    else if (name === 'is_active') {
      const boolValue = value === 'true';
      setAdminDetails(prev => ({
        ...prev,
        [name]: boolValue
      }));
      if (value === '') {
        setValidationStates(prev => ({
          ...prev,
          is_active: false
        }));
      } else {
        setValidationStates(prev => ({
          ...prev,
          is_active: true
        }));
      }
    }
    else {
      setAdminDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleValidation = (field) => (isValid) => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  const isFormValid = () => {
    return (
      adminDetails.name?.trim() && 
      adminDetails.mobile?.trim() && 
      adminDetails.email?.trim() &&
      adminDetails.is_active !== undefined &&
      validationStates.name &&
      validationStates.mobile &&
      validationStates.email &&
      validationStates.is_active
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitAttempted(true);
    
    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.patch(
          `${BASE_URL}/${API_VERSION}/admin/update_admin`,
          {
            user_id: adminData.user_id,
            admin_id: parseInt(adminId),
            name: adminDetails.name,
            email: adminDetails.email,
            mobile: adminDetails.mobile,
            is_active: adminDetails.is_active ? 1 : 0,
            role: adminDetails.role
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: "Updating admin...",
          success: "Admin updated successfully",
          error: (err) => err.response?.data?.detail || "Failed to update admin"
        }
      );

      navigate('/admins');
    } catch (error) {
      console.error('Error updating admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (fieldName) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: false
    }));
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

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Admin
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${isSubmitting || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-success-500 hover:bg-success-600"}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Name"
                name="name"
                value={adminDetails.name}
                onChange={handleChange}
                placeholder="Enter admin name"
                required
                validationType="name"
                onValidation={handleValidation("name")}
                isSubmitAttempted={isSubmitAttempted}
              />

              <div className="relative">
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={adminDetails.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  maxLength={10}
                  className={`
                    focus:border-brand-500 focus:ring-brand-500
                    ${!validationStates.mobile ? 'border-error-500' : 'border-gray-300'}
                  `}
                />
                {!validationStates.mobile && (
                  <p className="text-error-500 text-sm mt-1">
                    {validationStates.mobileMessage}
                  </p>
                )}
              </div>

              <div className="relative">
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={adminDetails.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  validationType="email"
                  onValidation={handleValidation("email")}
                  isSubmitAttempted={isSubmitAttempted}
                />
                {emailApiError && (
                  <p className="text-error-500 text-sm mt-1">{emailApiError}</p>
                )}
              </div>

              <SelectInput
                label="Status"
                name="is_active"
                value={adminDetails.is_active}
                onChange={handleChange}
                onFocus={() => handleFocus('is_active')}
                error={!validationStates.is_active && isSubmitAttempted}
                errorMessage="Please select a status"
                required
                options={statusOptions}
                placeholder="Select Status"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditAdmin;