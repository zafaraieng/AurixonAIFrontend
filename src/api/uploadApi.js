import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

export const validateVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await axios.post(`${API}/api/validate`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const uploadVideo = async (payload) => {
  // payload: FormData
  const res = await axios.post(`${API}/api/uploads`, payload, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getSchedules = async () => {
  const res = await axios.get(`${API}/api/schedules`, { withCredentials: true });
  return res.data;
};

export async function fetchUploads() {
  try {
    const res = await axios.get(`${API}/api/uploads`, { 
      withCredentials: true
    });
    console.log('API Response:', res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function deleteUpload(id) {
  const res = await fetch(`${API}/api/uploads/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to delete upload: ${res.status} ${text}`);
  }
  return res.json();
}
