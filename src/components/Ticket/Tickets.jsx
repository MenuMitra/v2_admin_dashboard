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
  faKitchenSet
} from '@fortawesome/free-solid-svg-icons';

function Tickets() {
  const { getToken } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
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

  // Update the useEffect for search
  useEffect(() => {
    handleSearch(searchInput);
  }, [searchInput, tickets]); // Add tickets as dependency to handle when tickets change

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = tickets.filter(ticket => {
      // Only search in ticket number, title, and user name
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
    navigate(`/ticket-details/${ticketId}`);  // Updated to match App.jsx route
  };

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
          {/* Outlet Selection */}
          <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <select
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
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
                className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                disabled={loading || !selectedOutlet}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Show Tickets'
                )}
              </button>
            </div>

            {/* Search Input */}
            {selectedOutlet && tickets.length > 0 && (
              <input
                type="text"
                placeholder="Search by ticket number, title, or user..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center mb-4 px-6">
              {error}
            </div>
          )}

          {/* Table */}
          {selectedOutlet && tickets.length > 0 && (
            <div className="max-w-full overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        Ticket Number
                      </p>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        Title
                      </p>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        Status
                      </p>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        Created On
                      </p>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        User
                      </p>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        Action
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket, index) => (
                    <tr key={ticket.ticket_id || `ticket-${index}`} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {ticket.ticket_number || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {ticket.title || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {ticket.created_on || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {ticket.user_name || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <button 
                          onClick={() => handleViewTicket(ticket.ticket_id)}
                          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty States */}
          {selectedOutlet && tickets.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4 px-6">
              No tickets found for this outlet
            </div>
          )}

          {selectedOutlet && filteredTickets.length === 0 && tickets.length > 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4 px-6">
              No matching tickets found for your search
            </div>
          )}

          {/* Pagination Info */}
          {selectedOutlet && tickets.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-6">
              <div className="text-gray-500 text-theme-sm dark:text-gray-400">
                Showing {filteredTickets.length} of {tickets.length} entries
                {searchInput && (
                  <span className="ml-2 text-gray-500">
                    (filtered from {tickets.length} total entries)
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-theme-sm dark:border-gray-700 dark:text-gray-400">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-brand-500 text-white text-theme-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-theme-sm dark:border-gray-700 dark:text-gray-400">
                  Next
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