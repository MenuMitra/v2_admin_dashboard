import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import DatePickerInput from '../common/DatePickerInput';
import { useAuth } from '../../hooks/useAuth';

// --- Helper functions moved to the top and corrected ---
const getISODateString = (date) => {
  // --- FIX: Use local date parts to avoid timezone shift on initialization ---
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForApi = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return "";
  const [year, month, day] = yyyy_mm_dd.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Stats() {
  const { getToken } = useAuth();
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Statistics', path: '/stats' },
    { label: 'API Usage' }
  ];

  // State to store API data
  const [statsData, setStatsData] = useState({
    total_api_calls: 0,
    endpoint_statistics: [],
    date_range: {
      start_date: '',
      end_date: ''
    }
  });

  // --- Update payload to use clean YYYY-MM-DD format ---
  const [payload, setPayload] = useState({
    app_source: "owner_app",
    start_date: getISODateString(new Date()),
    end_date: getISODateString(new Date())
  });

  // Replace the hardcoded appSourceOptions with state
  const [appSourceOptions, setAppSourceOptions] = useState([]);

  // Add function to fetch app sources
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

  // --- handleFilterChange now receives clean YYYY-MM-DD ---
  const handleFilterChange = (filterType, value) => {
    setPayload(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch stats
    const fetchStats = async () => {
      try {
        // --- Create a separate payload for the API call with the correct date format ---
        const apiPayload = {
          ...payload,
          start_date: formatDateForApi(payload.start_date),
          end_date: formatDateForApi(payload.end_date)
        };

        const response = await fetch('https://men4u.xyz/v2/admin/api_usage_stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload) // Use the formatted payload
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // For demo, setting mock data
        setStatsData({
          total_api_calls: 14,
          endpoint_statistics: [
            {
              endpoint: "/common/update_staff",
              call_count: 5,
              last_accessed: "07-Jul-2025 01:17:20 PM"
            },
            // ... other mock data entries
          ],
          date_range: {
            start_date: "06 Jul 2025",
            end_date: "07 Jul 2025"
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [payload]); // Re-fetch when payload changes

  // Define columns for the DataTable
  const columns = [
    {
      field: 'endpoint',
      header: 'Endpoint',
      sortable: true
    },
    {
      field: 'app_source',
      header: 'App Source',
      sortable: true
    },
    {
      field: 'call_count',
      header: 'Call Count',
      sortable: true
    },
    {
      field: 'last_accessed',
      header: 'Last Accessed',
      sortable: true
    }
  ];

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
        <Breadcrumb items={breadcrumbItems} />


      <div className="">
        {/* Summary Section */}
        {/* <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">API Usage Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-500 text-sm">Total API Calls</h3>
              <p className="text-2xl font-semibold">{statsData.total_api_calls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-500 text-sm">Date Range</h3>
              <p className="text-sm">
                {statsData.date_range.start_date} - {statsData.date_range.end_date}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-gray-500 text-sm">App Source</h3>
              <p className="text-sm">{payload.app_source}</p>
            </div>
          </div>
        </div> */}

        {/* Detailed Stats Table */}
        {isLoading ? (
          <div className="p-4 text-center">
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : (
          <DataTable
            data={statsData.endpoint_statistics || []}
            columns={columns}
            title="API Usage Statistics"
            counts={null}
            enableSearch={true}
            enableSort={true}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            emptyStateMessage="No API usage data available."
            enableStatusFilter={false}
            showCreateButton={false}
            customFilters={[
              {
                type: 'select',
                label: 'App Name',
                value: payload.app_source,
                options: appSourceOptions,
                onChange: (value) => handleFilterChange('app_source', value),
                placeholder: "Select App"
              },
              {
                type: 'custom',
                label: 'Start Date',
                component: (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <DatePickerInput
                      value={payload.start_date}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      placeholder="Select start date"
                      className="w-full sm:w-64"
                    />
                  </div>
                )
              },
              {
                type: 'custom',
                label: 'End Date',
                component: (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <DatePickerInput
                      value={payload.end_date}
                      onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      placeholder="Select end date"
                      className="w-full sm:w-64"
                    />
                  </div>
                )
              }
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default Stats;