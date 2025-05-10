import axios from 'axios';
import { API_URL, API_TIMEOUT } from './config';

// Create a simple API client without any fancy configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Export the simple API client directly
export default api; 