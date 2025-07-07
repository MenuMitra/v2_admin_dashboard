import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import DatePickerInput from '../common/DatePickerInput';

function Stats() {
  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Statistics', path: '/stats' },
    { label: 'API Usage' }
  ];

  // State to store API data
  const [statsData, setStatsData] = useState({
    summary: [],
    detailed_stats: [],
    total_api_calls: 0,
    date_range: {
      start_date: '',
      end_date: ''
    }
  });

  // Payload state
  const [payload, setPayload] = useState({
    app_source: "owner_app",
    start_date: "06 Jul 2025",
    end_date: "07 Jul 2025"
  });

  // Options for dropdowns
  const appSourceOptions = [
    { value: 'owner_app', label: 'Owner App' },
    { value: 'customer_app', label: 'Customer App' },
    { value: 'admin_app', label: 'Admin App' }
  ];

  // Function to handle filter changes
  const handleFilterChange = (filterType, value) => {
    setPayload(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  useEffect(() => {
    // Function to fetch stats
    const fetchStats = async () => {
      try {
        const response = await fetch('https://men4u.xyz/v2/admin/api_usage_stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
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
          summary: [
            {
              app: "owner_app",
              total_calls: 14
            }
          ],
          detailed_stats: [
            {
              app_source: "owner_app",
              endpoint: "/common/update_staff",
              call_count: 5,
              last_accessed: "07-Jul-2025 01:17:20 PM"
            },
            // ... other mock data entries
          ],
          total_api_calls: 14,
          date_range: {
            start_date: "06 Jul 2025",
            end_date: "07 Jul 2025"
          }
        });
      }
    };

    fetchStats();
  }, [payload]); // Re-fetch when payload changes

  // Define columns for the DataTable
  const columns = [
    {
      field: 'endpoint',
      header: 'Endpoint',
      sortable: true,
    },
    {
      field: 'call_count',
      header: 'Call Count',
      sortable: true,
    },
    {
      field: 'last_accessed',
      header: 'Last Accessed',
      sortable: true,
    }
  ];

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  // Function to format date for the API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+) ([A-Za-z]+) (\d+)/, '$1 $2 $3');
  };

  // Function to parse date from API format
  const parseDateFromAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format for DatePicker
  };

  return (
    <div>
      {/* Add Breadcrumb at the top */}
      <div className="px-6 pt-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="p-6">
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
        <div>
          <DataTable
            data={statsData.detailed_stats}
            columns={columns}
            title="API Usage Statistics"
            enableSearch={true}
            enableSort={true}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search"
            emptyStateMessage="No API usage data available."
            counts={null}
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
                      value={parseDateFromAPI(payload.start_date)}
                      onChange={(e) => handleFilterChange('start_date', formatDateForAPI(e.target.value))}
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
                      value={parseDateFromAPI(payload.end_date)}
                      onChange={(e) => handleFilterChange('end_date', formatDateForAPI(e.target.value))}
                      placeholder="Select end date"
                      className="w-full sm:w-64"
                    />
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default Stats;