import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../../../hooks/useAdmin";
import { useOfflineCategories, useOnlineStatus } from "../../../offline";
import { ensureOutletHydrated } from "../../../offline/syncService";
import { db } from "../../../offline/db";
import { getCategoryById } from "../../../offline/repositories/categoriesRepo";
import { listMenusByCategory } from "../../../offline/repositories/menusRepo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faCircleCheck,
  faCircleXmark,
  faCalendarPlus,
  faCalendarCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";
import Breadcrumb from "../../Breadcrumb";
import { toastController } from "../../../utils/toastController";

const toTitleCase = (str) =>
  str
    ? str
        .toString()
        .toLowerCase()
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1))
    : "";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function CategoryDetails() {
  const { outletId, menuCategoryId } = useParams();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { deleteMutation } = useOfflineCategories(outletId, adminData?.user_id);

  const getBreadcrumbItems = () => [
    { label: "Home", path: "/home" },
    { label: "Outlets", path: "/outlets" },
    {
      label: category?.outlet_name
        ? toTitleCase(category.outlet_name)
        : "Outlet",
      path: `/view-outlet/${outletId}`,
    },
    { label: "Categories", path: `/categories/${outletId}` },
    {
      label: category?.name ? toTitleCase(category.name) : "Category Details",
    },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await ensureOutletHydrated(outletId, adminData?.user_id);
        const cat = await getCategoryById(outletId, menuCategoryId);
        if (!cat) {
          setError("Category not found locally");
          setCategory(null);
          return;
        }

        const outletInfo = await db.outletCache.get(Number(outletId));
        const menu_list = await listMenusByCategory(
          outletId,
          cat.sync_uuid || cat.menu_cat_id
        );

        setCategory({
          name: cat.category_name || cat.name,
          is_active: Boolean(cat.is_active),
          menu_count: menu_list.length,
          menu_list,
          outlet_name: outletInfo?.outlet_name || "",
          created_on: formatDate(cat.created_at),
          updated_on: formatDate(cat.updated_at),
          sync_uuid: cat.sync_uuid,
          menu_cat_id: cat.menu_cat_id,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch category details");
      } finally {
        setLoading(false);
      }
    };

    if (adminData?.user_id && menuCategoryId && outletId) {
      load();
    }
  }, [adminData?.user_id, menuCategoryId, outletId]);

  const handleDeleteCategory = async () => {
    try {
      await deleteMutation.mutateAsync({
        menuCatIdOrUuid: category?.sync_uuid || menuCategoryId,
      });
      toastController.success(
        online
          ? "Category deleted — syncing"
          : "Category deleted offline — will sync when online"
      );
      navigate(-1);
    } catch (err) {
      toastController.error(err.message || "Failed to delete category");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <>
      <div className="mb-6">
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Category Details
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigate(`/edit-category/${outletId}/${menuCategoryId}`)
                }
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
          <div className="px-6 pb-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="w-6 h-6 text-brand-500"
                />
                {toTitleCase(category.name)}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={category.is_active ? faCircleCheck : faCircleXmark}
                    className={`w-5 h-5 ${
                      category.is_active ? "text-success-500" : "text-error-500"
                    }`}
                  />
                </div>
                <div className="ml-3">
                  <div
                    className={`text-base font-medium ${
                      category.is_active ? "text-success-700" : "text-error-700"
                    }`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUtensils}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">
                    {category.menu_count}
                  </div>
                  <div className="text-sm text-gray-500">Menu Count</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCalendarPlus}
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">
                    {category.created_on}
                  </div>
                  <div className="text-sm text-gray-500">Created On</div>
                </div>
              </div>
              {category.updated_on && category.updated_on !== "-" && (
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {category.updated_on}
                    </div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
              )}
            </div>

            {category.menu_list && category.menu_list.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-lato text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUtensils}
                    className="w-5 h-5 text-brand-500"
                  />
                  Menu Items ({category.menu_count})
                </h3>
                <div className="flex flex-wrap gap-4 justify-start">
                  {category.menu_list.map((menu) => (
                    <div
                      key={menu.menu_id || menu.sync_uuid}
                      className="group relative bg-white border-1 border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden w-[100px] h-[100px] flex flex-col justify-between flex-shrink-0"
                      onClick={() =>
                        navigate(
                          `/menu-details/${outletId}/${menu.menu_id || menu.sync_uuid}`
                        )
                      }
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="menu-name text-xs font-lato text-gray-900 line-clamp-2 leading-tight flex-1 pr-1">
                          {toTitleCase(menu.menu_name)}
                        </h4>
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faUtensils}
                              className="menu-icon w-2.5 h-2.5 text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-auto gap-3 w-full">
                        <span
                          className={`food-type inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-lato flex-shrink-0 ${
                            menu.food_type === "veg"
                              ? "bg-green-100 text-green-800"
                              : menu.food_type === "nonveg"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {toTitleCase(menu.food_type || "other")}
                        </span>
                        {menu.default_price != null && (
                          <span className="price-text text-xs font-lato text-success-600 flex-shrink-0 ml-auto">
                            ₹{Number(menu.default_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {category.menu_count === 0 && (
              <div className="mt-8 text-center py-8">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="w-12 h-12 text-gray-300 mb-4"
                />
                <p className="text-gray-500 text-sm">
                  No menu items found in this category
                </p>
              </div>
            )}
          </div>
        </div>
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
