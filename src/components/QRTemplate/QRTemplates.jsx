import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import {
  faChevronLeft,
  faImage,
  faChevronDown,
  faSearch,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

function QRTemplates() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats counts
  const counts = {
    total: templates.length,
    active: templates.filter(t => t.status === 'active').length,
    inactive: templates.filter(t => t.status === 'inactive').length
  };

  // Create button configuration
  const createButton = {
    show: true,
    label: "Create",
    icon: faPlus,
    onClick: () => navigate('/create-template'),
    className: "bg-success-500 hover:bg-success-600",
    position: "right",
    showIconOnly: false,
    disabled: false,
    tooltip: "Create new QR template"
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      const response = await axios.get(
        'https://men4u.xyz/v2/admin/get_qr_templates',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = getToken();
      if (!token) throw new Error('No authentication token available');

      await axios.delete(
        `https://men4u.xyz/v2/admin/delete_qr_templates/${templateToDelete.qr_code_template_id}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      fetchTemplates();
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter templates based on search and position
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter ? template.qr_overlay_position === positionFilter : true;
    return matchesSearch && matchesPosition;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">{error}</div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Create */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                QR Templates
              </h1>
            </div>

            {/* Right Side - Create Button */}
            <div className="flex items-center justify-end">
              {createButton.show && (
                <button 
                  onClick={createButton.onClick}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full shadow-theme-xs ${createButton.className}`}
                  disabled={createButton.disabled}
                  title={createButton.tooltip}
                >
                  <FontAwesomeIcon icon={createButton.icon} className="w-4 h-4" />
                  {!createButton.showIconOnly && (
                    <span className="hidden sm:inline">{createButton.label}</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between px-6 mb-4">
            {/* Stats */}
            <div className="flex items-center gap-4 sm:gap-6 text-sm overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
              <span className="font-medium text-gray-800">
                Total: {counts.total}
              </span>
              <span className="text-success-600">
                Active: {counts.active}
              </span>
              <span className="text-error-500">
                Inactive: {counts.inactive}
              </span>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              {/* Filter Dropdown */}
              <div className="relative">
                <select 
                  className="w-40 appearance-none h-10 pl-3 pr-10 text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="">All Positions</option>
                  <option value="top">Top</option>
                  <option value="centre">Centre</option>
                </select>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"
                />
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                </span>
                <input 
                  placeholder="Search templates..."
                  className="w-full sm:w-[250px] h-10 rounded-lg border border-gray-200 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 focus:outline-none shadow-theme-xs"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
          {filteredTemplates.map((template) => (
            <div key={template.qr_code_template_id} className="bg-white rounded-md shadow-sm">
              {/* Image Container - Fixed 100px size */}
              <div className="w-[100px] h-[100px] mx-auto flex flex-col items-center justify-center bg-gray-50 border-b overflow-hidden">
                {template.image_url ? (
                  <img 
                    src={template.image_url} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://www.mangobeds.com/images/image-fallback.jpg";
                    }}
                  />
                ) : (
                  <img 
                    src="https://www.mangobeds.com/images/image-fallback.jpg"
                    alt="Template fallback"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content Section - More compact */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{template.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {/* View Button */}
                    <button
                      onClick={() => navigate(`/template-details/${template.qr_code_template_id}`)}
                      className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/edit-template/${template.qr_code_template_id}`)}
                      className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit Template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteModal(true);
                      }}
                      className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  <div className="flex items-center text-xs">
                    <span className="text-gray-500">QR Position:</span>
                    <span className="text-gray-900 ml-1 capitalize">{template.qr_overlay_position}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="text-gray-500">Created on:</span>
                    <span className="text-gray-900 ml-1">{template.created_on}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Template</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-error-500 hover:bg-error-600 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Template'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRTemplates;