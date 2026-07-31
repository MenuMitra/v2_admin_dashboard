import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../../../hooks/useAdmin";
import { useOfflineCategories, useOnlineStatus } from "../../../offline";
import { TextInput } from "../../forms/FormElements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";
import { toastController } from "../../../utils/toastController";
import SaveButton from "../../common/SaveButton";

function CreateCategory() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const formRef = React.useRef();
  const { createMutation } = useOfflineCategories(outletId, adminData?.user_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nameError || !categoryName.trim()) {
      toastController.error("Enter a valid category name");
      return;
    }
    setLoading(true);

    try {
      await createMutation.mutateAsync({ name: categoryName });
      toastController.success(
        online
          ? "Category saved — syncing"
          : "Category saved offline — will sync when online"
      );
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      toastController.error(err.message || "Failed to create category");
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
          { label: "Create Category" },
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
              Create Category
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
            You are offline. This category will sync when you reconnect.
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

            <button
              type="submit"
              disabled={loading}
              className="hidden w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCategory;
