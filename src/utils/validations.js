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
  const mobileRegex = /^[6-9]\d{9}$/;
  const startsWithInvalidNumber = /^[0-5]/;
  
  if (!mobile) return { isValid: false, message: 'Mobile number is required' };
  if (startsWithInvalidNumber.test(mobile)) return { 
    isValid: false, 
    message: 'Mobile number must start with 6, 7, 8, or 9' 
  };
  if (!mobileRegex.test(mobile)) return { 
    isValid: false, 
    message: 'Mobile number must be 10 digits' 
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