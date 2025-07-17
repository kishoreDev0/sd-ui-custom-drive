import axios, { AxiosInstance } from 'axios';

export interface HttpClientInstance {
  httpClient: AxiosInstance;
}

export const initializeHttpClient = (): HttpClientInstance => {
  const token = localStorage.getItem('token');
  const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return { httpClient };
};
