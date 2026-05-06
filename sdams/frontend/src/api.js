import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const adminApi = {
  getStats: (params) => api.get('/admin/stats', { params }),
  getUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getActivityLogs: () => api.get('/admin/activity_logs'),
  deleteDocument: (id) => api.delete(`/admin/documents/${id}`),
  uploadForStudent: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDepartments: () => api.get('/auth/departments'),
  addDepartment: (data) => api.post('/auth/departments', data),
  getDocTypes: () => api.get('/documents/types'),
  // Sub Admin Management
  getSubAdmins: () => api.get('/admin/sub_admins'),
  createSubAdmin: (data) => api.post('/admin/sub_admins', data),
  updateSubAdmin: (id, data) => api.put(`/admin/sub_admins/${id}`, data),
  deleteSubAdmin: (id) => api.delete(`/admin/sub_admins/${id}`),
  getDepartmentsDetailed: () => api.get('/admin/departments/detailed'),
};

export default api;
