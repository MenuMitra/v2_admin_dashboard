import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { API_CONFIG } from "../../../../config/appConfig";
import { queryKeys } from "../../../../lib/react-query/queryKeys";
import Breadcrumb from "../../../Breadcrumb";
import {
  TextInput,
  SelectInput,
  Textarea,
  DateInput,
  Checkbox,
  labelStyles,
} from "../../../forms/FormElements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../../../utils/toastController";

// Roles will be fetched from get_list/staff_role

function CreateStaff() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    dob: "",
    address: "",
    role: "",
    aadhar_number: "",
  });
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [aadharError, setAadharError] = useState("");
  const [funcError, setFuncError] = useState("");
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [outletName, setOutletName] = useState("");

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Staff", path: `/staff/${outletId}` },
      { label: "Create Staff" },
    ],
    [outletId, outletName]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const fetchedFunctionalitiesRef = useRef(false);
  useEffect(() => {
    if (fetchedFunctionalitiesRef.current) return;
    fetchedFunctionalitiesRef.current = true;
    (async () => {
      try {
        const token = getToken();

        // First fetch outlet details to get assigned feature IDs and outlet name
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
          if (oData?.name) {
            setOutletName(oData.name);
          }
          if (oData?.modules) {
            featureIds = oData.modules.flatMap((m) =>
              (m.features || []).map((f) => f.feature_id)
            );
            featureIds = [...new Set(featureIds.filter(Boolean))];
          }
        } catch (err) {
          // ignore and fall back to default feature ids
        }

        // If no feature ids found, fall back to a small safe default
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

        // Normalize response shapes similar to other components
        let list =
          res.data?.actions ||
          res.data?.data ||
          res.data?.functionalities ||
          [];

        // If the API returned an array of objects each with an `actions` array, flatten
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

        // Deduplicate
        const unique = mapped.filter(
          (item, idx, arr) =>
            idx ===
            arr.findIndex((x) => x.functionality_id === item.functionality_id)
        );

        setFunctionalities(unique);
      } catch (e) {
        // no-op
      }
    })();
  }, [outletId, adminData, getToken, BASE_URL, API_VERSION]);

  // Fetch staff roles for select input (guard against repeated calls)
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
        const normalized = asArray.filter(Boolean).map((name) => String(name));
        setRoles(normalized);
        if (normalized.length > 0) {
          setForm((p) => ({
            ...p,
            role: normalized.includes(p.role) ? p.role : normalized[0],
          }));
        }
      } catch (err) {
        // keep roles empty but don't block form
      }
    })();
  }, []);

  const toggleFunctionality = (id) => {
    setSelectedFunctionalities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCheckAll = () => {
    if (checkAll) {
      setSelectedFunctionalities([]);
      setCheckAll(false);
    } else {
      setSelectedFunctionalities(
        functionalities.map((f) => f.functionality_id)
      );
      setCheckAll(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
        toastController.error("Please fix validation errors");
        setSubmitting(false);
        return;
      }
      const token = getToken();
      const payload = {
        user_id: adminData.user_id,
        name: form.name,
        mobile: form.mobile,
        dob: form.dob,
        address: form.address,
        role: form.role,
        aadhar_number: form.aadhar_number,
        outlet_id: Number(outletId),
        app_source: "admin_app",
        // backend supports assigning actions at creation via `action_ids`
        action_ids: selectedFunctionalities,
      };

      await toastController.promise(
        axios.post(`${BASE_URL}/${API_VERSION}/common/create_staff`, payload, {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }),
        {
          loading: "Creating staff...",
          success: "Staff created successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to create staff",
        }
      );

      // Invalidate staff cache to refresh the list
      queryClient.invalidateQueries(['staff', outletId]);
      // backend will assign actions; just navigate back
      navigate(-1);
    } catch (err) {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-xl font-semibold text-gray-800">
              Create Staff
            </h1>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full ${
                submitting
                  ? "bg-gray-400"
                  : "bg-success-500 hover:bg-success-600"
              }`}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          <div>
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
          </div>
          <div>
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
          </div>
          <DateInput
            label="DOB"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            placeholder="06 Dec 2014"
          />
          <div>
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
          </div>
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
            label="Role"
            name="role"
            value={form.role || roles[0] || ""}
            onChange={handleChange}
            options={roles.map((r) => ({ label: r, value: r }))}
            placeholder="Select role"
          />
        </div>
        {functionalities.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className={labelStyles}>Actions</label>
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={toggleCheckAll}
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

export default CreateStaff;
