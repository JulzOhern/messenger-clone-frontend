import axios from 'axios';

const baseURL = import.meta.env.VITE_SERVER_BASE_URL;

export const axiosClient = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})