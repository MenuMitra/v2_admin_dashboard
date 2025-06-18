import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import DataTable from '../common/DataTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import DatePickerInput from '../common/DatePickerInput';

function CreatePartner() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [functionalities, setFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dob: '',
    aadhar_number: '',
    address: '',
    functionality_ids: []
  });

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  const fetchFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/admin/get_ubac_functionalities',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      setFunctionalities(response.data);
    } catch (err) {
      console.error('Error fetching functionalities:', err);
      setError('Failed to load functionalities');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Format the date to match API expectation (DD MMM YYYY)
      const date = new Date(formData.dob);
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, ' '); // Ensure proper spacing

      const requestData = {
        user_id: adminData?.user_id,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        dob: formattedDate, // Will output like "12 Jan 2023"
        aadhar_number: formData.aadhar_number,
        address: formData.address,
        functionality_ids: formData.functionality_ids
      };

      console.log('Sending request with data:', requestData); // For debugging

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/create_partner',
        requestData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Partner created successfully") {
        navigate('/partners');
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create partner');
      console.error('Error creating partner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a custom render function for the form
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="p-6 text-left">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="text-left">
          <label className="block text-sm text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Mobile Number */}
        <div className="text-left">
          <label className="block text-sm text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Email Address */}
        <div className="text-left">
          <label className="block text-sm text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {/* Date of Birth */}
        <div className="text-left">
          <DatePickerInput
            label="Date of Birth"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            placeholder="Select date of birth"
            className="w-full"
          />
        </div>

        {/* Aadhar Number */}
        <div className="text-left">
          <label className="block text-sm text-gray-700 mb-1">
            Aadhar Number
          </label>
          <input
            type="text"
            name="aadhar_number"
            value={formData.aadhar_number}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhar number"
            className="w-full px-3 py-2 border rounded-md"
            required
            maxLength="12"
          />
        </div>

        {/* Empty div for grid alignment */}
        <div></div>
      </div>

      {/* Address - Full Width */}
      <div className="mt-6 text-left">
        <label className="block text-sm text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
            rows="3"
          className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

      {/* Functionalities - Full Width */}
      <div className="mt-6 text-left">
        <label className="block text-sm text-gray-700 mb-1">
            Functionalities
          </label>
          <div className="relative">
            <button
              type="button"
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="block truncate">
                {selectedFunctionalities.length > 0
                  ? `${selectedFunctionalities.length} selected`
                  : 'Select functionalities'}
              </span>
            </button>
            
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto border border-gray-300">
                {functionalities.map((func) => (
                  <label
                    key={func.functionality_id}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      value={func.functionality_id}
                      checked={selectedFunctionalities.includes(func.functionality_id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setSelectedFunctionalities(prev =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter(id => id !== value)
                        );
                        setFormData(prev => ({
                          ...prev,
                          functionality_ids: e.target.checked
                            ? [...prev.functionality_ids, value]
                            : prev.functionality_ids.filter(id => id !== value)
                        }));
                      }}
                    />
                    <span className="ml-2">{func.functionality_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {selectedFunctionalities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFunctionalities.map(id => {
                  const func = functionalities.find(f => f.functionality_id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {func?.functionality_name}
                      <button
                        type="button"
                        className="ml-1 inline-flex items-center justify-center"
                        onClick={() => {
                          setSelectedFunctionalities(prev => prev.filter(fid => fid !== id));
                          setFormData(prev => ({
                            ...prev,
                            functionality_ids: prev.functionality_ids.filter(fid => fid !== id)
                          }));
                        }}
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </form>
  );

  if (isLoading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DataTable
        title="Create Partner"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        showSearch={false}  
        showHeader={true}
        enablePagination={false}
        createButton={{
          show: true,
          label: "Create Partner",
          onClick: handleSubmit,
          icon: faPlus,
          className: "bg-brand-500 hover:bg-brand-600",
          position: "right",
          showIconOnly: false,
          disabled: isLoading
        }}
        data={[{ id: 1 }]} // Single item for the form
        columns={[{
          field: 'id',
          header: '',
          render: () => renderForm()
        }]}
      />
    </div>
  );
}

export default CreatePartner;