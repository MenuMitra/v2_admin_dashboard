import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import {
  TextInput,
} from '../../forms/FormElements';
import Breadcrumb from '../../Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft as faBack, faPlus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
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
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const { outletId, menuId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Add state for menu categories
  const [categories, setCategories] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [spicyIndexOptions, setSpicyIndexOptions] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [menuCatId, setMenuCatId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [spicyIndex, setSpicyIndex] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');
<<<<<<< HEAD
  const [menuPortionId, setMenuPortionId] = useState(null);
=======
>>>>>>> Rushi
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

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
    } catch (error) {

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

  // Fetch existing menu data
  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/common/menu_view`,
          {
            menu_id: Number(menuId),
            outlet_id: Number(outletId),
            user_id: adminData?.user_id,
            app_source: 'admin_app',
          },
          {
            headers: {
              Authorization: getToken(),
            }
          }
        );

<<<<<<< HEAD
        const menuData = response.data.detail;
        setName(menuData.name);
        setOutletName(menuData.outlet_name);
        setMenuCatId(menuData.menu_cat_id.toString());
        setFoodType(menuData.food_type);
        setSpicyIndex(menuData.spicy_index?.toString() || '');
        setIngredients(menuData.ingredients);
        setIsSpecial(menuData.is_special || false);

=======
        const menuData = response.data.detail || {};
        setName(menuData.name || '');
        setOutletName(menuData.outlet_name || '');
        setMenuCatId(
          menuData.menu_cat_id !== null && menuData.menu_cat_id !== undefined
            ? menuData.menu_cat_id.toString()
            : ''
        );
        setFoodType(menuData.food_type || '');
        setSpicyIndex(
          menuData.spicy_index !== null && menuData.spicy_index !== undefined
            ? menuData.spicy_index.toString()
            : ''
        );
        setIngredients(menuData.ingredients || '');
>>>>>>> Rushi
        // Format existing images
        const formattedExistingImages =
          Array.isArray(menuData.images)
            ? menuData.images.map(img => ({
                id: img.image_id,
                url: img.image,
                flag: 1, // Initially all images are kept
              }))
            : [];

        setExistingImages(formattedExistingImages);
        setPreviews([]); // Clear previews for new images
        setImages([]); // Clear new images array
<<<<<<< HEAD
        if (menuData.portions && menuData.portions.length > 0) {
          setPrice(menuData.portions[0].price.toString());
          setMenuPortionId(menuData.portions[0].menu_portion_id);
=======

        const portions = Array.isArray(menuData.portions)
          ? menuData.portions
          : [];

        if (portions.length > 0) {
          const primary = portions[0];
          setPrice(
            primary.price !== null && primary.price !== undefined
              ? primary.price.toString()
              : ''
          );
        } else if (
          menuData.default_price !== null &&
          menuData.default_price !== undefined
        ) {
          setPrice(menuData.default_price.toString());
        } else {
          setPrice('');
>>>>>>> Rushi
        }
      } catch (err) {
        toastController.error('Failed to load menu details');
        // Do not set the global form error here to avoid showing a stuck error message
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
        // Keep this as a toast only; don't show persistent form error
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
      } catch (err) {
        toastController.error('Failed to load food types');
        // Avoid setting global error so the page doesn't show a permanent error banner
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
      } catch (err) {
        toastController.error('Failed to load spicy index options');
        // Only use a toast for this background error
      }
    };

    fetchSpicyIndexList();
  }, []);

<<<<<<< HEAD
  // Portion handlers


  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

=======
  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
>>>>>>> Rushi
    if (!name || !menuCatId || !foodType || !price) {
      toastController.error('Please fill in all required fields');
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = getToken();

<<<<<<< HEAD
      // Format portion data properly
      const formattedPortionData = [{
        menu_portion_id: menuPortionId,
        price: parseInt(price, 10),
        flag: 1
      }];
=======
      // Build portion data from single price field
      const formattedPortionData = [
        {
          portion_name: 'Default',
          price: parseInt(price, 10),
          unit_value: '',
          unit_type: '',
          flag: 1,
        },
      ];
>>>>>>> Rushi

      // Construct the JSON payload
      const payload = {
        menu_id: Number(menuId),
        outlet_id: Number(outletId),
        user_id: adminData?.user_id,
        name: name?.trim() || '',
        portion_data: formattedPortionData, // Use formatted portion data from single price
        food_type: foodType,
        menu_cat_id: Number(menuCatId),
        spicy_index: spicyIndex ? spicyIndex.toString() : null,
        ingredients: ingredients?.trim() || '',
        images: images,
        existing_image_ids: existingImages
          .filter(img => img.flag === 0)
          .map(img => img.id),
        flag: 0,
        app_source: 'admin_app'
      };

      const response = await axios.put(
        `${BASE_URL}/common/menu_update`,
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      toastController.success('Menu updated successfully');
      setSuccessMsg(response.data.detail || 'Menu updated successfully');
      // Invalidate menus cache to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.list(outletId) });
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {

      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Failed to update menu';
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
<<<<<<< HEAD
                className="rounded-lg"
=======
                className= "rounded-lg"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Enter price"
>>>>>>> Rushi
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
<<<<<<< HEAD
              <div className="flex flex-col gap-2">
                <CustomDropdown
                  label="Spicy Index"
                  value={spicyIndex}
                  onChange={e => setSpicyIndex(e.target.value)}
                  options={spicyIndexOptions}
                  placeholder="Select Spicy Index"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="is_special"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded-lg"
                />
                <label htmlFor="is_special" className="text-sm font-medium text-gray-700">
                  Special Item
                </label>
              </div>
            </div>


=======
            </div>
>>>>>>> Rushi

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
<<<<<<< HEAD

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => img.flag === 1 ? handleRemoveExistingImage(img.id) : handleRestoreExistingImage(img.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full 
                              ${img.flag === 1 ? 'bg-error-500 hover:bg-error-600' : 'bg-success-500 hover:bg-success-600'}
                              transition-colors duration-200`}
                      >
                        <FontAwesomeIcon
                          icon={img.flag === 1 ? faTimes : faPlus}
                          className="w-4 h-4 text-white"
                        />
                      </button>
                    </div>
=======
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
>>>>>>> Rushi
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
<<<<<<< HEAD

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-error-500 hover:bg-error-600 transition-colors duration-200"
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="w-4 h-4 text-white"
                        />
                      </button>
                    </div>
=======
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
>>>>>>> Rushi
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