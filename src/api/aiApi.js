import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

export const optimizeContent = async (title) => {
    const response = await axios.post(`${BASE_URL}/api/optimize/title`, { title });
    return response.data;
};
