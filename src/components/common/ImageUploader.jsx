// src/components/common/ImageUploader.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { toastController } from '../../utils/toastController';

const ImageUploader = ({
  maxImages = 5,
  existingImages = [],
  onImagesChange,
  className = '',
  label = '',
  required = false,
  isOutletImage = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  
  // Format existing images on initial load
  const formattedExistingImages = useMemo(() => {
    return existingImages.map(img => ({
      id: img.id || img.image_id,
      url: img.url || img.image,
      isExisting: true,
      flag: 1
    }));
  }, [existingImages]);

  // Initialize state with formatted existing images
  const [previews, setPreviews] = useState(formattedExistingImages);
  const [images, setImages] = useState(formattedExistingImages);

  // Update state when existingImages prop changes
  useEffect(() => {
    setPreviews(formattedExistingImages);
    setImages(formattedExistingImages);
  }, [formattedExistingImages]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFiles = async (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const remainingSlots = maxImages - images.length;
    
    if (remainingSlots <= 0) {
      toastController.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = Array.from(files)
      .filter(file => allowedTypes.includes(file.type))
      .slice(0, remainingSlots);

    if (validFiles.length === 0) return;

    try {
      const base64Array = await Promise.all(
        validFiles.map(async file => {
          const base64 = await fileToBase64(file);
          return {
            url: base64,
            isExisting: false,
            flag: 1
          };
        })
      );
      
      const newImages = [...images, ...base64Array];
      setImages(newImages);
      setPreviews(newImages);
      
      // Handle differently for outlet images
      if (isOutletImage) {
        onImagesChange(newImages); // Parent component will extract base64 string
      } else {
        onImagesChange(newImages); // For other uses, pass the full array
      }
    } catch (error) {
      console.error('Error processing images:', error);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Remove image handler
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setPreviews(newImages);
    setImages(newImages);
    
    if (isOutletImage) {
      onImagesChange(newImages); // Parent component will handle empty array
    } else {
      onImagesChange(newImages);
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* New Drag & Drop Area */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={`
            flex flex-col items-center justify-center  h-64 
            border-2 border-dashed rounded-lg cursor-pointer 
            ${dragActive 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }
            ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
            dark:hover:bg-gray-800 dark:bg-gray-700 
            dark:border-gray-600 dark:hover:border-gray-500 
            dark:hover:bg-gray-600 transition-all duration-200
          `}
          onDragEnter={(e) => images.length < maxImages && handleDrag(e)}
          onDragLeave={(e) => images.length < maxImages && handleDrag(e)}
          onDragOver={(e) => images.length < maxImages && handleDrag(e)}
          onDrop={(e) => images.length < maxImages && handleDrop(e)}
          onClick={(e) => {
            if (images.length >= maxImages) {
              e.preventDefault();
              toastController.warning(`Maximum ${maxImages} images allowed`);
            }
          }}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-6">
            {/* Upload Icon */}
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
            
            {/* Upload Text */}
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {images.length >= maxImages ? (
                <span className="font-semibold text-error-500"></span>
              ) : (
                <>
                  <span className="font-semibold">Click to upload</span> or <br /> drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG ({images.length} of {maxImages} images)
            </p>
          </div>

          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            multiple={maxImages !== 1}
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              if (images.length < maxImages) {
                handleFiles(e.target.files);
              } else {
                e.target.value = null; // Reset input
                toastController.warning(`Maximum ${maxImages} images allowed`);
              }
            }}
            disabled={images.length >= maxImages}
          />
        </label>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div 
              key={preview.id || index}
              className="relative group flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden"
              style={{
                width: '100px',
                aspectRatio: '1/1',
              }}
            >
              {/* Remove Button - small, top-left, always visible */}
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-error-100 border border-gray-300 p-0.5"
                style={{ lineHeight: 1 }}
                title="Remove"
              >
                <FontAwesomeIcon 
                  icon={faTimes} 
                  className="w-3 h-3 text-error-500"
                />
              </button>
              {/* Image */}
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', preview.url);
                  e.target.src = 'fallback-image-url';
                }}
              />
              
              {/* Existing Label */}
              {/* {preview.isExisting && (
                <div className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/50 py-1 px-2 text-center">
                  Existing
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {/* <div className="text-sm text-gray-500 text-center mt-2">
        {images.length} of {maxImages} images used
      </div> */}
    </div>
  );
};

export default ImageUploader;