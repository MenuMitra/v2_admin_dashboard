// API Configuration - Structured with base URLs for different API groups

// Environment selector
export const API_ENV = (typeof window !== 'undefined' && localStorage.getItem('apiEnvironment')) || 'dev';

// Main API base URLs based on environment
export const API_URL = API_ENV === 'dev' 
  ? 'https://men4u.xyz/v2' 
  : 'https://menusmitra.xyz/v2';

// Base URLs for specific API groups
export const BASE_URLS = {
  COMMON: `${API_URL}/common`,
  ADMIN: `${API_URL}/admin`
};

// Endpoints organized by API groups
export const ENDPOINTS = {
  // Common endpoints
  COMMON: {
    LOGIN: '/login',
    RESEND_OTP: '/resend_otp',
    VERIFY_OTP: '/verify_otp',
    GET_OUTLET_TYPES: '/get_outlet_type',
    GET_FOOD_TYPES: '/get_food_type_list',
    MENU: '/menu',
    CATEGORIES: '/categories',
    ITEMS: '/items'
  },
  // Admin endpoints
  ADMIN: {
    // Auth endpoints
    ADMIN_LOGIN: '/admin_login',
    ADMIN_VERIFY_OTP: '/admin_verify_otp',
    
    // UBAC endpoints
    CREATE_UBAC_ROLE: '/create_ubac_role',
    GET_UBAC_ROLES: '/get_ubac_roles',
    CREATE_UBAC_FUNCTIONALITY: '/create_ubac_functionality',
    UPDATE_UBAC_FUNCTIONALITY: '/update_ubac_functionality',
    DELETE_UBAC_FUNCTIONALITY: '/delete_ubac_functionality',
    GET_UBAC_FUNCTIONALITIES: '/get_ubac_functionalities',
    VIEW_UBAC_FUNCTIONALITY: '/view_ubac_functionality',
    CREATE_UBAC_ROLE_FUNCTIONALITY_MAPPING: '/create_ubac_role_functionality_mapping',
    UPDATE_UBAC_ROLE_FUNCTIONALITY_MAPPING: '/update_ubac_role_functionality_mapping',
    DELETE_UBAC_ROLE_FUNCTIONALITY_MAPPING: '/delete_ubac_role_functionality_mapping',
    VIEW_UBAC_ROLE_FUNCTIONALITY_MAPPING: '/view_ubac_role_functionality_mapping',
    GET_UBAC_ROLE_FUNCTIONALITY_MAPPINGS: '/get_ubac_role_functionality_mappings',
    LISTVIEW_UBAC_ROLE_FUNCTIONALITY_MAPPING: '/listview_ubac_role_functionality_mapping',
    
    // Owner Management endpoints
    CREATE_OWNER: '/create_owner',
    LISTVIEW_OWNER: '/listview_owner',
    VIEW_OWNER: '/view_owner',
    UPDATE_OWNER: '/update_owner',
    
    // Partner Management endpoints
    CREATE_PARTNER: '/create_partner',
    UPDATE_PARTNER: '/update_partner',
    VIEW_PARTNER: '/view_partner',
    DELETE_PARTNER: '/delete_partner',
    LISTVIEW_PARTNER: '/listview_partner',
    
    // QR Template endpoints
    GET_QR_TEMPLATES: '/get_qr_templates',
    CREATE_QR_TEMPLATE: '/create_qr_templates',
    VIEW_QR_TEMPLATE: '/view_qr_templates',
    UPDATE_QR_TEMPLATE: '/update_qr_templates',
    DELETE_QR_TEMPLATE: '/delete_qr_templates'
  }
};

// API Request Timeouts (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}; 