import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { TextInput, Textarea } from "../forms/FormElements.jsx";
import CustomDropdown from "../common/CustomDropdown";
import Breadcrumb from "../Breadcrumb";
import { toastController } from "../../utils/toastController";

function CreateOwner() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { BASE_URL } = API_CONFIG;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState({
    company_id: "",
    name: "",
    mobile: "",
    email: "",
    aadhar: "",
    pan: "",
    address: "",
    outlet_ids: [],
  });

  const { data: companies = [] } = useQuery({
    queryKey: queryKeys.companies.list(),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/admin/list_companies`,
        { user_id: adminData.user_id },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data?.companies || [];
    },
    enabled: !!adminData?.user_id,
  });

  const { data: outlets = [] } = useQuery({
    queryKey: [...queryKeys.outlets.list(), "for-owner-create", form.company_id],
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/common/listview_outlet`,
        {
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      const list = response.data?.data || response.data?.outlets || response.data || [];
      const raw = Array.isArray(list) ? list : [];
      if (!form.company_id) return raw;
      return raw.filter(
        (o) =>
          String(o.company_id ?? o.companyId ?? "") === String(form.company_id)
      );
    },
    enabled: !!adminData?.user_id && !!form.company_id,
  });

  const companyOptions = useMemo(
    () =>
      companies.map((c) => ({
        value: String(c.company_id),
        label: c.company_name || `Company ${c.company_id}`,
      })),
    [companies]
  );

  useEffect(() => {
    setForm((prev) => ({ ...prev, outlet_ids: [] }));
  }, [form.company_id]);

  const isFormValid = () =>
    form.company_id &&
    form.name.trim() &&
    form.mobile.trim().length === 10 &&
    form.email.trim() &&
    !emailError;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      if (numericValue.length > 0 && /^[0-5]/.test(numericValue)) return;
      setForm((prev) => ({ ...prev, mobile: numericValue }));
      return;
    }

    if (name === "aadhar") {
      const numericValue = value.replace(/\D/g, "").slice(0, 12);
      if (numericValue.length > 0 && /^[01]/.test(numericValue)) return;
      setForm((prev) => ({ ...prev, aadhar: numericValue }));
      return;
    }

    if (name === "pan") {
      setForm((prev) => ({ ...prev, pan: value.toUpperCase().slice(0, 10) }));
      return;
    }

    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setEmailError(
        value && !emailPattern.test(value) ? "Email format is incorrect." : ""
      );
    }

    if (name === "name") {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleOutlet = (outletId) => {
    setForm((prev) => {
      const id = Number(outletId);
      const exists = prev.outlet_ids.includes(id);
      return {
        ...prev,
        outlet_ids: exists
          ? prev.outlet_ids.filter((x) => x !== id)
          : [...prev.outlet_ids, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: adminData.user_id,
        app_source: "admin",
        company_id: Number(form.company_id),
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        aadhar: form.aadhar.trim() || undefined,
        pan: form.pan.trim() || undefined,
        address: form.address.trim() || undefined,
      };
      if (form.outlet_ids.length > 0) {
        payload.outlet_ids = form.outlet_ids;
      }

      const response = await axios.post(
        `${BASE_URL}/admin/create_owner`,
        payload,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      toastController.success(
        response.data?.detail || "Owner created successfully"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
      navigate("/owners");
    } catch (err) {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create owner"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Owners", path: "/owners" },
    { label: "Create" },
  ];

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
            <h1 className="text-xl font-semibold text-gray-800">Create Owner</h1>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition shadow-sm ${
                isSubmitting || !isFormValid()
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-success-500 hover:bg-success-600 text-white"
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <CustomDropdown
                  label="Company"
                  options={companyOptions}
                  value={form.company_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      company_id: e.target.value,
                    }))
                  }
                  placeholder="Select company"
                  required
                />
              </div>
              <div>
                <TextInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <TextInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  maxLength={10}
                />
              </div>
              <div>
                <TextInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
                {emailError && (
                  <div className="text-error-500 text-sm mt-1">{emailError}</div>
                )}
              </div>
              <div>
                <TextInput
                  label="Aadhar"
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  placeholder="Enter aadhar number"
                  maxLength={12}
                />
              </div>
              <div>
                <TextInput
                  label="PAN"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="Enter PAN"
                  maxLength={10}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>

            {form.company_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Map Outlets (optional)
                </h3>
                {outlets.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No outlets found for this company.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {outlets.map((outlet) => {
                      const id = Number(outlet.outlet_id);
                      const selected = form.outlet_ids.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleOutlet(id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition ${
                            selected
                              ? "bg-brand-100 text-brand-700 border-brand-200"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {outlet.outlet_name || outlet.name || `Outlet ${id}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateOwner;
