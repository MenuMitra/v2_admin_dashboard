import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';

function CategoryDetails() {
  const { outletId, menuCategoryId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      setError(null);
      try {
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
              Authorization: getToken(),
              'Content-Type': 'application/json',
            },
          }
        );
        setCategory(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch category details');
      } finally {
        setLoading(false);
      }
    };

    if (adminData?.user_id && menuCategoryId && outletId) {
      fetchCategoryDetails();
    }
  }, [adminData?.user_id, menuCategoryId, outletId, getToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      {category.image && (
        <img src={category.image} alt={category.name} className="mb-4 w-32 h-32 object-cover rounded" />
      )}
      <div>Status: {category.is_active ? 'Active' : 'Inactive'}</div>
      <div>Menu Count: {category.menu_count}</div>
      <div>Created On: {category.created_on}</div>
      <div>Created By: {category.created_by}</div>
      {category.updated_on && <div>Updated On: {category.updated_on}</div>}
      {category.updated_by && <div>Updated By: {category.updated_by}</div>}
      {/* You can render menu_list or other details as needed */}
    </div>
  );
}

export default CategoryDetails;