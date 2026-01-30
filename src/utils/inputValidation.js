/**
 * Utility functions for input validation
 */

/**
 * Restricts input to only alphanumeric characters (A-Z, a-z, 0-9)
 * Removes any special characters from the input value
 * @param {string} value - The input value to sanitize
 * @returns {string} - The sanitized input value with only alphanumeric characters
 */
export const sanitizeAlphanumericInput = (value) => {
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Handles input change event to restrict to alphanumeric characters only
 * @param {Function} onChange - The original onChange handler
 * @returns {Function} - Enhanced onChange handler that filters special characters
 */
export const createAlphanumericChangeHandler = (onChange) => {
  return (e) => {
    const sanitizedValue = sanitizeAlphanumericInput(e.target.value);
    
    // Create a new synthetic event with the sanitized value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue
      }
    };
    
    // Call the original onChange handler with the sanitized event
    onChange(syntheticEvent);
  };
};

/**
 * Handles direct value changes for state setters
 * @param {Function} setValue - The state setter function
 * @returns {Function} - Enhanced setter that filters special characters
 */
export const createAlphanumericValueSetter = (setValue) => {
  return (value) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeAlphanumericInput(value) : value;
    setValue(sanitizedValue);
  };
};
