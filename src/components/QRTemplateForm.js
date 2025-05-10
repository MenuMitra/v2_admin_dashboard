"use client";

import { useState } from 'react';
import { useForm } from '@/hooks';
import { qrTemplateService } from '@/api';
import { Alert, Loading } from '@/components/ui';
import { Upload } from 'lucide-react';

/**
 * Component for creating or updating QR templates
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial template data for editing mode
 * @param {Function} props.onSuccess - Callback after successful submission
 * @param {Function} props.onCancel - Callback for cancellation
 */
const QRTemplateForm = ({ initialData = null, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image_name ? `${process.env.NEXT_PUBLIC_API_URL}/images/${initialData.image_name}` : null);
  
  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    
    if (!values.name) {
      errors.name = 'Template name is required';
    }
    
    if (!values.qr_overlay_position) {
      errors.qr_overlay_position = 'QR overlay position is required';
    }
    
    if (!initialData && !values.image) {
      errors.image = 'Please upload an image';
    }
    
    return errors;
  };
  
  // Form submission handler
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      let response;
      
      if (initialData) {
        // Update existing template
        const updateData = {
          ...values,
          qr_code_template_id: initialData.qr_code_template_id,
        };
        response = await qrTemplateService.updateTemplate(updateData);
      } else {
        // Create new template
        response = await qrTemplateService.createTemplate(values);
      }
      
      setSuccess(initialData ? 'Template updated successfully!' : 'Template created successfully!');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save the template. Please try again.');
      console.error('Template form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Initialize form with useForm hook
  const form = useForm(
    {
      name: initialData?.name || '',
      qr_overlay_position: initialData?.qr_overlay_position || 'centre',
      image: null,
    },
    handleSubmit,
    validateForm
  );
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      form.handleFileChange(e);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      
      {success && (
        <Alert
          type="success"
          message={success}
          dismissible
          onClose={() => setSuccess(null)}
          className="mb-4"
        />
      )}
      
      <form onSubmit={form.handleSubmit}>
        <div className="space-y-6">
          {/* Template Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className={`mt-1 block w-full rounded-md border ${
                form.errors.name && form.touched.name ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
              placeholder="Enter template name"
            />
            {form.errors.name && form.touched.name && (
              <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
            )}
          </div>
          
          {/* QR Overlay Position */}
          <div>
            <label htmlFor="qr_overlay_position" className="block text-sm font-medium text-gray-700">
              QR Overlay Position
            </label>
            <select
              id="qr_overlay_position"
              name="qr_overlay_position"
              value={form.values.qr_overlay_position}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className={`mt-1 block w-full rounded-md border ${
                form.errors.qr_overlay_position && form.touched.qr_overlay_position ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            >
              <option value="centre">Centre</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            {form.errors.qr_overlay_position && form.touched.qr_overlay_position && (
              <p className="mt-1 text-sm text-red-600">{form.errors.qr_overlay_position}</p>
            )}
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Image
            </label>
            <div className="mt-1 flex items-center">
              <div className={`flex justify-center items-center w-full h-48 border-2 border-dashed rounded-md ${
                form.errors.image && form.touched.image ? 'border-red-300' : 'border-gray-300'
              } hover:border-indigo-400 focus:outline-none transition-colors duration-200`}>
                {imagePreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagePreview}
                      alt="Template Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                      onClick={() => {
                        setImagePreview(null);
                        form.setFieldValue('image', null);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      <label htmlFor="image" className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="text-gray-500 pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            {form.errors.image && form.touched.image && (
              <p className="mt-1 text-sm text-red-600">{form.errors.image}</p>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            {onCancel && (
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-indigo-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loading size="sm" message="" /> : initialData ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QRTemplateForm; 