import React, { useState } from "react";
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
    start_date: getAppUsageDateString(new Date()),
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

  // Helper functions
  function getAppUsageDateString(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

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

  const appUsageColumns = [
    { field: "endpoint", header: "Endpoint", sortable: true },
    { field: "total_calls", header: "Total Calls", sortable: true },
    { field: "last_used", header: "Last Used", sortable: true },
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
    .flatMap((app) =>
      (app.api_details || []).map((detail) => ({
        ...detail,
        app_source: app.app_source,
      }))
    );

  // Filter change handlers
  const handleAppUsageFilterChange = (filterType, value) => {
    setAppUsagePayload((prev) => ({ ...prev, [filterType]: value }));
  };

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
           average_execution_time: apiUsageStatsData.summary?.average_execution_time || 0,
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

      {/* App Usage Table Section */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-1">App Usage</h2>
        <DataTable
          data={allApiDetails}
          columns={appUsageColumns}
          counts={null}
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
                    className="w-full sm:w-64 text-xs py-1 px-2"
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
