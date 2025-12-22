import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { API_CONFIG } from '../../../config/appConfig';

const { BASE_URL } = API_CONFIG;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faCircleCheck,
  faCircleXmark,
  faCalendarPlus,
  faCalendarCheck,
  faUser,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import DeleteConfirmModal from '../../common/DeleteConfirmModal/DeleteConfirmModal';
import Breadcrumb from '../../Breadcrumb';
import { toastController } from '../../../utils/toastController';

function CategoryDetails() {
  const { outletId, menuCategoryId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Move breadcrumbItems inside the render since it needs category data
  const getBreadcrumbItems = () => [
    { label: 'Home', path: '/home' },
    { label: 'Outlets', path: '/outlets' },
    { label: category?.outlet_name || 'Outlet', path: `/view-outlet/${outletId}` },
    { label: 'Categories', path: `/categories/${outletId}` },
    { label: 'Category Details' }
  ];

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const response = await axios.post(
          `${BASE_URL}/common/menu_category_view`,
          {
            menu_cat_id: Number(menuCategoryId),
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );
        setCategory(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch category details');
      } finally {
        setLoading(false);
      }
    };

    if (adminData?.user_id && menuCategoryId && outletId) {
      fetchCategoryDetails();
    }
  }, [adminData?.user_id, menuCategoryId, outletId]);

  const handleDeleteCategory = async () => {
    try {
      const token = getToken();
      await axios.delete(`${BASE_URL}/common/menu_category_delete`, {
        data: {
          menu_cat_id: Number(menuCategoryId),
          outlet_id: Number(outletId),
          user_id: adminData?.user_id,
          app_source: 'admin_app',
        },
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });
      navigate(-1);
    } catch (error) {
      toastController.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>

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
              Category Details
            </div>
            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-category/${outletId}/${menuCategoryId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
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
                {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Status */}
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={category.is_active ? faCircleCheck : faCircleXmark}
                    className={`w-5 h-5 ${category.is_active ? 'text-success-500' : 'text-error-500'}`}
                  />
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium ${category.is_active ? 'text-success-700' : 'text-error-700'}`}>{category.is_active ? 'Active' : 'Inactive'}</div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
              {/* Menu Count */}
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{category.menu_count}</div>
                  <div className="text-sm text-gray-500">Menu Count</div>
                </div>
              </div>
              {/* Created On */}
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendarPlus} className="w-5 h-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{category.created_on}</div>
                  <div className="text-sm text-gray-500">Created On</div>
                </div>
              </div>
              {/* Created By */}
              {category.created_by && (
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{category.created_by}</div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>
              )}
              {/* Updated On */}
              {category.updated_on && (
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{category.updated_on}</div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
              )}
              {/* Updated By */}
              {category.updated_by && (
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{category.updated_by}</div>
                    <div className="text-sm text-gray-500">Updated By</div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items Section */}
            {category.menu_list && category.menu_list.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUtensils} className="w-5 h-5 text-brand-500" />
                  Menu Items ({category.menu_count})
                </h3>
                
                <div className="flex flex-wrap gap-4 justify-start">
                  {category.menu_list.map((menu) => (
                    <div
                      key={menu.menu_id}
                      className="group relative bg-white border-1 border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden w-[100px] h-[100px] flex flex-col justify-between flex-shrink-0"
                      style={{
                        '--hover-border': '#66c9daff',
                        '--hover-bg': 'rgba(6, 182, 212, 0.1)',
                        '--hover-text': '#0891b2'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#a4d7e0ff';
                        e.currentTarget.style.backgroundColor = 'rgba(173, 226, 235, 0.1)';
                        const nameEl = e.currentTarget.querySelector('.menu-name');
                        const iconEl = e.currentTarget.querySelector('.menu-icon');
                        if (nameEl) nameEl.style.color = '#000000ff';
                        if (iconEl) iconEl.style.color = '#000000ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                        const nameEl = e.currentTarget.querySelector('.menu-name');
                        const iconEl = e.currentTarget.querySelector('.menu-icon');
                        if (nameEl) nameEl.style.color = '#1f2937';
                        if (iconEl) iconEl.style.color = '#4b5563';
                      }}
                    >
                      {/* Top Row: Menu Name (Left) + Icon (Right) */}
                      <div className="flex items-start justify-between mb-2">
                        {/* Menu Name - Left Top */}
                        <h4 className="menu-name text-xs font-semibold text-gray-800 line-clamp-2 transition-colors duration-300 leading-tight flex-1 pr-1">
                          {menu.menu_name}
                        </h4>
                        
                        {/* Menu Icon - Right Top */}
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                            <FontAwesomeIcon 
                              icon={faUtensils} 
                              className="menu-icon w-2.5 h-2.5 text-gray-600 transition-colors duration-300" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Food Type (Left) + Price (Right) */}
                      <div className="flex items-end justify-between mt-auto gap-3 w-full">
                        {/* Food Type Badge - Left Bottom */}
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-all duration-300 flex-shrink-0 ${
                            menu.food_type === 'veg'
                              ? 'bg-green-100 text-green-800 group-hover:bg-green-200'
                              : menu.food_type === 'nonveg'
                              ? 'bg-red-100 text-red-800 group-hover:bg-red-200'
                              : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full mr-0.5 ${
                              menu.food_type === 'veg'
                                ? 'bg-green-500'
                                : menu.food_type === 'nonveg'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                            }`}
                          />
                          {menu.food_type === 'veg' ? 'Veg' : menu.food_type === 'nonveg' ? 'Nonveg' : 'O'}
                        </span>

                        {/* Price - Right Bottom */}
                        <span className="text-xs font-bold text-success-600 group-hover:text-success-700 transition-all duration-300 flex-shrink-0 ml-auto">
                          ₹{menu.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State for Menu Items */}
                {category.menu_count === 0 && (
                  <div className="text-center py-8">
                    <FontAwesomeIcon icon={faUtensils} className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm">No menu items found in this category</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteCategory}
        />
      </div>
    </>
  );
}

export default CategoryDetails;