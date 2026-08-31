import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faRotate,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DatePickerInput from "../common/DatePickerInput";
import CustomDropdown from "../common/CustomDropdown";
import { useStats } from "../../lib/react-query/hooks/useStats";

function Stats() {
  const { useApiUsageStats, useDbTableStats, useAppUsageStats, useAppSources } =
    useStats();

  // State for filters and search terms
  const [apiUsageStatsSearchTerm, setApiUsageStatsSearchTerm] = useState("");
  const [executionTimeFilter, setExecutionTimeFilter] = useState("all");
  const [dbSearchTerm, setDbSearchTerm] = useState("");
  const [appUsageSearchTerm, setAppUsageSearchTerm] = useState("");
  const [appUsageAppSource, setAppUsageAppSource] = useState("");
  const [appUsagePayload, setAppUsagePayload] = useState({
    start_date: getAppUsageDateString(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ), // 30 days ago
    end_date: getAppUsageDateString(new Date()),
  });

  // Queries
  const {
    data: apiUsageStatsData = { api_stats: [], summary: {} },
    isLoading: apiUsageStatsIsLoading,
    error: apiUsageStatsError,
    refetch: reloadApiUsageStats,
  } = useApiUsageStats();

  const {
    data: dbStatsData = { table_statistics: [], summary: {} },
    isLoading: dbIsLoading,
    error: dbError,
    refetch: reloadDbTableStats,
  } = useDbTableStats();

  const {
    data: appUsageData = { app_statistics: [], total_calls_across_apps: 0 },
    isLoading: appUsageIsLoading,
    error: appUsageError,
    refetch: reloadAppUsage,
  } = useAppUsageStats(appUsagePayload);

  const { data: appSourceOptions = [] } = useAppSources();

  // Debug logging (currently disabled but keep dependency wiring if needed later)
  useEffect(() => {
    // Intentionally left blank – hook kept for potential future logging
  }, [appUsagePayload, appUsageData, appUsageIsLoading, appUsageError]);

  // Auto-refetch when dates change
  useEffect(() => {
    if (appUsagePayload.start_date && appUsagePayload.end_date) {
      reloadAppUsage();
    }
  }, [appUsagePayload.start_date, appUsagePayload.end_date, reloadAppUsage]);

  // Helper functions
  function getAppUsageDateString(date) {
    const day = date.getDate().toString().padStart(2, "0");

    // Ensure month format is exactly what API expects
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();
    const result = `${day} ${month} ${year}`;
    
    return result;
  }

  // Convert date string to API format
  function convertDateToApiFormat(dateString) {
    if (!dateString) return "";

    // Month names mapping for consistency
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // If it's already in the expected format (DD MMM YYYY), return as is
    if (/^\d{2} [A-Za-z]{3} \d{4}$/.test(dateString)) {
      return dateString;
    }

    // If it's in YYYY-MM-DD format, convert to DD MMM YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const day = date.getDate().toString().padStart(2, "0");
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }

    // If it's a Date object or other format, try to parse it
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      
      return dateString;
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Handle date change with proper formatting
  const handleAppUsageFilterChange = (filterType, value) => {
    const formattedValue = convertDateToApiFormat(value);
    
    setAppUsagePayload((prev) => ({ ...prev, [filterType]: formattedValue }));
  };

  // Get API usage stats data
  const getApiUsageStatsData = () => {
    return apiUsageStatsData.api_stats || [];
  };

  function renderSmallDate(value) {
    if (!value) return <span className="text-xs">-</span>;
    const date = new Date(value);
    if (isNaN(date.getTime())) return <span className="text-xs">{value}</span>;
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = hours.toString().padStart(2, "0");
    return (
      <span className="text-xs">{`${day}-${month}-${year} ${hourStr}:${minutes}:${seconds} ${ampm}`}</span>
    );
  }

  // Table columns
  const dbColumns = [
    { field: "table_name", header: "Table Name", sortable: true },
    { field: "record_count", header: "Record Count", sortable: true },
    // {
    //   field: "last_record_date",
    //   header: "Last Record Date",
    //   sortable: true,
    //   render: renderSmallDate,
    // },
  ];

  const apiUsageStatsColumns = [
    { field: "api_name", header: "API Name", sortable: true },
    { field: "total_calls", header: "Total Calls", sortable: true },
    {
      field: "avg_execution_time",
      header: "Execution Time",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-700">
          {value || "-"}
        </span>
      ),
    },
    { field: "last_accessed", header: "Last Accessed", sortable: true },
  ];

  // Filter data
  const allApiDetails = (appUsageData.app_statistics || [])
    .filter((app) => !appUsageAppSource || app.app_source === appUsageAppSource)
    .map((app) => ({
      app_source: app.app_source,
      total_calls: app.total_calls,
      first_accessed: app.first_accessed,
      last_accessed: app.last_accessed,
    }));

  // Breadcrumb
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Stats", path: "/stats" },
    { label: "API Usage & Database Tables" },
  ];

  return (
    <>
      {/* Breadcrumb - Moved outside the card */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Stats
              </h2>
            </div>

            {/* Right Side - Reload Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  reloadApiUsageStats();
                  reloadDbTableStats();
                  reloadAppUsage();
                }}
                disabled={apiUsageStatsIsLoading || dbIsLoading || appUsageIsLoading}
                className="inline-flex items-center justify-center w-10 h-10 rounded-3xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reload data"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${(apiUsageStatsIsLoading || dbIsLoading || appUsageIsLoading) ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6">
          {/* API Usage Stats Section */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-1">API Usage Stats</h2>
        <DataTable
          data={getApiUsageStatsData()}
          columns={apiUsageStatsColumns}
          enableSearch={true}
          enableSort={true}
          enablePagination={true}
          enableStatusFilter={false}
          enableExecutionTimeFilter={true}
          executionTimeFilter={executionTimeFilter}
          onExecutionTimeFilterChange={setExecutionTimeFilter}
          counts={{
            total: apiUsageStatsData.summary?.total_unique_apis || 0,
            total_api_calls: apiUsageStatsData.summary?.total_api_calls || 0,
            average_execution_time:
              apiUsageStatsData.summary?.average_execution_time || 0,
          }}
          showCreateButton={false}
          createButton={{ show: false, label: "", onClick: () => {} }}
          showBackButton={false}
          searchTerm={apiUsageStatsSearchTerm}
          onSearchChange={setApiUsageStatsSearchTerm}
          isLoading={apiUsageStatsIsLoading}
          error={apiUsageStatsError}
          itemsPerPage={50}
          itemsPerPageOptions={[25, 50, 100, 200]}
          className="compact-table"
          emptyStateMessage="No API usage stats data available."
          customFilters={[]}
          onReload={reloadApiUsageStats}
        />
      </div>

      {/* DB Table Stats Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1">
          Database Tables Statistics
        </h2>
        <div className="mt-2">
          <DataTable
            data={dbStatsData.table_statistics}
            columns={dbColumns}
            enableSearch={true}
            enableSort={true}
            enablePagination={true}
            searchTerm={dbSearchTerm}
            onSearchChange={setDbSearchTerm}
            searchPlaceholder="Search"
            isLoading={dbIsLoading}
            error={dbError}
            itemsPerPage={20}
            itemsPerPageOptions={[20, 50, 100, 200]}
            enableStatusFilter={false}
            showCreateButton={false}
            showBackButton={false}
            className="compact-table"
            createButton={{ show: false, label: "", onClick: () => {} }}
            counts={{
              total: dbStatsData.summary?.total_records || 0,
              tables_with_data: dbStatsData.summary?.tables_with_data || 0,
              empty_tables: dbStatsData.summary?.empty_tables || 0,
            }}
            onReload={reloadDbTableStats}
            forceTopControls={true}
          />
        </div>
      </div>

      {/* App Usage Table Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">App Usage</h2>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-3 mb-2">
            <div className="w-40 mb-2 sm:w-44">
              <CustomDropdown
                label="Select App"
                options={appSourceOptions}
                value={appUsageAppSource}
                onChange={(e) => setAppUsageAppSource(e.target.value)}
                placeholder="Select App"
                className="w-full"
                buttonClassName="pl-4"
              />
            </div>

            <div className="w-40 sm:w-44">
              <label className="block text-xs text-gray-600 mb-1">
                Start Date
              </label>
              <DatePickerInput
                value={appUsagePayload.start_date}
                onChange={(e) =>
                  handleAppUsageFilterChange("start_date", e.target.value)
                }
                placeholder="Start date"
                className="w-full text-xs py-1 px-2 rounded-lg"
              />
            </div>

            <div className="w-40 sm:w-44">
              <label className="block text-xs text-gray-600 mb-1">
                End Date
              </label>
              <DatePickerInput
                value={appUsagePayload.end_date}
                onChange={(e) =>
                  handleAppUsageFilterChange("end_date", e.target.value)
                }
                placeholder="End date"
                className="w-full text-xs py-1 px-2 rounded-lg"
              />
            </div>

          <div className="flex items-end gap-3">
            <div className="relative w-full sm:w-60 lg:w-64">
              <label className="sr-only">Search</label>
              <span className="absolute left-4 top-1/2 pb-2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={appUsageSearchTerm}
                onChange={(e) => setAppUsageSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full mb-2 h-10 pb-2 rounded-lg border border-gray-300 bg-transparent py-2 pr-12 pl-12 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-300 focus:outline-none"
              />
              {appUsageSearchTerm && (
                <button
                  type="button"
                  onClick={() => setAppUsageSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 pb-1 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => reloadAppUsage()}
              disabled={appUsageIsLoading}
              className="inline-flex items-center justify-center w-10 h-10 rounded-3xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reload data"
            >
              <FontAwesomeIcon
                icon={faRotate}
                className={`w-4 h-4 ${appUsageIsLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {appUsageError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              <strong>Error:</strong> {appUsageError.message}
            </p>
            <p className="text-xs text-red-500 mt-1">
              Check the browser console for more details.
            </p>
          </div>
        )}

        <DataTable
          data={allApiDetails}
          columns={[
            { field: "app_source", header: "App Source", sortable: true },
            { field: "total_calls", header: "Total Calls", sortable: true },
            {
              field: "first_accessed",
              header: "First Accessed",
              sortable: true,
              render: renderSmallDate,
            },
            {
              field: "last_accessed",
              header: "Last Accessed",
              sortable: true,
              render: renderSmallDate,
            },
          ]}
          counts={{
            total: appUsageData.total_calls_across_apps || 0,
            total_apps: appUsageData.app_statistics?.length || 0,
          }}
          enableSearch={true}
          showSearch={false}
          enableSort={true}
          enablePagination={true}
          enableStatusFilter={false}
          showCreateButton={false}
          createButton={{ show: false, label: "", onClick: () => {} }}
          showBackButton={false}
          searchTerm={appUsageSearchTerm}
          onSearchChange={setAppUsageSearchTerm}
          isLoading={appUsageIsLoading}
          error={appUsageError}
          itemsPerPage={50}
          itemsPerPageOptions={[50, 100, 200, 500]}
          className="compact-table"
          emptyStateMessage="No app usage data available."
        />
          </div>
        </div>
      </div>
    </>
  );
}

export default Stats;
