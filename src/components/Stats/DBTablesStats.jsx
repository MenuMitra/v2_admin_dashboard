import React, { useState, useEffect } from 'react';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';
import { useAuth } from '../../hooks/useAuth';

function DBTablesStats() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    summary: {
      total_tables: 0,
      total_records: 0,
      tables_with_data: 0,
      empty_tables: 0
    },
    table_statistics: []
  });

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
  useEffect(() => {
    const fetchTableStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://men4u.xyz/v2/admin/table_stats', {
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
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTableStats();
  }, [getToken]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

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
          active: null,  // Set to null to hide active count
          inactive: null // Set to null to hide inactive count
        }}
        dashboardTitle={`Total Records: ${statsData.summary.total_records} | Tables With Data: ${statsData.summary.tables_with_data} | Empty Tables: ${statsData.summary.empty_tables}`}
        emptyStateMessage="No table statistics available."
      />
    </div>
  );
}

export default DBTablesStats;