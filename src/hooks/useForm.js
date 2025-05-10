import { useState } from 'react';

/**
 * Custom hook for form handling with support for file uploads
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to call on form submission
 * @param {Function} validate - Validation function
 * @returns {Object} - Form state and handlers
 */
const useForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change for text inputs
   * @param {Event} e - Change event
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setValues((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  /**
   * Handle file input change
   * @param {Event} e - Change event
   */
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files.length > 0) {
      setValues((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
    
    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  /**
   * Handle form blur event
   * @param {Event} e - Blur event
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    
    // Validate if function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values);
      setErrors(validationErrors);
    }
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Only submit if no errors
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Reset form to initial state or new values
   * @param {Object} newValues - New values to set (optional)
   */
  const resetForm = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  /**
   * Set a specific field value
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleFileChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
};

export default useForm; 