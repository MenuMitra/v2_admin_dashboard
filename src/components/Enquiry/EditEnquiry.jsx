import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useEnquiryDetails } from "../../lib/react-query/hooks/useEnquiryDetails";
import { TextInput, Textarea } from "../forms/FormElements.jsx";
import CustomSelect from "../common/CustomSelect";
import CustomDropdown from "../common/CustomDropdown";
import MultiSelectDropdown from "../common/MultiSelectDropdown";
import Breadcrumb from "../Breadcrumb";
import SaveButton from "../common/SaveButton";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";
import { isEmailValid, isMobileValid } from "../../utils/validations";

const FALLBACK_OUTLET_TYPES = {
  outlet: "outlet",
  hotel: "hotel",
  mess: "mess",
  canteen: "canteen",
  cafe: "cafe",
  bakery: "bakery",
};

const emptyToNull = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const getValidationErrors = (data) => {
  const errors = {};
  const companyName = data.company.company_name?.trim() || "";
  const ownerName = data.owner.name?.trim() || "";
  const outletName = data.outlet.name?.trim() || "";
  const planName = data.subscription.name?.trim() || "";
  const tenure = data.subscription.tenure?.trim() || "";
  const priceValue = data.subscription.price;

  if (!companyName) errors.company_name = "Company name is required";
  if (!data.company.company_type) {
    errors.company_type = "Company type is required";
  }

  if (!ownerName) errors.owner_name = "Owner name is required";
  const ownerMobile = isMobileValid(data.owner.mobile || "");
  if (!ownerMobile.isValid) errors.owner_mobile = ownerMobile.message;
  const ownerEmail = isEmailValid(data.owner.email?.trim() || "");
  if (!ownerEmail.isValid) errors.owner_email = ownerEmail.message;

  if (!outletName) errors.outlet_name = "Outlet name is required";
  const outletMobile = isMobileValid(data.outlet.mobile || "");
  if (!outletMobile.isValid) errors.outlet_mobile = outletMobile.message;
  if (!data.outlet.outlet_type) {
    errors.outlet_type = "Outlet type is required";
  }

  if (!planName) errors.subscription_name = "Plan name is required";
  if (priceValue === "" || priceValue === null || priceValue === undefined) {
    errors.subscription_price = "Price is required";
  } else if (Number.isNaN(Number(priceValue))) {
    errors.subscription_price = "Price must be a number";
  } else if (Number(priceValue) < 0) {
    errors.subscription_price = "Price cannot be negative";
  }
  if (!tenure) errors.subscription_tenure = "Tenure is required";
  if (!Array.isArray(data.subscription.module_ids) || !data.subscription.module_ids.length) {
    errors.module_ids = "At least one module is required";
  }

  return errors;
};

const COMPANY_TYPE_OPTIONS = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership_firm", label: "Partnership Firm" },
  { value: "llp", label: "LLP" },
  { value: "opc", label: "OPC" },
  { value: "private_limited", label: "Private Limited" },
  { value: "limited", label: "Limited" },
];

