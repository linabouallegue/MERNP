import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════

export const registerStudent = async (data) => {
  const response = await api.post('/auth/register/student', data);
  return response.data;
};

export const registerCompany = async (data) => {
  const response = await api.post('/auth/register/company', data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ═══════════════════════════════════════════════════
// STAGES
// ═══════════════════════════════════════════════════

export const getAllInternships = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/internships?${params}`);
  return response.data;
};

export const getInternshipById = async (id) => {
  const response = await api.get(`/internships/${id}`);
  return response.data;
};

export const createInternship = async (data) => {
  const response = await api.post('/internships', data);
  return response.data;
};

export const updateInternship = async (id, data) => {
  const response = await api.put(`/internships/${id}`, data);
  return response.data;
};

export const deleteInternship = async (id) => {
  const response = await api.delete(`/internships/${id}`);
  return response.data;
};

// ═══════════════════════════════════════════════════
// CANDIDATURES
// ═══════════════════════════════════════════════════

export const applyToInternship = async (data) => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data;
};

export const getInternshipApplications = async (internshipId) => {
  const response = await api.get(`/applications/internship/${internshipId}`);
  return response.data;
};

export const updateApplicationStatus = async (id, data) => {
  const response = await api.put(`/applications/${id}/status`, data);
  return response.data;
};

// ═══════════════════════════════════════════════════
// PROFILS
// ═══════════════════════════════════════════════════

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const updateStudentProfile = async (id, data) => {
  const response = await api.put(`/students/${id}/profile`, data);
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export default api;