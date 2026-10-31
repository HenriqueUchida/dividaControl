<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push({ name: 'Login' });
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <!-- Navbar (Apenas quando autenticado) -->
    <header
      v-if="authStore.isAuthenticated"
      class="bg-white border-b border-slate-200 sticky top-0 z-30"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <span>dividaControl</span>
          </router-link>

          <nav class="hidden md:flex space-x-4 text-sm font-medium">
            <router-link
              to="/"
              class="px-3 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition"
              active-class="!text-emerald-600 !bg-emerald-50"
            >
              Visão Geral
            </router-link>
            <router-link
              to="/accounts"
              class="px-3 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition"
              active-class="!text-emerald-600 !bg-emerald-50"
            >
              Contas
            </router-link>
            <router-link
              to="/cards"
              class="px-3 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition"
              active-class="!text-emerald-600 !bg-emerald-50"
            >
              Cartões
            </router-link>
            <router-link
              to="/transactions"
              class="px-3 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition"
              active-class="!text-emerald-600 !bg-emerald-50"
            >
              Transações
            </router-link>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-xs text-slate-500 hidden sm:inline">
            {{ authStore.user?.nome }}
          </span>
          <button
            @click="handleLogout"
            class="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <router-view />
    </main>
  </div>
</template>

