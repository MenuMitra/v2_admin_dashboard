import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faImage, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';

function EditTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    qr_overlay_position: 'centre',
    image: null,
    image_name: '',
    qr_code_template_id: null
  });

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'QR Templates', path: '/qr-templates' },
    { label: 'Edit Template' }
  ];

  // Fetch template details on component mount
  useEffect(() => {
    fetchTemplateDetails();
  }, [templateId]);

  const fetchTemplateDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_qr_templates',
        {
          template_id: parseInt(templateId)
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response.data); // Debug log

      // Update form data with fetched details - matching API response structure
      setFormData({
        name: response.data.name,
        qr_overlay_position: response.data.qr_overlay_position,
        image: null,
        image_name: response.data.image_name,
        qr_code_template_id: response.data.qr_code_template_id
      });

    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.detail || 'Failed to fetch template details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Add handleSubmit function after handleFileChange
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('qr_overlay_position', formData.qr_overlay_position);
      formDataToSend.append('template_id', templateId);
      
      if (formData.image) {
        formDataToSend.append('image_name', formData.image);
      }

      const response = await axios.patch(
        'https://men4u.xyz/v2/admin/update_qr_templates',
        formDataToSend,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/qr-templates');

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update template');
      console.error('Error updating template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Configure save button
  const saveButton = {
    show: true,
    label: "Save Changes",
    icon: faSave,
    onClick: handleSubmit,
    className: "bg-brand-500 hover:bg-brand-600",
    position: "right",
    showIconOnly: false,
    disabled: isLoading || !formData.name,
    tooltip: "Save template changes"  
  };

  // Custom row render for edit form
  const renderEditForm = () => (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Template Name */}
        <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Classic, Modern, Elegant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

        {/* QR Position */}
        <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  QR Code Position <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.qr_overlay_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, qr_overlay_position: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="centre">Centre</option>
                  <option value="top">Top</option>
                </select>
              </div>

        {/* Image Upload */}
        <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Template Image
              </label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    {formData.image ? (
                      <>
                        <img 
                          src={URL.createObjectURL(formData.image)} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover mb-4"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formData.image.name}</p>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faImage} className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current image: {formData.image_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Drag and drop new image here</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">or click to browse files</p>
                        <p className="text-xs text-gray-400">PNG, JPG, JPEG (max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

      {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button 
              onClick={() => navigate('/qr-templates')}
              className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.name}
              className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
  );

  if (isLoading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-hidden pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
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

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90">
                Edit Template
              </h1>
            </div>

            {/* Right Side - Save Button */}
            <div className="flex items-center justify-end order-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 transition rounded-full shadow-theme-xs disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {error ? (
              <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : isLoading && !formData.name ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {/* Template Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Classic, Modern, Elegant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* QR Position */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    QR Code Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.qr_overlay_position}
                    onChange={(e) => setFormData(prev => ({ ...prev, qr_overlay_position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="centre">Centre</option>
                    <option value="top">Top</option>
                  </select>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Template Image
                  </label>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center justify-center">
                        {formData.image ? (
                          <>
                            <img 
                              src={URL.createObjectURL(formData.image)} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover mb-4"
                            />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formData.image.name}</p>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faImage} className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current image: {formData.image_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Drag and drop new image here</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">or click to browse files</p>
                            <p className="text-xs text-gray-400">PNG, JPG, JPEG (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EditTemplate;