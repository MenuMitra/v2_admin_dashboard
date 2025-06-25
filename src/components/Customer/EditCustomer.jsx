import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import { TextInput, SelectInput, ToggleSwitch } from '../forms/FormElements';
import { toastController } from '../../utils/toastController';

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    role: 'customer',
    address: '',
    is_active: true
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/admin/customer_view",
        {
          user_id: Number(customerId),
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      const { customer_details } = response.data;
      setFormData({
        name: customer_details.name || '',
        mobile: customer_details.mobile || '',
        email: customer_details.email || '',
        role: customer_details.role || 'customer',
        address: customer_details.address || '',
        is_active: customer_details.is_active === 1
      });
    } catch (err) {
      toastController.error(err.response?.data?.msg || "Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        'https://men4u.xyz/v2/admin/customer_update',
        {
          user_id: adminData?.user_id,
          customer_id: customerId,
          app_source: "admin_dashboard",
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email || null,
          role: formData.role,
          address: formData.address || null,
          is_active: formData.is_active ? 1 : 0
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      toastController.success("Customer updated successfully");
      navigate(-1);
    } catch (error) {
      toastController.error(error.response?.data?.msg || "Failed to update customer");
    } finally {
      setLoading(false);
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
    { label: "Customers", path: "/customer" },
    { label: "Edit Customer" }
  ];

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
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Edit Customer
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter customer name"
            />

            <TextInput
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              required
              placeholder="Enter mobile number"
              validationType="phone"
            />

            <TextInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              validationType="email"
            />

            <TextInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
            />

            <SelectInput
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={[
                { value: 'customer', label: 'Customer' }
              ]}
              disabled
            />

            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-3">Status</label>
              <ToggleSwitch
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-500">
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
              ) : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomer;