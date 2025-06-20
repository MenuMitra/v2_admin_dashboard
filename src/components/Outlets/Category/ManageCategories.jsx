import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl,
  faChevronRight,
  faPlus,
  faUtensils,
  faEye,
  faPenToSquare,
  faTrash
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

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setCategoryLoading(true);
      setCategoryError(null);
      try {
        const token = getToken();
        const response = await axios.post(
          "https://men4u.xyz/v2/common/menu_category_list",
          {
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: "admin_dashboard",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.data?.menucat_details) {
          const filtered = response.data.data.menucat_details.filter(
            cat => cat.menu_cat_id && cat.category_name && cat.category_name !== 'all'
          );
          setCategoryData(filtered);
        } else {
          setCategoryData([]);
          setCategoryError(response.data.msg || "Failed to fetch category details");
        }
      } catch (err) {
        setCategoryError(err.response?.data?.message || "Failed to fetch category details");
      } finally {
        setCategoryLoading(false);
      }
    };

    if (adminData?.user_id && outletId) {
      fetchCategoryDetails();
    }
  }, [adminData?.user_id, outletId]);

  // Calculate counts for the DataTable header
  const counts = {
    total: categoryData.length,
    active: categoryData.filter(cat => cat.is_active === 1).length,
    inactive: categoryData.filter(cat => cat.is_active === 0).length,
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
  const navigate = useNavigate();

  const handleView = (row) => {
    navigate(`/category-details/${row.outlet_id}/${row.menu_cat_id}`);
  };
  const handleEdit = (row) => {
    navigate(`/edit-category/${row.menu_cat_id}`);
  };
  const handleDelete = (row) => {
    console.log("Delete", row);
  };

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
                src={row.image}
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
      render: (value) => (
        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
            onClick={() => handleView(row)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Category"
            onClick={() => handleEdit(row)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Category"
            onClick={() => handleDelete(row)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
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