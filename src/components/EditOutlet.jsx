import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { outletId } = useParams();
  
  const [formData, setFormData] = useState({
    outlet_id: '',
    user_id: '',
    owner_id: '',
    name: '',
    outlet_type: '',
    fssainumber: '',
    gstnumber: '',
    mobile: '',
    veg_nonveg: '',
    service_charges: '',
    gst: '',
    address: '',
    is_open: true,
    outlet_status: true,
    upi_id: '',
    website: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    google_business_link: '',
    google_review: '',
    email: '',
    opening_time: '',
    closing_time: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [outletTypes, setOutletTypes] = useState({});
  const [foodTypes, setFoodTypes] = useState({});
  const [owners, setOwners] = useState([]);

  // Fetch outlet data when component mounts
  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchOutletTypes();
      fetchFoodTypes();
      fetchOwners();
      fetchOutletData();
    }
  }, [adminData?.user_id, outletId]);

  const fetchOutletData = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/common/view_outlet",
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet details") {
        const data = response.data.data;
        
        // Update form data with fetched data
        setFormData({
          outlet_id: outletId,
          user_id: data.owner_id,
          owner_id: data.owner_id,
          name: data.name,
          outlet_type: data.outlet_type,
          fssainumber: data.fssainumber,
          gstnumber: data.gstnumber,
          mobile: data.mobile,
          veg_nonveg: data.veg_nonveg,
          service_charges: data.service_charges,
          gst: data.gst,
          address: data.address,
          is_open: data.is_open === 1,
          outlet_status: data.outlet_status === 1,
          upi_id: data.upi_id,
          website: data.website || '',
          whatsapp: data.whatsapp?.replace(/\D/g, '') || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          google_business_link: data.google_business_link || '',
          google_review: data.google_review || '',
          email: data.email || '',
          opening_time: data.opening_time ? data.opening_time.split(' ')[1] : '',
          closing_time: data.closing_time ? data.closing_time.split(' ')[1] : ''
        });

        // If there's an image URL, set it as preview
        if (data.image) {
          setPreviewUrl(data.image);
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching outlet data:', error);
      navigate(-1);
    }
  };

  const fetchOutletTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/common/get_outlet_type',
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet types") {
        setOutletTypes(response.data.outlet_type_list);
      }
    } catch (error) {
      console.error('Error fetching outlet types:', error);
    }
  };

  const fetchFoodTypes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/common/get_food_type_list',
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.food_type_list) {
        setFoodTypes(response.data.food_type_list);
      }
    } catch (error) {
      console.error('Error fetching food types:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setOwners(response.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'whatsapp') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly.slice(0, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Prepare API data with exact field names and format
      const apiData = {
        outlet_id: parseInt(outletId),
        user_id: parseInt(formData.owner_id),
        name: formData.name,
        outlet_type: formData.outlet_type,
        fssainumber: formData.fssainumber,
        gstnumber: formData.gstnumber,
        mobile: formData.mobile,
        veg_nonveg: formData.veg_nonveg,
        service_charges: formData.service_charges.toString(),  // Convert to string
        gst: formData.gst.toString(),  // Convert to string
        address: formData.address,
        is_open: formData.is_open ? 1 : 0,
        outlet_status: formData.outlet_status ? 1 : 0,
        upi_id: formData.upi_id,
        website: formData.website || '',
        whatsapp: formData.whatsapp || '',  // This will be the 10-digit number
        facebook: formData.facebook || '',
        instagram: formData.instagram || '',
        google_business_link: formData.google_business_link || '',
        google_review: formData.google_review || '',
        app_source: "admin_dashboard"
      };

      const response = await axios.patch(
        'https://men4u.xyz/v2/common/update_outlet',
        apiData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.detail === "Outlet information updated successfully") {
        navigate(-1);
      } else {
        throw new Error('Failed to update outlet');
      }
    } catch (error) {
      console.error('Error updating outlet:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold ml-4">Edit Outlet</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Owner *
              </label>
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Owner</option>
                {owners.map((owner) => (
                  <option key={owner.user_id} value={owner.user_id}>
                    {owner.name} ({owner.mobile}) - {owner.account_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Outlet Image */}
            <div className="col-span-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="mx-auto max-h-40 object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Click to select image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, or GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="outlet-image"
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  UPI ID *
                </label>
                <input
                  type="text"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Outlet Type *
                </label>
                <select
                  name="outlet_type"
                  value={formData.outlet_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Outlet Type</option>
                  {Object.entries(outletTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Food Type *
                </label>
                <select
                  name="veg_nonveg"
                  value={formData.veg_nonveg}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Food Type</option>
                  {Object.entries(foodTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Business Details */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Business Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Charges (%)
              </label>
              <input
                type="number"
                name="service_charges"
                value={formData.service_charges}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GST (%)
              </label>
              <input
                type="number"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Opening Time
              </label>
              <input
                type="time"
                name="opening_time"
                value={formData.opening_time}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Closing Time
              </label>
              <input
                type="time"
                name="closing_time"
                value={formData.closing_time}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                FSSAI Number
              </label>
              <input
                type="text"
                name="fssainumber"
                value={formData.fssainumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                type="text"
                name="gstnumber"
                value={formData.gstnumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Social Media & Web Presence */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Social Media & Web Presence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="Enter 10 digit mobile number"
                pattern="[0-9]{10}"
                maxLength={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourhandle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Google Business Link
              </label>
              <input
                type="url"
                name="google_business_link"
                value={formData.google_business_link}
                onChange={handleInputChange}
                placeholder="https://business.google.com/yourpage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Google Review Link
              </label>
              <input
                type="url"
                name="google_review"
                value={formData.google_review}
                onChange={handleInputChange}
                placeholder="https://g.page/r/yourreviewpage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Outlet Status */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Outlet Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_open"
                checked={formData.is_open}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Outlet is currently open
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="outlet_status"
                checked={formData.outlet_status}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Outlet is active
              </label>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 transition rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditOutlet;