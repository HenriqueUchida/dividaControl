<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

// Fecha o menu mobile automaticamente ao trocar de rota
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);

function handleLogout() {
  authStore.logout();
  isMobileMenuOpen.value = false;
  router.push({ name: 'Login' });
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased font-sans">
    <!-- Navbar moderna com alto contraste -->
    <header
      v-if="authStore.isAuthenticated"
      class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <span class="text-white font-black text-lg">$</span>
            </div>
            <span class="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
              divida<span class="text-emerald-400">Control</span>
            </span>
          </router-link>

          <!-- Menu Desktop -->
          <nav class="hidden md:flex space-x-1 text-sm font-medium">
            <router-link
              to="/"
              class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              active-class="!text-emerald-400 !bg-slate-800 font-semibold"
            >
              Visão Geral
            </router-link>
            <router-link
              to="/accounts"
              class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              active-class="!text-emerald-400 !bg-slate-800 font-semibold"
            >
              Contas
            </router-link>
            <router-link
              to="/categories"
              class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              active-class="!text-emerald-400 !bg-slate-800 font-semibold"
            >
              Categorias
            </router-link>
            <router-link
              to="/cards"
              class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              active-class="!text-emerald-400 !bg-slate-800 font-semibold"
            >
              Cartões
            </router-link>
            <router-link
              to="/transactions"
              class="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              active-class="!text-emerald-400 !bg-slate-800 font-semibold"
            >
              Transações
            </router-link>
          </nav>
        </div>

        <!-- Ações do Usuário Desktop -->
        <div class="hidden md:flex items-center space-x-4">
          <div class="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
              {{ authStore.user?.nome?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="text-xs text-slate-300 font-medium">
              {{ authStore.user?.nome }}
            </span>
          </div>

          <button
            @click="handleLogout"
            class="text-xs font-semibold text-slate-300 hover:text-rose-400 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            Sair
          </button>
        </div>

        <!-- Botão Hambúrguer Mobile -->
        <div class="md:hidden flex items-center">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            type="button"
            class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition"
            aria-label="Abrir menu"
          >
            <!-- Ícone fechado (3 barras) -->
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- Ícone aberto (X) -->
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu Gaveta Mobile -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-5 space-y-2 shadow-2xl animate-in slide-in-from-top-2"
      >
        <router-link
          to="/"
          class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          active-class="!text-emerald-400 !bg-slate-800/90 font-semibold"
        >
          Visão Geral
        </router-link>
        <router-link
          to="/accounts"
          class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          active-class="!text-emerald-400 !bg-slate-800/90 font-semibold"
        >
          Contas Bancárias
        </router-link>
        <router-link
          to="/categories"
          class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          active-class="!text-emerald-400 !bg-slate-800/90 font-semibold"
        >
          Categorias
        </router-link>
        <router-link
          to="/cards"
          class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          active-class="!text-emerald-400 !bg-slate-800/90 font-semibold"
        >
          Cartões
        </router-link>
        <router-link
          to="/transactions"
          class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          active-class="!text-emerald-400 !bg-slate-800/90 font-semibold"
        >
          Transações e Extrato
        </router-link>

        <div class="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
              {{ authStore.user?.nome?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="text-sm font-medium text-slate-300">
              {{ authStore.user?.nome }}
            </span>
          </div>
          <button
            @click="handleLogout"
            class="text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 px-3 py-1.5 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <router-view />
    </main>
  </div>
</template>
