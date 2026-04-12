import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const handleResponse = (error) => {
  if (error.response) {
    throw new Error(error.response.data.message || error.response.data.error || `API request failed with status ${error.response.status}`);
  }
  throw new Error(error.message || 'API request failed');
};

// GET /doctor - get all doctors
export const getAllDoctors = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/doctor`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// GET /doctor/:id - Get a specific doctor by ID
export const getDoctorById = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/doctor/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// POST /doctor - create a new doctor
export const createDoctor = async (doctorData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/doctor`, doctorData);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// PUT /doctor/:id - update a doctor's information
export const updateDoctor = async (id, doctorData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.put(`${API_BASE_URL}/doctor/${id}`, doctorData, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// DELETE /doctor/:id - delete a doctor
export const deleteDoctor = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.delete(`${API_BASE_URL}/doctor/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};
