import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import {
  faEye,
  faPlus,
  faPenToSquare,
  faTrash,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import Modal from '../common/Modal';

function QRTemplates() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Stats counts
  const counts = {
    total: filteredTemplates.length,
    active: filteredTemplates.filter(t => t.status === 'active').length,
    inactive: filteredTemplates.filter(t => t.status === 'inactive').length
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

  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'QR Templates', path: '/qr-templates' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
      setFilteredTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = templates.filter(template => {
      const name = String(template.name || '').toLowerCase();
      const position = String(template.qr_overlay_position || '').toLowerCase();

      return (
        name.includes(searchLower) ||
        position.includes(searchLower)
      );
    });
    
    setFilteredTemplates(filtered);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteTemplate = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete(`https://men4u.xyz/v2/admin/delete_qr_templates/${templateToDelete}`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      setShowDeleteModal(false);
      setTemplateToDelete(null);
      fetchTemplates(); // Refresh the list
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const openDeleteModal = (templateId) => {
    setTemplateToDelete(templateId);
    setShowDeleteModal(true);
  };

  // Add these action buttons for the modal
  const deleteModalButtons = (
    <>
      <button
        type="button"
        onClick={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleDeleteTemplate}
        className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
      >
        Template
      </button>
    </>
  );

  // Define columns for DataTable
  const columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'qr_overlay_position', header: 'Position', sortable: true },
    {
      field: 'action',
      header: 'Action',
      sortable: false,
      render: (_, template) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => navigate(`/template-details/${template.qr_code_template_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-template/${template.qr_code_template_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Template"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(template.qr_code_template_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Template"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto flex-grow">
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={filteredTemplates}
        columns={columns}
        title="QR Templates"
        onBackClick={handleBack}
        showBackButton={true}
        showCreateButton={true}
        createButton={createButton}
        showSearch={templates.length > 0}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={filteredTemplates.length > 10}
        showOutletSelect={false}
        isLoading={isLoading}
        counts={counts}
        error={error}
        emptyMessage={
          templates.length === 0 && !isLoading
            ? "No templates found"
            : "No matching templates found for your search"
        }
        darkMode={true}
      />

      {/* Replace the old delete modal with new Modal component */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={deleteModalButtons}
      >
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="h-8 w-8 text-error-500"
          />
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this template? <br/>
            This action cannot be undone. All data associated with this template
            will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default QRTemplates;