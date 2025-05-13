import axios from 'axios';
import { API_URL, API_TIMEOUT, BASE_URLS } from './config';

// Create a simple API client without any fancy configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Create specific API clients for different endpoints
export const commonApiClient = axios.create({
  baseURL: BASE_URLS.COMMON,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const adminApiClient = axios.create({
  baseURL: BASE_URLS.ADMIN,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Export the simple API client directly
export default api; 