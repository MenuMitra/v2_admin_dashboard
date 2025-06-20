import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import {
  TextInput,
  SelectInput,
  FileInput,
  Textarea
} from '../../forms/FormElements';
import Breadcrumb from '../../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

function CreateMenu() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Add state for menu categories
  const [categories, setCategories] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [menuCatId, setMenuCatId] = useState('');
  const [foodType, setFoodType] = useState('veg');
  const [description, setDescription] = useState('');
  const [spicyIndex, setSpicyIndex] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [offer, setOffer] = useState('');
  const [rating, setRating] = useState('');
  const [portionData, setPortionData] = useState([
    { portion_name: '', price: '', unit_value: '', unit_type: '', flag: 1 }
  ]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Ref for form submission from Save button
  const formRef = React.useRef();

  // Update useEffect to remove default category selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        const response = await axios.post(
          'https://men4u.xyz/v2/common/menu_category_list',
          {
            outlet_id: outletId,
            user_id: adminData?.user_id,
            app_source: 'admin_dashboard'
          },
          {
            headers: {
              Authorization: token
            }
          }
        );
        
        // Get categories from the new response format
        const validCategories = response.data.data.menucat_details.filter(
          cat => cat.menu_cat_id !== null
        );
        setCategories(validCategories);
      } catch (err) {
        setError('Failed to load menu categories');
      }
    };

    if (outletId && adminData?.user_id) {
      fetchCategories();
    }
  }, [outletId, adminData?.user_id]);

  // Portion handlers
  const handlePortionChange = (idx, field, value) => {
    setPortionData(prev =>
      prev.map((portion, i) =>
        i === idx ? { ...portion, [field]: value } : portion
      )
    );
  };
  const addPortion = () => {
    setPortionData(prev => [
      ...prev,
      { portion_name: '', price: '', unit_value: '', unit_type: '', flag: 0 }
    ]);
  };
  const removePortion = (idx) => {
    setPortionData(prev => prev.filter((_, i) => i !== idx));
  };

  // Image handlers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('outlet_id', outletId);
      formData.append('menu_cat_id', menuCatId);
      formData.append('user_id', adminData?.user_id);
      formData.append('name', name);
      formData.append('food_type', foodType);
      formData.append('description', description);
      formData.append('spicy_index', spicyIndex);
      formData.append('ingredients', ingredients);
      formData.append('offer', offer);
      formData.append('rating', rating);
      formData.append('app_source', 'admin_dashboard');
      formData.append('portion_data', JSON.stringify(portionData));
      images.forEach((img, idx) => {
        formData.append('images', img);
      });

      const response = await axios.post(
        'https://men4u.xyz/v2/common/menu_create',
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccessMsg(response.data.detail || 'Menu created successfully');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to create menu'
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
          { label: 'Menus', path: `/menus/${outletId}` },
          { label: 'Create Menu' }
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
              Create Menu
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
            encType="multipart/form-data"
          >
            {/* Grid for form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-base">
              <TextInput
                label="Menu Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter menu name"
              />
              <SelectInput
                label="Category"
                required
                value={menuCatId}
                onChange={e => setMenuCatId(e.target.value)}
                options={categories.map(cat => ({
                  value: cat.menu_cat_id.toString(),
                  label: cat.category_name
                }))}
              />
              <SelectInput
                label="Food Type"
                required
                value={foodType}
                onChange={e => setFoodType(e.target.value)}
                options={[
                  { value: 'veg', label: 'Veg' },
                  { value: 'nonveg', label: 'Non-Veg' }
                ]}
              />
              <TextInput
                label="Spicy Index"
                value={spicyIndex}
                onChange={e => setSpicyIndex(e.target.value)}
                placeholder="e.g. 1, 2, 3"
                type="number"
                min="0"
                max="5"
              />
              <TextInput
                label="Offer (%)"
                value={offer}
                onChange={e => setOffer(e.target.value)}
                placeholder="e.g. 10"
                type="number"
                min="0"
                max="100"
              />
              <TextInput
                label="Rating"
                value={rating}
                onChange={e => setRating(e.target.value)}
                placeholder="e.g. 4.5"
                type="number"
                min="0"
                max="5"
                step="0.1"
              />
              <TextInput
                label="Ingredients"
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="e.g. dal, vegetables"
              />
            </div>
            {/* Description field outside the grid */}
            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter menu description"
              rows={3}
            />
            {/* Portion Data */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Portions
              </label>
              {portionData.map((portion, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <TextInput
                    placeholder="Portion Name"
                    value={portion.portion_name}
                    onChange={e => handlePortionChange(idx, 'portion_name', e.target.value)}
                    className="w-32"
                  />
                  <TextInput
                    placeholder="Price"
                    type="number"
                    value={portion.price}
                    onChange={e => handlePortionChange(idx, 'price', e.target.value)}
                    className="w-24"
                  />
                  <TextInput
                    placeholder="Unit Value"
                    value={portion.unit_value}
                    onChange={e => handlePortionChange(idx, 'unit_value', e.target.value)}
                    className="w-24"
                  />
                  <TextInput
                    placeholder="Unit Type"
                    value={portion.unit_type}
                    onChange={e => handlePortionChange(idx, 'unit_type', e.target.value)}
                    className="w-20"
                  />
                  <button
                    type="button"
                    className="text-error-500 hover:text-error-700"
                    onClick={() => removePortion(idx)}
                    disabled={portionData.length === 1}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-full mt-2"
                onClick={addPortion}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add Portion
              </button>
            </div>
            {/* Images */}
            <FileInput
              label="Menu Images (up to 5)"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
            {error && <div className="text-error-500 text-center">{error}</div>}
            {successMsg && <div className="text-success-600 text-center">{successMsg}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
              style={{ display: 'none' }} // Hide the default submit button, use Save in header
            >
              {loading ? 'Creating...' : 'Create Menu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateMenu;