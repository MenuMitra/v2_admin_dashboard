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
  faList
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
      await axios.delete('https://men4u.xyz/v2/common/delete_menu', {
        data: {
          menu_id: Number(menuId),
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
        },
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      navigate(-1);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete menu');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;
  if (!menu) return <div>No menu data found.</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      {/* Header Section */}
      <div className="overflow-hidden pt-4">
        <div className="flex items-center px-6 mb-3">
          {/* Left Side - Back Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
          {/* Center - Title */}
          <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
            Menu Details
          </div>
          {/* Right Side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit-menu/${outletId}/${menuId}`)}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faUtensils} className="w-6 h-6 text-brand-500" />
              {menu.name}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${menu.food_type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {menu.food_type?.toUpperCase()}
              </span>
            </h2>
            <p className="text-gray-600">{menu.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Images */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
              {menu.images && menu.images.length > 0 ? (
                <img src={menu.images[0].image} alt={menu.name} className="mb-2 w-24 h-24 object-cover rounded-lg border" />
              ) : (
                <div className="mb-2 w-24 h-24 flex items-center justify-center rounded-lg bg-gray-200">
                  <FontAwesomeIcon icon={faUtensils} className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="text-base font-medium text-gray-800">Menu Image</div>
            </div>

            {/* Category */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faList} className="w-5 h-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{menu.category_name}</div>
                <div className="text-sm text-gray-500">Category</div>
              </div>
            </div>

            {/* Spicy Index */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-error-500" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">Level {menu.spicy_index}</div>
                <div className="text-sm text-gray-500">Spicy Index</div>
              </div>
            </div>

            {/* Offer */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faPercent} className="w-5 h-5 text-success-500" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{menu.offer}%</div>
                <div className="text-sm text-gray-500">Offer</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={menu.is_active ? faCircleCheck : faCircleXmark}
                  className={`w-5 h-5 ${menu.is_active ? 'text-success-500' : 'text-error-500'}`}
                />
              </div>
              <div className="ml-3">
                <div className={`text-base font-medium ${menu.is_active ? 'text-success-700' : 'text-error-700'}`}>
                  {menu.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>

            {/* Created On */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarPlus} className="w-5 h-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{menu.created_on}</div>
                <div className="text-sm text-gray-500">Created On</div>
              </div>
            </div>

            {/* Created By */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{menu.created_by}</div>
                <div className="text-sm text-gray-500">Created By</div>
              </div>
            </div>

            {/* Updated On */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="w-5 h-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{menu.updated_on || '-'}</div>
                <div className="text-sm text-gray-500">Updated On</div>
              </div>
            </div>
          </div>

          {/* Portions Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Portions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {menu.portions.map((portion, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-50">
                  <div className="text-base font-medium text-gray-800">{portion.portion_name}</div>
                  <div className="text-sm text-gray-600">₹{portion.price}</div>
                  <div className="text-sm text-gray-500">
                    {portion.unit_value} {portion.unit_type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Section */}
          {menu.ingredients && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-gray-700">{menu.ingredients}</p>
              </div>
            </div>
          )}
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
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover hover:text-gray-800 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteMenu}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete Menu
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this menu? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this menu will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MenuDetails;