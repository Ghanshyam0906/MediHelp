import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const handleResponse = (error) => {
  if (error.response) {
    throw new Error(error.response.data.message || error.response.data.error || `API request failed with status ${error.response.status}`);
  }
  throw new Error(error.message || 'API request failed');
};

// GET /patients - get all patients -> admin only
export const getAllPatients = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/patient`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// GET /patients/:id - Get a specific patient by ID
export const getPatientById = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/patient/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// POST /patients - create a new patient
export const createPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/patient`, patientData);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// PUT /patients/:id - update a patient's information
export const updatePatient = async (id, patientData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.put(`${API_BASE_URL}/patient/${id}`, patientData, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// DELETE /patients/:id - delete a patient
export const deletePatient = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.delete(`${API_BASE_URL}/patient/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};
