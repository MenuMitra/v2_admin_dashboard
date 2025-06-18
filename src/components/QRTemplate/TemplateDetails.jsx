import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';

function TemplateDetails() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templateData, setTemplateData] = useState({
    name: '',
    qrPosition: 'centre',
    filename: '',
    createdOn: ''
  });

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'QR Templates', path: '/qr-templates' },
    { label: 'View', path: '#' }
  ];

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

      setTemplateData({
        name: response.data.name,
        qrPosition: response.data.qr_overlay_position,
        filename: response.data.image_name,
        createdOn: response.data.created_on
      });

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch template details');
      console.error('Error fetching template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom row render for template details
  const renderTemplateDetails = () => (
    <tr>
      <td className="px-6 py-4" colSpan="100%">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faImage} className="w-16 h-16 text-gray-300 mb-2" />
              <div className="text-sm text-gray-400">Image not available</div>
              <div className="text-xs text-gray-400 mt-1">{templateData.filename}</div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Name</h3>
                <p className="text-sm text-gray-900 dark:text-white/90">{templateData.name}</p>
              </div>

              {/* QR Code Position */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">QR Code Position</h3>
                <p className="text-sm text-gray-900 dark:text-white/90">{templateData.qrPosition}</p>
              </div>

              {/* Image Filename */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Image Filename</h3>
                <p className="text-sm text-gray-900 dark:text-white/90">{templateData.filename}</p>
              </div>

              {/* Created On */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Created On</h3>
                <p className="text-sm text-gray-900 dark:text-white/90">{templateData.createdOn}</p>
              </div>

              {/* QR Position Preview */}
              <div>
                <h3 className="text-sm text-gray-500 mb-2">QR Position Preview</h3>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  // Configure edit button
  const editButton = {
    show: true,
    label: "Edit",
    icon: faPen,
    onClick: () => navigate(`/edit-template/${templateId}`),
    className: "bg-brand-500 hover:bg-brand-600",
    position: "right",
    showIconOnly: false,
    disabled: false,
    tooltip: "Edit this template"
  };

  if (isLoading && !templateData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <DataTable
        title="Template Details"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        showCreateButton={true}
        createButton={editButton}
        showSearch={false}
        showHeader={true}
        showOutletSelect={false}
        isLoading={isLoading}
        error={error}
        data={[templateData]} // Pass template data as single item array
        columns={[{ field: 'details', header: '' }]} // Single column for the entire content
        customRowRender={() => renderTemplateDetails()} // Custom render function for the content
        enablePagination={false}
        enableSort={false}
        darkMode={true}
      />
    </div>
  );
}

export default TemplateDetails;