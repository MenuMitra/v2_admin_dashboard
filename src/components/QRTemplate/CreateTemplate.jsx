import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { TextInput, FileInput } from '../forms/FormElements';
import Breadcrumb from '../Breadcrumb';

function CreateTemplate() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    qrPosition: 'centre',
    image: null
  });

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'QR Templates', path: '/qr-templates' },
    { label: 'Create Template' }
  ];

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

  // Handle form submission
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
      formDataToSend.append('qr_overlay_position', formData.qrPosition);
      formDataToSend.append('image', formData.image);

      await axios.post(
        'https://men4u.xyz/v2/admin/create_qr_templates',
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
      setError(err.response?.data?.detail || 'Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Main Card */}
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
              Create Template
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.image}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading || !formData.name || !formData.image ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="max-w-5xl">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <TextInput
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Classic, Modern, Elegant"
                />

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    QR Code Position <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                        formData.qrPosition === 'centre' 
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, qrPosition: 'centre' }))}
                    >
                      <div className={`w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 ${
                        formData.qrPosition === 'centre' ? 'border-brand-500' : 'border-gray-300 dark:border-gray-700'
                      }`}>
                        <div className={`w-6 h-6 rounded ${
                          formData.qrPosition === 'centre' ? 'bg-brand-200 dark:bg-brand-700' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      </div>
                      <span className={`text-sm ${
                        formData.qrPosition === 'centre' ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                      }`}>Centre</span>
                    </div>
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                        formData.qrPosition === 'top' 
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, qrPosition: 'top' }))}
                    >
                      <div className={`w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center mb-2 ${
                        formData.qrPosition === 'top' ? 'border-brand-500' : 'border-gray-300 dark:border-gray-700'
                      }`}>
                        <div className={`w-6 h-6 rounded ${
                          formData.qrPosition === 'top' ? 'bg-brand-200 dark:bg-brand-700' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      </div>
                      <span className={`text-sm ${
                        formData.qrPosition === 'top' ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                      }`}>Top</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <FileInput
                  label="Template Image"
                  required
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                />
                {formData.image && (
                  <div className="mt-4 flex flex-col items-center">
                    <img 
                      src={URL.createObjectURL(formData.image)} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover mb-4 rounded-lg"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formData.image.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-error-500 text-sm">{error}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateTemplate;