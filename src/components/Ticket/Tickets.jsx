import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSpinner,
  faEye,
  faCrown,
  faUser,
  faUtensils,
  faStore,
  faQuestionCircle,
  faKitchenSet,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { API_CONFIG } from '../../config/appConfig';

function Tickets() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [searchInput, setSearchInput] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortCount, setSortCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
  const {API_VERSION, BASE_URL} = API_CONFIG

  // Modify useEffect to fetch tickets on component mount
  useEffect(() => {
    // fetchOutlets();
    fetchTickets(); // Call fetchTickets without outletId
  }, []);

  const fetchOutlets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/listview_outlet`,
        {
          user_id: adminData?.user_id,
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
      setLoading(false);
    }
  };

  // Modify fetchTickets to make outlet_id optional
  const fetchTickets = async (outletId = null) => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        user_id: adminData?.user_id,
        app_source: "admin_dashboard"
      };

      // Only add outlet_id if it exists
      if (outletId) {
        requestBody.outlet_id = outletId;
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/common/ticket_list',
        requestBody,
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      if (response.data.tickets) {
        setTickets(response.data.tickets);
        setFilteredTickets(response.data.tickets);
      } else {
        setError('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setError(error.response?.data?.msg || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setSearchInput(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = tickets.filter(ticket => {
      // Add all searchable fields here
      const searchableFields = [
        ticket.ticket_number,
        ticket.title,
        ticket.user_name,
        ticket.status,
        ticket.created_on
      ];

      return searchableFields.some(field => 
        String(field || '').toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredTickets(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/ticket-details/${ticketId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortCount === 0) {
        setSortOrder('asc');
        setSortCount(1);
      } else if (sortCount === 1) {
        setSortOrder('desc');
        setSortCount(2);
      } else {
        setSortField(null);
        setSortOrder('asc');
        setSortCount(0);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
      setSortCount(1);
    }
  };

  const getSortedTickets = () => {
    if (!sortField) return filteredTickets;

    return [...filteredTickets].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      // Handle different types of sorting
      if (sortField === 'ticket_number') {
        // Numeric sorting
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortField === 'created_on') {
        // Date sorting
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      } else {
        // String sorting
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400 w-4 h-4" />;
    }
    return sortOrder === 'asc' ? 
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-brand-500 w-4 h-4" /> : 
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-brand-500 w-4 h-4" />;
  };

  // Add these pagination helper functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedTickets().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(getSortedTickets().length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show max 7 page numbers
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const middlePage = Math.floor(maxVisiblePages / 2);
      if (currentPage <= middlePage) {
        endPage = maxVisiblePages;
      } else if (currentPage + middlePage >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - middlePage;
        endPage = currentPage + middlePage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <button
            onClick={() => handlePageChange(i)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
              currentPage === i
                ? 'bg-brand-500 text-white'
                : 'text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    // Add ellipsis if needed
    if (startPage > 1) {
      pages.unshift(
        <li key="start-ellipsis">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
            ...
          </span>
        </li>
      );
    }
    if (endPage < totalPages) {
      pages.push(
        <li key="end-ellipsis">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
            ...
          </span>
        </li>
      );
    }

    return pages;
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
          {value?.toUpperCase() || 'Unknown'}
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
          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-2 py-2 font-medium text-white hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Modify handleOutletChange to handle null/empty outlet selection
  const handleOutletChange = (outletId) => {
    setSelectedOutlet(outletId);
    fetchTickets(outletId); // This will work with both null and valid outletId
  };

  // Add breadcrumb items configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Tickets' }
  ];

  return (
    <div className="container mx-auto flex-grows">
      {/* Add Breadcrumb component */}
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={filteredTickets}
        columns={columns}
        title="Tickets"
        onBackClick={handleBack}
        showBackButton={true}
        showCreateButton={false}
        enableSearch={true}
        showSearch={true}
        searchTerm={searchInput}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by ticket number, title, status..."
        enableSort={true}
        enablePagination={true}
        showOutletSelect={false}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={handleOutletChange}
        isLoading={loading}
        counts={{
          total: tickets.length,
          active: tickets.filter(t => t.status?.toLowerCase() === 'open').length,
          inactive: tickets.filter(t => t.status?.toLowerCase() === 'closed').length
        }}
        error={error}
        emptyStateMessage={
          !searchInput
            ? "No tickets found"
            : "No tickets found matching your search criteria"
        }
        darkMode={false}
        createButton={{ show: false }}
        enableStatusFilter={true}
        statusFilter="all"
        onStatusFilterChange={(status) => {
          let filtered = tickets;
          if (status !== 'all') {
            const isOpen = status === 'active';
            filtered = tickets.filter(ticket => 
              isOpen 
                ? ticket.status?.toLowerCase() === 'open'
                : ticket.status?.toLowerCase() === 'closed'
            );
          }
          setFilteredTickets(filtered);
          setCurrentPage(1);
        }}
        statusField="status"
      />
    </div>
  );
}

export default Tickets;