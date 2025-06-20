import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl,
  faChevronRight,
  faPlus,
  faUtensils
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from '../../Breadcrumb';
import DataTable from "../../common/DataTable";

function ManageCategories() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // Add mock data
  const mockCategoryData = [
    {
      menu_cat_id: 1,
      outlet_id: 1,
      category_name: "Starters",
      image: null,
      menu_count: 25,
      is_active: 1,
      total_active_categories: 285,
      total_inactive_categories: 5
    },
    {
      menu_cat_id: 2,
      outlet_id: 1,
      category_name: "Main Course",
      image: null,
      menu_count: 45,
      is_active: 1,
      total_active_categories: 285,
      total_inactive_categories: 5
    },
    {
      menu_cat_id: 3,
      outlet_id: 1,
      category_name: "Rice",
      image: null,
      menu_count: 335,
      is_active: 1,
      total_active_categories: 285,
      total_inactive_categories: 5
    },
    {
      menu_cat_id: 4,
      outlet_id: 1,
      category_name: "Desserts",
      image: null,
      menu_count: 15,
      is_active: 1,
      total_active_categories: 285,
      total_inactive_categories: 5
    },
    {
      menu_cat_id: 5,
      outlet_id: 1,
      category_name: "Beverages",
      image: null,
      menu_count: 20,
      is_active: 0,
      total_active_categories: 285,
      total_inactive_categories: 5
    },
    {
      menu_cat_id: 6,
      outlet_id: 1,
      category_name: "North Indian",
      image: null,
      menu_count: 0,
      is_active: 0,
      total_active_categories: 285,
      total_inactive_categories: 5
    }
  ];

  // Comment out or remove the fetchCategoryDetails function and useEffect
  // Instead, set the mock data directly
  useEffect(() => {
    setCategoryData(mockCategoryData);
  }, []);

  // Calculate counts for the DataTable header
  const counts = {
    total: mockCategoryData.length,
    active: mockCategoryData.filter(cat => cat.is_active === 1).length,
    inactive: mockCategoryData.filter(cat => cat.is_active === 0).length
  };

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


      {/* Categories Grid */}
      <div className="grid grid-cols-1">
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
          <div className="col-span-full">
            <MenuCategoryTable 
              data={{ menucat_details: categoryData }} 
              counts={counts}
            />
          </div>
        )}
      </div>
    </>
  );
}

function MenuCategoryTable({ data, counts }) {
  // Define columns for the DataTable
  const columns = [
    {
      field: 'category_name',
      header: 'Category Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {row.image ? (
              <img
                src={`https://men4u.xyz${row.image}`}
                alt={value}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="w-4 h-4 text-gray-400"
                />
              </div>
            )}
          </div>
          <span className="font-medium text-gray-800 dark:text-white/90">
            {value}
          </span>
        </div>
      ),
    },
    {
      field: 'menu_count',
      header: 'Menu Items',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-white/90">
          {value}
        </span>
      ),
    },
    {
      field: 'is_active',
      header: 'Status',
      sortable: true,
    },
  ];

  return (
    <DataTable
      data={data.menucat_details}
      columns={columns}
      title="Menu Categories"
      counts={counts}
      enableSort={true}
      enableSearch={true}
      enablePagination={true}
      searchPlaceholder="Search categories..."
      darkMode={false}
      createButton={{
        show: true,
        label: "Add Category",
        position: "right",
        className: "bg-brand-500 hover:bg-brand-600",
      }}
    />
  );
}

export default ManageCategories;