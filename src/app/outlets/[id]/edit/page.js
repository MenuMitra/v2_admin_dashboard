'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiArrowLeft, FiInfo, FiPercent, FiHash, FiClock, FiDollarSign, FiGlobe, FiUser } from 'react-icons/fi';
import outletService from '@/api/services/outletService';
import commonService from '@/api/services/commonService';
import { isAuthenticated } from '@/utils/auth';

export default function EditOutletPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    outlet_type: '',
    veg_nonveg: '',
    service_charges: '',
    gst: '',
    upi_id: '',
    fssainumber: '',
    gstnumber: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    website: '',
    google_business_link: '',
    google_review: '',
    opening_time: '',
    closing_time: '',
    is_open: 1,
    outlet_status: 1
  });

  // Check authentication and fetch outlet details on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    
    // Fetch dropdown options and outlet details
    Promise.all([
      fetchOutletTypes(),
      fetchFoodTypes(),
      fetchOutletDetails()
    ]);
  }, [router, params.id]);

  // Fetch outlet types from API
  const fetchOutletTypes = async () => {
    try {
      const response = await commonService.getOutletTypes();
      if (response?.outlet_type_list) {
        setOutletTypes(response.outlet_type_list);
      }
    } catch (error) {
      console.error('Failed to fetch outlet types:', error);
      toast.error('Failed to load outlet types');
    }
  };

  // Fetch food types from API
  const fetchFoodTypes = async () => {
    try {
      const response = await commonService.getFoodTypes();
      if (response?.food_type_list) {
        setFoodTypes(response.food_type_list);
      }
    } catch (error) {
      console.error('Failed to fetch food types:', error);
      toast.error('Failed to load food types');
    }
  };

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
      const updateData = {
        ...formData,
        outlet_id: params.id
      };
      
      await outletService.updateOutlet(updateData);
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
      <div className="p-6 bg-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700">Loading outlet details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Outlet</h1>
          <p className="mt-1 text-sm text-gray-600">Update outlet information</p>
        </div>
        <button
          onClick={() => router.push(`/outlets/${params.id}`)}
          className="inline-flex items-center px-4 py-2 border border-gray-800 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
          <h3 className="text-lg font-medium">Outlet Information</h3>
          <p className="mt-1 text-sm text-gray-300">
            Fill in the details below to update the outlet. All fields marked with * are required.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiInfo className="mr-2 text-gray-700" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Outlet Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      placeholder="Enter outlet name"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="outlet_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Outlet Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="outlet_type"
                      name="outlet_type"
                      value={formData.outlet_type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      required
                    >
                      <option value="">Select Outlet Type</option>
                      {Object.entries(outletTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="veg_nonveg" className="block text-sm font-medium text-gray-700 mb-1">
                    Food Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <select
                      id="veg_nonveg"
                      name="veg_nonveg"
                      value={formData.veg_nonveg}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      required
                    >
                      <option value="">Select Food Type</option>
                      {Object.entries(foodTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="upi_id"
                      name="upi_id"
                      value={formData.upi_id}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      placeholder="Enter UPI ID"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiHash className="mr-2 text-gray-700" />
                Business Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label htmlFor="service_charges" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Charges (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="service_charges"
                      name="service_charges"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.service_charges}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
                    GST (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="gst"
                      name="gst"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.gst}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label htmlFor="opening_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 24-hour (HH:MM)</p>
                </div>

                <div className="col-span-1">
                  <label htmlFor="closing_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 24-hour (HH:MM)</p>
                </div>

                <div className="col-span-1">
                  <label htmlFor="fssainumber" className="block text-sm font-medium text-gray-700 mb-1">
                    FSSAI Number
                  </label>
                  <input
                    type="text"
                    id="fssainumber"
                    name="fssainumber"
                    value={formData.fssainumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="Enter FSSAI number"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="gstnumber" className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gstnumber"
                    name="gstnumber"
                    value={formData.gstnumber}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="Enter GST number"
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Web Presence Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center border-b pb-2">
                <FiGlobe className="mr-2 text-gray-700" />
                Social Media & Web Presence
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://wa.me/yourphonenumber"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="google_business_link" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Business Link
                  </label>
                  <input
                    type="url"
                    id="google_business_link"
                    name="google_business_link"
                    value={formData.google_business_link}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://business.google.com/yourpage"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="google_review" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Review Link
                  </label>
                  <input
                    type="url"
                    id="google_review"
                    name="google_review"
                    value={formData.google_review}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white hover:bg-gray-50 focus:bg-white focus:ring-gray-700 focus:border-gray-700 transition-colors duration-200"
                    placeholder="https://g.page/r/yourreviewpage"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/outlets/${params.id}`)}
              className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400 transition-colors duration-200"
            >
              {loading ? 'Saving...' : 'Update Outlet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 