import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useCompanies } from '../../lib/react-query/hooks/useCompanies';

function CompaniesDebug() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  
  const {
    companies,
    isLoading,
    error,
  } = useCompanies(getToken(), adminData?.user_id);

  useEffect(() => {
    console.log('=== COMPANIES DEBUG ===');
    console.log('Token:', getToken() ? 'Present' : 'Missing');
    console.log('User ID:', adminData?.user_id);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    console.log('Companies:', companies);
    console.log('Companies type:', typeof companies);
    console.log('Companies length:', companies?.length);
    console.log('First company:', companies?.[0]);
    console.log('========================');
  }, [companies, isLoading, error, getToken, adminData?.user_id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Companies Debug</h2>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Total Companies:</strong> {companies?.length || 0}</p>
        <p><strong>Data Type:</strong> {typeof companies}</p>
        <p><strong>Is Array:</strong> {Array.isArray(companies) ? 'Yes' : 'No'}</p>
        
        {companies && companies.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">First Company:</h3>
            <pre className="bg-white p-2 rounded text-sm overflow-auto">
              {JSON.stringify(companies[0], null, 2)}
            </pre>
          </div>
        )}
        
        {companies && companies.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">All Companies:</h3>
            <pre className="bg-white p-2 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(companies, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompaniesDebug;