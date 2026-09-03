import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { TextInput, Textarea } from "../forms/FormElements.jsx";
import Breadcrumb from "../Breadcrumb";
import SaveButton from "../common/SaveButton";
import { toastController } from "../../utils/toastController";

function EditOwner() {
  const navigate = useNavigate();
  const { ownerId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { BASE_URL } = API_CONFIG;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    aadhar: "",
    pan: "",
    address: "",
    outlet_ids: [],
  });

  useEffect(() => {
    const fetchOwner = async () => {
      if (!adminData?.user_id || !ownerId) return;
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${BASE_URL}/admin/view_owner`,
          {
            user_id: adminData.user_id,
            owner_id: Number(ownerId),
            app_source: "admin",
          },
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data?.data || response.data || {};
        setCompanyId(data.company?.company_id || data.company_id || null);
        setForm({
          name: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          aadhar: data.aadhar || "",
          pan: data.pan || "",
          address: data.address || "",
          outlet_ids: Array.isArray(data.outlets)
            ? data.outlets.map((o) => Number(o.outlet_id)).filter(Boolean)
            : [],
        });
      } catch (err) {
        toastController.error(
          err.response?.data?.detail || "Failed to load owner details"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwner();
  }, [adminData?.user_id, ownerId, BASE_URL, getToken]);

  const { data: outlets = [] } = useQuery({
    queryKey: [...queryKeys.outlets.list(), "for-owner-edit", companyId],
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
      const list =
        response.data?.data || response.data?.outlets || response.data || [];
      const raw = Array.isArray(list) ? list : [];
      if (!companyId) return raw;
      return raw.filter(
        (o) => String(o.company_id ?? o.companyId ?? "") === String(companyId)
      );
    },
    enabled: !!adminData?.user_id && !!companyId,
  });

  const isFormValid = () =>
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
      const response = await axios.patch(
        `${BASE_URL}/admin/update_owner`,
        {
          user_id: adminData.user_id,
          app_source: "admin",
          owner_id: Number(ownerId),
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          aadhar: form.aadhar.trim() || undefined,
          pan: form.pan.trim() || undefined,
          address: form.address.trim() || undefined,
          outlet_ids: form.outlet_ids,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      toastController.success(
        response.data?.detail || "Owner updated successfully"
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.owners.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.owners.detail(ownerId),
      });
      navigate(`/owner-details/${ownerId}`);
    } catch (err) {
      toastController.error(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update owner"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Owners", path: "/owners" },
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
            <h1 className="text-xl font-semibold text-gray-800">Edit Owner</h1>
            <SaveButton
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!isFormValid() || isSubmitting}
            />
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <TextInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
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
                  maxLength={12}
                />
              </div>
              <div>
                <TextInput
                  label="PAN"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Mapped Outlets
              </h3>
              {outlets.length === 0 ? (
                <p className="text-sm text-gray-500">No outlets available.</p>
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
          </form>
        </div>
      </div>
    </>
  );
}

export default EditOwner;
