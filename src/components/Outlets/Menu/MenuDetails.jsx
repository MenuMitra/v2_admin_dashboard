import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faCircleCheck,
  faCircleXmark,
  faCalendarPlus,
  faCalendarCheck,
  faUser,
  faChevronLeft,
  faFire,
  faPercent,
  faList,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../../common/Modal';

function MenuDetails() {
  const { outletId, menuId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (!adminData?.user_id || !menuId || !outletId) return;
      
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const response = await axios.post(
          'https://men4u.xyz/v2/common/menu_view',
          {
            menu_id: Number(menuId),
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: 'admin_dashboard',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        setMenu(response.data.detail);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch menu details');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [adminData?.user_id, menuId, outletId]);

  const handleDeleteMenu = async () => {
    try {
      const token = getToken();
      await axios.delete('https://men4u.xyz/v2/common/menu_delete', {
        data: {
          menu_id: Number(menuId),
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
          app_source: 'admin_dashboard'
        },
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu');
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;
  if (!menu) return <div>No menu data found.</div>;

  return (
    <div className="p-4">
      {/* Header with Back button and actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Menu Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-menu/${outletId}/${menuId}`)}
            className="px-4 py-2 text-sm font-medium text-white rounded-full bg-brand-500 hover:bg-brand-600"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-full bg-error-500 hover:bg-error-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Menu Content */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Menu Image and Basic Info */}
        <div className="p-6">
          {menu.images?.[0] && (
            <img
              src={menu.images[0].image}
              alt={menu.name}
              style={{
                width: '300px',
                height: '300px',
                objectFit: 'contain',
                marginBottom: '24px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            />
          )}
          
          {/* Menu Title and Tags */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-brand-500" />
              {menu.name}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2 py-1 text-sm font-medium ${
                menu.food_type === 'veg' ? 'text-green-700' : 'text-red-700'
              }`}>
                {menu.food_type?.toUpperCase()}
              </span>
              <span className="text-gray-500">{menu.category_name}</span>
              {menu.spicy_index && (
                <span className="text-error-500">Spicy Level {menu.spicy_index}</span>
              )}
              {menu.offer > 0 && (
                <span className="text-success-500">{menu.offer}% OFF</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-700">{menu.description}</p>
        </div>

        {/* Ingredients */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ingredients</h3>
          <p className="text-gray-700">{menu.ingredients}</p>
        </div>

        {/* Portions */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Portions</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            {menu.portions.map((portion, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div className="font-medium text-gray-800">{portion.portion_name}</div>
                <div>
                  <span className="text-brand-500 font-medium mr-4">₹{portion.price}</span>
                  <span className="text-sm text-gray-500">
                    {portion.unit_value} {portion.unit_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status and Meta Info */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon={menu.is_active ? faCircleCheck : faCircleXmark} 
                className={menu.is_active ? 'text-success-500' : 'text-error-500'} 
              />
              <span>{menu.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="text-gray-500">
              Created by {menu.created_by} on {menu.created_on}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="error"
        title="Confirm Deletion"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMenu}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-error-500 hover:bg-error-600"
            >
              Delete Menu
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {menu.name}? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default MenuDetails;