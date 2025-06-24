// src/components/common/ImageUploader.jsx
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons';

const ImageUploader = ({
  maxImages = 5,
  outputFormat = 'formData', // 'formData' or 'base64'
  existingImages = [],
  onImagesChange,
  className = '',
  label = '',
  required = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(existingImages);

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
    ).slice(0, maxImages - previews.length);

    if (validFiles.length === 0) return;

    try {
      if (outputFormat === 'base64') {
        const base64Array = await Promise.all(
          validFiles.map(file => fileToBase64(file))
        );
        setImages(prev => maxImages === 1 ? base64Array : [...prev, ...base64Array]);
        setPreviews(prev => maxImages === 1 ? base64Array : [...prev, ...base64Array]);
        onImagesChange(maxImages === 1 ? base64Array : [...images, ...base64Array]);
      } else {
        setImages(prev => maxImages === 1 ? validFiles : [...prev, ...validFiles]);
        setPreviews(prev => {
          const newPreviews = validFiles.map(file => URL.createObjectURL(file));
          return maxImages === 1 ? newPreviews : [...prev, ...newPreviews];
        });
        onImagesChange(maxImages === 1 ? validFiles : [...images, ...validFiles]);
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
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    setPreviews(newPreviews);
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

      {/* Drag & Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          ${dragActive 
            ? 'border-brand-500 bg-brand-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          transition-colors cursor-pointer
          ${maxImages === 1 ? 'min-h-[200px] flex flex-col items-center justify-center' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple={maxImages !== 1}
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        {maxImages === 1 && previews.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={previews[0]}
              alt="Preview"
              className="max-h-[150px] max-w-full object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(0);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <FontAwesomeIcon 
                icon={faTimes} 
                className="w-3 h-3 text-error-500" 
              />
            </button>
          </div>
        ) : (
          <>
        <FontAwesomeIcon 
          icon={faImage} 
          className="w-12 h-12 text-gray-400 mb-4" 
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {maxImages === 1 ? 'Click to upload or drag and drop' : 'Drag and drop images here'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              {maxImages === 1 ? 'Upload a single image' : 'or click to browse files'}
        </p>
        <p className="text-xs text-gray-400">
              PNG, JPG {maxImages === 1 ? '' : `(max ${maxImages} images)`}
        </p>
          </>
        )}
      </div>

      {/* Image Previews - Only show for multiple images */}
      {maxImages > 1 && previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <div 
              key={index} 
              className="relative group flex-shrink-0 bg-gray-50 rounded-md"
              style={{
                width: '100px',
                aspectRatio: '1/1',
              }}
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-contain p-1"
                style={{ aspectRatio: '1/1' }}
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              >
                <FontAwesomeIcon 
                  icon={faTimes} 
                  className="w-3 h-3 text-error-500" 
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;