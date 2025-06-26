import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack, faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../../Breadcrumb";
import { TextInput, DateInput, SelectInput } from "../../../forms/FormElements";

function EditManager() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableFunctionalities, setAvailableFunctionalities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    aadhar_number: "",
    dob: "",
    functionality_ids: [],
    role: "manager"
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchFunctionalities = async () => {
    try {
      const response = await axios.get(
        "https://men4u.xyz/v2/admin/get_ubac_functionalities",
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setAvailableFunctionalities(response.data);
    } catch (err) {
      console.error("Failed to fetch functionalities:", err);
      setError("Failed to load functionalities");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "https://men4u.xyz/v2/common/list_roles",
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setRoles(response.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError("Failed to load roles");
    }
  };

  useEffect(() => {
    Promise.all([fetchManagerDetails(), fetchFunctionalities(), fetchRoles()]).finally(() => {
      setLoading(false);
    });
  }, [outletId, userId]);

  const fetchManagerDetails = async () => {
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/manager_view",
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      
      const managerData = response.data.detail;
      setFormData({
        name: managerData.name || "",
        mobile: managerData.mobile || "",
        email: managerData.email || "",
        address: managerData.address || "",
        aadhar_number: managerData.aadhar_number || "",
        dob: managerData.dob || "",
        functionality_ids: managerData.functionalities?.map(f => f.functionality_id) || [],
        role: "manager"
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch manager details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.patch(
        "https://men4u.xyz/v2/common/manager_update",
        {
          update_user_id: adminData?.user_id,
          user_id: Number(userId),
          outlet_id: Number(outletId),
          ...formData,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      navigate(`/manager-details/${outletId}/${userId}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update manager");
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Managers", path: "/managers" },
    { label: "Manager Details", path: `/manager-details/${outletId}/${userId}` },
    { label: "Edit Manager" },
  ];

  const filteredFunctionalities = availableFunctionalities.filter(func =>
    func.functionality_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
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
              Edit Manager
            </h1>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-brand-500 hover:bg-brand-600 
                transition shadow-sm
                ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 text-error-500 text-center">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <TextInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <TextInput
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              required
              pattern="[0-9]{10}"
            />

            <TextInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <TextInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />

            <TextInput
              label="Aadhar Number"
              name="aadhar_number"
              value={formData.aadhar_number}
              onChange={handleInputChange}
              pattern="[0-9]{12}"
              required
            />

            <DateInput
              label="Date of Birth"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />

            <SelectInput
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              options={roles.map(role => ({
                value: role.role_name,
                label: role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)
              }))}
              placeholder="Select Role"
            />

            {/* Functionalities Dropdown */}
            <div className="relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                <span className="text-error-600">*</span> Select Functionalities
              </label>
              
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  {formData.functionality_ids.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formData.functionality_ids.length} Functionality(s) Selected
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-gray-500">Select Functionalities</div>
                  )}
                </div>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div 
                    className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                    style={{
                      width: '100%',
                      minWidth: '300px',
                      maxHeight: '350px',
                      overflowY: 'auto'
                    }}
                  >
                    {/* Search Bar */}
                    <div className="sticky top-0 p-2 border-b bg-white">
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Search functionalities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {/* Functionalities List */}
                    <div className="overflow-y-auto">
                      {filteredFunctionalities.map((func) => (
                        <div
                          key={func.functionality_id}
                          className={`
                            p-3 cursor-pointer hover:bg-gray-50
                            ${formData.functionality_ids.includes(func.functionality_id)
                              ? 'bg-brand-50 border-l-4 border-brand-500' 
                              : 'border-l-4 border-transparent'
                            }
                          `}
                          onClick={() => {
                            const newIds = formData.functionality_ids.includes(func.functionality_id)
                              ? formData.functionality_ids.filter(id => id !== func.functionality_id)
                              : [...formData.functionality_ids, func.functionality_id];
                            
                            setFormData(prev => ({
                              ...prev,
                              functionality_ids: newIds
                            }));
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={formData.functionality_ids.includes(func.functionality_id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({
                                  ...prev,
                                  functionality_ids: e.target.checked
                                    ? [...prev.functionality_ids, func.functionality_id]
                                    : prev.functionality_ids.filter(id => id !== func.functionality_id)
                                }));
                              }}
                              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                            />
                            <div className="font-medium text-gray-900">
                              {func.functionality_name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditManager;