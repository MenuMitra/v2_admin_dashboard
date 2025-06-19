import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl,
  faChevronRight,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from '../../Breadcrumb';

function ManageCategories() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const fetchCategoryDetails = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);

      const response = await axios.post(
        "https://men4u.xyz/v2/common/menu_category_list",
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.st === 1) {
        setCategoryData(response.data.menucat_details.filter(cat => cat.category_name !== 'all'));
      }
    } catch (err) {
      setCategoryError(err.response?.data?.message || "Failed to fetch category details");
      console.error("Error fetching category details:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchCategoryDetails();
    }
  }, [adminData?.user_id, outletId]);

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Categories' }
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your outlet categories
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : categoryError ? (
          <div className="col-span-full text-center py-8 text-error-500">
            {categoryError}
          </div>
        ) : categoryData.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          categoryData.map((category) => (
            <div
              key={category.menu_cat_id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                    {category.image ? (
                      <img
                        src={`https://men4u.xyz${category.image}`}
                        alt={category.category_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FontAwesomeIcon
                          icon={faListUl}
                          className="w-6 h-6 text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                      {category.category_name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.menu_count} {category.menu_count === 1 ? 'Menu' : 'Menus'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-brand-500 transition-colors">
                    <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default ManageCategories;