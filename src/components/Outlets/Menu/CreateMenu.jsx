import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import {
  TextInput,
  SelectInput,
  FileInput,
  Textarea
} from '../../forms/FormElements';
import Breadcrumb from '../../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faChevronLeft as faBack, faPlus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toastController } from '../../../utils/toastController';
import { API_CONFIG } from '../../../config/appConfig';

function CreateMenu() {
  const { outletId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const outletName = location.state?.outletName || '';
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Add state for menu categories
  const [categories, setCategories] = useState([]);

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
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Ref for form submission from Save button
  const formRef = React.useRef();

  // Add state for food types
  const [foodTypes, setFoodTypes] = useState([]);

  // Add state for spicy index options
  const [spicyIndexOptions, setSpicyIndexOptions] = useState([]);

  // Add unit type options
  const unitTypeOptions = [
    { value: 'gm', label: 'Gram (gm)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'pcs', label: 'Pieces (pcs)' }
  ];

  // Add file input ref
  const fileInputRef = React.useRef(null);

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    
    if (images.length + files.length > maxImages) {
      toastController.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));

    if (validFiles.length === 0) {
      toastController.error('Please select valid image files (JPEG, PNG, or WebP)');
      return;
    }

    try {
      const base64Array = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return base64;
        })
      );

      setImages(prev => [...prev, ...base64Array]);
      setPreviews(prev => [...prev, ...base64Array]);
    } catch (error) {
      
      toastController.error('Error processing images');
    }

    // Clear input value to allow selecting same file again
    e.target.value = '';
  };

  // Remove image handler
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Update useEffect to remove default category selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getToken();
        const response = await axios.post(
          `${BASE_URL}/common/menu_category_list`,
          {
            outlet_id: outletId,
            user_id: adminData?.user_id,
            app_source: 'admin_app'
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
        toastController.error('Failed to load menu categories');
        setError('Failed to load menu categories');
      }
    };

    if (outletId && adminData?.user_id) {
      fetchCategories();
    }
  }, [outletId, adminData?.user_id]);

  // Add new useEffect for fetching food types
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${BASE_URL}/common/get_list/food_type`,
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
        toastController.error('Failed to load food types');
        setError('Failed to load food types');
      }
    };

    fetchFoodTypes();
  }, []); // Empty dependency array as this only needs to run once

  // Add new useEffect for fetching spicy index list
  useEffect(() => {
    const fetchSpicyIndexList = async () => {
      try {
        const token = getToken();
        const response = await axios.get(
          `${BASE_URL}/common/get_list/spicy_index`,
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
        toastController.error('Failed to load spicy index options');
        setError('Failed to load spicy index options');
      }
    };

    fetchSpicyIndexList();
  }, []); // Empty dependency array as this only needs to run once

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

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !menuCatId || !foodType) {
      toastController.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    // Add validation for portion prices
    const missingPrices = portionData.some(portion => !portion.price);
    if (missingPrices) {
      toastController.error('Price is required for all portions');
      setError('Price is required for all portions');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = getToken();

      // Construct the JSON payload
      const payload = {
        outlet_id: outletId,
        menu_cat_id: menuCatId,
        user_id: adminData?.user_id,
        name: name.trim(),
        food_type: foodType,
        description: description.trim(),
        spicy_index: spicyIndex,
        ingredients: ingredients.trim(),
        offer: offer || '0',
        app_source: 'admin_app',
        portion_data: portionData.map((portion, index) => ({
          portion_name: portion.portion_name.trim(),
          price: parseInt(portion.price, 10),
          unit_value: portion.unit_value.trim(),
          unit_type: portion.unit_type.trim(),
          flag: index === 0 ? 1 : 0
        })),
        images: images // This will now directly receive base64 strings from ImageUploader
      };

      const response = await axios.post(
        `${BASE_URL}/common/menu_create`,
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      toastController.success('Menu created successfully');
      setSuccessMsg(response.data.detail || 'Menu created successfully');
      // Invalidate menus cache to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.list(outletId) });
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Failed to create menu';
      toastController.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', path: '/home' },
          { label: 'Outlets', path: '/outlets' },
          { label: outletName, path: `/view-outlet/${outletId}` },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter menu description"
              rows={3}
            />
            </div>
            </div>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Menu Images
              </label>
              
              {/* Image Upload Area */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className={`
                    flex flex-col items-center justify-center w-full h-64 
                    border-2 border-dashed rounded-lg cursor-pointer 
                    border-gray-300 bg-gray-50 hover:bg-gray-100
                    dark:hover:bg-gray-800 dark:bg-gray-700 
                    dark:border-gray-600 dark:hover:border-gray-500 
                    transition-all duration-200
                    ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => {
                    if (images.length >= 5) {
                      e.preventDefault();
                      toastController.warning('Maximum 5 images allowed');
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg 
                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" 
                      aria-hidden="true" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 20 16"
                    >
                      <path 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      {images.length >= 5 ? (
                        <span className="font-semibold text-error-500">Maximum limit reached</span>
                      ) : (
                        <>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, WebP ({images.length} of 5 images)
                    </p>
                  </div>
                </label>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  disabled={images.length >= 5}
                />
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previews.map((preview, index) => (
                    <div 
                      key={index}
                      className="relative group flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden w-[100px] aspect-square"
                    >
                      {/* Image */}
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Delete Button Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-error-500 hover:bg-error-600 transition-colors duration-200"
                        >
                          <FontAwesomeIcon 
                            icon={faTimes} 
                            className="w-4 h-4 text-white"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <div className="text-error-500 text-center">{error}</div>}
            {successMsg && <div className="text-success-600 text-center">{successMsg}</div>}
            <button
              type="submit"
              disabled={loading}
              className="hidden w-full py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
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