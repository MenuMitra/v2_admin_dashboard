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

const PIN_EXACT_MESSAGE = "PIN must be exactly 4 digits";

/**
 * Validates PIN for create/update flows (typically on submit).
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

  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, message: "PIN must contain only digits" };
  }

  if (trimmed.length !== 4) {
    return { isValid: false, message: PIN_EXACT_MESSAGE };
  }

  return { isValid: true, message: "" };
};

/**
 * TextInput customValidator — no error while typing 1–3 digits.
 * Use with validateOnChange={true} and maxLength={4}.
 */
export const createPinFieldValidator = ({ required = false } = {}) => {
  return (value, context = {}) => {
    const submitAttempted = context.isSubmitAttempted ?? false;
    const trimmed = (value ?? "").trim();

    if (!trimmed) {
      if (required && submitAttempted) {
        return { isValid: false, message: "Please enter PIN" };
      }
      return { isValid: true, message: "" };
    }

    if (!/^\d+$/.test(trimmed)) {
      return { isValid: false, message: "PIN must contain only digits" };
    }

    if (trimmed.length > 4) {
      return { isValid: false, message: PIN_EXACT_MESSAGE };
    }

    if (trimmed.length < 4 && submitAttempted) {
      return { isValid: false, message: PIN_EXACT_MESSAGE };
    }

    return { isValid: true, message: "" };
  };
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
