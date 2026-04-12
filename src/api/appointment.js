import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const handleResponse = (error) => {
  if (error.response) {
    throw new Error(error.response.data.message || error.response.data.error || `API request failed with status ${error.response.status}`);
  }
  throw new Error(error.message || 'API request failed');
};

// GET /appointments/doctor/:doctorId - get all appointments for a specific doctor
export const getAppointmentsByDoctorId = async (doctorId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/appointments/doctor/${doctorId}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// GET /appointments/patient/:patientId - get all appointments for a specific patient
export const getAppointmentsByPatientId = async (patientId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/appointments/patient/${patientId}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// GET /appointments/:id - get a specific appointment by ID
export const getAppointmentById = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_BASE_URL}/appointments/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// POST /appointments - create a new appointment
export const createAppointment = async (appointmentData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// PUT /appointments/:id - update an appointment
export const updateAppointment = async (id, appointmentData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, appointmentData, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};

// DELETE /appointments/:id - delete an appointment
export const deleteAppointment = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.delete(`${API_BASE_URL}/appointments/${id}`, config);
    return response.data;
  } catch (error) {
    handleResponse(error);
  }
};
