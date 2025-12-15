import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSearch,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import { SelectInput, TextInput } from "../forms/FormElements";
import { useNavigate } from "react-router-dom";
import { toastController } from "../../utils/toastController";
import { API_CONFIG } from "../../config/appConfig";

const Search = () => {
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const { getToken } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("name");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Check if we should focus based on URL params
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("focus") === "true") {
      searchInputRef.current?.focus();
    }
  }, []);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const performSearch = useCallback(
    async (value) => {
      if (!value.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${BASE_URL}/admin/search`,
          {
            search: searchType,
            app_source: "admin",
            value: value,
            ...(selectedRole &&
              selectedRole !== "All Roles" && {
                role: selectedRole.toLowerCase(),
              }),
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        );

        if (response.data && Array.isArray(response.data.results)) {
          setSearchResults(response.data.results);
          setTotalResults(response.data.total_results || 0);
        } else {
          setSearchResults([]);
          setTotalResults(0);
          setError("Invalid response format from server");
        }
      } catch (error) {
        
        setError(
          error.response?.data?.message || "Search failed. Please try again."
        );
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    [searchType, selectedRole, getToken]
  );

  // Update input and clear prior search state when user erases input
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val.trim()) {
      // clear previous search results / messages when input is empty
      setHasSearched(false);
      setSearchedTerm("");
      setSearchResults([]);
      setTotalResults(0);
      setError(null);
    }
  }, []);

  // Modified form submit handler to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchedTerm(searchInput);
    performSearch(searchInput);
  };

  // Add handler for view button click with role-based navigation
  const handleViewDetails = (userId, role, outlets) => {
    // Get primary outlet or first outlet
    const primaryOutlet = outlets?.find(outlet => outlet.is_primary);
    const outlet = primaryOutlet || outlets?.[0];
    
    switch (role?.toLowerCase()) {
      case "chef":
        if (outlet?.outlet_id) {
          navigate(`/chef-details/${outlet?.outlet_id}/${userId}`);
        } else {
          toastController.error("No outlet found for this chef");
        }
        break;
      case "customer":
        navigate(`/edit-customer/${userId}`);
        break;
      case "owner":
        navigate(`/owner-details/${userId}`);
        break;
      case "captain":
        if (outlet?.outlet_id) {
          navigate(`/captain-details/${outlet?.outlet_id}/${userId}`);
        } else {
          toastController.error("No outlet found for this captain");
        }
        break;
      case "manager":
        if (outlet?.outlet_id) {
          navigate(`/manager-details/${outlet?.outlet_id}/${userId}`);
        } else {
          toastController.error("No outlet found for this manager");
        }
        break;
      case "waiter":
        if (outlet?.outlet_id) {
          navigate(`/waiter-details/${outlet?.outlet_id}/${userId}`);
        } else {
          toastController.error("No outlet found for this waiter");
        }
        break;
      case "super_owner":
        navigate(`/super-owner-details/${userId}`);
        break;
      case "partner":
        navigate(`/partner-details/${userId}`);
        break;
      default:
        // Fallback to role-details if role is unknown
        navigate(`/role-details/${userId}`);
    }
  };

  // Define columns for DataTable
  const columns = [
    { field: "name", header: "Name", sortable: true },
    { field: "mobile", header: "Mobile", sortable: true },
    // { field: 'email', header: 'Email', sortable: true },
    {
      field: "role",
      header: "Role",
      sortable: true,
      render: (value) => (
        <span className="flex items-center justify-center gap-1">
          {value || "-"}
        </span>
      ),
    },
    {
      field: "outlets",
      header: "Outlets",
      sortable: true,
      render: (outlets) => {
        if (!outlets || !Array.isArray(outlets) || outlets.length === 0) {
          return "0";
        }
        return (
          <span className="font-medium text-gray-800">
            {outlets.length}
          </span>
        );
      },
    },
    {
      field: "action",
      header: "Action",
      sortable: false,
      render: (_, row) => {
        // Array of staff roles where view button should be hidden
        const staffRoles = [];

        // If the role is in staffRoles array, don't render the button
        if (staffRoles.includes(row.role?.toLowerCase())) {
          return null;
        }

        // Otherwise render the view button
        return (
          <div className="flex justify-center">
            <button
              onClick={() =>
                handleViewDetails(row.user_id, row.role, row.outlets)
              }
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Search" },
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
                className="px-5 py-1.5 rounded-3xl inline-flex items-center gap-1 sm:gap-1 sm:px-2 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon
                  icon={faBack}
                  className="w-4  h-4"
                />
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
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              {/* Mobile: Stacked Layout for Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Role Select */}
                <div className="w-full sm:w-auto sm:min-w-[200px]">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-10 sm:h-auto px-4 py-2 pr-10 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%236b7280%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m6%208%204%204%204-4%27/%3e%3c/svg%3e')] bg-[right_0.75rem_center] bg-no-repeat bg-[length:1.5em_1.5em] sm:w-max sm:min-w-[200px]"
                  >
                    <option value="">All Roles</option>
                    <option value="super_owner">Super Owner</option>
                    <option value="owner">Owner</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                {/* Search Type Select */}
                <div className="w-full sm:w-auto sm:min-w-[200px]">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full h-10 sm:h-auto px-4 py-2 pr-10 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%236b7280%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m6%208%204%204%204-4%27/%3e%3c/svg%3e')] bg-[right_0.75rem_center] bg-no-repeat bg-[length:1.5em_1.5em] sm:w-max sm:min-w-[200px]"
                  >
                    <option value="name">Name</option>
                    <option value="mobile">Mobile</option>
                    <option value="outlet_code">Outlet Code</option>
                  </select>
                </div>
              </div>

              {/* Search Input and Button Group */}
              <div className="flex gap-2 sm:gap-4 flex-1">
                <div className="flex-1 relative">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchInput}
                      onChange={handleInputChange}
                      placeholder={`Search by ${searchType}...`}
                      className="w-full h-10 sm:h-auto px-3 py-2 pr-10 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSearchInput("");
                          // Clear search state as well
                          setHasSearched(false);
                          setSearchedTerm("");
                          setSearchResults([]);
                          setTotalResults(0);
                          setError(null);
                          // Keep focus on the search input
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                        title="Clear search"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="self-start sm:self-end">
                  <button
                    type="submit"
                    className="h-10 sm:h-auto px-4 sm:px-6 py-2 text-sm bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={loading || !searchInput.trim()}
                  >
                    <span className="hidden sm:inline">
                      {loading ? "Searching..." : "Search"}
                    </span>
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
                  emptyStateMessage={`No results found for ${searchType}: "${searchInput}"`}
                  counts={{
                    total: totalResults,
                    active: searchResults.filter((r) => r.is_active === 1)
                      .length,
                    inactive: searchResults.filter((r) => r.is_active === 0)
                      .length,
                  }}
                />
              ) : loading ? (
                <div className="text-center text-gray-500 text-sm sm:text-base mt-6 sm:mt-8">
                  Searching...
                </div>
              ) : hasSearched && searchedTerm.trim() ? (
                <div className="text-center text-gray-500 text-sm sm:text-base mt-6 sm:mt-8">
                  No results found for {searchType}: "<b>{searchedTerm}</b>"
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
