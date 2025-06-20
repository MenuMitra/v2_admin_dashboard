import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import {
  TextInput,
  FileInput,
} from '../../forms/FormElements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../../Breadcrumb';

function EditCategory() {
  const { outletId, menuCategoryId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Ref for form submission from Save button
  const formRef = React.useRef();

  // Fetch current category details for editing
  useEffect(() => {
    // Only fetch if we haven't already set a name (i.e., user hasn't started typing)
    if (!categoryName && adminData?.user_id && menuCategoryId && outletId) {
      const fetchCategory = async () => {
        setLoading(true);
        setError('');
        try {
          const token = getToken();
          const response = await axios.post(
            'https://men4u.xyz/v2/common/menu_category_view',
            {
              menu_cat_id: Number(menuCategoryId),
              outlet_id: Number(outletId),
              user_id: adminData?.user_id,
              app_source: 'admin_dashboard',
            },
            {
              headers: {
                Authorization: token,
                'Content-Type': 'application/json',
              },
            }
          );
          setCategoryName(response.data.data.name || '');
          setImagePreview(response.data.data.image || '');
        } catch (err) {
          setError('Failed to fetch category details');
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
    // eslint-disable-next-line
  }, [adminData?.user_id, menuCategoryId, outletId]);

  // Handle file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('outlet_id', outletId);
      formData.append('menu_cat_id', menuCategoryId);
      formData.append('user_id', adminData?.user_id);
      formData.append('category_name', categoryName);
      formData.append('app_source', 'admin_dashboard');
      formData.append('remove_image_flag', 'True');
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.patch(
        'https://men4u.xyz/v2/common/menu_category_update?remove_image_flag=True',
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccessMsg(response.data.detail || 'Menu Category updated successfully');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to update category'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Outlets', path: '/outlets' },
          { label: 'Categories', path: `/outlets/${outletId}/categories` },
          { label: 'Edit Category' }
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
              type="button"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Edit Category
            </h2>

            {/* Save Button */}
            <button
              onClick={() => formRef.current?.requestSubmit()}
              disabled={loading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              type="button"
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <TextInput
              label="Category Name"
              required
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
            <FileInput
              label="Category Image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border mx-auto"
              />
            )}
            {error && <div className="text-error-500 text-center">{error}</div>}
            {successMsg && <div className="text-success-600 text-center">{successMsg}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
              style={{ display: 'none' }} // Hide the default submit button, use Save in header
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;