import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import SaveButton from "../common/SaveButton";
import CustomSelect from "../common/CustomSelect";
import { API_CONFIG } from "../../config/appConfig";

function EditCompany() {
  const { getToken, getUserId } = useAuth();
  const { adminData } = useAdmin();
  const { companyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [error, setError] = useState(null);
  const [ownerAadharErrors, setOwnerAadharErrors] = useState({});
  const [ownerMobileErrors, setOwnerMobileErrors] = useState({});
  const [contactNumberErrors, setContactNumberErrors] = useState({});
  const [panError, setPanError] = useState("");
  const [tanError, setTanError] = useState("");
  const [fssaiError, setFssaiError] = useState("");
  const [cinError, setCinError] = useState("");
  const [showPanReference, setShowPanReference] = useState(false);
  const [showFssaiReference, setShowFssaiReference] = useState(false);
  const [showTanReference, setShowTanReference] = useState(false);
  const [showCinReference, setShowCinReference] = useState(false);

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
          user_id: getUserId(), // Use dynamic user_id from auth
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
  }, [companyId, getToken, getUserId, BASE_URL]);

  useEffect(() => {
    if (companyId && adminData?.user_id) {
      fetchCompanyDetails();
    }
  }, [companyId, adminData?.user_id, fetchCompanyDetails]);

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
      // Remove all non-digit characters
      const filteredValue = value.replace(/\D/g, '');
      
      // Check if the first digit is invalid (0-5) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
          // Don't update the value and show error
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
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setContactNumberErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      }
      
      // Limit to 10 digits and update state
      const finalValue = filteredValue.slice(0, 10);
      
      // Show error if non-numeric characters were removed
      if (value !== finalValue && value.length > finalValue.length) {
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
      }
      
      setCompanyData(prev => ({
        ...prev,
        company_contacts: prev.company_contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: finalValue } : contact
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
    // Validate Mobile field - only allow numbers and check first digit
    if (field === "mobile") {
      // Remove all non-digit characters
      const filteredValue = value.replace(/\D/g, '');
      
      // Check if the first digit is invalid (0-5) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
          // Don't update the value and show error
          setOwnerMobileErrors(prev => ({
            ...prev,
            [index]: "Mobile number must start with 6, 7, 8, or 9"
          }));
          setTimeout(() => {
            setOwnerMobileErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setOwnerMobileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      }
      
      // Limit to 10 digits and update state
      const finalValue = filteredValue.slice(0, 10);
      
      // Show error if non-numeric characters were removed
      if (value !== finalValue && value.length > finalValue.length) {
        setOwnerMobileErrors(prev => ({
          ...prev,
          [index]: "Only numbers are allowed in mobile number"
        }));
        setTimeout(() => {
          setOwnerMobileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      }
      
      setCompanyData(prev => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: finalValue } : owner
        )
      }));
      return;
    }

    // Validate Aadhar field - only allow numbers and check first digit
    if (field === "aadhar") {
      // Remove all non-digit characters
      const filteredValue = value.replace(/\D/g, '');
      
      // Check if the first digit is invalid (0 or 1) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (['0', '1'].includes(firstDigit)) {
          // Don't update the value and show error
          setOwnerAadharErrors(prev => ({
            ...prev,
            [index]: "Aadhar number cannot start with 0 or 1"
          }));
          setTimeout(() => {
            setOwnerAadharErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setOwnerAadharErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      }
      
      // Limit to 12 digits and update state
      const finalValue = filteredValue.slice(0, 12);
      
      // Show error if non-numeric characters were removed
      if (value !== finalValue && value.length > finalValue.length) {
        setOwnerAadharErrors(prev => ({
          ...prev,
          [index]: "Only numbers are allowed in Aadhar number"
        }));
        setTimeout(() => {
          setOwnerAadharErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      }
      
      setCompanyData(prev => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: finalValue } : owner
        )
      }));
      return;
    }

    // Validate PAN field - allow letters and numbers, convert to uppercase
    if (field === "pan") {
      const filteredValue = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
      setCompanyData(prev => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: filteredValue } : owner
        )
      }));
      return;
    }

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
        user_id: getUserId(),
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
          <div className="flex items-center justify-between min-h-[60px]">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center flex-shrink-0 gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="flex-1 mx-4 text-xl font-semibold text-center text-gray-800 dark:text-white/90">
              Edit Company
            </h1>
            <div className="flex items-center flex-shrink-0 gap-3">
              <SaveButton
                onClick={handleSubmit}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Save
              </SaveButton>
            </div>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                <TextInput
                  label="Company Name"
                  name="name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
                <CustomSelect
                  label="Company Type"
                  name="company_type"
                  value={companyData.company_type}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, company_type: e.target.value }))}
                  required
                  className="rounded-lg"
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                <div className="relative">
                  <TextInput
                    label="Company PAN Number"
                    name="pan_number"
                    value={companyData.pan_number}
                    onChange={(e) => {
                      const filteredValue = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
                      setCompanyData(prev => ({ ...prev, pan_number: filteredValue }));
                      // Validate PAN format: 10 characters (5 letters, 4 numbers, 1 letter)
                      if (filteredValue.length === 10) {
                        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                        if (!panRegex.test(filteredValue)) {
                          setPanError("PAN format is invalid. Expected format: AAAAA1234A");
                        } else {
                          setPanError("");
                        }
                      } else if (filteredValue.length > 0) {
                        setPanError("PAN must be exactly 10 characters");
                      } else {
                        setPanError("");
                      }
                    }}
                    onFocus={() => setShowPanReference(true)}
                    onBlur={() => setShowPanReference(false)}
                    placeholder="Enter 10-digit PAN number"
                    maxLength={10}
                    required={true}
                    error={!!panError}
                  />
                  {panError && (
                    <p className="mt-1 text-sm text-error-500">{panError}</p>
                  )}
                  {showPanReference && (
                    <p className="mt-1 text-xs text-gray-500">PAN format: AAAAA1234A (5 letters, 4 numbers, 1 letter)</p>
                  )}
                </div>
                <div className="relative">
                  <TextInput
                    label="Company FSSAI Number"
                    name="fssai_number"
                    value={companyData.fssai_number}
                    onChange={(e) => {
                      const filteredValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 14);
                      setCompanyData(prev => ({ ...prev, fssai_number: filteredValue }));
                      
                      // Validate FSSAI format with specific error messages
                      if (!filteredValue) {
                        setFssaiError("FSSAI number is required");
                      } else if (filteredValue.length < 14) {
                        setFssaiError("FSSAI number must be exactly 14 digits");
                      } else if (filteredValue.length === 14) {
                        // Validate FSSAI format: First 2 digits are state code (01-37)
                        const stateCode = parseInt(filteredValue.substring(0, 2), 10);
                        if (stateCode < 1 || stateCode > 37) {
                          setFssaiError("Invalid state code in FSSAI number");
                        } else {
                          // Additional validation: Check if it looks like a valid FSSAI
                          // FSSAI format: 2 digit state code + 5 digit district code + 5 digit business code + 2 digit check digits
                          setFssaiError("");
                        }
                      }
                    }}
                    onFocus={() => setShowFssaiReference(true)}
                    onBlur={() => setShowFssaiReference(false)}
                    placeholder="Enter 14-digit FSSAI number"
                    maxLength={14}
                    required={true}
                    error={!!fssaiError}
                  />
                  {fssaiError && (
                    <p className="mt-1 text-sm text-error-500">{fssaiError}</p>
                  )}
                  {showFssaiReference && (
                    <p className="mt-1 text-xs text-gray-500">FSSAI format: 2-digit state code + 5-digit district code + 5-digit business code + 2-digit check digits</p>
                  )}
                </div>
                {companyData.company_type && (
                  companyData.company_type === "llp" || 
                  companyData.company_type === "opc" || 
                  companyData.company_type === "private_limited" || 
                  companyData.company_type === "limited"
                ) && (
                  <>
                    <div className="relative">
                      <TextInput
                        label="TAN Number"
                        name="tan_number"
                        value={companyData.tan_number}
                        onChange={(e) => {
                          const filteredValue = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
                          setCompanyData(prev => ({ ...prev, tan_number: filteredValue }));
                          
                          // Validate TAN format with specific error messages
                          if (!filteredValue) {
                            setTanError("TAN number is required");
                          } else if (filteredValue.length < 10) {
                            setTanError("TAN number must be exactly 10 characters");
                          } else if (filteredValue.length === 10) {
                            // Validate TAN format: AAAA99999A (4 letters, 5 digits, 1 letter)
                            const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
                            
                            // Check if positions 1-4 are alphabets
                            if (!/^[A-Z]{4}/.test(filteredValue)) {
                              setTanError("Alphabets required in positions 1–4 and 10");
                            }
                            // Check if positions 5-9 are digits
                            else if (!/[0-9]{5}/.test(filteredValue.substring(4, 9))) {
                              setTanError("Digits required in positions 5–9");
                            }
                            // Check if position 10 is alphabet
                            else if (!/[A-Z]$/.test(filteredValue)) {
                              setTanError("Alphabets required in positions 1–4 and 10");
                            }
                            // Check overall format
                            else if (!tanRegex.test(filteredValue)) {
                              setTanError("Invalid TAN format (AAAA99999A)");
                            } else {
                              setTanError("");
                            }
                          }
                        }}
                        onFocus={() => setShowTanReference(true)}
                        onBlur={() => setShowTanReference(false)}
                        placeholder="Enter 10-digit TAN number"
                        maxLength={10}
                        required={true}
                        error={!!tanError}
                      />
                      {tanError && (
                        <p className="mt-1 text-sm text-error-500">{tanError}</p>
                      )}
                      {showTanReference && (
                        <p className="mt-1 text-xs text-gray-500">TAN format: AAAA99999A (4 letters, 5 numbers, 1 letter)</p>
                      )}
                    </div>
                    <div className="relative">
                      <TextInput
                        label="CIN Number"
                        name="cin_number"
                        value={companyData.cin_number}
                        onChange={(e) => {
                          const filteredValue = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 21).toUpperCase();
                          setCompanyData(prev => ({ ...prev, cin_number: filteredValue }));
                          // Validate CIN format: 21 characters
                          if (filteredValue.length === 21) {
                            setCinError("");
                          } else if (filteredValue.length > 0) {
                            setCinError("CIN must be exactly 21 characters");
                          } else {
                            setCinError("");
                          }
                        }}
                        onFocus={() => setShowCinReference(true)}
                        onBlur={() => setShowCinReference(false)}
                        placeholder="Enter 21-digit CIN number"
                        maxLength={21}
                        required={true}
                        error={!!cinError}
                      />
                      {cinError && (
                        <p className="mt-1 text-sm text-error-500">{cinError}</p>
                      )}
                      {showCinReference && (
                        <p className="mt-1 text-xs text-gray-500">CIN format: L12345MH2014PTC123456 (21 characters alphanumeric)</p>
                      )}
                    </div>
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
                    className="inline-flex items-center gap-2 px-3 py-2 text-white transition-colors duration-200 bg-green-500 border-0 rounded-full shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                    style={{ backgroundColor: '#10b981' }}
                    title="Add another contact"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                    <span>Add More</span>
                  </button>
                </div>
                {companyData.company_contacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700 text-md">Contact {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        {companyData.company_contacts.length > 1 && index !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="flex items-center justify-center w-8 h-8 text-white border border-red-500 rounded-full hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                            style={{ backgroundColor: '#ef4444' }}
                            title="Remove this contact"
                          >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
                      <CustomSelect
                        label="Type"
                        name={`contact_type_${index}`}
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        className="rounded-lg"
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
                    className="inline-flex items-center gap-2 px-3 py-2 text-white transition-colors duration-200 bg-green-500 border-0 rounded-full shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                    style={{ backgroundColor: '#10b981' }}
                    title="Add another owner"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                    <span>Add More</span>
                  </button>
                </div>
                {companyData.company_owners.map((owner, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700 text-md">Owner {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        {companyData.company_owners.length > 1 && index !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeOwner(index)}
                            className="flex items-center justify-center w-8 h-8 text-white transition-colors duration-200 bg-red-500 border-0 rounded-full shadow-md hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                            style={{ backgroundColor: '#ef4444' }}
                            title="Remove this owner"
                          >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
                        error={!!ownerMobileErrors[index]}
                        errorMessage={ownerMobileErrors[index]}
                      />
                      <TextInput
                        label="Aadhar"
                        name={`owner_aadhar_${index}`}
                        value={owner.aadhar}
                        onChange={(e) => updateOwner(index, 'aadhar', e.target.value)}
                        placeholder="Enter 12-digit Aadhar"
                        maxLength={12}
                        required={true}
                        error={!!ownerAadharErrors[index]}
                        errorMessage={ownerAadharErrors[index]}
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
                <div className="mt-2 text-sm text-error-500">{error}</div>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default EditCompany;