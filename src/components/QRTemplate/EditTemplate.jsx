import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faImage, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import DataTable from '../common/DataTable';

function EditTemplate() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    qrPosition: 'centre',
    image: null,
    currentImageName: ''
  });

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

      // Update form data with fetched details
      setFormData({
        name: response.data.name,
        qrPosition: response.data.qr_overlay_position,
        image: null,
        currentImageName: response.data.image_name
      });

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch template details');
      console.error('Error fetching template:', err);
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

      // Create FormData instance
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('qr_overlay_position', formData.qrPosition);
      formDataToSend.append('template_id', templateId);
      
      // Only append image if a new one is selected
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

      // Navigate back to templates list on success
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
    <tr>
      <td className="px-6 py-4" colSpan="100%">
        <div className="max-w-5xl">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Classic, Modern, Elegant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current image: {formData.currentImageName}</p>
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

          {/* Buttons */}
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
      </td>
    </tr>
  );

  if (isLoading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        title="Edit Template"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        showCreateButton={false}
        createButton={{ show: false }}
        showSearch={false}
        showHeader={true}
        showOutletSelect={false}
        isLoading={isLoading}
        error={error}
        data={[formData]}
        columns={[{ field: 'form', header: '' }]}
        customRowRender={() => renderEditForm()}
        enablePagination={false}
        enableSort={false}
        darkMode={true}
      />
    </div>
  );
}

export default EditTemplate;