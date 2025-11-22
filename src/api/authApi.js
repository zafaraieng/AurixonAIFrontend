import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

export const getMe = async () => {
  const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
  return res.data;
};

export const loginUrl = () => `${API}/auth/google`;

export async function setInstagramCredentials(data) {
  const res = await fetch(`${API}/auth/instagram/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
}
