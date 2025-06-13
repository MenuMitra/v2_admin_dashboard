import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';

function CreateSuperOwner() {
  const { getToken, isAuthenticated } = useAuth();
  const { adminData } = useAdmin();
  
  const [formData, setFormData] = useState({
    user_id: adminData?.user_id || '',
    name: '',
    mobile: '',
    email: '',
    aadhar_number: '',
    outlet_ids: '',
    app_source: 'admin_dashboard'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'outlet_ids' ? value.split(',').map(id => parseInt(id.trim())) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError('You are not authenticated. Please login again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      const response = await fetch('https://men4u.xyz/v2/admin/create_super_owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      setSuccess('Super owner created successfully!');
      setFormData({
        user_id: adminData?.user_id || '',
        name: '',
        mobile: '',
        email: '',
        aadhar_number: '',
        outlet_ids: '',
        app_source: 'admin_dashboard'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Super Owner</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outlet IDs (comma-separated)</label>
          <input
            type="text"
            name="outlet_ids"
            value={formData.outlet_ids}
            onChange={handleChange}
            placeholder="1, 2, 3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isAuthenticated()}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || !isAuthenticated() 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating...' : 'Create Super Owner'}
        </button>
      </form>
    </div>
  );
}

export default CreateSuperOwner;