import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import { validatePin } from "../../utils/validationPatterns";

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
  const [pinError, setPinError] = useState("");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    aadhar: "",
    pan: "",
    pin: "",
    address: "",
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
        setForm({
          name: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          aadhar: data.aadhar || "",
          pan: data.pan || "",
          pin: String(data.pin ?? data.login_pin ?? ""),
          address: data.address || "",
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

  const isFormValid = () =>
    form.name.trim() &&
    form.mobile.trim().length === 10 &&
    form.email.trim() &&
    !emailError &&
    !pinError &&
    (form.pin.trim().length === 0 || form.pin.trim().length === 4);

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

    if (name === "pin") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      setForm((prev) => ({ ...prev, pin: digitsOnly }));
      if (pinError) setPinError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const pinValidation = validatePin(form.pin, { required: false });
    if (!pinValidation.isValid) {
      setPinError(pinValidation.message);
      toastController.error(pinValidation.message);
      return;
    }

    if (!isFormValid()) return;

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
          ...(form.pin.trim() ? { pin: form.pin.trim() } : {}),
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
              <div>
                <TextInput
                  label="Owner PIN"
                  name="pin"
                  type="password"
                  value={form.pin}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current PIN"
                  maxLength={4}
                  autoComplete="new-password"
                  inputMode="numeric"
                  error={!!pinError}
                  errorMessage={pinError}
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
          </form>
        </div>
      </div>
    </>
  );
}

export default EditOwner;
