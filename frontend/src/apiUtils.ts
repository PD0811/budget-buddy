// API utility functions for handling authenticated requests

const API_BASE_URL = 'http://localhost:3001';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token
    window.location.href = '/';
    throw new Error('No authentication token found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Authentication expired');
  }

  return response;
};

export { API_BASE_URL };
