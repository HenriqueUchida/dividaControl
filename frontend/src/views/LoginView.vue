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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/80">
      <div class="text-center mb-8">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
          <span class="text-white font-black text-2xl">$</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">divida<span class="text-emerald-600">Control</span></h1>
        <p class="text-xs text-slate-500 mt-1">Controle financeiro pessoal inteligente e descomplicado</p>
      </div>

      <div v-if="error" class="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="seu@email.com"
            class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Senha</label>
          <input
            v-model="senha"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm active:scale-98"
        >
          <span v-if="loading">Autenticando...</span>
          <span v-else>Entrar no Sistema</span>
        </button>
      </form>

      <div class="text-center text-xs text-slate-500 mt-8 pt-6 border-t border-slate-100">
        Não possui uma conta?
        <router-link to="/register" class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline ml-1">
          Cadastre-se gratuitamente
        </router-link>
      </div>
    </div>
  </div>
</template>
