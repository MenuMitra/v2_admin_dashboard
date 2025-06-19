import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';

function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { getToken, authData } = useAuth();
  const { adminData } = useAdmin();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/ticket_view',
        { ticket_id: ticketId },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      if (response.data.ticket) {
        setTicket(response.data.ticket);
        setConversations(response.data.chat || []);
      } else {
        setError('Failed to fetch ticket details');
      }
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      setError(error.response?.data?.msg || 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/tickets');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      // Make API call to continue chat with string values for user_id and ticket_id
      await axios.post(
        'https://men4u.xyz/v2/admin/continue_chat',
        {
          ticket_id: String(ticketId), // Convert to string
          user_id: String(adminData?.user_id), // Convert to string
          message: message.trim(),
          flag: "1"  // For admin messages
        },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      // Clear the message input
      setMessage('');
      
      // Refresh ticket details to show new message
      await fetchTicketDetails();
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  // --- Status Change Logic ---
  const handleChangeStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      await axios.patch(
        'https://men4u.xyz/v2/admin/update_ticket_status',
        {
          ticket_id: ticketId,
          user_id: adminData?.user_id,
          ticket_status: 'resolved'
        },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );
      setShowModal(false);
      await fetchTicketDetails();
    } catch (error) {
      setStatusError(error.response?.data?.msg || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Update the date formatting functions
  const formatMessageDate = (dateString) => {
    try {
      // Handle format "DD-MM-YYYY HH:mm AM/PM"
      const [datePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      
      const date = new Date(`${year}-${month}-${day}`);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return dateString; // Return original string if parsing fails
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      // Handle format "DD-MM-YYYY HH:mm AM/PM"
      const timePart = dateString.split(' ').slice(-2).join(' ');
      return timePart; // Returns "HH:mm AM/PM"
    } catch (error) {
      console.error('Time parsing error:', error);
      return dateString;
    }
  };

  // For ticket creation date formatting
  const formatTicketDate = (dateString) => {
    return dateString; // Already in desired format "DD MMM YYYY HH:mm AM/PM"
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Tickets', path: '/tickets' },
    { label: `Ticket Details` }
  ];

  const renderTicketContent = () => (
    <div className="px-6">
      {/* Main Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {ticket.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ticket #{ticket.ticket_number}
            </p>
          </div>
          {ticket.status === 'open' ? (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              onClick={() => handleChangeStatus('resolved')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Update Status
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Resolved</span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
              <p className="mt-2 text-gray-900 dark:text-white">{ticket.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
              <p className="mt-2 text-gray-900 dark:text-white capitalize">{ticket.status}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</h4>
              <p className="mt-2 text-gray-900 dark:text-white">{`${ticket.user_name} (${ticket.user_role})`}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</h4>
              <p className="mt-2 text-gray-900 dark:text-white">{formatTicketDate(ticket.created_on)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attachments</h4>
              <div className="mt-2 space-y-2">
                {ticket.attachment_1 ? (
                  <a href={ticket.attachment_1} target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attachment 1
                  </a>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No attachments</p>
                )}
                {ticket.attachment_2 && (
                  <a href={ticket.attachment_2} target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attachment 2
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conversation</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
            {conversations.reduce((messageGroups, conv, index) => {
              const messageDate = formatMessageDate(conv.created_on);
              const messageTime = formatMessageTime(conv.created_on);
              const isAdmin = conv.user_role === 'admin';
              
              // Date header logic remains the same
              if (index === 0 || messageDate !== formatMessageDate(conversations[index - 1].created_on)) {
                messageGroups.push(
                  <div key={`date-${conv.ticket_chat_id}`} className="flex justify-center my-4">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                      {messageDate}
                    </div>
                  </div>
                );
              }

              // Message bubble
              messageGroups.push(
                <div key={conv.ticket_chat_id} className={`mb-4 ${isAdmin ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  <div className={`max-w-[80%] relative group ${
                    isAdmin 
                      ? 'bg-brand-500 text-white rounded-l-lg rounded-br-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-r-lg rounded-bl-lg'
                  } p-3 shadow-sm`}>
                    <p className="break-words mb-1">{conv.message}</p>
                    <div className={`text-xs ${isAdmin ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} mt-1 flex items-center gap-1`}>
                      <span>{messageTime}</span>
                      {isAdmin && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {conv.user_name}
                  </div>
                </div>
              );

              return messageGroups;
            }, [])}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={ticket.status === 'closed'}
            />
            <button
              type="submit"
              disabled={loading || !message.trim() || ticket.status === 'closed'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Add Breadcrumb above the main content */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90">
              Ticket Details
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !ticket && (
          <div className="flex justify-center items-center h-screen">Loading...</div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {/* No Ticket State */}
        {!ticket && !loading && !error && (
          <div className="text-center">Ticket not found</div>
        )}

        {/* Ticket Content */}
        {ticket && renderTicketContent()}

        {/* Status Change Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Confirm Status Change</h2>
              <p>Are you sure you want to mark this ticket as <span className="font-semibold text-green-600">resolved</span>?</p>
              {statusError && (
                <div className="text-red-500 mt-2">{statusError}</div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => setShowModal(false)}
                  disabled={statusLoading}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  onClick={handleChangeStatus}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDetails;