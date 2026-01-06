import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import axios from "axios";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { toastController } from "../../utils/toastController";
import { validationPatterns } from "../../utils/validationPatterns";
import {
  TextInput,
  SelectInput,
} from "../forms/FormElements.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faTrash, faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import CustomSelect from "../common/CustomSelect";
import { API_CONFIG } from "../../config/appConfig";

function CreateCompany() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { BASE_URL } = API_CONFIG;

  const [ownerData, setOwnerData] = useState({
    company_name: "",
    pan_number: "",
    fssai_number: "",
    tan_number: "",
    cin_number: "",
    company_type: "",
    company_contacts: [
      {
        email: "",
        contact_number: "",
        type: "head_office",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pin: "",
        landmark: "",
      },
    ],
    company_owners: [
      {
        name: "",
        mobile: "",
        aadhar: "",
        pan: "",
        email: "",
        address: "",
      },
    ],
  });

  // Validation states
  const [emailValidationErrors, setEmailValidationErrors] = useState({});
  const [ownerEmailValidationErrors, setOwnerEmailValidationErrors] = useState({});
  const [companyNameError, setCompanyNameError] = useState("");
  const [ownerAadharErrors, setOwnerAadharErrors] = useState({});
  const [ownerNameErrors, setOwnerNameErrors] = useState({});
  const [ownerMobileErrors, setOwnerMobileErrors] = useState({});
  const [contactNumberErrors, setContactNumberErrors] = useState({});
  const [cityErrors, setCityErrors] = useState({});
  const [pinErrors, setPinErrors] = useState({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Companies", path: "/companies" },
    { label: "Create Company", path: "/create-company" },
  ];

  // Fetch data on component mount
  useEffect(() => {
    // Component initialization if needed
  }, []);

  // Contact functions
  const addContact = () => {
    setOwnerData((prev) => ({
      ...prev,
      company_contacts: [
        ...prev.company_contacts,
        {
          email: "",
          contact_number: "",
          type: "head_office",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pin: "",
          landmark: "",
        },
      ],
    }));
  };

  const removeContact = (index) => {
    if (ownerData.company_contacts.length > 1) {
      setOwnerData((prev) => ({
        ...prev,
        company_contacts: prev.company_contacts.filter((_, i) => i !== index),
      }));
    }
  };

  const updateContactField = (index, field, value) => {
    // Validate Contact Number field - prevent numbers starting with 0-5
    if (field === "contact_number") {
      // Remove all non-digit characters
      const filteredValue = value.replace(/[^0-9]/g, '');
      
      // Check if the first digit is invalid (0-5) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
          // Don't update the value and show error
          setContactNumberErrors((prev) => ({
            ...prev,
            [index]: "Contact number must start with 6, 7, 8, or 9",
          }));
          setTimeout(() => {
            setContactNumberErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setContactNumberErrors((prev) => {
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
        setContactNumberErrors((prev) => ({
          ...prev,
          [index]: "Only numbers are allowed in contact number",
        }));
        setTimeout(() => {
          setContactNumberErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      }
      
      setOwnerData((prev) => ({
        ...prev,
        company_contacts: prev.company_contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: finalValue } : contact
        ),
      }));
      return;
    }

    // Validate City field
    if (field === "city") {
      const filteredValue = value.replace(/[^A-Za-z ]/g, "");
      if (value !== filteredValue) {
        setCityErrors((prev) => ({
          ...prev,
          [index]: "City can only contain letters and spaces",
        }));
        setTimeout(() => {
          setCityErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      } else {
        setCityErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
      setOwnerData((prev) => ({
        ...prev,
        company_contacts: prev.company_contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: filteredValue } : contact
        ),
      }));
      return;
    }

    // Validate PIN Code field
    if (field === "pin") {
      const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      if (value !== filteredValue) {
        setPinErrors((prev) => ({
          ...prev,
          [index]: "PIN code can only contain numbers",
        }));
        setTimeout(() => {
          setPinErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      } else {
        setPinErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
      setOwnerData((prev) => ({
        ...prev,
        company_contacts: prev.company_contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: filteredValue } : contact
        ),
      }));
      return;
    }

    setOwnerData((prev) => ({
      ...prev,
      company_contacts: prev.company_contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  // Owner functions
  const addOwner = () => {
    setOwnerData((prev) => ({
      ...prev,
      company_owners: [
        ...prev.company_owners,
        {
          name: "",
          mobile: "",
          aadhar: "",
          pan: "",
          email: "",
          address: "",
        },
      ],
    }));
  };

  const removeOwner = (index) => {
    if (ownerData.company_owners.length > 1) {
      setOwnerData((prev) => ({
        ...prev,
        company_owners: prev.company_owners.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOwner = (index, field, value) => {
    // Validate Aadhar field - prevent numbers starting with 0 or 1
    if (field === "aadhar") {
      // Remove all non-digit characters
      const filteredValue = value.replace(/\D/g, '');
      
      // Check if the first digit is invalid (0 or 1) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (["0", "1"].includes(firstDigit)) {
          // Don't update the value and show error
          setOwnerAadharErrors((prev) => ({
            ...prev,
            [index]: "Aadhar number cannot start with 0 or 1",
          }));
          setTimeout(() => {
            setOwnerAadharErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setOwnerAadharErrors((prev) => {
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
        setOwnerAadharErrors((prev) => ({
          ...prev,
          [index]: "Only numbers are allowed in Aadhar number",
        }));
        setTimeout(() => {
          setOwnerAadharErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      }
      
      setOwnerData((prev) => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: finalValue } : owner
        ),
      }));
      return;
    }

    // Validate Name field
    if (field === "name") {
      const filteredValue = value.replace(/[^A-Za-z ]/g, "");
      if (value !== filteredValue) {
        setOwnerNameErrors((prev) => ({
          ...prev,
          [index]: "Only letters and spaces are allowed in name",
        }));
        setTimeout(() => {
          setOwnerNameErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      } else {
        setOwnerNameErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
      setOwnerData((prev) => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: filteredValue } : owner
        ),
      }));
      return;
    }

    // Validate Owner Mobile field - prevent numbers starting with 0-5
    if (field === "mobile") {
      // Remove all non-digit characters
      const filteredValue = value.replace(/[^0-9]/g, '');
      
      // Check if the first digit is invalid (0-5) and prevent input
      if (filteredValue.length > 0) {
        const firstDigit = filteredValue.charAt(0);
        if (["0", "1", "2", "3", "4", "5"].includes(firstDigit)) {
          // Don't update the value and show error
          setOwnerMobileErrors((prev) => ({
            ...prev,
            [index]: "Mobile number must start with 6, 7, 8, or 9",
          }));
          setTimeout(() => {
            setOwnerMobileErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[index];
              return newErrors;
            });
          }, 3000);
          return; // Don't update the state with invalid value
        } else {
          // Clear any existing error for this field
          setOwnerMobileErrors((prev) => {
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
        setOwnerMobileErrors((prev) => ({
          ...prev,
          [index]: "Only numbers are allowed in mobile number",
        }));
        setTimeout(() => {
          setOwnerMobileErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }, 2000);
      }
      
      setOwnerData((prev) => ({
        ...prev,
        company_owners: prev.company_owners.map((owner, i) =>
          i === index ? { ...owner, [field]: finalValue } : owner
        ),
      }));
      return;
    }

    setOwnerData((prev) => ({
      ...prev,
      company_owners: prev.company_owners.map((owner, i) =>
        i === index ? { ...owner, [field]: value } : owner
      ),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "company_name") {
      setCompanyNameError("");
    }

    if (name === "pan_number") {
      const filteredValue = value.replace(/[^A-Z0-9]/g, "").slice(0, 10);
      setOwnerData((prev) => ({ ...prev, [name]: filteredValue }));
      return;
    } else {
      setOwnerData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const isFormValid = () => {
    // Basic company info
    if (
      !ownerData.company_name?.trim() ||
      !ownerData.company_type ||
      !ownerData.pan_number?.trim() ||
      !ownerData.fssai_number?.trim()
    ) {
      return false;
    }

    // PAN and FSSAI are always required
    if (!ownerData.pan_number?.trim() || !ownerData.fssai_number?.trim()) {
      return false;
    }

    // TAN and CIN required for specific company types
    const needsTanCin = ["llp", "opc", "private_limited", "limited"].includes(
      ownerData.company_type
    );
    if (
      needsTanCin &&
      (!ownerData.tan_number?.trim() || !ownerData.cin_number?.trim())
    ) {
      return false;
    }

    // At least one contact with all required fields
    const contactsValid = ownerData.company_contacts.every(
      (c) =>
        c.email?.trim() &&
        c.contact_number?.trim() &&
        c.type?.trim() &&
        c.address_line1?.trim() &&
        c.city?.trim() &&
        c.state?.trim() &&
        c.pin?.trim()
    );
    if (ownerData.company_contacts.length === 0) {
      return false;
    }
    if (!contactsValid) {
      return false;
    }

    // At least one owner with all required fields
    const ownersValid = ownerData.company_owners.every(
      (o) =>
        o.name?.trim() &&
        o.mobile?.trim() &&
        o.aadhar?.trim() &&
        o.aadhar.trim().length === 12 &&
        o.pan?.trim() &&
        o.email?.trim() &&
        o.address?.trim()
    );
    if (ownerData.company_owners.length === 0) {
      return false;
    }
    if (!ownersValid) {
      return false;
    }

    // Check validation errors
    if (
      Object.keys(emailValidationErrors).some((key) => emailValidationErrors[key]) ||
      Object.keys(ownerEmailValidationErrors).some((key) => ownerEmailValidationErrors[key]) ||
      Object.keys(ownerAadharErrors).length > 0 ||
      Object.keys(ownerNameErrors).length > 0 ||
      Object.keys(ownerMobileErrors).length > 0 ||
      Object.keys(contactNumberErrors).length > 0 ||
      Object.keys(cityErrors).length > 0 ||
      Object.keys(pinErrors).length > 0
    ) {
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setOwnerData({
      company_name: "",
      pan_number: "",
      fssai_number: "",
      tan_number: "",
      cin_number: "",
      company_type: "",
      company_contacts: [
        {
          email: "",
          contact_number: "",
          type: "head_office",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pin: "",
          landmark: "",
        },
      ],
      company_owners: [
        {
          name: "",
          mobile: "",
          aadhar: "",
          pan: "",
          email: "",
          address: "",
        },
      ],
    });
  };

  const handleSubmit = async (e, stayOnPage = false) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    setError(null);

    if (!isFormValid()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsLoading(true);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const payload = {
        app_source: "admin_panel",
        user_id: 440, // Use hardcoded user_id as per requirements
        company_name: ownerData.company_name,
        company_type: ownerData.company_type,
        pan: ownerData.pan_number,
        fssai: ownerData.fssai_number,
        tan: ownerData.tan_number || "",
        cin: ownerData.cin_number || "",
        contact_details: ownerData.company_contacts.map((contact) => ({
          email: contact.email,
          contact_number: contact.contact_number,
          type: contact.type || "head_office",
          address_line1: contact.address_line1,
          address_line2: contact.address_line2,
          city: contact.city,
          state: contact.state,
          pin: contact.pin,
          landmark: contact.landmark,
        })),
        owners: ownerData.company_owners.map((owner) => ({
          name: owner.name,
          mobile: owner.mobile,
          aadhar: owner.aadhar,
          pan: owner.pan,
          email: owner.email,
          address: owner.address,
        })),
      };

      console.log('Create company payload:', JSON.stringify(payload, null, 2));

      await toastController.promise(
        axios.post(`${BASE_URL}/admin/create_company`, payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating company...",
          success: "Company created successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to create company",
        }
      );

      // Invalidate the companies cache to refresh companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });

      if (stayOnPage) {
        resetForm();
      } else {
        navigate(-1);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Failed to create company";
      setError(errorMsg);
      toastController.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndAddMore = (e) => {
    handleSubmit(e, true);
  };

  if (isLoading && !ownerData.company_name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800">
              Create Company
            </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${isLoading || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-success-500 hover:bg-success-600"}
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>{isLoading ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Company Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-3">
              <TextInput
                label="Company Name"
                name="company_name"
                value={ownerData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                error={!!companyNameError}
                errorMessage={companyNameError}
                isSubmitAttempted={isSubmitAttempted}
              />

              <CustomSelect
                label="Company Type"
                name="company_type"
                value={ownerData.company_type}
                onChange={handleChange}
                placeholder="Select Company Type"
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
              />

              {ownerData.company_type && (
                <>
                  <TextInput
                    label="Company PAN Number"
                    name="pan_number"
                    value={ownerData.pan_number}
                    onChange={handleChange}
                    placeholder="Enter 10-digit PAN number"
                    required
                    maxLength={10}
                  />

                  <TextInput
                    label="Company FSSAI Number"
                    name="fssai_number"
                    value={ownerData.fssai_number}
                    onChange={handleChange}
                    placeholder="Enter 14-digit FSSAI number"
                    required
                    maxLength={14}
                  />
                </>
              )}

              {ownerData.company_type &&
                ["llp", "opc", "private_limited", "limited"].includes(
                  ownerData.company_type
                ) && (
                  <>
                    <TextInput
                      label="TAN Number"
                      name="tan_number"
                      value={ownerData.tan_number}
                      onChange={handleChange}
                      placeholder="Enter 10-digit TAN number"
                      required={true}
                      maxLength={10}
                    />

                    <TextInput
                      label="CIN Number"
                      name="cin_number"
                      value={ownerData.cin_number}
                      onChange={handleChange}
                      placeholder="Enter 21-digit CIN number"
                      required={true}
                      maxLength={21}
                    />
                  </>
                )}
            </div>

            {/* Company Contacts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Company Contacts
                </h2>
                <button
                  type="button"
                  onClick={addContact}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 border-0"
                  style={{ backgroundColor: "#10b981" }}
                  title="Add another contact"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                  <span>Add More</span>
                </button>
              </div>

              {ownerData.company_contacts.map((contact, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-gray-700">
                      Contact {index + 1}
                    </h3>
                    {ownerData.company_contacts.length > 1 && index !== 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-md hover:shadow-lg transition-colors duration-200"
                          style={{ backgroundColor: "#ef4444" }}
                          title="Remove this contact"
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-5">
                    <TextInput
                      label="Email"
                      name={`contact_email_${index}`}
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        updateContactField(index, "email", e.target.value)
                      }
                      placeholder="Enter email address"
                      required={true}
                      validationType="email"
                      validationRules={{
                        pattern: validationPatterns.email.pattern,
                        patternMessage: validationPatterns.email.message,
                      }}
                      onValidation={(isValid) => {
                        setEmailValidationErrors((prev) => ({
                          ...prev,
                          [`contact_${index}`]: !isValid,
                        }));
                      }}
                      errorMessage={emailValidationErrors[`contact_${index}`]}
                      error={!!emailValidationErrors[`contact_${index}`]}
                    />

                    <TextInput
                      label="Contact Number"
                      name={`contact_number_${index}`}
                      value={contact.contact_number}
                      onChange={(e) =>
                        updateContactField(index, "contact_number", e.target.value)
                      }
                      placeholder="Enter contact number"
                      required
                      maxLength={10}
                      error={!!contactNumberErrors[index]}
                      errorMessage={contactNumberErrors[index]}
                    />

                    <CustomSelect
                      label="Type"
                      name={`contact_type_${index}`}
                      value={contact.type}
                      onChange={(e) =>
                        updateContactField(index, "type", e.target.value)
                      }
                      placeholder="Select Contact Type"
                      required={true}
                      className="rounded-lg"
                      options={[
                        { value: "head_office", label: "Head Office" },
                        { value: "branch_office", label: "Branch Office" },
                        { value: "registered_office", label: "Registered Office" },
                        { value: "working_office", label: "Working Office" },
                      ]}
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    <TextInput
                      label="Address Line 1"
                      name={`address_line1_${index}`}
                      value={contact.address_line1}
                      onChange={(e) =>
                        updateContactField(index, "address_line1", e.target.value)
                      }
                      placeholder="Enter address line 1"
                      required={true}
                    />

                    <TextInput
                      label="Address Line 2"
                      name={`address_line2_${index}`}
                      value={contact.address_line2}
                      onChange={(e) =>
                        updateContactField(index, "address_line2", e.target.value)
                      }
                      placeholder="Enter address line 2"
                    />

                    <TextInput
                      label="Landmark"
                      name={`landmark_${index}`}
                      value={contact.landmark}
                      onChange={(e) =>
                        updateContactField(index, "landmark", e.target.value)
                      }
                      placeholder="Enter landmark"
                    />

                    <TextInput
                      label="City"
                      name={`city_${index}`}
                      value={contact.city}
                      onChange={(e) =>
                        updateContactField(index, "city", e.target.value)
                      }
                      placeholder="Enter city"
                      required
                      error={!!cityErrors[index]}
                      errorMessage={cityErrors[index]}
                    />

                    <TextInput
                      label="PIN Code"
                      name={`pin_${index}`}
                      value={contact.pin}
                      onChange={(e) =>
                        updateContactField(index, "pin", e.target.value)
                      }
                      placeholder="Enter PIN code"
                      required
                      maxLength={6}
                      error={!!pinErrors[index]}
                      errorMessage={pinErrors[index]}
                    />

                    <CustomSelect
                      label="State"
                      name={`state_${index}`}
                      value={contact.state}
                      onChange={(e) =>
                        updateContactField(index, "state", e.target.value)
                      }
                      placeholder="Select state"
                      required={true}
                      className="rounded-lg"
                      options={[
                        { value: "AN", label: "Andaman and Nicobar Islands" },
                        { value: "AP", label: "Andhra Pradesh" },
                        { value: "AR", label: "Arunachal Pradesh" },
                        { value: "AS", label: "Assam" },
                        { value: "BR", label: "Bihar" },
                        { value: "CH", label: "Chandigarh" },
                        { value: "CT", label: "Chhattisgarh" },
                        { value: "DN", label: "Dadra and Nagar Haveli and Daman and Diu" },
                        { value: "DL", label: "Delhi" },
                        { value: "GA", label: "Goa" },
                        { value: "GJ", label: "Gujarat" },
                        { value: "HR", label: "Haryana" },
                        { value: "HP", label: "Himachal Pradesh" },
                        { value: "JK", label: "Jammu and Kashmir" },
                        { value: "JH", label: "Jharkhand" },
                        { value: "KA", label: "Karnataka" },
                        { value: "KL", label: "Kerala" },
                        { value: "LA", label: "Ladakh" },
                        { value: "LD", label: "Lakshadweep" },
                        { value: "MP", label: "Madhya Pradesh" },
                        { value: "MH", label: "Maharashtra" },
                        { value: "MN", label: "Manipur" },
                        { value: "ML", label: "Meghalaya" },
                        { value: "MZ", label: "Mizoram" },
                        { value: "NL", label: "Nagaland" },
                        { value: "OR", label: "Odisha" },
                        { value: "PY", label: "Puducherry" },
                        { value: "PB", label: "Punjab" },
                        { value: "RJ", label: "Rajasthan" },
                        { value: "SK", label: "Sikkim" },
                        { value: "TN", label: "Tamil Nadu" },
                        { value: "TS", label: "Telangana" },
                        { value: "TR", label: "Tripura" },
                        { value: "UK", label: "Uttarakhand" },
                        { value: "UP", label: "Uttar Pradesh" },
                        { value: "WB", label: "West Bengal" },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Company Owners Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Company Owners
                </h2>
                <button
                  type="button"
                  onClick={addOwner}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 border-0"
                  style={{ backgroundColor: "#10b981" }}
                  title="Add another owner"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
                  <span>Add More</span>
                </button>
              </div>

              {ownerData.company_owners.map((owner, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-medium text-gray-700">
                      Owner {index + 1}
                    </h3>
                    {ownerData.company_owners.length > 1 && index !== 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeOwner(index)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-md hover:shadow-lg transition-colors duration-200"
                          style={{ backgroundColor: "#ef4444" }}
                          title="Remove this owner"
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-5">
                    <TextInput
                      label="Name"
                      name={`owner_name_${index}`}
                      value={owner.name}
                      onChange={(e) =>
                        updateOwner(index, "name", e.target.value)
                      }
                      placeholder="Enter owner name"
                      required
                      error={!!ownerNameErrors[index]}
                      errorMessage={ownerNameErrors[index]}
                    />

                    <TextInput
                      label="Mobile"
                      name={`owner_mobile_${index}`}
                      type="tel"
                      value={owner.mobile}
                      onChange={(e) =>
                        updateOwner(index, "mobile", e.target.value)
                      }
                      placeholder="Enter mobile number"
                      required
                      maxLength={10}
                      error={!!ownerMobileErrors[index]}
                      errorMessage={ownerMobileErrors[index]}
                    />

                    <TextInput
                      label="Aadhar"
                      name={`owner_aadhar_${index}`}
                      value={owner.aadhar}
                      onChange={(e) =>
                        updateOwner(index, "aadhar", e.target.value)
                      }
                      placeholder="Enter 12-digit Aadhar"
                      required
                      maxLength={12}
                      error={!!ownerAadharErrors[index]}
                      errorMessage={ownerAadharErrors[index]}
                    />

                    <TextInput
                      label="PAN"
                      name={`owner_pan_${index}`}
                      value={owner.pan}
                      onChange={(e) =>
                        updateOwner(index, "pan", e.target.value)
                      }
                      placeholder="Enter 10-digit PAN"
                      required
                      maxLength={10}
                    />

                    <TextInput
                      label="Email"
                      name={`owner_email_${index}`}
                      type="email"
                      value={owner.email}
                      onChange={(e) =>
                        updateOwner(index, "email", e.target.value)
                      }
                      placeholder="Enter email address"
                      required
                      validationType="email"
                      validationRules={{
                        pattern: validationPatterns.email.pattern,
                        patternMessage: validationPatterns.email.message,
                      }}
                      onValidation={(isValid) => {
                        setOwnerEmailValidationErrors((prev) => ({
                          ...prev,
                          [`owner_${index}`]: !isValid,
                        }));
                      }}
                      errorMessage={ownerEmailValidationErrors[`owner_${index}`]}
                      error={!!ownerEmailValidationErrors[`owner_${index}`]}
                    />

                    <TextInput
                      label="Address"
                      name={`owner_address_${index}`}
                      value={owner.address}
                      onChange={(e) =>
                        updateOwner(index, "address", e.target.value)
                      }
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateCompany;