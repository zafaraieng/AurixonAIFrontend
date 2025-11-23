import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

const api = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true
});

export const validateVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/validate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const uploadVideo = async (payload, isJson = false) => {
  const endpoint = isJson ? '/save-video' : '/uploads';
  const headers = isJson
    ? { 'Content-Type': 'application/json' }
    : { 'Content-Type': 'multipart/form-data' };

  const res = await api.post(endpoint, payload, { headers });
  return res.data;
};

export const saveVideoMetadata = async (data) => {
  const res = await api.post('/save-metadata', data);
  return res.data;
};

export const processPlatformUpload = async (data) => {
  const res = await api.post('/process-platform', data);
  return res.data;
};

export const getSchedules = async () => {
  const res = await api.get('/schedules');
  return res.data;
};

export async function fetchUploads() {
  try {
    const res = await api.get('/uploads');
    console.log('API Response:', res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function deleteUpload(id) {
  try {
    const res = await api.delete(`/uploads/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(`Failed to delete upload: ${error.message}`);
  }
}
