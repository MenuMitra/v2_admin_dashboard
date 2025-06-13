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
          owner_id: ownerId
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.st === 1) {
        setOutlets(response.data.outlet_list);
      } else {
        throw new Error(response.data.msg || 'Failed to fetch outlets');
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
        await fetchOwners(); // Refresh owners list after creation
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
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="number"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={adminData?.user_id}
                />
              </div>

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

        {/* Owner Selection Section */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Owner</h3>
            <div className="bg-white p-6 rounded-lg shadow max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {owners.map((owner) => (
                  <div 
                    key={owner.user_id}
                    onClick={() => handleOwnerSelect(owner)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      selectedOwner?.user_id === owner.user_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{owner.name}</h4>
                    <p className="text-sm text-gray-600">{owner.email}</p>
                    <p className="text-sm text-gray-600">{owner.mobile}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outlets Selection Section */}
          {selectedOwner && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Outlets</h3>
              <div className="grid grid-cols-1 gap-4 bg-white p-6 rounded-lg shadow max-h-[400px] overflow-y-auto">
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
                    <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{outlet.address}</p>
                    {selectedOutlets.includes(outlet.outlet_id) && (
                      <div className="mt-2 text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSuperOwner;