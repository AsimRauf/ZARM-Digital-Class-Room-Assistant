import api from './api';

export const authService = {
    register: async (userData) => {
        console.log('Data being sent:', userData);
        const response = await api.post('/auth/register', userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    login: async (credentials) => {
      console.log('Login request data:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
