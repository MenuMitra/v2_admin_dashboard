'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ubacService from '@/api/services/ubacService';
import { isAuthenticated } from '@/utils/auth';
import { getAuthHeaders, getAuthToken } from '@/utils/apiUtils';
import { FiEye } from 'react-icons/fi';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);
  
  // Table columns configuration
  const columns = [
    {
      header: 'Sr No',
      render: (row, index) => (
        <span className="text-gray-800 font-medium">{index + 1}</span>
      ),
    },
   
    {
      header: 'Role Name',
      accessor: 'role_name',
      render: (row) => (
        <span className="capitalize text-gray-800 font-medium">{row.role_name}</span>
      )
    },
    {
      header: 'Created On',
      accessor: 'created_on',
      render: (row) => (
        <span className="text-gray-800">{formatDate(row.created_on)}</span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-3">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            title="View Functionalities"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];
  
  // Fetch roles on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchRoles();
    }
  }, []);
  
  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      // Get all role-functionality mappings to extract unique roles
      const mappingsData = await ubacService.getRoleFunctionalityMappings();
      
      // Check for authentication error
      if (mappingsData && mappingsData.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      // Ensure we have an array of mappings
      if (Array.isArray(mappingsData)) {
        // Extract unique roles from the mappings data
        const uniqueRoles = [];
        const roleIds = new Set();
        
        // Loop through mappings to find unique roles
        mappingsData.forEach(mapping => {
          if (!roleIds.has(mapping.ubac_role_id)) {
            roleIds.add(mapping.ubac_role_id);
            uniqueRoles.push({
              ubac_role_id: mapping.ubac_role_id,
              role_name: `Role ${mapping.ubac_role_id}`, // Default name
              created_on: mapping.created_on
            });
          }
        });
        
        setRoles(uniqueRoles);
      } else {
        console.error('API did not return an array for mappings:', mappingsData);
        
        // Show error message and set empty array
        setRoles([]);
        toast.error('Failed to retrieve roles from server');
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load roles');
      }
      // Initialize roles as empty array on error
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };
  
  // View role's assigned functionalities
  const handleView = async (role) => {
    try {
      // Log for debugging
      console.log("Viewing role:", role);
      
      // Navigate to role details page with the mappings
      router.push(`/access-control/role-mapping/${role.ubac_role_id}`);
    } catch (error) {
      console.error('Failed to fetch role functionalities:', error);
      toast.error('Failed to load role functionalities');
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Access Control Roles</h1>
        <p className="text-gray-600 mt-1">Manage user roles for access control</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between">
          <h2 className="text-lg font-medium">Roles</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No roles found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role, rowIndex) => (
                  <tr key={role.ubac_role_id} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(role, rowIndex) : role[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 