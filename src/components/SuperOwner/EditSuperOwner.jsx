import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
    app_source: 'admin_dashboard'
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
        const { name, mobile, email, aadhar_number } = response.data.super_owner;
        setFormData(prev => ({
          ...prev,
          name,
          mobile,
          email,
          aadhar_number,
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Super Owner</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Outlets Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Outlets</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {outlets.map((outlet) => (
                  <div
                    key={outlet.outlet_id}
                    onClick={() => handleOutletSelect(outlet.outlet_id)}
                    className={`rounded-2xl border bg-white p-5 cursor-pointer transition-all ${
                      selectedOutlets.includes(outlet.outlet_id)
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{outlet.outlet_name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{outlet.address}</p>
                        </div>
                      </div>
                      {selectedOutlets.includes(outlet.outlet_id) && (
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isAuthenticated()}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg shadow-theme-xs ${
                loading || !isAuthenticated()
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Update Super Owner</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditSuperOwner;