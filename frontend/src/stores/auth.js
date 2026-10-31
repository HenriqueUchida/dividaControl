import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../services/api.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(credentials) {
    const response = await authApi.login(credentials);
    const { token: jwtToken, user: userData } = response.data;

    token.value = jwtToken;
    user.value = userData;

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return response.data;
  }

  async function register(userData) {
    const response = await authApi.register(userData);
    const { token: jwtToken, user: userCreated } = response.data;

    token.value = jwtToken;
    user.value = userCreated;

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userCreated));

    return response.data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
});

