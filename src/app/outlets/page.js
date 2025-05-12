'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiEye, FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch, FiToggleRight, FiToggleLeft, FiChevronDown, FiChevronUp, FiX, FiAlertTriangle } from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import { isAuthenticated } from '@/utils/auth';
import Modal from '@/components/ui/Modal';

// Format phone number for display
const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export default function OutletsPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, outlet: null });

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    fetchOutlets();
  }, [router]);

  // Fetch outlets from API
  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const userId = 2; // TODO: Get from auth context
      const response = await outletService.listOutlets(userId);
      
      // Transform API data to match the component's expected format
      const formattedOutlets = Array.isArray(response) 
        ? response.map(outlet => ({
            outlet_id: outlet.outlet_id,
            name: outlet.outlet_name || outlet.name,
            code: outlet.outlet_code,
            mobile: outlet.mobile,
            is_active: outlet.outlet_status === 1 || outlet.is_active,
            is_open: outlet.is_open === 1
          }))
        : [];
      
      setOutlets(formattedOutlets);
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      toast.error('Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (outlet, e) => {
    e?.stopPropagation();
    setDeleteModal({ isOpen: true, outlet });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, outlet: null });
  };

  // Handle delete outlet
  const handleDelete = async () => {
    setLoading(true);
    try {
      const userId = 1; // TODO: Get from auth context
      await outletService.deleteOutlet(deleteModal.outlet.outlet_id, userId);
      toast.success('Outlet deleted successfully');
      fetchOutlets(); // Refresh the list
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete outlet:', error);
      toast.error('Failed to delete outlet');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to outlet details
  const viewOutlet = (outletId) => {
    router.push(`/outlets/${outletId}`);
  };
  
  // Navigate to edit outlet
  const editOutlet = (outletId) => {
    router.push(`/outlets/${outletId}/edit`);
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Filter and sort outlets
  const filteredOutlets = outlets
    .filter(outlet => {
      const matchesSearch = outlet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            outlet.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            outlet.mobile?.includes(searchTerm);
      
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active') return matchesSearch && outlet.is_active;
      if (statusFilter === 'inactive') return matchesSearch && !outlet.is_active;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') {
        return direction * (a.name?.localeCompare(b.name) || 0);
      }
      if (sortField === 'code') {
        return direction * (a.code?.localeCompare(b.code) || 0);
      }
      return 0;
    });

  // Render delete confirmation modal content
  const renderDeleteConfirmation = () => {
    if (!deleteModal.outlet) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete outlet "{deleteModal.outlet.name}"? This action cannot be undone. 
            All data associated with this outlet will be permanently removed.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:bg-red-300"
          >
            {loading ? 'Deleting...' : 'Delete Outlet'}
          </button>
        </div>
      </div>
    );
  };

  // Table header component
  const TableHeader = ({ label, field, width }) => {
    const isActive = sortField === field;
    return (
      <th 
        className={`px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${width || ''}`}
        onClick={() => field && handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {field && (
            <span>
              {isActive ? (
                sortDirection === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
              ) : (
                <FiChevronDown className="opacity-20" size={16} />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outlet Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all restaurant outlets and their details</p>
        </div>
        <button
          onClick={() => router.push('/outlets/create')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
        >
          <FiPlus className="mr-2" />
          Add New Outlet
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative sm:w-64 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search outlets..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <select
          className="block w-full sm:w-40 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 appearance-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Outlets list */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <div className="px-6 py-4 flex items-center">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded mr-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOutlets.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <TableHeader label="Outlet" field="name" width="w-2/5" />
                <TableHeader label="Code" field="code" width="w-1/6" />
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider w-1/6">
                  Mobile
                </th>
                <TableHeader label="Status" field="" width="w-1/8" />
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase tracking-wider w-1/8">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOutlets.map((outlet) => (
                <tr 
                  key={outlet.outlet_id} 
                  className={`transition-colors duration-150 cursor-pointer ${
                    (!outlet.is_active || !outlet.is_open) ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => viewOutlet(outlet.outlet_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{outlet.name}</div>
                        <div className={`text-xs flex items-center mt-1 ${outlet.is_open ? 'text-green-600' : 'text-gray-400'}`}>
                          {outlet.is_open ? <FiToggleRight className="mr-1" /> : <FiToggleLeft className="mr-1" />}
                          {outlet.is_open ? 'Open' : 'Closed'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{outlet.code || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {outlet.mobile || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      outlet.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {outlet.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => viewOutlet(outlet.outlet_id)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        title="View Details"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => editOutlet(outlet.outlet_id)}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit Outlet"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(outlet, e)}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Outlet"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <FiShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outlets found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No outlets match your search: "${searchTerm}"` 
                : statusFilter !== 'all'
                  ? `No ${statusFilter} outlets found`
                  : "You don't have any outlets yet."
              }
            </p>
            <button
              onClick={() => router.push('/outlets/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <FiPlus className="mr-2" />
              Add New Outlet
            </button>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
} 