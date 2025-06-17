import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import {
  faEye,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';

function QRTemplates() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);

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

  // Define columns for DataTable
  const columns = [
    { field: 'name', header: 'Template Name', sortable: true },
    { field: 'qr_overlay_position', header: 'Position', sortable: true },

    {
      field: 'action',
      header: 'Action',
      sortable: false,
      render: (_, template) => (
        <button 
          onClick={() => navigate(`/template-details/${template.qr_code_template_id}`)}
          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          <span className="hidden sm:inline">View</span>
        </button>
      )
    }
  ];

  return (
    <div className="container mx-auto flex-grow py-6 px-4">
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
        searchPlaceholder="Search by template name or position..."
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
    </div>
  );
}

export default QRTemplates;