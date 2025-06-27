import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft as faBack,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../../../utils/toastController";
import {
  TextInput,
  DateInput,
  Textarea,
  Checkbox,
  labelStyles,
} from "../../../forms/FormElements";
import Breadcrumb from "../../../Breadcrumb";

function CreateWaiter() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [waiterData, setWaiterData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    aadhar_number: "",
    address: "",
    functionality_ids: [],
  });
  const [validationStates, setValidationStates] = useState({
    name: true,
    email: true,
    mobile: true,
    aadhar_number: true,
  });
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/" },
    { label: "Waiters", path: "/waiters" },
    { label: "Create Waiter", path: "/create-waiter" },
  ];

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        "https://men4u.xyz/v2/admin/get_ubac_functionalities",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setFunctionalities(response.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Failed to load functionalities";
      setError(errorMsg);
      toastController.error(errorMsg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaiterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValidation = (field) => (isValid) => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: isValid,
    }));
  };

  const isFormValid = () => {
    return Object.values(validationStates).every((state) => state);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    if (!isFormValid()) {
      toastController.error("Please fix validation errors before submitting");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const payload = {
        user_id: adminData.user_id,
        outlet_id: Number(outletId),
        name: waiterData.name,
        mobile: waiterData.mobile,
        email: waiterData.email,
        address: waiterData.address,
        aadhar_number: waiterData.aadhar_number,
        dob: waiterData.dob,
        functionality_ids: waiterData.functionality_ids,
        app_source: "admin_dashboard"
      };

      await toastController.promise(
        axios.post("https://men4u.xyz/v2/common/waiter_create", payload, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Creating waiter...",
          success: "Waiter created successfully!",
          error: (err) =>
            err.response?.data?.detail || "Failed to create waiter",
        }
      );

      navigate(-1);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create waiter";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !waiterData.name) {
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
        {/* Header */}
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
              Create Waiter
            </h1>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <TextInput
                label="Full Name"
                name="name"
                value={waiterData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                validationType="name"
                onValidation={handleValidation("name")}
                isSubmitAttempted={isSubmitAttempted}
              />

              <TextInput
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={waiterData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                validationType="mobile"
                onValidation={handleValidation("mobile")}
                isSubmitAttempted={isSubmitAttempted}
              />

              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={waiterData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                validationType="email"
                onValidation={handleValidation("email")}
              />

              <DateInput
                label="Date of Birth"
                name="dob"
                value={waiterData.dob}
                onChange={handleChange}
                placeholder="Select date of birth"
              />

              <TextInput
                label="Aadhar Number"
                name="aadhar_number"
                value={waiterData.aadhar_number}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhar number"
                required
                validationType="aadhar"
                onValidation={handleValidation("aadhar_number")}
                isSubmitAttempted={isSubmitAttempted}
              />
            </div>

            <Textarea
              label="Address"
              name="address"
              value={waiterData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows={3}
            />

            {/* Functionalities */}
            <div>
              <label className={labelStyles}>
                Functionalities
              </label>
              <div className="mt-2 rounded-lg p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-wrap gap-4">
                  {functionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="min-w-[200px] flex-1"
                    >
                      <Checkbox
                        label={func.functionality_name}
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
                          setWaiterData((prev) => ({
                            ...prev,
                            functionality_ids: e.target.checked
                              ? [...prev.functionality_ids, value]
                              : prev.functionality_ids.filter(
                                  (id) => id !== value
                                ),
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateWaiter;