import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack, faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
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

  const performSearch = useCallback(async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/search',
        {
          search: searchType,
          value: value,
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
  }, [searchType, selectedRole, getToken]);

  // Simplify handleInputChange to just update state
  const handleInputChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  // Modified form submit handler to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  // Define columns for DataTable
  const columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'mobile', header: 'Mobile', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { 
      field: 'role', 
      header: 'Role', 
      sortable: true,
      render: (value) => (
        <span className="flex items-center gap-1">
          {value || '-'}
        </span>
      )
    },
    { 
      field: 'outlets', 
      header: 'Outlets', 
      sortable: true,
      render: (outlets) => (
        Array.isArray(outlets) ? 
          (outlets.map(outlet => outlet.outlet_name).join(', ') || '-') 
          : '-'
      )
    },
    {
      field: 'action',
      header: 'Action',
      sortable: false,
      render: () => (
        <button 
            // onClick={}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Outlet"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
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
      <div className="mb-4 sm:mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-3 sm:pt-4">
          {/* Header Section */}
          <div className="flex items-center px-4 sm:px-6 mb-2 sm:mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center">
              <button 
                onClick={handleBack}
                className="inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Search
            </div>

            <div className="w-10 sm:w-auto"></div>
          </div>

          {/* Search Controls */}
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Mobile: Stacked Layout for Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Role Select */}
                <div className="w-full sm:w-40">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-10 sm:h-auto text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                {/* Search Type Select */}
                <div className="w-full sm:w-40">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full h-10 sm:h-auto px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Outlet Name</option>
                    <option value="mobile">Outlet Mobile</option>
                    <option value="outlet_name">Outlet Code</option>
                  </select>
                </div>
              </div>

              {/* Search Input and Button Group */}
              <div className="flex gap-2 sm:gap-4 flex-1">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleInputChange}
                    placeholder={`Search by ${searchType}...`}
                    className="w-full h-10 sm:h-auto px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="self-start sm:self-end">
                  <button 
                    type="submit" 
                    className="h-10 sm:h-auto px-4 sm:px-6 py-2 text-sm bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:bg-brand-300 flex items-center gap-2"
                    disabled={loading || !searchInput.trim()}
                  >
                    <span className="hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
                    <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center text-sm sm:text-base mb-3 sm:mb-4">
                {error}
              </div>
            )}

            {/* Results Section */}
            <div className="overflow-x-auto">
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
              ) : loading ? (
                <div className="text-center text-gray-500 text-sm sm:text-base mt-6 sm:mt-8">
                  Searching...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;