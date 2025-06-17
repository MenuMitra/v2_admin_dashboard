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
  faPlus,
  faSpinner,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';

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
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);

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
    fetchOutlets();
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

  const fetchOutlets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/common/listview_outlet',
        {
          user_id: 1,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      if (response.data.data) {
        setOutlets(response.data.data);
      } else {
        setError('Failed to fetch outlets');
      }
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      setError(error.response?.data?.msg || 'Failed to fetch outlets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!selectedOutlet) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/ticket_list',
        {
          outlet_id: selectedOutlet
        },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      if (response.data.tickets) {
        setFilteredTickets(response.data.tickets);
      } else {
        setError('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setError(error.response?.data?.msg || 'Failed to fetch tickets');
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

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredTickets(templates);
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
    
    setFilteredTickets(filtered);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/ticket-details/${ticketId}`);
  };

  // Define columns for DataTable
  const columns = [
    { field: 'ticket_number', header: 'Ticket Number', sortable: true },
    { field: 'title', header: 'Title', sortable: true },
    { 
      field: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(value)}`}>
          {value || 'Unknown'}
        </span>
      )
    },
    { field: 'created_on', header: 'Created On', sortable: true },
    { field: 'user_name', header: 'User', sortable: true },
    {
      field: 'action',
      header: 'Action',
      sortable: false,
      render: (_, ticket) => (
        <button 
          onClick={() => handleViewTicket(ticket.ticket_id)}
          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          <span className="hidden sm:inline">View</span>
        </button>
      )
    }
  ];

  // Outlet selection header component
  const CustomHeader = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="flex items-center gap-4">
        <select
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          value={selectedOutlet || ''}
          onChange={(e) => setSelectedOutlet(e.target.value)}
        >
          <option value="">Select an outlet</option>
          {outlets.map((outlet) => (
            <option key={outlet.outlet_id} value={outlet.outlet_id}>
              {outlet.outlet_name} ({outlet.outlet_code})
            </option>
          ))}
        </select>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs disabled:opacity-50"
          disabled={isLoading || !selectedOutlet}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            'Show Tickets'
          )}
        </button>
      </div>
    </div>
  );

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
    <div className="container mx-auto flex-grow py-6 px-4">
      {/* Outlet Selection */}
      <CustomHeader />

      {/* Error Message */}
      {error && (
        <div className="text-error-500 text-center mb-4">
          {error}
        </div>
      )}

      {/* DataTable */}
      {selectedOutlet && (
        <DataTable
          data={filteredTickets}
          columns={columns}
          title="Tickets Management"
          onBackClick={handleBack}
          showBackButton={true}
          showCreateButton={false}
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          searchPlaceholder="Search by ticket number, title, or user..."
          enableSort={true}
          enablePagination={true}
          counts={{
            total: filteredTickets.length,
            active: filteredTickets.filter(t => t.status?.toLowerCase() === 'open').length,
            inactive: filteredTickets.filter(t => t.status?.toLowerCase() === 'closed').length
          }}
        />
      )}

      {/* Empty States */}
      {selectedOutlet && templates.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 mt-4">
          No tickets found for this outlet
        </div>
      )}
    </div>
  );
}

export default QRTemplates;