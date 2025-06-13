import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import axios from 'axios';

function CreateSuperOwner() {
  const { getToken, isAuthenticated } = useAuth();
  const { adminData } = useAdmin();
  
  const [formData, setFormData] = useState({
    user_id: adminData?.user_id || '',
    name: '',
    mobile: '',
    email: '',
    aadhar_number: '',
    outlet_ids: [],
    app_source: 'admin_dashboard'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    if (selectedOwner) {
      fetchOutlets(selectedOwner.user_id);
    } else {
      setOutlets([]);
    }
  }, [selectedOwner]);

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData?.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setOwners(response.data);
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to fetch owners list. Please try again.');
      }
      setOwners([]); // Reset owners list on error
    }
  };

  const fetchOutlets = async (ownerId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/common/get_outlet_list',
        {
          owner_id: ownerId,
          app_source: 'admin_dashboard'
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail) {
        setOutlets(response.data.outlets);
      } else {
        throw new Error('Failed to fetch outlets');
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
      setError('Failed to fetch outlets');
    }
  };

  const handleOwnerSelect = (owner) => {
    setSelectedOwner(owner);
    setSelectedOutlets([]);
    setFormData(prev => ({
      ...prev,
      outlet_ids: []
    }));
  };

  const handleOutletSelect = (outletId) => {
    setSelectedOutlets(prev => {
      const newSelection = prev.includes(outletId)
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId];
      
      setFormData(prev => ({
        ...prev,
        outlet_ids: newSelection
      }));
      
      return newSelection;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/create_super_owner',
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setSuccess('Super owner created successfully!');
        await fetchOwners();
        setFormData({
          user_id: adminData?.user_id || '',
          name: '',
          mobile: '',
          email: '',
          aadhar_number: '',
          outlet_ids: [],
          app_source: 'admin_dashboard'
        });
        setSelectedOutlets([]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Super Owner</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <div className="space-y-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
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
            </div>

            {/* Owner Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Owner</label>
              <select
                value={selectedOwner?.user_id || ''}
                onChange={(e) => {
                  const owner = owners.find(o => o.user_id === Number(e.target.value));
                  handleOwnerSelect(owner || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.user_id} value={owner.user_id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outlets Selection */}
            {selectedOwner && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Outlets</h3>
                <div className="grid grid-cols-2 gap-4 bg-white border border-gray-200 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                  {outlets.map((outlet) => (
                    <div 
                      key={outlet.outlet_id}
                      onClick={() => handleOutletSelect(outlet.outlet_id)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedOutlets.includes(outlet.outlet_id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                          <p className="text-sm text-gray-600">{outlet.address}</p>
                        </div>
                        {selectedOutlets.includes(outlet.outlet_id) && (
                          <div className="text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          Code: {outlet.outlet_code}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          outlet.is_open 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {outlet.is_open ? 'Open' : 'Closed'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          outlet.outlet_status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {outlet.outlet_status ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          outlet.account_type === 'live' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {outlet.account_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isAuthenticated() || selectedOutlets.length === 0}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading || !isAuthenticated() || selectedOutlets.length === 0
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Super Owner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSuperOwner;