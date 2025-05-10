'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiEye, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import DataTable from '@/components/ui/DataTable';
import outletService from '@/api/services/outletService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function OutletsPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    fetchOutlets();
  }, [router]);

  // Table columns configuration
  const columns = [
    {
      header: 'Sr No',
      render: () => null, // This will be populated directly in the UI
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FiShoppingBag className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <FiMail className="mr-2" /> {row.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="mr-2" /> {row.mobile}
          </div>
        </div>
      ),
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <FiMapPin className="mr-2" />
          <span>{row.address}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/outlets/${row.outlet_id}`)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.push(`/outlets/${row.outlet_id}/edit`)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Edit Outlet"
          >
            <FiEdit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
            title="Delete Outlet"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  // Fetch outlets from API
  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const userId = 1; // TODO: Get from auth context
      const data = await outletService.listOutlets(userId);
      setOutlets(data);
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      toast.error('Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete outlet
  const handleDelete = async (outlet) => {
    if (window.confirm('Are you sure you want to delete this outlet?')) {
      setLoading(true);
      try {
        const userId = 1; // TODO: Get from auth context
        await outletService.deleteOutlet(outlet.outlet_id, userId);
        toast.success('Outlet deleted successfully');
        fetchOutlets(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete outlet:', error);
        toast.error('Failed to delete outlet');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outlet Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage food outlets and their details</p>
        </div>
        <button
          onClick={() => router.push('/outlets/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="mr-2" />
          Add New Outlet
        </button>
      </div>

      <div className="mb-8">
        <DataTable
          title="Outlets"
          data={outlets}
          columns={columns}
          emptyMessage={loading ? "Loading outlets..." : "No outlets found"}
        />
      </div>
    </div>
  );
} 