import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config/appConfig';


function DBTablesStats() {
    const { BASE_URL, API_VERSION } = API_CONFIG;
    const { getToken } = useAuth();
  const [statsData, setStatsData] = useState({
    summary: {
      total_tables: 0,
      total_records: 0,
      tables_with_data: 0,
      empty_tables: 0
    },
    table_statistics: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Statistics', path: '/stats' },
    { label: 'Database Tables' }
  ];

  // Define columns for the DataTable
  const columns = [
    {
      field: 'table_name',
      header: 'Table Name',
      sortable: true
    },
    {
      field: 'record_count',
      header: 'Record Count',
      sortable: true
    },
    {
      field: 'last_record_date',
      header: 'Last Record Date',
      sortable: true,
      render: (value) => value || '-'
    }
  ];

  // Fetch table statistics
  const fetchTableStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/table_stats`, {
        method: 'GET',
        headers: {
          'Authorization': getToken(),
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch table statistics');
      }

      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching table statistics:', error);
      setError('Failed to fetch table statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchTableStats only once when component mounts
  useEffect(() => {
    fetchTableStats();
  }, []); // Empty dependency array

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={statsData.table_statistics}
        columns={columns}
        title="Database Tables Statistics"
        enableSearch={true}
        enableSort={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
        error={error}
        enableStatusFilter={false}
        showCreateButton={false}
        createButton={{
          show: false,
          label: '',
          onClick: () => {},
        }}
        counts={{
          total: statsData.summary.total_tables,
          active: null,
          inactive: null
        }}
        dashboardTitle={`Total Records: ${statsData.summary.total_records} | Tables With Data: ${statsData.summary.tables_with_data} | Empty Tables: ${statsData.summary.empty_tables}`}
        emptyStateMessage="No table statistics available."
      />
    </div>
  );
}

export default DBTablesStats;