'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiArrowLeft } from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function ViewOutletPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    fetchOutletDetails();
  }, [router, params.id]);

  const fetchOutletDetails = async () => {
    try {
      const data = await outletService.viewOutlet(params.id);
      setOutlet(data);
    } catch (error) {
      console.error('Failed to fetch outlet details:', error);
      toast.error('Failed to load outlet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading outlet details...</div>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Outlet not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outlet Details</h1>
          <p className="mt-1 text-sm text-gray-600">View detailed information about the outlet</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/outlets')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to List
          </button>
          <button
            onClick={() => router.push(`/outlets/${params.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit className="mr-2" />
            Edit Outlet
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FiShoppingBag className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Outlet Name</span>
                </div>
                <span className="text-base font-medium text-gray-900">{outlet.name}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FiMail className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Email Address</span>
                </div>
                <span className="text-base font-medium text-gray-900">{outlet.email}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FiPhone className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Mobile Number</span>
                </div>
                <span className="text-base font-medium text-gray-900">{outlet.mobile}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <FiMapPin className="text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Address</span>
                </div>
                <span className="text-base font-medium text-gray-900">{outlet.address}</span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Business Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Outlet Type</span>
                <p className="mt-1 text-base font-medium text-gray-900 capitalize">{outlet.outlet_type}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Food Type</span>
                <p className="mt-1 text-base font-medium text-gray-900 capitalize">{outlet.veg_nonveg}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Service Charges</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.service_charges}%</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">GST</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.gst}%</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Opening Hours</span>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {outlet.opening_time} - {outlet.closing_time}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    outlet.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {outlet.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">FSSAI Number</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.fssainumber || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">GST Number</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.gstnumber || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">UPI ID</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.upi_id || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">WhatsApp</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.whatsapp || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Created On</span>
                <p className="mt-1 text-base font-medium text-gray-900">{formatDate(outlet.created_on)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-500">Created By</span>
                <p className="mt-1 text-base font-medium text-gray-900">{outlet.created_by}</p>
              </div>

              {outlet.updated_on && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Updated On</span>
                    <p className="mt-1 text-base font-medium text-gray-900">{formatDate(outlet.updated_on)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Updated By</span>
                    <p className="mt-1 text-base font-medium text-gray-900">{outlet.updated_by}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 