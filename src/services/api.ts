import axios from 'axios';

export const api = axios.create({
  // baseURL: 'http://localhost:3336',
  baseURL: 'https://backend.pitstopcabines.com.br',
});
