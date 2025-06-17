import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import Form from './forms/Form';

function CreateOwner() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    dob: '',
    aadhar_number: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const payload = {
        user_id: adminData.user_id,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        aadhar_number: formData.aadhar_number,
        dob: formData.dob,
        functionality_ids: [1]
      };

      await axios.post(
        'https://men4u.xyz/v2/admin/create_owner',
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      navigate(-1);
    } catch (error) {
      console.error('Error creating owner:', error);
    }
  };

  // Define form fields configuration
  const formFields = [
    {
      type: 'text',
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter full name',
      required: true,
      fullWidth: true,
    },
    {
      type: 'tel',
      name: 'mobile',
      label: 'Mobile Number',
      placeholder: 'Enter mobile number',
      required: true,
      pattern: '[0-9]{10}',
      fullWidth: true,
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address',
      required: true,
      fullWidth: true,
    },
    {
      type: 'custom',
      name: 'dob',
      component: (
        <div className="w-full">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="h-10 md:h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              required
            />
            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      ),
    },
    {
      type: 'text',
      name: 'aadhar_number',
      label: 'Aadhar Number',
      placeholder: 'Enter 12-digit Aadhar number',
      required: true,
      pattern: '[0-9]{12}',
      fullWidth: true,
    },
    {
      type: 'textarea',
      name: 'address',
      label: 'Address',
      placeholder: 'Enter complete address',
      required: true,
      rows: 3,
      span: 2,
      fullWidth: true,
      className: 'col-span-1 md:col-span-2'
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Form
        title="Create Owner"
        formFields={formFields}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        showCancel={true}
        submitText="Create"
        gridCols={2}
        backButtonLabel="Back"
      />
    </div>
  );
}

export default CreateOwner;