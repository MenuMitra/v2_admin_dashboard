import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { useOfflineMenus, useOnlineStatus } from '../../../offline';
import { getMenuById as getLocalMenuById } from '../../../offline/repositories/menusRepo';
import { ensureOutletHydrated } from '../../../offline/syncService';
import { db } from '../../../offline/db';
import { listCategories } from '../../../offline/repositories/categoriesRepo';
import {
  TextInput,
} from '../../forms/FormElements';
import Breadcrumb from '../../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toastController } from '../../../utils/toastController';
import { API_CONFIG } from '../../../config/appConfig';
import SaveButton from '../../common/SaveButton';
import CustomDropdown from '../../common/CustomDropdown';

// Single Select Dropdown with Vertical Scrolling
const CategorySingleSelect = ({
  label,
  options,
  selectedValue,
  onChange,
  displayKey,
  valueKey,
  placeholder = "Select item",
  searchPlaceholder = "Search...",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option[displayKey]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    onChange(value.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSelectedText = () => {
    if (!selectedValue) return placeholder;
    const selectedOption = options.find(option => option[valueKey].toString() === selectedValue);
    return selectedOption ? selectedOption[displayKey] : placeholder;
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </label>

      {/* Main Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2 text-left border shadow-sm bg-white hover:bg-gray-50 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[42px] ${className || 'rounded-lg'}`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={`${!selectedValue ? 'text-gray-500' : 'text-gray-900'} truncate`}>
            {getSelectedText()}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-[17px] bg-white border rounded-lg shadow-xl z-50 w-full min-w-[250px]">
          {/* Search Bar */}
          <div className="p-2 border-b bg-white">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm("");
                    const searchInput = e.target.closest(".relative").querySelector("input");
                    if (searchInput) {
                      searchInput.focus();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List with Fixed Height and Scrolling */}
          <div
            style={{
              height: '250px',
              maxHeight: '250px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className={`
                    p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                    ${selectedValue === option[valueKey].toString()
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'border-l-4 border-transparent'}
                  `}
                  onClick={() => handleSelect(option[valueKey])}
                >
                  <div className="font-medium text-gray-900 truncate" style={{ textTransform: 'capitalize' }}>
                    {option[displayKey]}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function EditMenu() {
  const { BASE_URL } = API_CONFIG;
  const { outletId, menuId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { updateMutation } = useOfflineMenus(
    outletId,
    adminData?.user_id
  );

  // Add state for menu categories
  const [categories, setCategories] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [, setSpicyIndexOptions] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [menuCatId, setMenuCatId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [spicyIndex, setSpicyIndex] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [localSyncUuid, setLocalSyncUuid] = useState(null);

  const [existingImages, setExistingImages] = useState([]);

  // Add state for name error
  const [nameError, setNameError] = useState('');

  // Ref for form submission from Save button
  const formRef = React.useRef();



  // Add new state for outlet name
  const [outletName, setOutletName] = useState('');

  // Update image state structure
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

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

    if (existingImages.length + images.length + files.length > maxImages) {
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
    } catch {
      toastController.error('Error processing images');
    }

    e.target.value = '';
  };

  // Remove new image handler
  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image handler
  const handleRemoveExistingImage = (imageId) => {
    setExistingImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, flag: 0 } // Mark for deletion
          : img
      )
    );
  };

  // Restore existing image handler
  const handleRestoreExistingImage = (imageId) => {
    setExistingImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, flag: 1 } // Restore image
          : img
      )
    );
  };

  // Fetch existing menu data (local-first)
  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        await ensureOutletHydrated(outletId, adminData?.user_id, {
          waitIfEmpty: true,
        });

        const menuData = await getLocalMenuById(outletId, menuId);
        if (!menuData) {
          toastController.error('Menu not found locally');
          return;
        }

        const outletInfo = await db.outletCache.get(Number(outletId));
        setLocalSyncUuid(menuData.sync_uuid || null);
        setName(menuData.name || '');
        setOutletName(outletInfo?.outlet_name || menuData.outlet_name || '');
        setMenuCatId(
          menuData.menu_cat_id != null
            ? String(menuData.menu_cat_id)
            : menuData.menu_cat_sync_uuid
              ? String(menuData.menu_cat_sync_uuid)
              : ''
        );
        setFoodType(menuData.food_type || '');
        setSpicyIndex(
          menuData.spicy_index != null && menuData.spicy_index !== ''
            ? String(menuData.spicy_index)
            : ''
        );
        setIngredients(menuData.ingredients || '');
        setPrice(
          menuData.price != null && menuData.price !== ''
            ? String(menuData.price)
            : ''
        );

        const formattedExistingImages = Array.isArray(menuData.images)
          ? menuData.images.map((img, index) => {
              if (typeof img === 'string') {
                return { id: `local-${index}`, url: img, flag: 1 };
              }
              return {
                id: img.image_id || img.id || `local-${index}`,
                url: img.image || img.url || '',
                flag: 1,
              };
            })
          : [];

        setExistingImages(formattedExistingImages);
        setPreviews([]);
        setImages([]);
      } catch {
        toastController.error('Failed to load menu details');
      }
    };

    if (menuId && outletId && adminData?.user_id) {
      fetchMenuDetails();
    }
  }, [menuId, outletId, adminData?.user_id]);

  // Fetch categories (local-first)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const local = await listCategories(outletId);
        if (local.length) {
          setCategories(
            local.map((c) => ({
              menu_cat_id: c.menu_cat_id,
              sync_uuid: c.sync_uuid,
              category_name: c.category_name,
            }))
          );
          return;
        }

        if (!navigator.onLine) {
          setCategories([]);
          return;
        }

        const token = getToken();
        const response = await axios.post(
          `${BASE_URL}/common/menu_category_list`,
          {
            outlet_id: outletId,
            user_id: adminData?.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const validCategories = response.data.data.menucat_details.filter(
          (cat) => cat.menu_cat_id !== null
        );
        setCategories(validCategories);
      } catch {
        toastController.error('Failed to load menu categories');
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
      } catch {
        setFoodTypes([
          { value: 'veg', label: 'Veg' },
          { value: 'nonveg', label: 'Nonveg' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'egg', label: 'Egg' },
        ]);
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
      } catch {
        setSpicyIndexOptions([
          { value: '0', label: 'Level 0' },
          { value: '1', label: 'Level 1' },
          { value: '2', label: 'Level 2' },
          { value: '3', label: 'Level 3' },
        ]);
      }
    };

    fetchSpicyIndexList();
  }, []);

  // Form submit — local-first, sync via /v1/sync
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !menuCatId || !foodType || !price) {
      toastController.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const keptImages = existingImages
        .filter((img) => img.flag === 1)
        .map((img) => img.url);
      const mergedImages = [...keptImages, ...images];

      await updateMutation.mutateAsync({
        menuIdOrUuid: localSyncUuid || menuId,
        menuCatId,
        name: name.trim(),
        price: parseFloat(price),
        foodType,
        spicyIndex,
        ingredients: ingredients.trim(),
        images: mergedImages,
      });

      toastController.success(
        online
          ? 'Menu updated — syncing'
          : 'Menu updated offline — will sync when online'
      );
      setSuccessMsg('Menu updated successfully');
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to update menu';
      toastController.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Update Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', path: '/home' },
          { label: 'Outlets', path: '/outlets' },
          { label: outletName || 'Outlet', path: `/view-outlet/${outletId}` },
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
            <SaveButton
              onClick={() => formRef.current?.requestSubmit()}
              disabled={loading}
              isLoading={loading}
              type="button"
            >
              Save
            </SaveButton>
          </div>
        </div>

        {!online && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You are offline. Changes will sync when you reconnect.
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {/* Grid for form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 text-base">
              <TextInput
                label="Menu Name"
                className="rounded-lg"
                value={name}
                onChange={e => {
                  const value = e.target.value;
                  if (!/^[A-Za-z\s]*$/.test(value)) {
                    setNameError('Menu name should only contain alphabets and spaces');
                  } else {
                    setNameError('');
                  }
                  setName(value);
                }}
                placeholder="Enter menu name"
              />
              {nameError && <p className="text-error-500 text-sm mt-1">{nameError}</p>}
              <div className="relative z-50">
                <CategorySingleSelect
                  label="Category"
                  options={categories}
                  selectedValue={menuCatId}
                  onChange={(categoryId) => {
                    setMenuCatId(categoryId);
                  }}
                  displayKey="category_name"
                  valueKey="menu_cat_id"
                  placeholder="Select category"
                  searchPlaceholder="Search categories..."
                  className="rounded-lg"
                  required
                />
              </div>
              <CustomDropdown
                label="Food Type"
                required
                value={foodType}
                onChange={e => setFoodType(e.target.value)}
                options={foodTypes}
                placeholder="Select Food Type"
              />
              <TextInput
                label="Price"
                className="rounded-lg"
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Enter price"
                required
                min="0"
              />
              <TextInput
                label="Ingredients"
                className="rounded-lg"
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="e.g. dal, vegetables"
              />
            </div>

            {/* Images Section */}
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
                    ${(existingImages.filter(img => img.flag === 1).length + images.length) >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => {
                    if ((existingImages.filter(img => img.flag === 1).length + images.length) >= 5) {
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
                      {(existingImages.filter(img => img.flag === 1).length + images.length) >= 5 ? (
                        <span className="font-semibold text-error-500">Maximum limit reached</span>
                      ) : (
                        <>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, WebP ({existingImages.filter(img => img.flag === 1).length + images.length} of 5 images)
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
                  disabled={(existingImages.filter(img => img.flag === 1).length + images.length) >= 5}
                />
              </div>

              {/* Image Previews */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden w-24 h-24 border ${img.flag === 0 ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <img
                      src={img.url}
                      alt="Menu item"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        img.flag === 1
                          ? handleRemoveExistingImage(img.id)
                          : handleRestoreExistingImage(img.id)
                      }
                      className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-white text-xs
                        ${img.flag === 1 ? 'bg-error-500 hover:bg-error-600' : 'bg-success-500 hover:bg-success-600'}
                        transition-colors duration-200`}
                      title={img.flag === 1 ? 'Remove image' : 'Restore image'}
                    >
                      <FontAwesomeIcon
                        icon={img.flag === 1 ? faTimes : faPlus}
                        className="w-3 h-3"
                      />
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {previews.map((preview, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden w-27 h-27 border"
                  >
                    <img
                      src={preview}
                      alt={`New preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-error-500 hover:bg-error-600 text-white text-xs transition-colors duration-200"
                      title="Remove image"
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="w-3 h-3"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-error-500 text-center">{error}</div>}
            {successMsg && <div className="text-success-600 text-center">{successMsg}</div>}

            <button
              type="submit"
              disabled={loading}
              className="hidden w-full py-2 rounded-3xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition"
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