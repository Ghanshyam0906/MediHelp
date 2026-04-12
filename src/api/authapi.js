import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Shared error handler translating Axios exceptions to our generic Throw formats
const handleResponse = (error) => {
  if (error.response) {
    throw new Error(error.response.data.message || error.response.data.error || `API request failed with status ${error.response.status}`);
  }
  throw new Error(error.message || 'API request failed');
};

// POST /auth/login - login user
export const loginUser = async (email, password, role) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password, role });
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// POST /auth/register - register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};
