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
import ImageUploader from '../../common/ImageUploader';

function EditMenu() {
  const { outletId, menuId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Add state for menu categories
  const [categories, setCategories] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [spicyIndexOptions, setSpicyIndexOptions] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [menuCatId, setMenuCatId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [description, setDescription] = useState('');
  const [spicyIndex, setSpicyIndex] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [offer, setOffer] = useState('');
  const [portionData, setPortionData] = useState([
    { portion_name: '', price: '', unit_value: '', unit_type: '', flag: 1 }
  ]);
  const [menuImages, setMenuImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Ref for form submission from Save button
  const formRef = React.useRef();

  // Unit type options
  const unitTypeOptions = [
    { value: 'gm', label: 'Gram (gm)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'pcs', label: 'Pieces (pcs)' }
  ];

  // Fetch existing menu data
  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const token = getToken();
        const response = await axios.post(
          'https://men4u.xyz/v2/common/menu_view',
          {
            menu_id: Number(menuId),
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: 'admin_dashboard',
          },
          {
            headers: {
              Authorization: token,
            }
          }
        );

        const menuData = response.data.detail;
        setName(menuData.name);
        setMenuCatId(menuData.menu_cat_id.toString());
        setFoodType(menuData.food_type);
        setDescription(menuData.description);
        setSpicyIndex(menuData.spicy_index?.toString() || '');
        setIngredients(menuData.ingredients);
        setOffer(menuData.offer?.toString() || '');
        setPortionData(menuData.portions.map((p, idx) => ({
          portion_name: p.portion_name,
          price: p.price.toString(),
          unit_value: p.unit_value,
          unit_type: p.unit_type,
          flag: idx === 0 ? 1 : 0
        })));
      } catch (err) {
        setError('Failed to load menu details');
      }
    };

    if (menuId && outletId && adminData?.user_id) {
      fetchMenuDetails();
    }
  }, [menuId, outletId, adminData?.user_id]);

  // Fetch categories
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

  // Fetch food types
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          'https://men4u.xyz/v2/common/get_food_type_list',
          {
            headers: {
              Authorization: token
            }
          }
        );
        
        const types = Object.entries(response.data.food_type_list).map(([value, label]) => ({
          value,
          label: label.charAt(0).toUpperCase() + label.slice(1)
        }));
        
        setFoodTypes(types);
      } catch (err) {
        setError('Failed to load food types');
      }
    };

    fetchFoodTypes();
  }, []);

  // Fetch spicy index list
  useEffect(() => {
    const fetchSpicyIndexList = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          'https://men4u.xyz/v2/common/get_spicy_index_list',
          {
            headers: {
              Authorization: token
            }
          }
        );
        
        const indexOptions = Object.entries(response.data.spicy_index_list).map(([value, label]) => ({
          value,
          label: `Level ${label}`
        }));
        
        setSpicyIndexOptions(indexOptions);
      } catch (err) {
        setError('Failed to load spicy index options');
      }
    };

    fetchSpicyIndexList();
  }, []);

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
  const handleImagesChange = (newImages) => {
    setMenuImages(newImages);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !menuCatId || !foodType || !portionData[0].portion_name || !portionData[0].price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = getToken();

      // Format portion data
      const validPortionData = portionData.map((portion, index) => ({
        portion_name: portion.portion_name.trim(),
        price: parseInt(portion.price, 10),
        unit_value: portion.unit_value.trim(),
        unit_type: portion.unit_type.trim(),
        flag: index === 0 ? 1 : 0
      }));

      // Create JSON payload instead of FormData
      const jsonPayload = {
        menu_id: Number(menuId),
        outlet_id: Number(outletId),
        menu_cat_id: Number(menuCatId),
        user_id: adminData?.user_id,
        name: name.trim(),
        food_type: foodType,
        description: description.trim(),
        spicy_index: spicyIndex ? spicyIndex.toString() : null,
        ingredients: ingredients.trim(),
        offer: offer ? Number(offer) : 0,
        app_source: 'admin_dashboard',
        portion_data: validPortionData
      };

      // Add console logs to help debug
      console.log('Sending update request with data:', jsonPayload);

      // Make PUT request to update menu with JSON
      const response = await axios.put(
        'https://men4u.xyz/v2/common/menu_update',
        jsonPayload,
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMsg(response.data.detail || 'Menu updated successfully');
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error('Update error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to update menu'
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
          { label: 'Edit Menu' }
        ]}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
              type="button"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Edit Menu
            </h2>
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
                options={foodTypes}
              />
              <SelectInput
                label="Spicy Index"
                value={spicyIndex}
                onChange={e => setSpicyIndex(e.target.value)}
                options={spicyIndexOptions}
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
                <div key={idx} className="mb-4 flex items-start gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 flex-1">
                    <TextInput
                      placeholder="Portion Name"
                      value={portion.portion_name}
                      onChange={e => handlePortionChange(idx, 'portion_name', e.target.value)}
                      required={idx === 0}
                      label={idx === 0 ? "Portion Name" : ""}
                    />
                    <TextInput
                      placeholder="Price"
                      type="number"
                      value={portion.price}
                      onChange={e => handlePortionChange(idx, 'price', e.target.value)}
                      required={idx === 0}
                      min="0"
                      label={idx === 0 ? "Price" : ""}
                    />
                    <TextInput
                      placeholder="Unit Value"
                      type="number"
                      value={portion.unit_value}
                      onChange={e => handlePortionChange(idx, 'unit_value', e.target.value)}
                      required={idx === 0}
                      min="0"
                      label={idx === 0 ? "Unit Value" : ""}
                    />
                    <SelectInput
                      value={portion.unit_type}
                      onChange={e => handlePortionChange(idx, 'unit_type', e.target.value)}
                      options={unitTypeOptions}
                      placeholder="Select Unit"
                      required={idx === 0}
                      label={idx === 0 ? "Unit Type" : ""}
                    />
                  </div>
                  <div className={`pt-${idx === 0 ? '8' : '2'}`}>
                    <button
                      type="button"
                      className="text-error-500 hover:text-error-700 p-2 rounded-full hover:bg-error-50"
                      onClick={() => removePortion(idx)}
                      disabled={portionData.length === 1}
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-full mt-2 shadow-sm"
                onClick={addPortion}
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span>Add Portion</span>
              </button>
            </div>

            {/* Images */}
            <ImageUploader
              maxImages={5}
              outputFormat="formData"
              existingImages={menuImages}
              onImagesChange={handleImagesChange}
              className="mb-4"
              label="Menu Images"
              required={false}
            />

            {error && <div className="text-error-500 text-center">{error}</div>}
            {successMsg && <div className="text-success-600 text-center">{successMsg}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
              style={{ display: 'none' }}
            >
              {loading ? 'Updating...' : 'Update Menu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMenu;