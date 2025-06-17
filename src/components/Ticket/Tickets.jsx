import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
} from '@fortawesome/free-solid-svg-icons';
import DataTable from '../common/DataTable';

function Tickets() {
  const { getToken } = useAuth();
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

  // Fetch outlets on component mount
  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!selectedOutlet) return;
    
    setLoading(true);
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
      const ticketNumber = String(ticket.ticket_number || '').toLowerCase();
      const title = String(ticket.title || '').toLowerCase();
      const userName = String(ticket.user_name || '').toLowerCase();

      return (
        ticketNumber.includes(searchLower) ||
        title.includes(searchLower) ||
        userName.includes(searchLower)
      );
    });
    
    setFilteredTickets(filtered);
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
        return 'bg-gray-100 text-gray-800';
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

  // Custom header content for DataTable
  const headerContent = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 mb-4">
      <div className="flex items-center gap-4">
        <select
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
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
          disabled={loading || !selectedOutlet}
        >
          {loading ? (
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

  return (
    <div className="container mx-auto flex-grow py-6 px-4">
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              Back
            </button>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tickets Management
            </h3>
          </div>
        </div>

        <div className="border-t border-gray-100 p-5 sm:p-6 dark:border-gray-800">
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center mb-4 px-6">
              {error}
            </div>
          )}

          {/* Table */}
          <DataTable
            data={filteredTickets}
            columns={columns}
            title="Tickets Management"
            onBackClick={handleBack}
            showBackButton={true}
            showCreateButton={false}
            showSearch={selectedOutlet && tickets.length > 0}
            searchTerm={searchInput}
            onSearchChange={handleSearch}
            searchPlaceholder="Search by ticket number, title, or user..."
            enableSort={true}
            enablePagination={true}
            headerContent={headerContent}
            counts={{
              total: filteredTickets.length,
              active: filteredTickets.filter(t => t.status?.toLowerCase() === 'open').length,
              inactive: filteredTickets.filter(t => t.status?.toLowerCase() === 'closed').length
            }}
            error={error}
            emptyMessage={
              selectedOutlet && tickets.length === 0 && !loading
                ? "No tickets found for this outlet"
                : "No matching tickets found for your search"
            }
          />

          {/* Pagination */}
          {selectedOutlet && tickets.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
              <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, getSortedTickets().length)} of {getSortedTickets().length} entries
                {searchInput && (
                  <span className="ml-2 text-gray-500">
                    (filtered from {tickets.length} total entries)
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2 sm:justify-normal">
                <button
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                </button>

                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
                  Page {currentPage} of {totalPages}
                </span>

                <ul className="hidden items-center gap-0.5 sm:flex">
                  {renderPaginationNumbers()}
                </ul>

                <button
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tickets;