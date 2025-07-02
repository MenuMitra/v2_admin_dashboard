// src/components/common/ImageUploader.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ImageUploader = ({
  maxImages = 5,
  existingImages = [],
  onImagesChange,
  className = '',
  label = '',
  required = false
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
    const validFiles = Array.from(files).filter(file => 
      allowedTypes.includes(file.type)
    ).slice(0, maxImages - images.length);

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
      onImagesChange(newImages);
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
    onImagesChange(newImages);
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
            flex flex-col items-center justify-center w-full h-64 
            border-2 border-dashed rounded-lg cursor-pointer 
            ${dragActive 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }
            dark:hover:bg-gray-800 dark:bg-gray-700 
            dark:border-gray-600 dark:hover:border-gray-500 
            dark:hover:bg-gray-600 transition-all duration-200
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
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
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG (max {maxImages} images)
            </p>
          </div>

          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            multiple={maxImages !== 1}
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleFiles(e.target.files)}
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
              
              {/* Delete Button Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-error-500 hover:bg-error-600 transition-colors duration-200"
                >
                  <FontAwesomeIcon 
                    icon={faTimes} 
                    className="w-4 h-4 text-white"
                  />
                </button>
              </div>

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