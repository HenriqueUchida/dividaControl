<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const senha = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login({
      email: email.value,
      senha: senha.value,
    });
    router.push({ name: 'Dashboard' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Falha ao realizar login. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-slate-800">dividaControl</h1>
        <p class="text-sm text-slate-500 mt-1">Acesse sua conta para gerenciar suas finanças</p>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="seu@email.com"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input
            v-model="senha"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
        >
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        Não tem uma conta?
        <router-link to="/register" class="text-emerald-600 hover:underline font-medium">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>

