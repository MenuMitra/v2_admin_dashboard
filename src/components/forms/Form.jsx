import React from 'react';
import { FormInput, FormTextarea, FormSelect } from './FormInput';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft as faBack } from "@fortawesome/free-solid-svg-icons";

const Form = ({
  formFields,
  formData,
  onInputChange,
  onSubmit,
  submitText = "Submit",
  showCancel = false,
  onCancel,
  title,
  layout = "grid", // grid or stack
  gridCols = 2,
  showBackButton = true,
  onBackClick,
  backButtonLabel = "Back"
}) => {
  const getFormComponent = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <FormTextarea
            key={field.name}
            name={field.name}
            label={field.label}
            value={formData[field.name]}
            onChange={onInputChange}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 3}
            fullWidth={field.fullWidth}
            className={field.className}
            {...field.props}
          />
        );

      case 'select':
        return (
          <FormSelect
            key={field.name}
            name={field.name}
            label={field.label}
            value={formData[field.name]}
            onChange={onInputChange}
            options={field.options}
            required={field.required}
            fullWidth={field.fullWidth}
            className={field.className}
            {...field.props}
          />
        );

      case 'custom':
        return field.component;

      default:
        return (
          <FormInput
            key={field.name}
            type={field.type || 'text'}
            name={field.name}
            label={field.label}
            value={formData[field.name]}
            onChange={onInputChange}
            placeholder={field.placeholder}
            required={field.required}
            pattern={field.pattern}
            fullWidth={field.fullWidth}
            className={field.className}
            icon={field.icon}
            {...field.props}
          />
        );
    }
  };

  return (
    <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header Section */}
      <div className="overflow-hidden pt-4 dark:border-gray-800">
        {/* Top Row - Back & Title */}
        <div className="flex items-center px-4 md:px-6 mb-4">
          {/* Left Side - Back Button */}
          <div className="flex items-center">
            {showBackButton && (
              <button 
                onClick={onBackClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">{backButtonLabel}</span>
              </button>
            )}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h1 className="text-base md:text-xl font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h1>
          </div>

          {/* Right Side - Spacer for alignment */}
          <div className="w-[42px] md:w-[70px]"></div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={onSubmit} className="px-4 md:px-6 pb-4 md:pb-6">
        <div 
          className={
            layout === "grid" 
              ? `grid grid-cols-1 ${gridCols > 1 ? 'md:grid-cols-2' : ''} gap-3 md:gap-4`
              : "flex flex-col space-y-3 md:space-y-4"
          }
        >
          {formFields.map((field) => (
            <div 
              key={field.name}
              className={`${
                field.span ? `col-span-1 md:col-span-${field.span}` : 'col-span-1'
              }`}
            >
              {getFormComponent(field)}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 md:mt-6 flex justify-end gap-2 md:gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-3xl hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-brand-500 rounded-3xl hover:bg-brand-600 focus:outline-none"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;