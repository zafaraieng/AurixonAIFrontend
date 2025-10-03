import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

// Instagram account management
export const getInstagramStatus = async () => {
  const response = await axios.get(`${API}/instagram/status`, { withCredentials: true });
  return response.data;
};

export const refreshInstagramToken = async () => {
  const response = await axios.post(`${API}/instagram/refresh-token`, {}, { withCredentials: true });
  return response.data;
};

export const disconnectInstagram = async () => {
  const response = await axios.post(`${API}/instagram/disconnect`, {}, { withCredentials: true });
  return response.data;
};

// Content publishing and scheduling
export const scheduleInstagramPost = async (postData) => {
  const response = await axios.post(`${API}/instagram/schedule`, postData, { withCredentials: true });
  return response.data;
};

export const publishInstagramPostNow = async (scheduleId) => {
  const response = await axios.post(`${API}/instagram/publish/${scheduleId}`, {}, { withCredentials: true });
  return response.data;
};

export const getScheduledInstagramPosts = async () => {
  const response = await axios.get(`${API}/instagram/scheduled`, { withCredentials: true });
  return response.data;
};

export const deleteScheduledInstagramPost = async (scheduleId) => {
  const response = await axios.delete(`${API}/instagram/scheduled/${scheduleId}`, { withCredentials: true });
  return response.data;
};

export const updateScheduledInstagramPost = async (scheduleId, updateData) => {
  const response = await axios.put(`${API}/instagram/scheduled/${scheduleId}`, updateData, { withCredentials: true });
  return response.data;
};
