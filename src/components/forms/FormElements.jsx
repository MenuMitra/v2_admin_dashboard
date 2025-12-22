import React, { useState } from "react";
import DatePickerInput from "../common/DatePickerInput";
import TimePickerInput from "../common/TimePickerInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { validateInput } from "../../utils/validationPatterns";

// Base input styles
const baseInputStyles = `
  h-11 w-full  rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 
  text-sm text-gray-800 placeholder:text-gray-400 
  focus:ring-3 focus:outline-hidden focus:border-brand-300 focus:ring-brand-500/10
  dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 
  dark:placeholder:text-white/30 dark:focus:border-brand-800
`;

// Label styles
const labelStyles = `
  mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400
`;

// Update the Required Label component to show asterisk on the left
const RequiredLabel = ({ label }) => (
  <span>
    <span className="text-error-600 text-red-500 mr-1">*</span>
    {label}
  </span>
);

// Text Input Component
const TextInput = React.forwardRef(
  (
    {
      label,
      required = false,
      placeholder = "",
      type = "text",
      value,
      onChange,
      validationType = null,
      validationRules = {},
      customValidator = null,
      onValidation = () => { },
      isSubmitAttempted = false,
      className = "",
      onFocus,
      errorMessage = "",
      error: errorProp = false,
      ...props
    },
    ref
  ) => {
    const [localError, setLocalError] = useState("");

    const showError =
      (required && isSubmitAttempted && !value) || localError || errorProp;

    const validateInput = (value) => {
      // Skip validation if field is not required and empty
      if (!required && !value) {
        setLocalError("");
        return true;
      }

      // Required field validation
      if (required && !value) {
        setLocalError("This field is required");
        return false;
      }

      // Custom validator function takes precedence
      if (customValidator) {
        const { isValid, message } = customValidator(value);
        setLocalError(message);
        return isValid;
      }

      // Validation type specific validation
      if (validationType) {
        const { minLength, maxLength, pattern, patternMessage } =
          validationRules;

        if (minLength && value.length < minLength) {
          setLocalError(`Minimum ${minLength} characters required`);
          return false;
        }

        if (maxLength && value.length > maxLength) {
          setLocalError(`Maximum ${maxLength} characters allowed`);
          return false;
        }

        if (pattern && !pattern.test(value)) {
          setLocalError(patternMessage || "Invalid format");
          return false;
        }
      }

      setLocalError("");
      return true;
    };

    const handleChange = (e) => {
      const newValue = e.target.value;
      const isValid = validateInput(newValue);
      onValidation(isValid);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {required && <span className="text-error-600">*</span>} {label}
        </label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          required={required}
          className={`
          w-full px-3 py-2 border shadow-sm
          focus:outline-none focus:ring-2 focus:ring-brand-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${showError ? "border-error-500 focus:border-error-500" : ""}
          ${className || 'rounded-lg'}
        `}
          {...props}
        />
        {(localError || (errorProp && errorMessage)) && (
          <p className="mt-1 text-sm text-error-500">
            {localError || (errorProp ? errorMessage : "")}
          </p>
        )}
      </div>
    );
  }
);

