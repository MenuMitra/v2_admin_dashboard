import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import DataTable from '../common/DataTable';

function Partners() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (adminData?.user_id) {
      fetchPartners();
    }
  }, [adminData?.user_id]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_partner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setPartners(response.data);
      
      // Calculate stats from the response
      const total = response.data.length;
      const active = response.data.filter(partner => partner.is_active === 1).length;
      const inactive = total - active;
      
      setStats({
        total,
        active,
        inactive
      });

    } catch (err) {
      setError('Failed to fetch partners');
      console.error('Error fetching partners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.delete(
        'https://men4u.xyz/v2/admin/delete_partner',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          data: {
            partner_id: partnerToDelete.user_id,
            user_id: adminData.user_id
          }
        }
      );

      if (response.data.detail === "Partner deleted successfully") {
        setIsDeleteModalOpen(false);
        setPartnerToDelete(null);
        fetchPartners(); // Refresh the list
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete partner');
      console.error('Error deleting partner:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true
    },
    {
      field: 'mobile',
      header: 'Mobile',
      sortable: true
    },
    {
      field: 'is_active',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 1 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      field: 'actions',
      header: 'ACTIONS',
      sortable: false,
      render: (_, partner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/partner-details/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Partner"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-partner/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Partner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPartnerToDelete(partner);
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Partner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">Partners</span>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={partners}
        columns={columns}
        title="Partners"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: partners.length,
          active: partners.filter(p => p.is_active === 1).length,
          inactive: partners.filter(p => p.is_active !== 1).length
        }}
        createButton={{
          label: "Create Partner",
          onClick: () => navigate('/create-partner'),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false
        }}
        searchPlaceholder="Search partners..."
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
      />

      {/* Add the Modal JSX at the bottom of your return statement, before the closing div */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              {/* Close button */}
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal content */}
              <div className="text-center">
                {/* Warning icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this partner? This action cannot be undone. All data associated with this partner will be permanently removed.
                </p>

                {/* Action buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-md hover:bg-error-600 transition"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </div>
                    ) : (
                      'Delete Partner'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Partners;