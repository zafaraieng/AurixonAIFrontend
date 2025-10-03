import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://aurixon-ai-backend.vercel.app';

export const optimizeContent = async (title) => {
    const response = await axios.post(`${BASE_URL}/api/optimize/title`, { title });
    return response.data;
};
