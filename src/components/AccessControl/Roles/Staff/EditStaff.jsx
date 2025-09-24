import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { API_CONFIG } from "../../../../config/appConfig";
import Breadcrumb from "../../../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  SelectInput,
  Textarea,
  DateInput,
  Checkbox,
  labelStyles,
} from "../../../forms/FormElements";
import { toastController } from "../../../../utils/toastController";

// Roles will be fetched from get_list/staff_role

function EditStaff() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    dob: "",
    address: "",
    role: "cleaner",
    aadhar_number: "",
    is_active: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [aadharError, setAadharError] = useState("");
  const [funcError, setFuncError] = useState("");
  const [roles, setRoles] = useState([]);
  const [outletName, setOutletName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await axios.post(
          `${BASE_URL}/${API_VERSION}/common/staff_view`,
          {
            staff_id: Number(userId),
            outlet_id: Number(outletId),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          { headers: { Authorization: token } }
        );
        const d = res.data?.data || {};
        setForm({
          name: d.name || "",
          mobile: d.mobile || "",
          dob: d.dob || "",
          address: d.address || "",
          role: d.role || "cleaner",
          aadhar_number: d.aadhar_number || "",
          is_active: typeof d.is_active === "number" ? d.is_active : 1,
        });
        // Pre-check assigned functionalities from staff_view (normalize to numbers)
        let assigned = [];
        if (Array.isArray(d.functionalities)) {
          assigned = d.functionalities
            .map((f) => Number(f?.functionality_id))
            .filter((id) => Number.isFinite(id));
        } else if (Array.isArray(d.functionality_ids)) {
          assigned = d.functionality_ids
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
        }
        setSelectedFunctionalities(assigned);

        // Also fetch outlet name for breadcrumb
        try {
          const token2 = getToken();
          const outletRes = await axios.post(
            `${BASE_URL}/${API_VERSION}/common/view_outlet`,
            {
              outlet_id: Number(outletId),
              user_id: adminData?.user_id,
              app_source: "admin_app",
            },
            {
              headers: {
                Authorization: token2,
                "Content-Type": "application/json",
              },
            }
          );
          const oData = outletRes.data?.data;
          if (oData?.name) setOutletName(oData.name);
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    })();
  }, [API_CONFIG, adminData?.user_id, outletId, userId]);

  const fetchedFunctionalitiesRef = useRef(false);
  useEffect(() => {
    if (fetchedFunctionalitiesRef.current) return;
    fetchedFunctionalitiesRef.current = true;
    (async () => {
      try {
        const token = getToken();

        // First fetch outlet details to get assigned feature IDs
        let featureIds = [];
        try {
          const outletRes = await axios.post(
            `${BASE_URL}/${API_VERSION}/common/view_outlet`,
            {
              outlet_id: Number(outletId),
              user_id: adminData?.user_id,
              app_source: "admin_app",
            },
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          const oData = outletRes.data?.data;
          if (oData?.modules) {
            featureIds = oData.modules.flatMap((m) =>
              (m.features || []).map((f) => f.feature_id)
            );
            featureIds = [...new Set(featureIds.filter(Boolean))];
          }
        } catch (err) {
          // ignore and fall back to defaults
        }

        const payload = {
          feature_ids: featureIds.length ? featureIds : [1, 2, 3],
        };

        const res = await axios.post(
          `${BASE_URL}/${API_VERSION}/admin/list_actions`,
          payload,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );

        // Normalize possible response shapes
        let list =
          res.data?.actions ||
          res.data?.data ||
          res.data?.functionalities ||
          [];
        if (Array.isArray(list) && list.length > 0 && list[0]?.actions) {
          const flattened = [];
          for (const entry of list) {
            if (Array.isArray(entry.actions)) flattened.push(...entry.actions);
          }
          list = flattened;
        }

        const mapped = (Array.isArray(list) ? list : [])
          .map((a) => {
            const action = a || {};
            return {
              functionality_id: action.action_id ?? action.id ?? null,
              functionality_name:
                action.name ??
                action.action_name ??
                action.functionality_name ??
                "",
            };
          })
          .filter((x) => x.functionality_id !== null);

        const unique = mapped.filter(
          (item, idx, arr) =>
            idx ===
            arr.findIndex(
              (x) =>
                Number(x.functionality_id) === Number(item.functionality_id)
            )
        );

        // Normalize functionality_id to numbers to ensure checkbox matching
        const normalized = unique.map((u) => ({
          ...u,
          functionality_id: Number(u.functionality_id),
        }));

        setFunctionalities(normalized);
      } catch (e) {}
    })();
  }, [outletId, adminData, getToken, BASE_URL, API_VERSION]);

  // Fetch staff roles (run once per mount)
  const fetchedRolesRef = useRef(false);
  useEffect(() => {
    if (fetchedRolesRef.current) return;
    fetchedRolesRef.current = true;
    (async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${BASE_URL}/${API_VERSION}/common/get_list/staff_role`,
          { headers: { Authorization: token } }
        );
        const list =
          response.data?.staff_role_list ||
          response.data?.role_list ||
          response.data?.roles ||
          response.data?.detail ||
          response.data ||
          [];
        const asArray = Array.isArray(list) ? list : Object.values(list || {});
        setRoles(asArray.map((name) => String(name)));
      } catch (e) {}
    })();
  }, []);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Staff", path: `/staff/${outletId}` },
      { label: "Edit Staff" },
    ],
    [outletId, outletName]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_active") {
      setForm((p) => ({ ...p, is_active: Number(value) }));
      return;
    }
    if (name === "name") {
      const sanitized = value.replace(/[^A-Za-z\s]/g, "");
      setForm((p) => ({ ...p, name: sanitized }));
      setNameError(sanitized ? "" : "Name is required and alphabets only");
      return;
    }
    if (name === "mobile") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);
      setForm((p) => ({ ...p, mobile: digits }));
      setMobileError(
        /^[6-9]\d{9}$/.test(digits)
          ? ""
          : "Mobile must start with 6-9 and be 10 digits"
      );
      return;
    }
    if (name === "aadhar_number") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 12) digits = digits.slice(0, 12);
      setForm((p) => ({ ...p, aadhar_number: digits }));
      setAadharError(/^\d{12}$/.test(digits) ? "" : "Aadhar must be 12 digits");
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nameValid = /^[A-Za-z\s]+$/.test(form.name);
      const mobileValid = /^[6-9]\d{9}$/.test(form.mobile);
      const aadharValid = /^\d{12}$/.test(form.aadhar_number);
      setNameError(nameValid ? "" : "Name is required and alphabets only");
      setMobileError(
        mobileValid ? "" : "Mobile must start with 6-9 and be 10 digits"
      );
      setAadharError(aadharValid ? "" : "Aadhar must be 12 digits");
      setFuncError("");
      if (!nameValid || !mobileValid || !aadharValid) {
        setSaving(false);
        return toastController.error("Please fix validation errors");
      }
      const token = getToken();
      const payload = {
        staff_id: Number(userId),
        user_id: adminData.user_id,
        name: form.name,
        mobile: form.mobile,
        dob: form.dob,
        address: form.address,
        role: form.role,
        aadhar_number: form.aadhar_number,
        outlet_id: Number(outletId),
        is_active: Number(form.is_active) || 0,
        app_source: "admin_app",

        action_ids: selectedFunctionalities,
      };

      await toastController.promise(
        axios.patch(`${BASE_URL}/${API_VERSION}/common/update_staff`, payload, {
          headers: { Authorization: token },
        }),
        {
          loading: "Updating staff...",
          success: "Staff updated successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to update staff",
        }
      );

      // Also call update_active_status so central active/inactive state is updated
      try {
        const statusPayload = {
          outlet_id: Number(outletId),
          user_id: adminData.user_id,
          type: form.role || "staff",
          id: Number(userId),
          is_active: Number(form.is_active) || 0,
          app_source: "admin_app",
        };

        // fire-and-forget; report failure but don't block the main save
        await axios.patch(
          `${BASE_URL}/${API_VERSION}/common/update_active_status`,
          statusPayload,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (statusErr) {
        // Log and show a non-blocking error
        toastController.error(
          statusErr?.response?.data?.detail || "Failed to update active status"
        );
      }

      // After successful update, assign actions if any selected
      try {
        if (selectedFunctionalities.length > 0) {
          const assignPayload = {
            user_id: Number(userId),
            action_ids: selectedFunctionalities,
          };
          await toastController.promise(
            axios.post(
              `${BASE_URL}/${API_VERSION}/admin/user_assign_actions`,
              assignPayload,
              {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              }
            ),
            {
              loading: "Assigning actions...",
              success: "Actions assigned successfully!",
              error: (err) =>
                err.response?.data?.detail || "Failed to assign actions",
            }
          );
        }
      } catch (assignErr) {
        // show error but do not block navigation
        toastController.error(
          assignErr.response?.data?.detail || "Failed to assign actions"
        );
      }
      navigate(-1);
    } catch (err) {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <div className="px-2 pb-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Edit Staff</h1>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full ${
                saving ? "bg-gray-400" : "bg-success-500 hover:bg-success-600"
              }`}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          <TextInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {nameError && (
            <div className="-mt-3">
              <p className="text-error-500 text-sm">{nameError}</p>
            </div>
          )}
          <TextInput
            label="Mobile"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            required
          />
          {mobileError && (
            <div className="-mt-3">
              <p className="text-error-500 text-sm">{mobileError}</p>
            </div>
          )}
          <DateInput
            label="DOB"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />
          <TextInput
            label="Aadhar Number"
            name="aadhar_number"
            value={form.aadhar_number}
            onChange={handleChange}
            type="tel"
            inputMode="numeric"
            maxLength={12}
            required
          />
          {aadharError && (
            <div className="-mt-3">
              <p className="text-error-500 text-sm">{aadharError}</p>
            </div>
          )}
          <div className="sm:col-span-1">
            <Textarea
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <SelectInput
            label="Status"
            name="is_active"
            value={form.is_active}
            onChange={handleChange}
            options={[
              { label: "Active", value: 1 },
              { label: "Inactive", value: 0 },
            ]}
          />
          <SelectInput
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={roles.map((r) => ({ label: r, value: r }))}
          />
        </div>
        <div className="mt-6 flex justify-end"></div>
        {functionalities.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className={labelStyles}>Action</label>
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={() => {
                    if (checkAll) {
                      setSelectedFunctionalities([]);
                      setCheckAll(false);
                    } else {
                      setSelectedFunctionalities(
                        functionalities.map((f) => f.functionality_id)
                      );
                      setCheckAll(true);
                    }
                  }}
                />
                Check All
              </label>
            </div>
            <div className="mt-2 rounded-lg p-4 bg-white">
              <div className="flex flex-wrap gap-4">
                {functionalities.map((func) => (
                  <div
                    key={func.functionality_id}
                    className="min-w-[200px] flex-1"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        label=""
                        value={func.functionality_id}
                        checked={selectedFunctionalities.includes(
                          func.functionality_id
                        )}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setSelectedFunctionalities((prev) =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter((id) => id !== value)
                          );
                        }}
                      />
                      <span>{func.functionality_name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {funcError && (
              <p className="text-error-500 text-sm mt-2">{funcError}</p>
            )}
          </div>
        )}
      </form>
    </>
  );
}

export default EditStaff;
