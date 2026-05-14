import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register  = (data) => API.post('/auth/register', data);
export const login     = (data) => API.post('/auth/login', data);
export const getJobs   = ()     => API.get('/jobs');
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id)   => API.delete(`/jobs/${id}`);
export const analyzeJD = (data) => API.post('/ai/analyze', data);
export const getCoverLetter    = (data) => API.post('/ai/cover-letter', data);
export const getInterviewPrep  = (data) => API.post('/ai/interview-prep', data);
export const getProfile    = ()     => API.get('/user/profile');
export const updateProfile = (data) => API.put('/user/profile', data);