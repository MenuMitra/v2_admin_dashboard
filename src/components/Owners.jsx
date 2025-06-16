import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faFilter,
  faEye,
  faPenToSquare,
  faTrash,
  faExclamationTriangle,
  faArrowRight,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';

function Owners() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortCount, setSortCount] = useState(0);

  useEffect(() => {
    if (adminData?.user_id) {
      fetchOwners();
    }
  }, [adminData?.user_id]);

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setOwners(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setIsLoading(false);
    }
  };

  const handleViewOwner = (owner_id) => {
    navigate(`/owner-details/${owner_id}`);
  };

  const handleEditOwner = (owner_id) => {
    navigate(`/edit-owner/${owner_id}`);
  };

  const handleDeleteOwner = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete(
        'https://men4u.xyz/v2/admin/delete_owner',
        {
          data: {
            owner_id: ownerToDelete,
            user_id: adminData.user_id
          },
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      setShowDeleteModal(false);
      setOwnerToDelete(null);
      fetchOwners();
      
    } catch (error) {
      console.error('Error deleting owner:', error);
    }
  };

  const openDeleteModal = (owner_id) => {
    setOwnerToDelete(owner_id);
    setShowDeleteModal(true);
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

  const getSortedOwners = () => {
    if (!sortField) return owners;

    return [...owners].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      // Handle different types of sorting
      if (sortField === 'is_active') {
        // Numeric sorting for status
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        // String sorting for other fields
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Restaurant Owners
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <FontAwesomeIcon icon={faFilter} className="w-5 h-5" />
              Filter
            </button>

            <button 
              onClick={() => navigate('/create-owner')}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 font-medium text-white hover:bg-brand-600"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              Add Owner
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                <th 
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Name
                    </p>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Email
                    </p>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('mobile')}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Mobile
                    </p>
                    {renderSortIcon('mobile')}
                  </div>
                </th>
                <th className="px-6 py-3 text-center">
                  <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                    Address
                  </p>
                </th>
                <th 
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('is_active')}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Status
                    </p>
                    {renderSortIcon('is_active')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('account_type')}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Account Type
                    </p>
                    {renderSortIcon('account_type')}
                  </div>
                </th>
                <th className="px-6 py-3 text-center">
                  <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                    Actions
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedOwners().map((owner) => (
                <tr key={owner.user_id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-6 py-3.5 text-center">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {owner.name}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.email}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.mobile}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.address}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      owner.is_active === 1 
                        ? 'bg-success-100 text-success-600' 
                        : 'bg-error-100 text-error-500'
                    }`}>
                      {owner.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      owner.account_type === 'live' 
                        ? 'bg-brand-100 text-brand-600' 
                        : 'bg-warning-100 text-warning-600'
                    }`}>
                      {owner.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button - Blue */}
                      <button 
                        onClick={() => handleViewOwner(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>

                      {/* Edit Button - Yellow/Warning */}
                      <button 
                        onClick={() => handleEditOwner(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
                        title="Edit Owner"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                      </button>

                      {/* Delete Button - Red */}
                      <button 
                        onClick={() => openDeleteModal(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                        title="Delete Owner"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => {
              setShowDeleteModal(false);
              setOwnerToDelete(null);
            }}
          />
          
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-error-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Confirm Deletion
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this owner? This action
                        cannot be undone. All data associated with this owner will
                        be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setOwnerToDelete(null);
                    }}
                    className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteOwner}
                    className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
                  >
                    Delete Owner
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

export default Owners;