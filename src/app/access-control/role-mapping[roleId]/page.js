'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ubacService from '@/api/services/ubacService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function RoleMappingPage({ params }) {
  const roleId = parseInt(params.roleId, 10);
  const router = useRouter();
  
  const [roleMappings, setRoleMappings] = useState([]);
  const [allFunctionalities, setAllFunctionalities] = useState([]);
  const [roleDetails, setRoleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFunctionality, setSelectedFunctionality] = useState(null);
  
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
      header: 'Mapping ID',
      accessor: 'ubac_role_functionality_mapping_id',
    },
    {
      header: 'Functionality',
      render: (row) => {
        const functionality = allFunctionalities.find(f => f.ubac_functionality_id === row.ubac_functionality_id);
        return functionality ? (
          <span className="capitalize">{functionality.functionality_name.replace(/_/g, ' ')}</span>
        ) : `ID: ${row.ubac_functionality_id}`;
      }
    },
    {
      header: 'Created On',
      accessor: 'created_on',
      render: (row) => formatDate(row.created_on)
    }
  ];
  
  // Fetch data on component mount
  useEffect(() => {
    if (isNaN(roleId)) {
      toast.error('Invalid role ID');
      router.push('/dashboard/access-control/roles');
      return;
    }
    
    if (isAuthenticated()) {
      fetchData();
    }
  }, [roleId, router]);
  
  // Fetch role mappings and functionalities
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get role mappings
      const mappings = await ubacService.listviewRoleFunctionalityMapping(roleId);
      
      // Check for authentication error
      if (mappings && mappings.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      setRoleMappings(mappings);
      
      // Get all functionalities for reference
      const functionalities = await ubacService.getFunctionalities();
      
      // Check for authentication error
      if (functionalities && functionalities.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      setAllFunctionalities(functionalities);
      
      // Get roles to find current role name
      const roles = await ubacService.getRoles();
      
      // Check for authentication error
      if (roles && roles.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      const role = roles.find(r => r.ubac_role_id === roleId);
      if (role) {
        setRoleDetails(role);
      } else {
        toast.error('Role not found');
        router.push('/dashboard/access-control/roles');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Open modal for adding new mapping
  const handleAddNew = () => {
    setIsModalOpen(true);
  };
  
  // Delete mapping
  const handleDelete = async (item) => {
    // Find functionality name for confirmation message
    const functionality = allFunctionalities.find(f => f.ubac_functionality_id === item.ubac_functionality_id);
    const functionalityName = functionality ? functionality.functionality_name.replace(/_/g, ' ') : `ID: ${item.ubac_functionality_id}`;
    
    if (window.confirm(`Are you sure you want to remove "${functionalityName}" from this role?`)) {
      setLoading(true);
      try {
        const response = await ubacService.deleteRoleFunctionalityMapping(item.ubac_role_functionality_mapping_id);
        
        // Check for authentication error
        if (response && response.detail === 'Not authenticated') {
          toast.error('Authentication required. Please log in.');
          router.push('/auth/login');
          return;
        }
        
        toast.success('Mapping deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Failed to delete mapping:', error);
        
        // Handle authentication error
        if (error.message && error.message.includes('Not authenticated')) {
          toast.error('Authentication required. Please log in.');
          router.push('/auth/login');
        } else {
          toast.error('Failed to delete mapping');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle functionality selection
  const handleFunctionalitySelect = async (functionality) => {
    setLoading(true);
    try {
      const response = await ubacService.createRoleFunctionalityMapping({
        role_id: roleId,
        functionality_id: functionality.ubac_functionality_id
      });
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success(`Added "${functionality.functionality_name.replace(/_/g, ' ')}" to role`);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create mapping:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to add functionality to role');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Check if functionality is already mapped to this role
  const isFunctionalityMapped = (functionalityId) => {
    return roleMappings.some(mapping => mapping.ubac_functionality_id === functionalityId);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/dashboard/access-control/roles')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Roles
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          Role: <span className="capitalize ml-2 text-blue-600">{roleDetails?.role_name || 'Loading...'}</span>
        </h1>
        <p className="text-gray-500 mt-1">Manage functionalities assigned to this role</p>
      </div>
      
      <div className="mb-8">
        <DataTable
          title="Assigned Functionalities"
          data={roleMappings}
          columns={columns}
          onAdd={handleAddNew}
          onDelete={handleDelete}
          addButtonLabel="Add Functionality"
          emptyMessage={loading ? "Loading mappings..." : "No functionalities assigned to this role"}
        />
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Functionality to Role"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a functionality to add to the <span className="font-semibold capitalize">{roleDetails?.role_name}</span> role:
          </p>
          
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Functionality
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allFunctionalities.map((functionality) => {
                  const isAlreadyMapped = isFunctionalityMapped(functionality.ubac_functionality_id);
                  return (
                    <tr key={functionality.ubac_functionality_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {functionality.functionality_name.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {isAlreadyMapped ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheck className="mr-1" /> Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FiX className="mr-1" /> Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => handleFunctionalitySelect(functionality)}
                          disabled={isAlreadyMapped || loading}
                          className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                            isAlreadyMapped 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {isAlreadyMapped ? 'Already Assigned' : 'Add'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 