// Password Input Component
const PasswordInput = React.forwardRef(
  (
    { label, placeholder = "Enter your password", value, onChange, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        {label && <label className={labelStyles}>{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${baseInputStyles} pr-11`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    );
  }
);

// Select Input Component
const SelectInput = React.forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      placeholder = "Select Option",
      required,
      error,
      onFocus,
      errorMessage,
      ...props
    },
    ref
  ) => {
    return (
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {required && <span className="text-error-600">*</span>} {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            className={`
            w-full px-3 py-2 pr-10 border rounded-3xl shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500
            appearance-none bg-white
            ${error ? "border-error-500" : "border-gray-300"}
            dark:border-gray-700 dark:bg-gray-900 dark:text-white
          `}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
            {...props}
          >
            <option
              value=""
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {placeholder}
            </option>
            {options.map((option, index) => (
              <option
                key={index}
                value={option.value}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-error-500 text-sm mt-1">
            {errorMessage || `Please select a ${label.toLowerCase()}`}
          </p>
        )}
      </div>
    );
  }
);

const Checkbox = React.forwardRef(
  ({ label, checked, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="form-checkbox h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900"
          {...props}
        />
        {label && (
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
            {label}
          </span>
        )}
      </label>
    );
  }
);

// Date Input Component
const DateInput = React.forwardRef(
  (
    {
      label,
      required,
      value,
      onChange,
      placeholder = "Select date",
      disabled = false,
      className = "",
      error = "",
      ...props
    },
    ref
  ) => {
    // Function to format date to DD MMM YYYY
    // Use manual parsing for known input formats to avoid Date parsing quirks
    const formatDate = (date) => {
      if (!date) return "";

      // YYYY-MM-DD -> produce DD MMM YYYY
      const ymdMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymdMatch) {
        const [, y, m, d] = ymdMatch;
        const months = {
          "01": "Jan",
          "02": "Feb",
          "03": "Mar",
          "04": "Apr",
          "05": "May",
          "06": "Jun",
          "07": "Jul",
          "08": "Aug",
          "09": "Sep",
          10: "Oct",
          11: "Nov",
          12: "Dec",
        };
        const mon = months[m] || "";
        if (mon) return `${d} ${mon} ${y}`;
      }

      // DD-MM-YYYY -> produce DD MMM YYYY
      const hyphenMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (hyphenMatch) {
        const [, d, m, y] = hyphenMatch;
        const months = {
          "01": "Jan",
          "02": "Feb",
          "03": "Mar",
          "04": "Apr",
          "05": "May",
          "06": "Jun",
          "07": "Jul",
          "08": "Aug",
          "09": "Sep",
          10: "Oct",
          11: "Nov",
          12: "Dec",
        };
        const mon = months[m] || "";
        if (mon) return `${d} ${mon} ${y}`;
      }

      // Already in DD Mon YYYY -> return as-is
      const dmyShortMatch = date.match(/^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/);
      if (dmyShortMatch) return date;

      // Fallback to Date parsing only if necessary
      const dObj = new Date(date);
      if (!isNaN(dObj.getTime())) {
        return dObj
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, " ");
      }

      return "";
    };

    // Convert controlled value to YYYY-MM-DD for input element
    const getInputValue = () => {
      if (!value) return "";

      // Already in YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

      // Handle DD MMM YYYY (e.g., 21 May 1919)
      const dmyMatch = value.match(/^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/);
      if (dmyMatch) {
        const [, d, mon, y] = dmyMatch;
        const months = {
          Jan: "01",
          Feb: "02",
          Mar: "03",
          Apr: "04",
          May: "05",
          Jun: "06",
          Jul: "07",
          Aug: "08",
          Sep: "09",
          Oct: "10",
          Nov: "11",
          Dec: "12",
        };
        const mm = months[mon] || "";
        if (mm) return `${y}-${mm}-${d}`;
      }

      // Handle DD-MM-YYYY
      const hyphenMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (hyphenMatch) {
        const [, d, m, y] = hyphenMatch;
        return `${y}-${m}-${d}`;
      }

      // Try native parse but prefer preserving year from explicit strings
      const dObj = new Date(value);
      if (!isNaN(dObj.getTime())) {
        const yyyy = dObj.getFullYear();
        const mm = String(dObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dObj.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }

      return "";
    };

    // onChange: accept native YYYY-MM-DD, propagate as DD MMM YYYY
    const handleDateChange = (e) => {
      const inputDate = e.target.value; // YYYY-MM-DD

      // Validate year is exactly 4 digits
      if (inputDate) {
        const yearMatch = inputDate.match(/^(\d+)-/);
        if (yearMatch && yearMatch[1].length !== 4) {
          // Reject input if year is not exactly 4 digits
          return;
        }
      }

      const formatted = formatDate(inputDate); // DD MMM YYYY
      const syntheticEvent = {
        target: {
          name: e.target.name,
          value: formatted,
        },
      };
      onChange?.(syntheticEvent);
    };

    // Validate incoming controlled value: allowed formats are YYYY-MM-DD or DD Mon YYYY
    const isAllowedFormat = (v) => {
      if (!v) return true;
      const ymd = /^\d{4}-\d{2}-\d{2}$/;
      const dmy = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/; // e.g., 21 May 1919
      return ymd.test(v) || dmy.test(v);
    };

    const formatErrorMessage =
      value && !isAllowedFormat(value)
        ? "Invalid date format. Use either DD MMM YYYY or YYYY-MM-DD"
        : "";

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-error-600">*</span>}
          </label>
        )}
        <input
          type="date"
          ref={ref}
          value={getInputValue()}
          onChange={handleDateChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 ${className || 'rounded-lg'}`}
          {...props}
        />
        {(error || formatErrorMessage) && (
          <p className="text-error-500 text-xs mt-1">
            {error || formatErrorMessage}
          </p>
        )}
      </div>
    );
  }
);

// Textarea Component
const Textarea = React.forwardRef(
  ({ label, required, value, onChange, rows = 4, className = "", maxLength, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {required ? <RequiredLabel label={label} /> : label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          maxLength={maxLength}
          className={`w-full h-11 border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:border-blue-500 ${className || 'rounded-lg'}`}
          {...props}
        />
        {maxLength && value && value.length >= 3 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

// Radio Button Component
const RadioButton = React.forwardRef(
  ({ label, checked, value, name, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          value={value}
          name={name}
          onChange={onChange}
          className="form-radio h-5 w-5 border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900"
          {...props}
        />
        {label && (
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
            {label}
          </span>
        )}
      </label>
    );
  }
);

// Toggle Switch Component
const ToggleSwitch = React.forwardRef(
  ({ label, checked, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center">
        <div className="relative inline-block">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <div
            className={`
          h-6 w-11 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}
        `}
          >
            <div
              className={`
            h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
            />
          </div>
        </div>
        {label && (
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
            {label}
          </span>
        )}
      </label>
    );
  }
);

// File Input Component
const FileInput = React.forwardRef(
  ({ label, onChange, accept, multiple = false, ...props }, ref) => {
    return (
      <div>
        {label && <label className={labelStyles}>{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type="file"
            onChange={onChange}
            accept={accept}
            multiple={multiple}
            className={`
            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-sm file:font-medium file:bg-brand-500 file:text-white
            hover:file:bg-brand-600 file:cursor-pointer
            text-sm text-gray-700 dark:text-gray-400
            ${baseInputStyles}
          `}
            {...props}
          />
        </div>
      </div>
    );
  }
);

// Input Group Component
const InputGroup = React.forwardRef(
  (
    { label, prefix, suffix, value, onChange, type = "text", ...props },
    ref
  ) => {
    return (
      <div>
        {label && <label className={labelStyles}>{label}</label>}
        <div className="relative flex">
          {prefix && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            className={`
            ${baseInputStyles}
            ${prefix ? "rounded-l-none" : ""}
            ${suffix ? "rounded-r-none" : ""}
          `}
            {...props}
          />
          {suffix && (
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }
);

// Add display names for all components
RadioButton.displayName = "RadioButton";
ToggleSwitch.displayName = "ToggleSwitch";
FileInput.displayName = "FileInput";
InputGroup.displayName = "InputGroup";

// Add display names for better debugging
TextInput.displayName = "TextInput";
PasswordInput.displayName = "PasswordInput";
SelectInput.displayName = "SelectInput";
Checkbox.displayName = "Checkbox";
DateInput.displayName = "DateInput";
Textarea.displayName = "Textarea";

// Single consolidated export at the end
export {
  // Styles
  baseInputStyles,
  labelStyles,
  RequiredLabel,

  // Components
  TextInput,
  PasswordInput,
  SelectInput,
  Checkbox,
  DateInput,
  Textarea,
  RadioButton,
  ToggleSwitch,
  FileInput,
  InputGroup,
  TimePickerInput,
};
