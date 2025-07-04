import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import {
  TextInput,
  SelectInput,
  DateInput,
  Checkbox,
  labelStyles
} from '../forms/FormElements';
import Breadcrumb from '../Breadcrumb';
import { API_CONFIG } from '../../config/appConfig';
import { toastController } from '../../utils/toastController';

function CreateSubscription() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    subscription_end_date: '',
    feature_ids: []
  });
  const [validationStates, setValidationStates] = useState({
    name: false,
    price: false,
    subscription_end_date: false,
    feature_ids: false
  });

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Create Subscription' }
  ];

  // Fetch available features
  const fetchFeatures = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/list_features`,
        {
          user_id: adminData.user_id,
          app_source: "admin_app"
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Feature list fetched successfully") {
        setFeatures(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      toastController.error('Failed to fetch features');
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationStates(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const handleFeatureChange = (featureId) => {
    setFormData(prev => {
      const newFeatureIds = prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter(id => id !== featureId)
        : [...prev.feature_ids, featureId];
      
      return {
        ...prev,
        feature_ids: newFeatureIds
      };
    });
    setValidationStates(prev => ({
      ...prev,
      feature_ids: false
    }));
  };

  const validateForm = () => {
    const newValidationStates = {
      name: !formData.name.trim(),
      price: !formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0,
      subscription_end_date: !formData.subscription_end_date,
      feature_ids: formData.feature_ids.length === 0
    };

    setValidationStates(newValidationStates);
    return !Object.values(newValidationStates).some(state => state);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toastController.error('Please fill all required fields correctly');
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_subscription`,
        {
          ...formData,
          price: parseFloat(formData.price),
          user_id: adminData.user_id,
          app_source: "admin_app"
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Subscription created successfully") {
        toastController.success('Subscription created successfully');
        navigate('/subscriptions');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toastController.error(error.response?.data?.detail || 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Subscription
            </h1>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-brand-500 hover:bg-brand-600 
                transition shadow-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={validationStates.name}
                errorMessage="Plan name is required"
                placeholder="Enter plan name"
              />

              <TextInput
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                error={validationStates.price}
                errorMessage="Please enter a valid price"
                placeholder="Enter price"
              />

              <DateInput
                label="End Date"
                name="subscription_end_date"
                value={formData.subscription_end_date}
                onChange={handleInputChange}
                required
                error={validationStates.subscription_end_date}
                placeholder="Select end date"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Features
                <span className="text-error-600 ml-1">*</span>
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Selected: {formData.feature_ids.length}
              </span>
            </div>
            
            <div className={`
              grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4
            `}>
              {features.map(feature => (
                <div 
                  key={feature.feature_id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 transition-colors"
                >
                  <Checkbox
                    label={feature.name.split('_').join(' ')}
                    checked={formData.feature_ids.includes(feature.feature_id)}
                    onChange={() => handleFeatureChange(feature.feature_id)}
                  />
                </div>
              ))}
            </div>
            {validationStates.feature_ids && (
              <p className="mt-2 text-sm text-error-500">
                Please select at least one feature
              </p>
            )}
          </section>
        </form>
      </div>
    </>
  );
}

export default CreateSubscription;