import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api.synaptica.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
