import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import {
  TextInput,
  SelectInput,
  DateInput,
  Checkbox,
  labelStyles,
} from "../forms/FormElements";
import Breadcrumb from "../Breadcrumb";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";

function EditSubscription() {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    subscription_end_date: "",
    feature_ids: [],
  });
  const [validationStates, setValidationStates] = useState({
    name: false,
    price: false,
    subscription_end_date: false,
    feature_ids: false,
  });

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Subscriptions", path: "/subscriptions" },
    { label: "Edit Subscription" },
  ];

  // Fetch subscription details
  const fetchSubscriptionDetails = async () => {
    try {
      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/view_subscription`,
          {
            subscription_id: Number(subscriptionId),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Loading subscription details...",
          success: "Subscription details loaded successfully!",
          error: "Failed to load subscription details",
        }
      );

      if (response.data.detail === "Subscription fetched successfully") {
        const subscription = response.data.data;
        setFormData((prev) => ({
          ...prev,
          name: subscription.name,
          price: subscription.price,
          subscription_end_date: subscription.subscription_end_date,
          // feature_ids will be set after features are fetched
        }));
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to fetch subscription details"
      );
      navigate("/subscriptions");
    }
  };

  // Fetch available features
  const fetchFeatures = async () => {
    try {
      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/list_features`,
          {
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Loading features...",
          success: "Features loaded successfully!",
          error: "Failed to load features",
        }
      );

      if (response.data.detail === "Feature list fetched successfully") {
        // Filter out 'admin_app' feature
        const filteredFeatures = response.data.data.filter(
          (f) => f.name !== "admin_app"
        );
        setFeatures(filteredFeatures);
        // Always select all features by default when editing
        setFormData((prev) => ({
          ...prev,
          feature_ids: filteredFeatures.map((f) => f.feature_id),
        }));
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to fetch features"
      );
    }
  };

  useEffect(() => {
    fetchFeatures();
    fetchSubscriptionDetails();
  }, [subscriptionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationStates((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleFeatureChange = (featureId) => {
    setFormData((prev) => {
      const newFeatureIds = prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter((id) => id !== featureId)
        : [...prev.feature_ids, featureId];

      return {
        ...prev,
        feature_ids: newFeatureIds,
      };
    });
    setValidationStates((prev) => ({
      ...prev,
      feature_ids: false,
    }));
  };

  const validateForm = () => {
    // Normalize values
    const normalizedName = (formData.name || "").trim();
    const normalizedPrice = Number.parseFloat(formData.price);
    const hasValidPrice =
      Number.isFinite(normalizedPrice) && normalizedPrice > 0;
    const hasFeatures = features.length > 0;
    const hasSelectedAnyFeature = (formData.feature_ids || []).length > 0;

    const newValidationStates = {
      name: normalizedName.length === 0,
      price: !hasValidPrice,
      // Not required
      subscription_end_date: false,
      feature_ids: hasFeatures ? !hasSelectedAnyFeature : false,
    };

    // Debug in console to spot what's failing
    console.log("EditSubscription validate:", {
      formData,
      featuresCount: features.length,
      newValidationStates,
    });

    setValidationStates(newValidationStates);
    const isValid = !Object.values(newValidationStates).some((state) => state);

    if (!isValid) {
      if (newValidationStates.name) {
        toastController.error("Plan name is required");
      } else if (newValidationStates.price) {
        toastController.error("Please enter a valid price greater than 0");
      } else if (newValidationStates.feature_ids) {
        toastController.error("Please select at least one feature");
      } else {
        toastController.error("Please fill all required fields correctly");
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Build payload explicitly; include optional fields conditionally
      const payload = {
        subscription_id: Number(subscriptionId),
        name: (formData.name || "").trim(),
        price: Number.parseFloat(formData.price),
        feature_ids: formData.feature_ids,
        user_id: adminData.user_id,
        app_source: "admin_app",
      };
      if (formData.subscription_end_date) {
        payload.subscription_end_date = formData.subscription_end_date;
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/update_subscription`,
        payload,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Subscription updated successfully") {
        toastController.success("Subscription updated successfully");
        navigate("/subscriptions");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Subscription
            </h1>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                 bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isLoading ? "Updating..." : "Save"}
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={validationStates.name}
                errorMessage="Plan name is required"
                placeholder="Enter plan name"
              />

              <TextInput
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                error={validationStates.price}
                errorMessage="Please enter a valid price"
                placeholder="Enter price"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 flex items-center">
                Features
                <span className="text-error-600 ml-1">*</span>
              </h2>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      features.length > 0 &&
                      formData.feature_ids.length === features.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = features.map((f) => f.feature_id);
                        setFormData((prev) => ({
                          ...prev,
                          feature_ids: allIds,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          feature_ids: [],
                        }));
                      }
                    }}
                  />
                  Check All
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Selected: {formData.feature_ids.length}
                </span>
              </div>
            </div>

            <div
              className={`
              grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4
            `}
            >
              {features.map((feature) => (
                <div
                  key={feature.feature_id}
                  onClick={() => handleFeatureChange(feature.feature_id)}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
                    border cursor-pointer select-none
                    ${
                      formData.feature_ids.includes(feature.feature_id)
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-500/50 dark:hover:border-brand-500/50"
                    }
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.feature_ids.includes(
                        feature.feature_id
                      )}
                      onChange={() => handleFeatureChange(feature.feature_id)}
                    />
                    <span
                      className={`
                      text-sm font-medium pl-2
                      ${
                        formData.feature_ids.includes(feature.feature_id)
                          ? "text-brand-700 dark:text-brand-400"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    `}
                    >
                      {feature.name.split("_").join(" ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {validationStates.feature_ids && (
              <p className="mt-2 text-sm text-error-500">
                Please select at least one feature
              </p>
            )}
          </section>
        </form>
      </div>
    </>
  );
}

export default EditSubscription;
