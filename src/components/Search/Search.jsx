import React, { useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { SelectInput, TextInput } from '../forms/FormElements';

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

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Search' }
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Search
            </div>

            {/* Right Side - Empty for symmetry */}
            <div className="flex items-center gap-2"></div>
          </div>

          {/* Search Controls */}
          <div className="px-6 py-4">
            <form onSubmit={handleSearch} className="flex gap-4 mb-8 justify-center">
            <div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="super_owner">Super Owner</option>
                  <option value="owner">Owner</option>
                  <option value="captain">Captain</option>
                  <option value="manager">Manager</option>
                  <option value="customer">Customer</option>
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                </select>
              </div>
              <div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Outlet Name</option>
                  <option value="mobile">Outlet Mobile</option>
                  <option value="outlet_name">Outlet Code</option>
                </select>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="self-end">
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
                  disabled={loading || !searchInput.trim()}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center mb-4">
                {error}
              </div>
            )}

            {/* Results Section using DataTable */}
            {searchResults.length > 0 ? (
              <DataTable
                data={searchResults}
                columns={columns}
                showBackButton={false}
                showCreateButton={false}
                showSearch={false}
                showHeader={false}
                enableSort={true}
                enablePagination={true}
                counts={{
                  total: totalResults,
                  active: searchResults.filter(r => r.is_active === 1).length,
                  inactive: searchResults.filter(r => r.is_active === 0).length
                }}
              />
            ) : (
              <div className="text-center text-gray-500 mt-8">
                {loading ? 'Searching...' : (searchInput ? 'No results found' : 'Enter a search term to begin')}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;