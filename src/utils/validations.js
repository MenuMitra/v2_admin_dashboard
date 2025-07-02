// Create validation utility functions that can be shared between components
export const isValidUrl = (url) => {
  if (!url) return true; // Empty URLs are allowed
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidSocialMediaLinks = (links) => {
  const validations = {
    website: {
      pattern: /^https?:\/\/.+/,
      message: 'Website URL must start with http:// or https://'
    },
    facebook: {
      pattern: /^https?:\/\/(www\.)?facebook\.com\/.+/,
      message: 'Please enter a valid Facebook URL (e.g., https://facebook.com/yourpage)'
    },
    instagram: {
      pattern: /^https?:\/\/(www\.)?instagram\.com\/.+/,
      message: 'Please enter a valid Instagram URL (e.g., https://instagram.com/yourhandle)'
    },
    google_business_link: {
      pattern: /^https?:\/\/(www\.)?(business\.)?google\.com\/.+/,
      message: 'Please enter a valid Google Business URL'
    },
    google_review: {
      pattern: /^https?:\/\/(www\.)?g\.page\/r\/.+/,
      message: 'Please enter a valid Google Review URL (e.g., https://g.page/r/yourreviewpage)'
    }
  };

  const errors = {};
  let isValid = true;

  Object.entries(links).forEach(([key, value]) => {
    if (validations[key] && value) { // Only validate if field has a value
      if (!validations[key].pattern.test(value)) {
        errors[key] = validations[key].message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Add this validation function
export const isMobileValid = (mobile) => {
  // Remove any non-digit characters
  const cleanedMobile = mobile.replace(/\D/g, '');
  
  // Check if empty
  if (!mobile) return { 
    isValid: false, 
    message: 'Mobile number is required' 
  };

  // Check if contains only digits
  if (/[^\d]/.test(mobile)) return {
    isValid: false,
    message: 'Mobile number must contain only digits'
  };

  // Check if starts with valid digit (6-9)
  if (!/^[6-9]/.test(mobile)) return {
    isValid: false,
    message: 'Mobile number must start with 6, 7, 8, or 9'
  };

  // Check length
  if (mobile.length !== 10) return {
    isValid: false,
    message: 'Mobile number must be exactly 10 digits'
  };

  return { isValid: true, message: '' };
};

// Add this validation function for WhatsApp numbers
export const isWhatsappValid = (whatsapp) => {
  const whatsappRegex = /^[6-9]\d{9}$/;
  const startsWithInvalidNumber = /^[0-5]/;
  
  if (!whatsapp) return { isValid: true, message: '' }; // WhatsApp is optional
  if (startsWithInvalidNumber.test(whatsapp)) return { 
    isValid: false, 
    message: 'WhatsApp number must start with 6, 7, 8, or 9' 
  };
  if (!whatsappRegex.test(whatsapp)) return { 
    isValid: false, 
    message: 'WhatsApp number must be 10 digits' 
  };
  
  return { isValid: true, message: '' };
};

export const isNameValid = (name) => {
  if (!name) return { isValid: false, message: 'Name is required' };
  if (name.length < 3) return { isValid: false, message: 'Name must be at least 3 characters' };
  if (name.length > 50) return { isValid: false, message: 'Name cannot exceed 50 characters' };
  return { isValid: true, message: '' };
};

export const isEmailValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
  return { isValid: true, message: '' };
};

export const isDobValid = (dob) => {
  if (!dob) return { isValid: false, message: 'Date of birth is required' };
  const date = new Date(dob);
  if (isNaN(date.getTime())) return { isValid: false, message: 'Please enter a valid date' };
  return { isValid: true, message: '' };
};

export const isAadharValid = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  if (!aadhar) return { isValid: false, message: 'Aadhar number is required' };
  if (!aadharRegex.test(aadhar)) return { 
    isValid: false, 
    message: 'Aadhar number must be exactly 12 digits' 
  };
  return { isValid: true, message: '' };
};

export const isAddressValid = (address) => {
  if (!address) return { isValid: false, message: 'Address is required' };
  if (address.length < 4) return { isValid: false, message: 'Address must be at least 4 characters' };
  if (address.length > 50) return { isValid: false, message: 'Address cannot exceed 50 characters' };
  return { isValid: true, message: '' };
}; 