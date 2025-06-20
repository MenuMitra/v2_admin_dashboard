import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPen, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';

function TemplateDetails() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templateData, setTemplateData] = useState(null);

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'QR Templates', path: '/qr-templates' },
    { label: 'View', path: '#' }
  ];

  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails();
    }
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

      console.log('API Response:', response.data);
      setTemplateData(response.data);

    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.detail || 'Failed to fetch template details');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTemplateDetails = () => {
    if (!templateData) return null;

    return (
      <div className="w-full space-y-6">
        {/* First Row - Image Card */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faImage} className="w-16 h-16 text-gray-300 mb-2" />
              <div className="text-sm text-gray-400">Template Image</div>
              <div className="text-sm text-gray-400 mt-1">{templateData.image_name}</div>
            </div>
          </div>
        </div>

        {/* Second Row - Details Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Name */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Name</h3>
                <p className="text-sm text-gray-900">{templateData.name}</p>
              </div>

              {/* QR Code Position */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">QR Code Position</h3>
                <p className="text-sm text-gray-900">{templateData.qr_overlay_position}</p>
              </div>

              {/* Created On */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Created On</h3>
                <p className="text-sm text-gray-900">{templateData.created_on}</p>
              </div>

              {/* QR Position Preview - Full Width */}
              <div className="col-span-full">
                <h3 className="text-sm text-gray-500 mb-2">QR Position Preview</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-brand-500 rounded flex items-center justify-center text-white text-sm">
                      {templateData.qr_overlay_position}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      
      {/* DataTable-style Header */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-hidden pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Top Row - Back, Title, Edit */}
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
                Template Details
              </h1>
            </div>

            {/* Right Side - Edit Button */}
            <div className="flex items-center justify-end order-3">
              <button
                onClick={() => navigate(`/edit-template/${templateId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 transition rounded-full shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-4">
            {error ? (
              <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : (
              renderTemplateDetails()
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TemplateDetails;