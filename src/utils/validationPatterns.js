// Utility constants for outlet boolean dropdowns
export const YES_NO_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No" },
];

export default YES_NO_OPTIONS;

// Common validation patterns
export const validationPatterns = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Invalid email address",
  },
  mobile: {
    pattern: /^[0-9]{10}$/,
    message: "Mobile number must be 10 digits",
  },
  aadhar: {
    pattern: /^[0-9]{12}$/,
    message: "Aadhar number must be 12 digits",
  },
  name: {
    pattern: /^[A-Za-z\s]{2,50}$/,
    message:
      "Name must be 2-50 characters long and contain only letters and spaces",
  },
  /** Owner login PIN (4 digits) */
  ownerLoginPin: {
    pattern: /^[0-9]{4}$/,
    message: "PIN must be 4 digits",
  },
  // Add more patterns as needed
};

/**
 * Validates PIN for create/update flows.
 * Empty PIN is valid when optional (update); required on create.
 */
export const validatePin = (value, { required = false } = {}) => {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    if (required) {
      return { isValid: false, message: "Please enter PIN" };
    }
    return { isValid: true, message: "" };
  }

  if (trimmed.length < 4) {
    return { isValid: false, message: "PIN must be 4 digits" };
  }

  return { isValid: true, message: "" };
};

// Validation helper function
export const validateInput = (value, validationType) => {
  if (!validationType || !validationPatterns[validationType])
    return { isValid: true };

  const { pattern, message } = validationPatterns[validationType];
  const isValid = pattern.test(value);
  return {
    isValid,
    message: isValid ? "" : message,
  };
};
