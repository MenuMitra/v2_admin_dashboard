import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

function EditSuperOwner() {
  const { getToken, isAuthenticated } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { superOwnerId } = useParams();
  
  const [formData, setFormData] = useState({
    user_id: adminData?.user_id || '',
    super_owner_id: superOwnerId,
    name: '',
    mobile: '',
    email: '',
    aadhar_number: '',
    app_source: 'admin_dashboard',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);

  const fetchSuperOwnerDetails = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_super_owner',
        {
          user_id: adminData?.user_id,
          super_owner_id: parseInt(superOwnerId),
          app_source: 'admin_dashboard'
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.super_owner) {
        const { name, mobile, email, aadhar_number, is_active } = response.data.super_owner;
        setFormData(prev => ({
          ...prev,
          name,
          mobile,
          email,
          aadhar_number,
          is_active: Boolean(is_active),
          super_owner_id: parseInt(superOwnerId)
        }));
      }
    } catch (error) {
      console.error('Error fetching super owner details:', error);
      setError('Failed to fetch super owner details');
    }
  };

  useEffect(() => {
    if (superOwnerId) {
      fetchSuperOwnerDetails();
      fetchOutlets();
    }
  }, [superOwnerId]);

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/get_outlets_for_super_owner',
        {
          app_source: 'admin_dashboard',
          super_owner_id: parseInt(superOwnerId)
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.outlets) {
        setOutlets(response.data.data.outlets);
        setSelectedOutlets(
          response.data.data.outlets
            .filter(outlet => outlet.is_currently_assigned === 1)
            .map(outlet => outlet.outlet_id)
        );
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
      setError('Failed to fetch outlets');
    }
  };

  const handleOutletSelect = (outletId) => {
    setSelectedOutlets(prev => {
      const newSelection = prev.includes(outletId)
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId];
      return newSelection;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError('You are not authenticated. Please login again.');
      return;
    }

    if (selectedOutlets.length === 0) {
      setError('Please select at least one outlet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      const response = await axios.put(
        'https://men4u.xyz/v2/admin/update_super_owner',
        {
          ...formData,
          super_owner_id: parseInt(superOwnerId),
          outlet_ids: selectedOutlets
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setSuccess('Super owner updated successfully!');
        navigate('/super-owners');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Super Owners', path: '/super-owners' },
    { label: 'Edit Super Owner' }
  ];

  return (
    <>
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* DataTable-style header */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="relative flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="absolute left-6">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Edit Super Owner
              </h2>
            </div>

            {/* Right Side - Save Button */}
            <div className="absolute right-6">
              <button
                type="submit"
                form="superOwnerForm"
                disabled={loading || !isAuthenticated()}
                className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition rounded-full ${
                  loading || !isAuthenticated()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-success-500 hover:bg-success-600'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 pb-2">
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg">
              <form id="superOwnerForm" onSubmit={handleSubmit}>
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={formData.aadhar_number}
                      onChange={handleChange}
                      pattern="[0-9]{12}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                    <select
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Outlets Grid */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-4">Select Outlets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {outlets.map((outlet) => (
                      <div
                        key={outlet.outlet_id}
                        onClick={() => handleOutletSelect(outlet.outlet_id)}
                        className={`rounded-2xl border bg-white p-4 cursor-pointer transition-all ${
                          selectedOutlets.includes(outlet.outlet_id)
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">{outlet.outlet_name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{outlet.address}</p>
                            </div>
                          </div>
                          {selectedOutlets.includes(outlet.outlet_id) && (
                            <div className="text-blue-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditSuperOwner;