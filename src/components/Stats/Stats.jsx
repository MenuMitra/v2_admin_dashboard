import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DatePickerInput from "../common/DatePickerInput";
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

  // Debug logging
  useEffect(() => {
    console.log("App Usage Payload:", appUsagePayload);
    console.log("App Usage Data:", appUsageData);
    console.log("App Usage Loading:", appUsageIsLoading);
    console.log("App Usage Error:", appUsageError);

    // Log the exact format of dates being sent
    if (appUsagePayload.start_date && appUsagePayload.end_date) {
      console.log("Date format check:");
      console.log(
        "Start date:",
        appUsagePayload.start_date,
        "Type:",
        typeof appUsagePayload.start_date
      );
      console.log(
        "End date:",
        appUsagePayload.end_date,
        "Type:",
        typeof appUsagePayload.end_date
      );
      console.log(
        "Start date regex test:",
        /^\d{2} [A-Za-z]{3} \d{4}$/.test(appUsagePayload.start_date)
      );
      console.log(
        "End date regex test:",
        /^\d{2} [A-Za-z]{3} \d{4}$/.test(appUsagePayload.end_date)
      );
    }
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
    console.log("getAppUsageDateString input:", date, "output:", result);
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
      console.warn("Could not parse date:", dateString);
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
    console.log(`Date change - ${filterType}:`, {
      original: value,
      formatted: formattedValue,
    });
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
    { label: "Dashboard", path: "/" },
    { label: "Stats", path: "/stats" },
    { label: "API Usage & Database Tables" },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* API Usage Stats Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1">API Usage Stats</h2>
        <DataTable
          data={getApiUsageStatsData()}
          columns={apiUsageStatsColumns}
          enableSearch={true}
          enableSort={true}
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
          itemsPerPage={20}
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
      searchTerm={dbSearchTerm}
      onSearchChange={setDbSearchTerm}
      searchPlaceholder="Search"
      isLoading={dbIsLoading}
      error={dbError}
      itemsPerPage={20}
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
    />
  </div>
</div>

      {/* App Usage Table Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">App Usage</h2>
          <div className="flex gap-2">
            <button
  onClick={() => reloadAppUsage()}
  disabled={appUsageIsLoading}
  className="px-3 py-1 text-xs bg-blue-500 text-black rounded hover:bg-blue-600 disabled:opacity-50"
>
  {appUsageIsLoading ? "Loading..." : "Refresh"}
</button>

<button
  onClick={() => {
    setAppUsagePayload({
      start_date: "",
      end_date: "",
    });
    reloadApiUsageStats();
  }}
  className="px-3 py-1 text-xs bg-green-500 text-black rounded hover:bg-green-600"
>
  {appUsageIsLoading ? "Loading..." : "Refresh"}
  Test Dates
</button>

            <span className="text-xs text-gray-500">
              {appUsagePayload.start_date} - {appUsagePayload.end_date}
            </span>
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
          enableSort={true}
          enableStatusFilter={false}
          showCreateButton={false}
          createButton={{ show: false, label: "", onClick: () => {} }}
          showBackButton={false}
          searchTerm={appUsageSearchTerm}
          onSearchChange={setAppUsageSearchTerm}
          isLoading={appUsageIsLoading}
          error={appUsageError}
          itemsPerPage={20}
          className="compact-table"
          emptyStateMessage="No app usage data available."
          onReload={reloadAppUsage}
          customFilters={[
            {
              type: "select",
              label: "App Name",
              value: appUsageAppSource,
              options: appSourceOptions,
              onChange: setAppUsageAppSource,
              placeholder: "Select App",
            },
            {
              type: "custom",
              label: "Start Date",
              component: (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start Date
                  </label>
                  <DatePickerInput
                    value={appUsagePayload.start_date}
                    onChange={(e) =>
                      handleAppUsageFilterChange("start_date", e.target.value)
                    }
                    placeholder="Select start date"
                    className="w-full sm:w-64 text-xs py-1 px-2"
                  />
                </div>
              ),
            },
            {
              type: "custom",
              label: "End Date",
              component: (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    End Date
                  </label>
                  <DatePickerInput
                    value={appUsagePayload.end_date}
                    onChange={(e) =>
                      handleAppUsageFilterChange("end_date", e.target.value)
                    }
                    placeholder="Select end date"
                    className="w-full sm:w-64 text-xs py-2 px-2"
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default Stats;
