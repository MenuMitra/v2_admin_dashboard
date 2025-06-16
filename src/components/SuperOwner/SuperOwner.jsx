import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faUser, 
  faPhone, 
  faCalendar, 
  faBuilding,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';

function SuperOwner() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [superOwners, setSuperOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuperOwners();
  }, []);

  const fetchSuperOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/listview_super_owner',
        {
          app_source: 'admin_dashboard'
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.super_owners) {
        setSuperOwners(response.data.super_owners);
      }
    } catch (error) {
      console.error('Error fetching super owners:', error);
      setError('Failed to fetch super owners list');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (superOwnerId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_super_owner',
        {
          user_id: 1, // You might want to get this from adminData
          super_owner_id: superOwnerId,
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
        navigate(`/super-owner-details/${superOwnerId}`, { 
          state: { 
            superOwnerData: response.data.super_owner,
            assignedOutlets: response.data.assigned_outlets,
            assignedFunctionalities: response.data.assigned_functionalities,
            totalOutlets: response.data.total_outlets,
            totalFunctionalities: response.data.total_functionalities
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching super owner details:', error);
      setError('Failed to fetch super owner details');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Super Owners', path: '/super-owners' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-theme(spacing.16))]">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Super Owners</h2>
        <button 
          onClick={() => navigate('/create-super-owner')}
          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600"
        >
          <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
          <span>Create</span>
        </button>
      </div>

      {superOwners.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100%-theme(spacing.16))]">
          <div className="text-center">
            <FontAwesomeIcon icon={faUserShield} className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Super Owners Found</h3>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {superOwners.map((owner) => (
            <div 
              key={owner.super_owner_id} 
              onClick={() => handleViewDetails(owner.super_owner_id)}
              className="rounded-2xl border border-gray-200 bg-white p-5 cursor-pointer hover:border-brand-500 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50">
                    <FontAwesomeIcon icon={faUserShield} className="h-6 w-6 text-brand-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{owner.name}</h4>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  owner.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {owner.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                  <span className="text-sm">{owner.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                  <span className="text-sm">{owner.created_on}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4" />
                  <span className="text-sm">{owner.outlet_ids.length} Outlets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperOwner;