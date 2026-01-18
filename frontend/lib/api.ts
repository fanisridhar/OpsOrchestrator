import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Incidents API
export const getIncidents = async () => {
  const response = await api.get('/incidents');
  return response.data;
};

export const getIncident = async (id: string) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data: any) => {
  const response = await api.post('/incidents', data);
  return response.data;
};

export const updateIncidentStatus = async (id: string, status: string) => {
  const response = await api.put(`/incidents/${id}/status`, { status });
  return response.data;
};

// Actions API
export const createAction = async (data: any) => {
  const response = await api.post('/actions', data);
  return response.data;
};

export const getActionsByIncident = async (incidentId: string) => {
  const response = await api.get(`/actions/incident/${incidentId}`);
  return response.data;
};

// Approvals API
export const approveAction = async (approvalId: string, comment?: string) => {
  const response = await api.post(`/approvals/${approvalId}/approve`, { comment });
  return response.data;
};

export const rejectAction = async (approvalId: string, comment?: string) => {
  const response = await api.post(`/approvals/${approvalId}/reject`, { comment });
  return response.data;
};

// Audit API
export const getAuditLogs = async (limit = 100) => {
  const response = await api.get(`/audit?limit=${limit}`);
  return response.data;
};

export default api;
