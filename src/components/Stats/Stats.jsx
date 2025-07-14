import React, { useState, useEffect } from "react";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DatePickerInput from "../common/DatePickerInput";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

function Stats() {
  // --- API Usage State and Logic (from Stats.jsx) ---
  const { getToken } = useAuth();

  const [apiStatsData, setApiStatsData] = useState({
    total_api_calls: 0,
    endpoint_statistics: [],
    date_range: {
      start_date: "",
      end_date: "",
    },
  });
  const [apiPayload, setApiPayload] = useState({
    app_source: "owner_app",
    start_date: getISODateString(new Date()),
    end_date: getISODateString(new Date()),
  });
  const [appSourceOptions, setAppSourceOptions] = useState([]);
  const [apiIsLoading, setApiIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [apiSearchTerm, setApiSearchTerm] = useState("");

  // --- DB Table Stats State and Logic (from DBTablesStats.jsx) ---
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [dbStatsData, setDbStatsData] = useState({
    summary: {
      total_tables: 0,
      total_records: 0,
      tables_with_data: 0,
      empty_tables: 0,
    },
    table_statistics: [],
  });
  const [dbIsLoading, setDbIsLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [dbSearchTerm, setDbSearchTerm] = useState("");

  // --- App Usage Table State ---
  const [appUsageData, setAppUsageData] = useState({
    app_statistics: [],
    total_calls_across_apps: 0,
    date_range: { start_date: '', end_date: '' },
  });
  const [appUsageIsLoading, setAppUsageIsLoading] = useState(false);
  const [appUsageError, setAppUsageError] = useState(null);
  const [appUsagePayload, setAppUsagePayload] = useState({
    start_date: getAppUsageDateString(new Date()),
    end_date: getAppUsageDateString(new Date()),
  });
  const [appUsageSearchTerm, setAppUsageSearchTerm] = useState("");
  const [appUsageAppSource, setAppUsageAppSource] = useState("");

  // --- API Usage Stats Table State ---
  const [apiUsageStatsData, setApiUsageStatsData] = useState({
    api_stats: [],
    summary: { total_unique_apis: 0, total_api_calls: 0, average_execution_time: 0 },
    detail: '',
  });
  const [apiUsageStatsIsLoading, setApiUsageStatsIsLoading] = useState(false);
  const [apiUsageStatsError, setApiUsageStatsError] = useState(null);
  const [apiUsageStatsPayload, setApiUsageStatsPayload] = useState({
    user_id: '1',
    app_source: 'pos_app',
  });
  const [apiUsageStatsSearchTerm, setApiUsageStatsSearchTerm] = useState("");

  // --- Breadcrumb ---
  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Stats", path: "/stats" },
    { label: "API Usage & Database Tables" },
  ];

  // --- Helper functions ---
  function getISODateString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function formatDateForApi(yyyy_mm_dd) {
    if (!yyyy_mm_dd) return "";
    const [year, month, day] = yyyy_mm_dd.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Helper to format date in '09-Jul-2025 07:47:47 PM' and small font
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

  // Helper for 'DD MMM YYYY' format
  function getAppUsageDateString(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  const fetchAppSources = async () => {
    try {
      const response = await fetch('https://men4u.xyz/v2/common/get_list/app_source', {
        method: 'GET',
        headers: {
          'Authorization': getToken(),
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch app sources');
      }

      const data = await response.json();
      
      // Transform the app_source_list object into the format needed for the dropdown
      const options = Object.entries(data.app_source_list).map(([value, label]) => ({
        value,
        label: label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      }));
      
      setAppSourceOptions(options);
    } catch (error) {
      console.error('Error fetching app sources:', error);
    }
  };

  // Add useEffect to fetch app sources when component mounts
  useEffect(() => {
    fetchAppSources();
  }, []);

  // --- API Usage: Fetch stats ---
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     setApiIsLoading(true);
  //     setApiError(null);
  //     try {
  //       const apiPayloadFormatted = {
  //         ...apiPayload,
  //         start_date: formatDateForApi(apiPayload.start_date),
  //         end_date: formatDateForApi(apiPayload.end_date),
  //       };
  //       const response = await fetch(
  //         "https://men4u.xyz/v2/admin/api_usage_stats",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(apiPayloadFormatted),
  //         }
  //       );
  //       if (!response.ok) throw new Error("Network response was not ok");
  //       const data = await response.json();
  //       setApiStatsData(data);
  //     } catch (error) {
  //       setApiError("Failed to fetch API usage stats");
  //       setApiStatsData({
  //         total_api_calls: 0,
  //         endpoint_statistics: [],
  //         date_range: { start_date: "", end_date: "" },
  //       });
  //     } finally {
  //       setApiIsLoading(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  // --- DB Table Stats: Fetch stats ---
  useEffect(() => {
    const fetchTableStats = async () => {
      setDbIsLoading(true);
      setDbError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/${API_VERSION}/admin/table_stats`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch table statistics");
        const data = await response.json();
        setDbStatsData(data);
      } catch (error) {
        setDbError("Failed to fetch table statistics");
        setDbStatsData({
          summary: {
            total_tables: 0,
            total_records: 0,
            tables_with_data: 0,
            empty_tables: 0,
          },
          table_statistics: [],
        });
      } finally {
        setDbIsLoading(false);
      }
    };
    fetchTableStats();
  }, []);

  // Fetch App Usage Data
  useEffect(() => {
    const fetchAppUsage = async () => {
      setAppUsageIsLoading(true);
      setAppUsageError(null);
      try {
        const response = await fetch(
          "https://men4u.xyz/v2/admin/app_usage_stats",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_date: appUsagePayload.start_date,
              end_date: appUsagePayload.end_date,
            }),
          }
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setAppUsageData(data);
      } catch (error) {
        setAppUsageError("Failed to fetch App Usage stats");
        setAppUsageData({
          app_statistics: [],
          total_calls_across_apps: 0,
          date_range: { start_date: '', end_date: '' },
        });
      } finally {
        setAppUsageIsLoading(false);
      }
    };
    fetchAppUsage();
  }, [appUsagePayload]);

  // Fetch API Usage Stats Data
  useEffect(() => {
    if (!apiUsageStatsPayload.user_id || !apiUsageStatsPayload.app_source) return;
    const fetchApiUsageStats = async () => {
      setApiUsageStatsIsLoading(true);
      setApiUsageStatsError(null);
      try {
        const response = await fetch(
          `https://men4u.xyz/v2/admin/api_usage_stats`,
          {
            method: "GET",
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json"
            }
          }
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setApiUsageStatsData(data);
      } catch (error) {
        setApiUsageStatsError("Failed to fetch API usage stats");
        setApiUsageStatsData({
          api_stats: [],
          summary: { total_unique_apis: 0, total_api_calls: 0, average_execution_time: 0 },
          detail: '',
        });
      } finally {
        setApiUsageStatsIsLoading(false);
      }
    };
    fetchApiUsageStats();
  }, [apiUsageStatsPayload]);

  // --- API Usage: Columns ---
  // const apiColumns = [
  //   { field: "endpoint", header: "Endpoint", sortable: true },
  //   { field: "app_source", header: "App Source", sortable: true },
  //   { field: "call_count", header: "Call Count", sortable: true },
  //   {
  //     field: "last_accessed",
  //     header: "Last Accessed",
  //     sortable: true,
  //     render: renderSmallDate,
  //   },
  // ];

  // --- DB Table Stats: Columns ---
  const dbColumns = [
    { field: "table_name", header: "Table Name", sortable: true },
    { field: "record_count", header: "Record Count", sortable: true },
    {
      field: "last_record_date",
      header: "Last Record Date",
      sortable: true,
      render: renderSmallDate,
    },
  ];

  // App Usage Table Columns
  const appUsageColumns = [
    { field: "endpoint", header: "Endpoint", sortable: true },
    { field: "total_calls", header: "Total Calls", sortable: true },
    { field: "last_used", header: "Last Used", sortable: true },
  ];

  // API Usage Stats Table Columns
  const apiUsageStatsColumns = [
    { field: "api_name", header: "API Name", sortable: true },
    { field: "total_calls", header: "Total Calls", sortable: true },
    { field: "avg_execution_time", header: "Execution Time", sortable: true },
    { field: "last_accessed", header: "Last Accessed", sortable: true },
  ];

  // Flatten all api_details from all apps into one array for the table, filtered by app source if selected
  const allApiDetails = (appUsageData.app_statistics || [])
    .filter(app => !appUsageAppSource || app.app_source === appUsageAppSource)
    .flatMap(app =>
      (app.api_details || []).map(detail => ({
        ...detail,
        app_source: app.app_source,
      }))
    );

  // --- API Usage: Filter change handler ---
  const handleApiFilterChange = (filterType, value) => {
    setApiPayload((prev) => ({ ...prev, [filterType]: value }));
  };

  // App Usage Filter change handler
  const handleAppUsageFilterChange = (filterType, value) => {
    setAppUsagePayload((prev) => ({ ...prev, [filterType]: value }));
  };

  // API Usage Stats Filter change handler
  const handleApiUsageStatsFilterChange = (filterType, value) => {
    setApiUsageStatsPayload((prev) => ({ ...prev, [filterType]: value }));
  };

  // Reload functions for each table
  const reloadApiUsageStats = async () => {
    setApiUsageStatsIsLoading(true);
    setApiUsageStatsError(null);
    try {
      const response = await fetch(
        `https://men4u.xyz/v2/admin/api_usage_stats`,
        {
          method: "GET",
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setApiUsageStatsData(data);
    } catch (error) {
      setApiUsageStatsError("Failed to fetch API usage stats");
      setApiUsageStatsData({
        api_stats: [],
        summary: { total_unique_apis: 0, total_api_calls: 0, average_execution_time: 0 },
        detail: '',
      });
    } finally {
      setApiUsageStatsIsLoading(false);
    }
  };

  const reloadDbTableStats = async () => {
    setDbIsLoading(true);
    setDbError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/${API_VERSION}/admin/table_stats`,
        {
          method: "GET",
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch table statistics");
      const data = await response.json();
      setDbStatsData(data);
    } catch (error) {
      setDbError("Failed to fetch table statistics");
      setDbStatsData({
        summary: {
          total_tables: 0,
          total_records: 0,
          tables_with_data: 0,
          empty_tables: 0,
        },
        table_statistics: [],
      });
    } finally {
      setDbIsLoading(false);
    }
  };

  const reloadAppUsage = async () => {
    setAppUsageIsLoading(true);
    setAppUsageError(null);
    try {
      const response = await fetch(
        "https://men4u.xyz/v2/admin/app_usage_stats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start_date: appUsagePayload.start_date,
            end_date: appUsagePayload.end_date,
          }),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setAppUsageData(data);
    } catch (error) {
      setAppUsageError("Failed to fetch App Usage stats");
      setAppUsageData({
        app_statistics: [],
        total_calls_across_apps: 0,
        date_range: { start_date: '', end_date: '' },
      });
    } finally {
      setAppUsageIsLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {/* API Usage Stats Section - Full Width */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1">API Usage Stats</h2>
        <DataTable
          data={apiUsageStatsData.api_stats}
          columns={apiUsageStatsColumns}
          enableSearch={true}
          enableSort={true}
          enableStatusFilter={false}
          counts={null}
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
          dashboardTitle={`Total Unique APIs: ${apiUsageStatsData.summary?.total_unique_apis ?? '-'} | Total API Calls: ${apiUsageStatsData.summary?.total_api_calls ?? '-'} | Avg Execution Time: ${apiUsageStatsData.summary?.average_execution_time ?? '-'}`}
          onReload={reloadApiUsageStats}
        />
      </div>

      {/* DB Table Stats Section - Full Width */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1">Database Tables Statistics</h2>
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
          counts={null}
          dashboardTitle={`Total Records: ${dbStatsData.summary.total_records} | Tables With Data: ${dbStatsData.summary.tables_with_data} | Empty Tables: ${dbStatsData.summary.empty_tables}`}
          emptyStateMessage="No table statistics available."
          onReload={reloadDbTableStats}
        />
      </div>
      {/* App Usage Table Section below, full width */}
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
                    value={apiPayload.start_date}
                    onChange={(e) =>
                      handleApiFilterChange("start_date", e.target.value)
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
                    value={apiPayload.end_date}
                    onChange={(e) =>
                      handleApiFilterChange("end_date", e.target.value)
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