function EditEnquiry() {
  const { enquiry_id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;
  const { enquiry, isLoading, updateEnquiry, isUpdating } = useEnquiryDetails(
    enquiry_id,
    getToken()
  );

  const [outletTypeOptions, setOutletTypeOptions] = useState(
    Object.entries(FALLBACK_OUTLET_TYPES).map(([value, label]) => ({
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }))
  );
  const [modules, setModules] = useState([]);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [formData, setFormData] = useState({
    company: {
      company_name: "",
      company_type: "",
      pan: "",
      fssai: "",
      tan: "",
      cin: "",
    },
    owner: {
      name: "",
      mobile: "",
      aadhar: "",
      pan: "",
      email: "",
      address: "",
    },
    outlet: {
      name: "",
      mobile: "",
      outlet_type: "",
      address: "",
      veg_nonveg: "",
      fssainumber: "",
      gstnumber: "",
    },
    subscription: {
      name: "",
      price: "",
      tenure: "",
      module_ids: [],
    },
  });

  useEffect(() => {
    if (!enquiry) return;
    setFormData({
      company: {
        company_name: enquiry.company?.company_name || "",
        company_type: enquiry.company?.company_type || "",
        pan: enquiry.company?.pan || "",
        fssai: enquiry.company?.fssai || "",
        tan: enquiry.company?.tan || "",
        cin: enquiry.company?.cin || "",
      },
      owner: {
        name: enquiry.owner?.name || "",
        mobile: enquiry.owner?.mobile || "",
        aadhar: enquiry.owner?.aadhar || "",
        pan: enquiry.owner?.pan || "",
        email: enquiry.owner?.email || "",
        address: enquiry.owner?.address || "",
      },
      outlet: {
        name: enquiry.outlet?.name || "",
        mobile: enquiry.outlet?.mobile || "",
        outlet_type: enquiry.outlet?.outlet_type || "",
        address: enquiry.outlet?.address || "",
        veg_nonveg: enquiry.outlet?.veg_nonveg || "",
        fssainumber: enquiry.outlet?.fssainumber || "",
        gstnumber: enquiry.outlet?.gstnumber || "",
      },
      subscription: {
        name: enquiry.subscription?.name || "",
        price:
          enquiry.subscription?.price === 0 || enquiry.subscription?.price
            ? String(enquiry.subscription.price)
            : "",
        tenure: enquiry.subscription?.tenure || "",
        module_ids: Array.isArray(enquiry.subscription?.module_ids)
          ? enquiry.subscription.module_ids.map(Number)
          : [],
      },
    });
  }, [enquiry]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const fetchOutletTypes = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/common/get_list/outlet_type`,
          { headers: { Authorization: token } }
        );
        const list =
          response.data?.outlet_type_list ||
          response.data?.data?.outlet_type_list ||
          response.data?.data ||
          null;
        const source =
          list && typeof list === "object" && !Array.isArray(list)
            ? list
            : FALLBACK_OUTLET_TYPES;
        setOutletTypeOptions(
          Object.entries(source).map(([value, label]) => ({
            value,
            label:
              String(label).charAt(0).toUpperCase() +
              String(label).slice(1).replace(/_/g, " "),
          }))
        );
      } catch {
        // Keep fallback outlet types
      }
    };

    const fetchModules = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/modules`, {
          headers: { Authorization: token },
        });
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.modules || [];
        setModules(
          (Array.isArray(list) ? list : []).map((item) => ({
            ...item,
            module_id: Number(item.module_id ?? item.id),
            name: item.name || item.module_name || `Module ${item.module_id ?? item.id}`,
          }))
        );
      } catch {
        toastController.error("Failed to fetch modules");
      }
    };

    fetchOutletTypes();
    fetchModules();
  }, [BASE_URL, getToken]);

  const updateSection = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const fieldErrors = isSubmitAttempted ? getValidationErrors(formData) : {};

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitAttempted(true);
    const errors = getValidationErrors(formData);
    if (Object.keys(errors).length) {
      toastController.error("Please fill all required fields");
      return;
    }

    const priceValue = formData.subscription.price;
    const payload = {
      enquiry_id: Number(enquiry_id),
      company: {
        company_name: emptyToNull(formData.company.company_name),
        company_type: emptyToNull(formData.company.company_type),
        pan: emptyToNull(formData.company.pan),
        fssai: emptyToNull(formData.company.fssai),
        tan: emptyToNull(formData.company.tan),
        cin: emptyToNull(formData.company.cin),
      },
      owner: {
        name: emptyToNull(formData.owner.name),
        mobile: emptyToNull(formData.owner.mobile),
        aadhar: emptyToNull(formData.owner.aadhar),
        pan: emptyToNull(formData.owner.pan),
        email: emptyToNull(formData.owner.email),
        address: emptyToNull(formData.owner.address),
      },
      outlet: {
        name: emptyToNull(formData.outlet.name),
        mobile: emptyToNull(formData.outlet.mobile),
        outlet_type: emptyToNull(formData.outlet.outlet_type),
        address: emptyToNull(formData.outlet.address),
        veg_nonveg: emptyToNull(formData.outlet.veg_nonveg),
        fssainumber: emptyToNull(formData.outlet.fssainumber),
        gstnumber: emptyToNull(formData.outlet.gstnumber),
      },
      subscription: {
        name: emptyToNull(formData.subscription.name),
        price:
          priceValue === "" || priceValue === null
            ? null
            : Number(priceValue),
        tenure: emptyToNull(formData.subscription.tenure),
        module_ids: formData.subscription.module_ids.map(Number),
      },
    };

    try {
      await updateEnquiry(payload);
      navigate(`/view-enquiry/${enquiry_id}`);
    } catch {
      // Error toast is handled in the mutation
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Enquiry", path: "/enquiries" },
    { label: "Edit Enquiry" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between min-h-[60px]">
            <button
              onClick={() => navigate(`/view-enquiry/${enquiry_id}`)}
              className="inline-flex items-center flex-shrink-0 gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="flex-1 mx-4 text-xl font-semibold text-center text-gray-800">
              Edit Enquiry
            </h1>
            <SaveButton
              onClick={handleSubmit}
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Save
            </SaveButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <section>
            <h2 className="mb-4 text-base font-medium text-gray-800">Company</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <TextInput
                label="Company Name"
                value={formData.company.company_name}
                onChange={(e) =>
                  updateSection("company", "company_name", e.target.value)
                }
                placeholder="Enter company name"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.company_name}
                errorMessage={fieldErrors.company_name}
              />
              <div>
                <CustomSelect
                  label="Company Type"
                  name="company_type"
                  value={formData.company.company_type}
                  onChange={(e) =>
                    updateSection("company", "company_type", e.target.value)
                  }
                  options={COMPANY_TYPE_OPTIONS}
                  placeholder="Select company type"
                  required
                  className={`rounded-lg ${
                    fieldErrors.company_type ? "border-error-500" : ""
                  }`}
                />
                {fieldErrors.company_type && (
                  <p className="mt-1 text-sm text-error-500">
                    {fieldErrors.company_type}
                  </p>
                )}
              </div>
              <TextInput
                label="PAN"
                value={formData.company.pan}
                onChange={(e) =>
                  updateSection(
                    "company",
                    "pan",
                    e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase()
                  )
                }
                placeholder="AAAAA1234A"
                maxLength={10}
              />
              <TextInput
                label="FSSAI"
                value={formData.company.fssai}
                onChange={(e) =>
                  updateSection(
                    "company",
                    "fssai",
                    e.target.value.replace(/\D/g, "").slice(0, 14)
                  )
                }
                placeholder="14-digit FSSAI"
                maxLength={14}
              />
              <TextInput
                label="TAN"
                value={formData.company.tan}
                onChange={(e) => updateSection("company", "tan", e.target.value)}
                placeholder="Enter TAN"
              />
              <TextInput
                label="CIN"
                value={formData.company.cin}
                onChange={(e) => updateSection("company", "cin", e.target.value)}
                placeholder="Enter CIN"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-medium text-gray-800">Owner</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <TextInput
                label="Name"
                value={formData.owner.name}
                onChange={(e) => updateSection("owner", "name", e.target.value)}
                placeholder="Enter owner name"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.owner_name}
                errorMessage={fieldErrors.owner_name}
              />
              <TextInput
                label="Mobile"
                value={formData.owner.mobile}
                onChange={(e) =>
                  updateSection(
                    "owner",
                    "mobile",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit mobile"
                maxLength={10}
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.owner_mobile}
                errorMessage={fieldErrors.owner_mobile}
                customValidator={(val) => isMobileValid(val || "")}
              />
              <TextInput
                label="Email"
                type="email"
                value={formData.owner.email}
                onChange={(e) => updateSection("owner", "email", e.target.value)}
                placeholder="owner@example.com"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.owner_email}
                errorMessage={fieldErrors.owner_email}
                customValidator={(val) => isEmailValid(val?.trim() || "")}
              />
              <TextInput
                label="Aadhar"
                value={formData.owner.aadhar}
                onChange={(e) =>
                  updateSection(
                    "owner",
                    "aadhar",
                    e.target.value.replace(/\D/g, "").slice(0, 12)
                  )
                }
                placeholder="12-digit Aadhar"
                maxLength={12}
              />
              <TextInput
                label="PAN"
                value={formData.owner.pan}
                onChange={(e) =>
                  updateSection(
                    "owner",
                    "pan",
                    e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase()
                  )
                }
                placeholder="AAAAA1234A"
                maxLength={10}
              />
              <Textarea
                label="Address"
                value={formData.owner.address}
                onChange={(e) =>
                  updateSection("owner", "address", e.target.value)
                }
                placeholder="Enter owner address"
                rows={3}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-medium text-gray-800">Outlet</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <TextInput
                label="Outlet Name"
                value={formData.outlet.name}
                onChange={(e) => updateSection("outlet", "name", e.target.value)}
                placeholder="Enter outlet name"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.outlet_name}
                errorMessage={fieldErrors.outlet_name}
              />
              <TextInput
                label="Mobile"
                value={formData.outlet.mobile}
                onChange={(e) =>
                  updateSection(
                    "outlet",
                    "mobile",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="10-digit mobile"
                maxLength={10}
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.outlet_mobile}
                errorMessage={fieldErrors.outlet_mobile}
                customValidator={(val) => isMobileValid(val || "")}
              />
              <CustomDropdown
                label="Outlet Type"
                name="outlet_type"
                value={formData.outlet.outlet_type}
                onChange={(e) =>
                  updateSection("outlet", "outlet_type", e.target.value)
                }
                options={outletTypeOptions}
                placeholder="Select outlet type"
                required
                error={!!fieldErrors.outlet_type}
                errorMessage={fieldErrors.outlet_type}
              />
              <CustomDropdown
                label="Food Type"
                name="veg_nonveg"
                value={formData.outlet.veg_nonveg}
                onChange={(e) =>
                  updateSection("outlet", "veg_nonveg", e.target.value)
                }
                options={[
                  { value: "veg", label: "Veg" },
                  { value: "nonveg", label: "Non-Veg" },
                ]}
                placeholder="Select food type"
              />
              <TextInput
                label="FSSAI Number"
                value={formData.outlet.fssainumber}
                onChange={(e) =>
                  updateSection("outlet", "fssainumber", e.target.value)
                }
                placeholder="Outlet FSSAI"
              />
              <TextInput
                label="GST Number"
                value={formData.outlet.gstnumber}
                onChange={(e) =>
                  updateSection("outlet", "gstnumber", e.target.value)
                }
                placeholder="Outlet GST"
              />
              <Textarea
                label="Address"
                value={formData.outlet.address}
                onChange={(e) =>
                  updateSection("outlet", "address", e.target.value)
                }
                placeholder="Enter outlet address"
                rows={3}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-medium text-gray-800">
              Subscription
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <TextInput
                label="Plan Name"
                value={formData.subscription.name}
                onChange={(e) =>
                  updateSection("subscription", "name", e.target.value)
                }
                placeholder="Enter plan name"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.subscription_name}
                errorMessage={fieldErrors.subscription_name}
              />
              <TextInput
                label="Price"
                type="number"
                value={formData.subscription.price}
                onChange={(e) =>
                  updateSection("subscription", "price", e.target.value)
                }
                placeholder="Enter price"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.subscription_price}
                errorMessage={fieldErrors.subscription_price}
              />
              <TextInput
                label="Tenure"
                value={formData.subscription.tenure}
                onChange={(e) =>
                  updateSection("subscription", "tenure", e.target.value)
                }
                placeholder="e.g. 12 Months"
                required
                isSubmitAttempted={isSubmitAttempted}
                error={!!fieldErrors.subscription_tenure}
                errorMessage={fieldErrors.subscription_tenure}
              />
              <div>
                <MultiSelectDropdown
                  label="Modules"
                  options={modules}
                  selectedValues={formData.subscription.module_ids}
                  onChange={(values) =>
                    updateSection(
                      "subscription",
                      "module_ids",
                      values.map(Number)
                    )
                  }
                  displayKey="name"
                  valueKey="module_id"
                  searchKeys={["name"]}
                  placeholder="Select modules"
                  required
                />
                {fieldErrors.module_ids && (
                  <p className="mt-1 text-sm text-error-500">
                    {fieldErrors.module_ids}
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

export default EditEnquiry;
