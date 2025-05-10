'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import { isAuthenticated } from '@/utils/auth';

export default function EditOutletPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    outlet_type: 'outlet',
    veg_nonveg: 'veg',
    service_charges: '',
    gst: '',
    upi_id: '',
    fssainumber: '',
    gstnumber: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    website: '',
    opening_time: '',
    closing_time: '',
  });

  // Check authentication and fetch outlet details on component mount
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
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch outlet details:', error);
      toast.error('Failed to load outlet details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = 1; // TODO: Get from auth context
      const data = {
        update_user_id: userId,
        outlet_id: params.id,
        ...formData
      };
      await outletService.updateOutlet(data);
      toast.success('Outlet updated successfully');
      router.push(`/outlets/${params.id}`);
    } catch (error) {
      console.error('Failed to update outlet:', error);
      toast.error('Failed to update outlet');
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Outlet</h1>
          <p className="mt-1 text-sm text-gray-600">Update outlet information</p>
        </div>
        <button
          onClick={() => router.push(`/outlets/${params.id}`)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiArrowLeft className="mr-2" />
          Back to Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Outlet Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Enter outlet name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="outlet_type" className="block text-sm font-medium text-gray-700">
                Outlet Type
              </label>
              <select
                id="outlet_type"
                name="outlet_type"
                value={formData.outlet_type}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="outlet">Outlet</option>
                <option value="mess">Mess</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>

            <div>
              <label htmlFor="veg_nonveg" className="block text-sm font-medium text-gray-700">
                Food Type
              </label>
              <select
                id="veg_nonveg"
                name="veg_nonveg"
                value={formData.veg_nonveg}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label htmlFor="service_charges" className="block text-sm font-medium text-gray-700">
                Service Charges (%)
              </label>
              <input
                type="number"
                id="service_charges"
                name="service_charges"
                value={formData.service_charges}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="gst" className="block text-sm font-medium text-gray-700">
                GST (%)
              </label>
              <input
                type="number"
                id="gst"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Enter complete address"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700">
                Opening Time
              </label>
              <input
                type="time"
                id="opening_time"
                name="opening_time"
                value={formData.opening_time}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700">
                Closing Time
              </label>
              <input
                type="time"
                id="closing_time"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/outlets/${params.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
            >
              {loading ? 'Saving...' : 'Update Outlet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 