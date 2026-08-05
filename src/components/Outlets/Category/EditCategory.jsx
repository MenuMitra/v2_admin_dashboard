import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../../../hooks/useAdmin";
import { useOfflineCategories, useOnlineStatus } from "../../../offline";
import { TextInput } from "../../forms/FormElements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";
import { toastController } from "../../../utils/toastController";
import SaveButton from "../../common/SaveButton";

function EditCategory() {
  const { outletId, menuCategoryId } = useParams();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const formRef = React.useRef();
  const { updateMutation, getCategoryById } = useOfflineCategories(
    outletId,
    adminData?.user_id
  );

  useEffect(() => {
    if (!hasLoadedData && menuCategoryId && outletId) {
      const load = async () => {
        setLoading(true);
        try {
          const cat = await getCategoryById(menuCategoryId);
          if (!cat) {
            toastController.error("Category not found locally");
            return;
          }
          setCategoryName(cat.category_name || cat.name || "");
          setHasLoadedData(true);
        } catch {
          toastController.error("Failed to load category");
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [menuCategoryId, outletId, hasLoadedData, getCategoryById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateMutation.mutateAsync({
        menuCatIdOrUuid: menuCategoryId,
        name: categoryName,
      });
      toastController.success(
        online
          ? "Category updated — syncing"
          : "Category updated offline — will sync when online"
      );
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      toastController.error(err.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Breadcrumb
        items={[
          { label: "Home", path: "/home" },
          { label: "Outlets", path: "/outlets" },
          { label: "Categories", path: `/categories/${outletId}` },
          { label: "Edit Category" },
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
              type="button"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Edit Category
            </h2>
            <SaveButton
              onClick={() => formRef.current?.requestSubmit()}
              disabled={loading}
              isLoading={loading}
              type="button"
            >
              Save
            </SaveButton>
          </div>
        </div>

        {!online && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You are offline. Changes will sync when you reconnect.
          </div>
        )}

        <div className="p-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-1">
              <TextInput
                className="rounded-lg"
                label="Category Name"
                required
                value={categoryName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^[A-Za-z\s]*$/.test(value)) {
                    setNameError(
                      "Category name should only contain alphabets and spaces"
                    );
                  } else {
                    setNameError("");
                  }
                  setCategoryName(value);
                }}
                placeholder="Enter category name"
              />
              {nameError && (
                <p className="text-error-500 text-sm mt-1">{nameError}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;
