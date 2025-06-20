import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
  SelectInput
} from './forms/FormElements.jsx';
import Breadcrumb from './Breadcrumb';

function EditOwner() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    aadhar_number: '',
    address: '',
    account_type: '',
    is_active: 0,
    functionality_ids: []
  });

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Owners", path: "/owners" },
    { label: "Edit Owner", path: `/edit-owner/${ownerId}` },
  ];

  useEffect(() => {
    if (adminData?.user_id && ownerId) {
      fetchOwnerDetails();
    }
  }, [adminData?.user_id, ownerId]);

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/admin/get_ubac_functionalities',
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setFunctionalities(response.data);
    } catch (err) {
      console.error('Error fetching functionalities:', err);
      setError('Failed to load functionalities');
    }
  };

  const fetchOwnerDetails = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/common/view_owner',
        {
          owner_id: Number(ownerId),
          user_id: adminData.user_id
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      const funcIds = response.data.functionalities.map(f => f.functionality_id);
      setSelectedFunctionalities(funcIds);

      setFormData({
        name: response.data.name,
        email: response.data.email,
        mobile: response.data.mobile,
        dob: response.data.dob,
        aadhar_number: response.data.aadhar_number,
        address: response.data.address,
        account_type: response.data.account_type,
        is_active: response.data.is_active,
        functionality_ids: funcIds
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch owner details');
      console.error('Error fetching owner details:', err);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.patch(
        'https://men4u.xyz/v2/common/update_owner',
        {
          update_user_id: adminData.user_id,
          user_id: parseInt(ownerId),
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          aadhar_number: formData.aadhar_number,
          dob: formData.dob,
          email: formData.email,
          account_type: formData.account_type,
          functionality_ids: formData.functionality_ids,
          is_active: Number(formData.is_active)
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.detail === "Owner updated successfully") {
        navigate(-1);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update owner');
      console.error('Error updating owner:', err);
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
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
              Edit Owner
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              <TextInput
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                pattern="[0-9]{10}"
              />

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                placeholder="Select date of birth"
              />

              <TextInput
                label="Aadhar Number"
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhar number"
                required
                pattern="[0-9]{12}"
                maxLength="12"
              />

              {/* Owner Status - Added to the grid */}
              <SelectInput
                label="Owner Status"
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                required
                options={[
                  { value: 1, label: 'Active' },
                  { value: 0, label: 'Inactive' }
                ]}
                placeholder="Select Status"
              />

              {/* Account Type - Modified for live/test options */}
              <SelectInput
                label="Account Type"
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                required
                options={[
                  { value: 'live', label: 'Live' },
                  { value: 'test', label: 'Test' }
                ]}
                placeholder="Select Account Type"
              />
            </div>

            {/* Address - Keep this outside the grid as it's full width */}
            <Textarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows={3}
              required
            />

            {/* Functionalities */}
            <div>
              <label className={labelStyles}>
                <span className="text-error-600 text-red-500 mr-1">*</span>
                Functionalities
              </label>
              <div className="mt-2 rounded-lg p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  {functionalities.map((func) => (
                    <div key={func.functionality_id} className="min-w-[200px] flex-1">
                      <Checkbox
                        label={func.functionality_name}
                        value={func.functionality_id}
                        checked={selectedFunctionalities.includes(func.functionality_id)}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setSelectedFunctionalities(prev =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter(id => id !== value)
                          );
                          setFormData(prev => ({
                            ...prev,
                            functionality_ids: e.target.checked
                              ? [...prev.functionality_ids, value]
                              : prev.functionality_ids.filter(id => id !== value)
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Functionalities Tags */}
              {/* {selectedFunctionalities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFunctionalities.map(id => {
                    const func = functionalities.find(f => f.functionality_id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {func?.functionality_name}
                        <button
                          type="button"
                          className="ml-1 inline-flex items-center justify-center"
                          onClick={() => {
                            setSelectedFunctionalities(prev => prev.filter(fid => fid !== id));
                            setFormData(prev => ({
                              ...prev,
                              functionality_ids: prev.functionality_ids.filter(fid => fid !== id)
                            }));
                          }}
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )} */}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error-500 text-sm mt-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditOwner;