'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  FiShoppingBag, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiEdit,
  FiArrowLeft, 
  FiClock,
  FiPercent,
  FiFileText,
  FiCreditCard,
  FiUser,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiCoffee,
  FiMessageCircle
} from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Info Item component with label below value
const InfoItem = ({ icon: Icon, label, value, iconClass = 'text-indigo-600' }) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center mb-1">
      <Icon className={`mr-2 ${iconClass}`} size={18} />
      <span className="text-base font-semibold text-gray-900">{value || 'N/A'}</span>
    </div>
    <div className="text-sm font-medium text-gray-500 pl-6">{label}</div>
  </div>
);

// Status badge component
const StatusBadge = ({ status, type }) => {
  const isActive = status === 1;
  const label = type === 'outlet_status' ? 'Active' : 'Open';
  const inactiveLabel = type === 'outlet_status' ? 'Inactive' : 'Closed';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          {label}
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
          {inactiveLabel}
        </>
      )}
    </span>
  );
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
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const data = await outletService.viewOutlet(params.id, userId);
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-200 rounded-md mr-6"></div>
              <div className="flex-1">
                <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-60 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <FiAlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Outlet Not Found</h2>
          <p className="text-gray-600 mb-6">The outlet you are looking for could not be found or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/outlets')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Outlets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Outlet Details</h1>
          <p className="text-gray-600">View detailed information about {outlet.name}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => router.push('/outlets')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to List
          </button>
          <button
            onClick={() => router.push(`/outlets/${params.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <FiEdit className="mr-2" />
            Edit Outlet
          </button>
        </div>
      </div>

      {/* Outlet Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="h-16 w-16 rounded-md bg-indigo-100 flex items-center justify-center mr-6 mb-4 md:mb-0">
            <FiShoppingBag className="text-indigo-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{outlet.name}</h2>
            {outlet.address && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <FiMapPin className="mr-2 text-gray-400" />
                {outlet.address}
              </div>
            )}
            {outlet.mobile && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <FiPhone className="mr-2 text-gray-400" />
                {outlet.mobile}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <StatusBadge status={outlet.outlet_status} type="outlet_status" />
            <StatusBadge status={outlet.is_open} type="is_open" />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem 
            icon={FiShoppingBag} 
            label="Outlet Name" 
            value={outlet.name} 
          />
          <InfoItem 
            icon={FiMail} 
            label="Email Address" 
            value={outlet.email} 
          />
          <InfoItem 
            icon={FiPhone} 
            label="Mobile Number" 
            value={outlet.mobile} 
          />
          <InfoItem 
            icon={FiMapPin} 
            label="Address" 
            value={outlet.address} 
          />
          <InfoItem 
            icon={FiMessageCircle} 
            label="WhatsApp" 
            value={outlet.whatsapp} 
          />
          <InfoItem 
            icon={FiCoffee} 
            label="Outlet Type" 
            value={outlet.outlet_type} 
          />
        </div>
      </div>

      {/* Business Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem 
            icon={FiLayers} 
            label="Food Type" 
            value={outlet.veg_nonveg?.toUpperCase()} 
          />
          <InfoItem 
            icon={FiPercent} 
            label="Service Charges" 
            value={`${outlet.service_charges || 0}%`} 
          />
          <InfoItem 
            icon={FiDollarSign} 
            label="GST" 
            value={`${outlet.gst || 0}%`} 
          />
          <InfoItem 
            icon={FiClock} 
            label="Opening Hours" 
            value={outlet.opening_time ? outlet.opening_time.split(' ')[1] + ' ' + (outlet.opening_time.split(' ')[2] || '') : 'Not specified'} 
          />
          <InfoItem 
            icon={FiClock} 
            label="Closing Hours" 
            value={outlet.closing_time ? outlet.closing_time.split(' ')[1] + ' ' + (outlet.closing_time.split(' ')[2] || '') : 'Not specified'} 
          />
          <InfoItem 
            icon={FiCheckCircle} 
            label="Outlet Status" 
            value={outlet.outlet_status === 1 ? 'Active' : 'Inactive'} 
            iconClass={outlet.outlet_status === 1 ? 'text-green-600' : 'text-red-600'}
          />
          <InfoItem 
            icon={outlet.is_open === 1 ? FiCheckCircle : FiXCircle} 
            label="Currently" 
            value={outlet.is_open === 1 ? 'Open' : 'Closed'} 
            iconClass={outlet.is_open === 1 ? 'text-green-600' : 'text-red-600'}
          />
          <InfoItem 
            icon={FiFileText} 
            label="FSSAI Number" 
            value={outlet.fssainumber} 
          />
          <InfoItem 
            icon={FiTag} 
            label="GST Number" 
            value={outlet.gstnumber} 
          />
          <InfoItem 
            icon={FiCreditCard} 
            label="UPI ID" 
            value={outlet.upi_id} 
          />
        </div>
      </div>

      {/* Audit Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoItem 
            icon={FiCalendar} 
            label="Created On" 
            value={formatDate(outlet.created_on)} 
          />
          <InfoItem 
            icon={FiUser} 
            label="Created By" 
            value={outlet.created_by} 
          />
          {outlet.updated_on && (
            <>
              <InfoItem 
                icon={FiCalendar} 
                label="Updated On" 
                value={formatDate(outlet.updated_on)} 
              />
              <InfoItem 
                icon={FiUser} 
                label="Updated By" 
                value={outlet.updated_by} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 