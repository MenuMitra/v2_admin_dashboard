import React, { useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import DataTable from '../common/DataTable';

const Search = () => {
  const { getToken } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('name');

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/search',
        {
          search: searchType,
          value: searchInput,
          ...(selectedRole && selectedRole !== 'All Roles' && { role: selectedRole.toLowerCase() })
        },
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      if (response.data && Array.isArray(response.data.results)) {
        setSearchResults(response.data.results);
        setTotalResults(response.data.total_results || 0);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.response?.data?.message || 'Search failed. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataTable
  const columns = [
    { field: 'name', header: 'NAME', sortable: true },
    { field: 'mobile', header: 'MOBILE', sortable: true },
    { field: 'email', header: 'EMAIL', sortable: true },
    { 
      field: 'role', 
      header: 'ROLE', 
      sortable: true,
      render: (value) => (
        <span className="flex items-center gap-1">
          {value || '-'}
        </span>
      )
    },
    { 
      field: 'outlets', 
      header: 'OUTLETS', 
      sortable: true,
      render: (outlets) => (
        Array.isArray(outlets) ? 
          (outlets.map(outlet => outlet.outlet_name).join(', ') || '-') 
          : '-'
      )
    },
    {
      field: 'action',
      header: 'ACTION',
      sortable: false,
      render: () => (
        <button className="bg-blue-400 text-white p-1 rounded hover:bg-blue-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      )
    }
  ];

  return (
    <DataTable
      data={searchResults}
      columns={columns}
      title="Search"
      onBackClick={handleBack}
      showBackButton={true}
      showCreateButton={false}
      showSearch={false}
      enableSort={true}
      enablePagination={true}
      counts={{
        total: totalResults,
        active: searchResults.filter(r => r.is_active === 1).length,
        inactive: searchResults.filter(r => r.is_active === 0).length
      }}
    >
      {/* Custom Search Controls */}
      <div className="px-6 py-4 border-t border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-4 justify-center">
          <select 
            className="px-4 py-2 border rounded-lg border-gray-200 bg-transparent text-sm text-gray-800 focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 focus:outline-none shadow-theme-xs"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">Search by Name</option>
            <option value="mobile">Search by Mobile</option>
            <option value="outlet_name">Search by Outlet</option>
          </select>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search by ${searchType}...`}
              className="w-[250px] h-10 rounded-lg border border-gray-200 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 focus:outline-none shadow-theme-xs"
              required
            />
          </div>
          <select 
            className="px-4 py-2 border rounded-lg border-gray-200 bg-transparent text-sm text-gray-800 focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300 focus:outline-none shadow-theme-xs min-w-[120px]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>All Roles</option>
            <option>Owner</option>
            <option>Customer</option>
            <option>Waiter</option>
            <option>Chef</option>
            <option>Outlet</option>
          </select>
          <button 
            type="submit" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !searchInput.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-error-500 text-center mt-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchInput && (
          <div className="text-center text-gray-500 mt-8">
            No results found
          </div>
        )}
      </div>
    </DataTable>
  );
};

const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'owner':
      return '👑';
    case 'waiter':
      return '👨‍🍳';
    case 'customer':
      return '👤';
    case 'outlet':
      return '🏪';
    case 'chef':
      return '🍳';
    default:
      return '❓';
  }
};

export default Search;