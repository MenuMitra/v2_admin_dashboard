import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faChevronLeft as faBack,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  TextInput,
  DateInput,
  SelectInput,
} from "../forms/FormElements.jsx";
import Breadcrumb from "../Breadcrumb";
import { API_CONFIG } from "../../config/appConfig";
import { validationPatterns } from "../../utils/validationPatterns";

function EditCompany() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { companyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [error, setError] = useState(null);
  const [emailValidationErrors, setEmailValidationErrors] = useState({});
  const [ownerEmailValidationErrors, setOwnerEmailValidationErrors] = useState({});
  const [companyNameError, setCompanyNameError] = useState("");
  const [ownerAadharErrors, setOwnerAadharErrors] = useState({});
  const [ownerNameErrors, setOwnerNameErrors] = useState({});
  const [ownerMobileErrors, setOwnerMobileErrors] = useState({});
  const [contactNumberErrors, setContactNumberErrors] = useState({});
  const [cityErrors, setCityErrors] = useState({});
  const [pinErrors, setPinErrors] = useState({});

  // Normalize company type strings coming from the API or legacy data to the
  // canonical values expected by the backend.
  const normalizeCompanyType = (type) => {
    if (!type) return "";
    const normalized = type.trim().toLowerCase();
    const normalizedUnderscored = normalized.replace(/\s+/g, "_");
    const mapping = {
      proprietorship: "proprietorship",
      proprietary: "proprietorship",
      proprietory: "proprietorship",
      partnership: "partnership_firm",
      partnership_firm: "partnership_firm",
      llp: "llp",
      opc: "opc",
      private_limited: "private_limited",
      private_ltd: "private_limited",
      pvt_ltd: "private_limited",
      pvt_limited: "private_limited",
      limited: "limited",
    };
    return (
      mapping[normalized] ||
      mapping[normalizedUnderscored] ||
      normalizedUnderscored
    );
  };

  const [companyData, setCompanyData] = useState({
    name: "",
    pan_number: "",
    fssai_number: "",
    tan_number: "",
    cin_number: "",
    company_type: "",
    company_contacts: [
      {
        type: "",
        email: "",
        contact_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pin: "",
        landmark: ""
      }
    ],
    company_owners: [
      {
        name: "",
        mobile: "",
        email: "",
        aadhar: "",
        pan: "",
        address: ""
      }
    ],
  });

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/view_company`,
        {
          company_id: Number(companyId),
          user_id: 440, // Use hardcoded user_id as per requirements
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.data;
      setCompanyData({
        name: data.company_name,
        pan_number: data.pan || "",
        fssai_number: data.fssai || "",
        tan_number: data.tan || "",
        cin_number: data.cin || "",
        company_type: normalizeCompanyType(data.company_type),
        company_contacts: data.contact_details || [
          {
            type: "",
            email: "",
            contact_number: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            pin: "",
            landmark: ""
          }
        ],
        company_owners: data.owners || [
          {
            name: "",
            mobile: "",
            email: "",
            aadhar: "",
            pan: "",
            address: ""
          }
        ],
      });
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch company details");
      console.error("Error fetching company details:", err);
      setIsLoading(false);
    }
  }, [companyId, getToken, BASE_URL]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId, fetchCompanyDetails]);

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Companies", path: "/companies" },
    { label: "Edit Company", path: `/edit-company/${companyId}` },
  ];

  // Contact management functions
  const addContact = () => {
    setCompanyData(prev => ({
      ...prev,
      company_contacts: [
        ...prev.company_contacts,
        {
          type: "",
          email: "",
          contact_number: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pin: "",
          landmark: ""
        }
      ]
    }));
  };

  const removeContact = (index) => {
    if (companyData.company_contacts.length > 1) {
      setCompanyData(prev => ({
        ...prev,
        company_contacts: prev.company_contacts.filter((_, i) => i !== index)
      }));
    }
  };

  const updateContact = (index, field, value) => {
    // Validate Contact Number field - only allow numbers and check first digit
    if (field === "contact_number") {
      const filteredValue = value.replace(/\D/g, '').slice(0, 10);
      if (value !== filteredValue) {
        setContactNumberErrors(prev => ({
          ...prev,
          [index]: "Only numbers are allowed in contact number"
        }));
        setTimeout(() => {
          setContactNumberErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      } else if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
          setContactNumberErrors(prev => ({
            ...prev,
            [index]: "Contact number must start with 6, 7, 8, or 9"
          }));
          setTimeout(() => {
            setContactNumberErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 2000);
        } else {
          setContactNumberErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      } else {
        setContactNumberErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
      setCompanyData(prev => ({
        ...prev,
        company_contacts: prev.company_contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: filteredValue } : contact
        )
      }));
      return;
    }

    setCompanyData(prev => ({
      ...prev,
      company_contacts: prev.company_contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  // Company owners management functions
  const addOwner = () => {
    setCompanyData(prev => ({
      ...prev,
      company_owners: [
        ...prev.company_owners,
        {
          name: "",
          mobile: "",
          email: "",
          aadhar: "",
          pan: "",
          address: ""
        }
      ]
    }));
  };

  const removeOwner = (index) => {
    if (companyData.company_owners.length > 1) {
      setCompanyData(prev => ({
        ...prev,
        company_owners: prev.company_owners.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOwner = (index, field, value) => {
    setCompanyData(prev => ({
      ...prev,
      company_owners: prev.company_owners.map((owner, i) =>
        i === index ? { ...owner, [field]: value } : owner
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const payload = {
        app_source: "admin_panel",
        company_id: parseInt(companyId),
        user_id: 440,
        company_name: companyData.name,
        company_type: companyData.company_type,
        pan: companyData.pan_number || null,
        fssai: companyData.fssai_number || null,
        tan: companyData.tan_number || null,
        cin: companyData.cin_number || null,
        contact_details: companyData.company_contacts.map(contact => ({
          email: contact.email || null,
          contact_number: contact.contact_number || null,
          type: contact.type || null,
          address_line1: contact.address_line1 || null,
          address_line2: contact.address_line2 || null,
          city: contact.city || null,
          state: contact.state || null,
          pin: contact.pin || null,
          landmark: contact.landmark || null,
        })),
        owners: companyData.company_owners.map(owner => ({
          name: owner.name || null,
          mobile: owner.mobile || null,
          email: owner.email || null,
          aadhar: owner.aadhar || null,
          pan: owner.pan || null,
          address: owner.address || null,
        })),
      };

      console.log('Update company payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${BASE_URL}/admin/update_company`,
        payload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Company updated successfully") {
        queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
        navigate("/companies");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update company");
      console.error("Error updating company:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Company
            </h1>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full transition shadow-sm bg-success-500 hover:bg-success-600"
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Company Name"
                  name="name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                  error={!!companyNameError}
                  errorMessage={companyNameError}
                />
                <SelectInput
                  label="Company Type"
                  name="company_type"
                  value={companyData.company_type}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, company_type: e.target.value }))}
                  required
                  options={[
                    { value: "proprietorship", label: "Proprietorship" },
                    { value: "partnership_firm", label: "Partnership Firm" },
                    { value: "llp", label: "LLP" },
                    { value: "opc", label: "OPC" },
                    { value: "private_limited", label: "Private Limited" },
                    { value: "limited", label: "Limited" },
                  ]}
                  placeholder="Select Company Type"
                />
              </div>

              {/* Document Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <TextInput
                  label="Company PAN Number"
                  name="pan_number"
                  value={companyData.pan_number}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, pan_number: e.target.value }))}
                  placeholder="Enter 10-digit PAN number"
                  maxLength={10}
                  required={true}
                />
                <TextInput
                  label="Company FSSAI Number"
                  name="fssai_number"
                  value={companyData.fssai_number}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, fssai_number: e.target.value }))}
                  placeholder="Enter 14-digit FSSAI number"
                  maxLength={14}
                  required={true}
                />
                {companyData.company_type && (
                  companyData.company_type === "llp" || 
                  companyData.company_type === "opc" || 
                  companyData.company_type === "private_limited" || 
                  companyData.company_type === "limited"
                ) && (
                  <>
                    <TextInput
                      label="TAN Number"
                      name="tan_number"
                      value={companyData.tan_number}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, tan_number: e.target.value }))}
                      placeholder="Enter 10-digit TAN number"
                      maxLength={10}
                      required={true}
                    />
                    <TextInput
                      label="CIN Number"
                      name="cin_number"
                      value={companyData.cin_number}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, cin_number: e.target.value }))}
                      placeholder="Enter 21-digit CIN number"
                      maxLength={21}
                      required={true}
                    />
                  </>
                )}
              </div>

              {/* Company Contacts Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Company Contacts</h2>
                  <button
                    type="button"
                    onClick={addContact}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-300"
                    style={{ backgroundColor: '#10b981' }}
                    title="Add another contact"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                    <span>Add More</span>
                  </button>
                </div>
                {companyData.company_contacts.map((contact, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium text-gray-700">Contact {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        {companyData.company_contacts.length > 1 && index !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="w-8 h-8 flex items-center justify-center border border-red-500 hover:bg-red-600 text-white rounded-full focus:ring-2 focus:ring-red-300"
                            style={{ backgroundColor: '#ef4444' }}
                            title="Remove this contact"
                          >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      <TextInput
                        label="Email"
                        name={`contact_email_${index}`}
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact(index, 'email', e.target.value)}
                        placeholder="Enter email address"
                        required={true}
                      />
                      <TextInput
                        label="Contact Number"
                        name={`contact_number_${index}`}
                        type="tel"
                        value={contact.contact_number}
                        onChange={(e) => updateContact(index, 'contact_number', e.target.value)}
                        placeholder="Enter contact number"
                        maxLength={10}
                        required={true}
                        error={!!contactNumberErrors[index]}
                        errorMessage={contactNumberErrors[index]}
                      />
                      <SelectInput
                        label="Type"
                        name={`contact_type_${index}`}
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        options={[
                          { value: "head_office", label: "Head Office" },
                          { value: "branch_office", label: "Branch Office" },
                          { value: "registered_office", label: "Registered Office" },
                          { value: "working_office", label: "Working Office" },
                        ]}
                        placeholder="Select Type"
                        required={true}
                      />
                      <TextInput
                        label="Address Line 1"
                        name={`address_line1_${index}`}
                        value={contact.address_line1}
                        onChange={(e) => updateContact(index, 'address_line1', e.target.value)}
                        placeholder="Enter address line 1"
                        required={true}
                      />
                      <TextInput
                        label="City"
                        name={`city_${index}`}
                        value={contact.city}
                        onChange={(e) => updateContact(index, 'city', e.target.value)}
                        placeholder="Enter city"
                        required={true}
                      />
                      <TextInput
                        label="PIN Code"
                        name={`pin_${index}`}
                        value={contact.pin}
                        onChange={(e) => updateContact(index, 'pin', e.target.value)}
                        placeholder="Enter PIN code"
                        maxLength={6}
                        required={true}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Company Owners Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Company Owners</h2>
                  <button
                    type="button"
                    onClick={addOwner}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-300"
                    style={{ backgroundColor: '#10b981' }}
                    title="Add another owner"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                    <span>Add More</span>
                  </button>
                </div>
                {companyData.company_owners.map((owner, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium text-gray-700">Owner {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        {companyData.company_owners.length > 1 && index !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeOwner(index)}
                            className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-300"
                            style={{ backgroundColor: '#ef4444' }}
                            title="Remove this owner"
                          >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      <TextInput
                        label="Name"
                        name={`owner_name_${index}`}
                        value={owner.name}
                        onChange={(e) => updateOwner(index, 'name', e.target.value)}
                        placeholder="Enter owner name"
                        required={true}
                      />
                      <TextInput
                        label="Mobile"
                        name={`owner_mobile_${index}`}
                        type="tel"
                        value={owner.mobile}
                        onChange={(e) => updateOwner(index, 'mobile', e.target.value)}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        required={true}
                      />
                      <TextInput
                        label="Aadhar"
                        name={`owner_aadhar_${index}`}
                        value={owner.aadhar}
                        onChange={(e) => updateOwner(index, 'aadhar', e.target.value)}
                        placeholder="Enter 12-digit Aadhar"
                        maxLength={12}
                        required={true}
                      />
                      <TextInput
                        label="PAN"
                        name={`owner_pan_${index}`}
                        value={owner.pan}
                        onChange={(e) => updateOwner(index, 'pan', e.target.value)}
                        placeholder="Enter 10-digit PAN"
                        maxLength={10}
                      />
                      <TextInput
                        label="Email"
                        name={`owner_email_${index}`}
                        type="email"
                        value={owner.email}
                        onChange={(e) => updateOwner(index, 'email', e.target.value)}
                        placeholder="Enter email address"
                      />
                      <TextInput
                        label="Address"
                        name={`owner_address_${index}`}
                        value={owner.address}
                        onChange={(e) => updateOwner(index, 'address', e.target.value)}
                        placeholder="Enter complete address"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-error-500 text-sm mt-2">{error}</div>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default EditCompany;