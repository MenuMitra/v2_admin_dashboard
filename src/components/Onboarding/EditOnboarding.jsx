import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { TextInput, Textarea, SelectInput } from "../forms/FormElements.jsx";
import Breadcrumb from "../Breadcrumb";
import SaveButton from "../common/SaveButton";
import { toastController } from "../../utils/toastController";

const COMPANY_TYPE_OPTIONS = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership_firm", label: "Partnership Firm" },
  { value: "llp", label: "LLP" },
  { value: "opc", label: "OPC" },
  { value: "private_limited", label: "Private Limited" },
  { value: "limited", label: "Limited" },
];

const EMPTY_OWNER = {
  name: "",
  mobile: "",
  aadhar: "",
  pan: "",
  email: "",
  address: "",
};

function EditOnboarding() {
  const navigate = useNavigate();
  const { onboardingId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { BASE_URL } = API_CONFIG;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("pending");
  const [outletTypeOptions, setOutletTypeOptions] = useState([
    { value: "hotel", label: "Hotel" },
    { value: "restaurant", label: "Restaurant" },
    { value: "cafe", label: "Cafe" },
  ]);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_type: "",
    pan: "",
    fssai: "",
    tan: "",
    cin: "",
  });
  const [outletData, setOutletData] = useState({
    name: "",
    outlet_type: "",
    mobile: "",
    address: "",
  });
  const [ownersData, setOwnersData] = useState([{ ...EMPTY_OWNER }]);
  const [subscriptionData, setSubscriptionData] = useState({
    name: "",
    price: "",
    tenure: "",
    module_ids: [],
  });

  useEffect(() => {
    const fetchOutletTypes = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/common/get_list/outlet_type`,
          { headers: { Authorization: getToken() } }
        );
        const list =
          response.data?.outlet_type_list ||
          response.data?.data?.outlet_type_list ||
          response.data?.data ||
          [];
        if (Array.isArray(list) && list.length) {
          setOutletTypeOptions(
            list.map((item) => {
              const value =
                item?.value || item?.key || item?.outlet_type || item?.name;
              return {
                value,
                label: String(value || "")
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()),
              };
            })
          );
        }
      } catch {
        // keep fallback options
      }
    };

    const fetchModules = async () => {
      setLoadingModules(true);
      try {
        const response = await axios.get(`${BASE_URL}/admin/get_modules`, {
          headers: { Authorization: getToken() },
        });
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.modules || [];
        setModules(Array.isArray(list) ? list : []);
      } catch {
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchOutletTypes();
    fetchModules();
  }, [BASE_URL, getToken]);

  useEffect(() => {
    const fetchOnboarding = async () => {
      if (!adminData?.user_id || !onboardingId) return;
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${BASE_URL}/admin/onboarding/view`,
          { onboarding_id: Number(onboardingId) },
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data?.data || response.data || {};
        setStatus(data.status || "pending");

        if (data.status === "activated") {
          toastController.error(
            "Cannot update onboarding with status 'activated'. Only pending onboardings can be updated."
          );
          navigate(`/onboarding-details/${onboardingId}`);
          return;
        }

        const company = data.company_data || {};
        const outlet = data.outlet_data || {};
        const owners = Array.isArray(data.owners_data) ? data.owners_data : [];
        const subscription = data.subscription_data || {};

        setCompanyData({
          company_name: company.company_name || "",
          company_type: company.company_type || "",
          pan: company.pan || "",
          fssai: company.fssai || "",
          tan: company.tan || "",
          cin: company.cin || "",
        });
        setOutletData({
          name: outlet.name || "",
          outlet_type: outlet.outlet_type || "",
          mobile: outlet.mobile || "",
          address: outlet.address || "",
        });
        setOwnersData(
          owners.length
            ? owners.map((o) => ({
                name: o.name || "",
                mobile: o.mobile || "",
                aadhar: o.aadhar || "",
                pan: o.pan || "",
                email: o.email || "",
                address: o.address || "",
              }))
            : [{ ...EMPTY_OWNER }]
        );
        setSubscriptionData({
          name: subscription.name || "",
          price:
            subscription.price !== undefined && subscription.price !== null
              ? String(subscription.price)
              : "",
          tenure: subscription.tenure || "",
          module_ids: Array.isArray(subscription.module_ids)
            ? subscription.module_ids.map(Number)
            : [],
        });
      } catch (err) {
        toastController.error(
          err.response?.data?.detail || "Failed to load onboarding details"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboarding();
  }, [adminData?.user_id, onboardingId, BASE_URL, getToken, navigate]);

  const updateOwner = (index, field, value) => {
    setOwnersData((prev) =>
      prev.map((owner, i) => {
        if (i !== index) return owner;
        let next = value;
        if (field === "mobile") {
          next = value.replace(/\D/g, "").slice(0, 10);
          if (next.length > 0 && /^[0-5]/.test(next)) return owner;
        }
        if (field === "aadhar") {
          next = value.replace(/\D/g, "").slice(0, 12);
          if (next.length > 0 && /^[01]/.test(next)) return owner;
        }
        if (field === "pan") next = value.toUpperCase().slice(0, 10);
        if (field === "name" && value && !/^[a-zA-Z\s]*$/.test(value)) {
          return owner;
        }
        return { ...owner, [field]: next };
      })
    );
  };

  const addOwner = () => {
    setOwnersData((prev) => [...prev, { ...EMPTY_OWNER }]);
  };

  const removeOwner = (index) => {
    setOwnersData((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const toggleModule = (moduleId) => {
    setSubscriptionData((prev) => {
      const exists = prev.module_ids.includes(moduleId);
      return {
        ...prev,
        module_ids: exists
          ? prev.module_ids.filter((id) => id !== moduleId)
          : [...prev.module_ids, moduleId],
      };
    });
  };

  const isFormValid = () =>
    companyData.company_name.trim() &&
    companyData.company_type &&
    outletData.name.trim() &&
    outletData.outlet_type &&
    outletData.mobile.trim().length === 10 &&
    ownersData.every(
      (o) => o.name.trim() && o.mobile.trim().length === 10
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isFormValid()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/admin/onboarding/update`,
        {
          onboarding_id: Number(onboardingId),
          company_data: {
            company_name: companyData.company_name.trim(),
            company_type: companyData.company_type,
            pan: companyData.pan.trim(),
            fssai: companyData.fssai.trim(),
            ...(companyData.tan.trim()
              ? { tan: companyData.tan.trim() }
              : {}),
            ...(companyData.cin.trim()
              ? { cin: companyData.cin.trim() }
              : {}),
          },
          outlet_data: {
            name: outletData.name.trim(),
            outlet_type: outletData.outlet_type,
            mobile: outletData.mobile.trim(),
            address: outletData.address.trim(),
          },
          owners_data: ownersData.map((o) => ({
            name: o.name.trim(),
            mobile: o.mobile.trim(),
            aadhar: o.aadhar.trim(),
            pan: o.pan.trim(),
            email: o.email.trim(),
            address: o.address.trim(),
          })),
          subscription_data: {
            name: subscriptionData.name.trim(),
            price: Number(subscriptionData.price) || 0,
            tenure: subscriptionData.tenure.trim(),
            module_ids: subscriptionData.module_ids.map(Number),
          },
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      toastController.success(
        response.data?.detail || "Onboarding updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.onboarding.detail(onboardingId),
      });
      navigate(`/onboarding-details/${onboardingId}`);
    } catch (err) {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update onboarding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Onboarding", path: "/onboarding" },
    { label: "Edit" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center justify-between px-6 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Edit Onboarding
            </h1>
            <SaveButton
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!isFormValid() || isSubmitting || status !== "pending"}
            />
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Company
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Company Name"
                  name="company_name"
                  value={companyData.company_name}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  required
                />
                <SelectInput
                  label="Company Type"
                  name="company_type"
                  value={companyData.company_type}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      company_type: e.target.value,
                    }))
                  }
                  options={COMPANY_TYPE_OPTIONS}
                  required
                />
                <TextInput
                  label="PAN"
                  name="pan"
                  value={companyData.pan}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      pan: e.target.value.toUpperCase().slice(0, 10),
                    }))
                  }
                  maxLength={10}
                />
                <TextInput
                  label="FSSAI"
                  name="fssai"
                  value={companyData.fssai}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      fssai: e.target.value,
                    }))
                  }
                />
                <TextInput
                  label="TAN"
                  name="tan"
                  value={companyData.tan}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      tan: e.target.value,
                    }))
                  }
                />
                <TextInput
                  label="CIN"
                  name="cin"
                  value={companyData.cin}
                  onChange={(e) =>
                    setCompanyData((prev) => ({
                      ...prev,
                      cin: e.target.value,
                    }))
                  }
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Outlet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Outlet Name"
                  name="name"
                  value={outletData.name}
                  onChange={(e) =>
                    setOutletData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
                <SelectInput
                  label="Outlet Type"
                  name="outlet_type"
                  value={outletData.outlet_type}
                  onChange={(e) =>
                    setOutletData((prev) => ({
                      ...prev,
                      outlet_type: e.target.value,
                    }))
                  }
                  options={outletTypeOptions}
                  required
                />
                <TextInput
                  label="Mobile"
                  name="mobile"
                  type="tel"
                  value={outletData.mobile}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, "").slice(0, 10);
                    if (next.length > 0 && /^[0-5]/.test(next)) return;
                    setOutletData((prev) => ({ ...prev, mobile: next }));
                  }}
                  required
                  maxLength={10}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Address"
                    name="address"
                    value={outletData.address}
                    onChange={(e) =>
                      setOutletData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Owners</h2>
                <button
                  type="button"
                  onClick={addOwner}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-success-500 hover:bg-success-600 rounded-full"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Add Owner
                </button>
              </div>
              <div className="space-y-4">
                {ownersData.map((owner, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        Owner {index + 1}
                      </h3>
                      {ownersData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOwner(index)}
                          className="text-error-500 hover:text-error-600"
                          title="Remove owner"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      <TextInput
                        label="Name"
                        value={owner.name}
                        onChange={(e) =>
                          updateOwner(index, "name", e.target.value)
                        }
                        required
                      />
                      <TextInput
                        label="Mobile"
                        type="tel"
                        value={owner.mobile}
                        onChange={(e) =>
                          updateOwner(index, "mobile", e.target.value)
                        }
                        required
                        maxLength={10}
                      />
                      <TextInput
                        label="Email"
                        type="email"
                        value={owner.email}
                        onChange={(e) =>
                          updateOwner(index, "email", e.target.value)
                        }
                      />
                      <TextInput
                        label="Aadhar"
                        value={owner.aadhar}
                        onChange={(e) =>
                          updateOwner(index, "aadhar", e.target.value)
                        }
                        maxLength={12}
                      />
                      <TextInput
                        label="PAN"
                        value={owner.pan}
                        onChange={(e) =>
                          updateOwner(index, "pan", e.target.value)
                        }
                        maxLength={10}
                      />
                      <div className="sm:col-span-2">
                        <Textarea
                          label="Address"
                          value={owner.address}
                          onChange={(e) =>
                            updateOwner(index, "address", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Subscription
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
                <TextInput
                  label="Plan Name"
                  value={subscriptionData.name}
                  onChange={(e) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <TextInput
                  label="Price"
                  type="number"
                  value={subscriptionData.price}
                  onChange={(e) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
                <TextInput
                  label="Tenure"
                  value={subscriptionData.tenure}
                  onChange={(e) =>
                    setSubscriptionData((prev) => ({
                      ...prev,
                      tenure: e.target.value,
                    }))
                  }
                  placeholder="e.g. 1 Months"
                />
              </div>

              {loadingModules ? (
                <p className="text-sm text-gray-500">Loading modules...</p>
              ) : modules.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Modules
                    </h3>
                    <label className="inline-flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={
                          modules.length > 0 &&
                          subscriptionData.module_ids.length === modules.length
                        }
                        onChange={(e) => {
                          setSubscriptionData((prev) => ({
                            ...prev,
                            module_ids: e.target.checked
                              ? modules.map((m) => Number(m.module_id))
                              : [],
                          }));
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded-lg mr-2"
                      />
                      Check All
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {modules.map((m) => {
                      const id = Number(m.module_id);
                      const checked = subscriptionData.module_ids.includes(id);
                      return (
                        <div
                          key={id}
                          onClick={() => toggleModule(id)}
                          className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer select-none transition-all ${
                            checked
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleModule(id)}
                              onClick={(e) => e.stopPropagation()}
                              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded-lg"
                            />
                            <span className="text-xs font-medium uppercase text-gray-800">
                              {m.name?.split("_").join(" ")}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </section>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditOnboarding;
