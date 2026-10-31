<script setup>
import { ref, onMounted } from 'vue';
import { reportsApi } from '../services/api.js';
import { formatCentsToBRL } from '../utils/formatters.js';

const loading = ref(true);
const error = ref('');
const summary = ref(null);
const balances = ref([]);
const categoryExpenses = ref([]);

async function loadDashboardData() {
  loading.value = true;
  error.value = '';
  try {
    const [summaryRes, balancesRes, categoriesRes] = await Promise.all([
      reportsApi.summary(),
      reportsApi.balances(),
      reportsApi.byCategory(),
    ]);

    summary.value = summaryRes.data;
    balances.value = balancesRes.data;
    categoryExpenses.value = categoriesRes.data;
  } catch (err) {
    error.value = 'Não foi possível carregar os dados do painel.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Visão Geral</h1>
      <button
        @click="loadDashboardData"
        class="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm"
      >
        Atualizar
      </button>
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
      <p class="animate-pulse">Carregando indicadores financeiros...</p>
    </div>

    <!-- Estado de Erro -->
    <div v-else-if="error" class="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
      <p class="font-medium">{{ error }}</p>
      <button @click="loadDashboardData" class="mt-2 text-sm text-red-600 underline">Tentar novamente</button>
    </div>

    <!-- Conteúdo Principal -->
    <div v-else class="space-y-6">
      <!-- Cards de Resumo Mensal -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span class="text-sm font-medium text-slate-500">Receitas do Mês</span>
          <p class="text-2xl font-bold text-emerald-600 mt-2">
            {{ formatCentsToBRL(summary?.total_receitas_cents || 0) }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span class="text-sm font-medium text-slate-500">Despesas do Mês</span>
          <p class="text-2xl font-bold text-rose-600 mt-2">
            {{ formatCentsToBRL(summary?.total_despesas_cents || 0) }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <span class="text-sm font-medium text-slate-500">Resultado Líquido</span>
          <p
            class="text-2xl font-bold mt-2"
            :class="(summary?.saldo_liquido_cents || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ formatCentsToBRL(summary?.saldo_liquido_cents || 0) }}
          </p>
        </div>
      </div>

      <!-- Saldos por Conta -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Saldos por Conta</h2>

        <!-- Estado Vazio -->
        <div v-if="balances.length === 0" class="text-center py-8 text-slate-400">
          Nenhuma conta bancária cadastrada.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="acc in balances"
            :key="acc.id"
            class="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <span class="text-xs uppercase tracking-wider text-slate-400">{{ acc.tipo }}</span>
              <p class="font-semibold text-slate-800">{{ acc.nome }}</p>
            </div>
            <p class="text-lg font-bold mt-3 text-slate-900">
              {{ formatCentsToBRL(acc.saldo_atual_cents) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Despesas por Categoria -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Despesas por Categoria</h2>

        <div v-if="categoryExpenses.length === 0" class="text-center py-8 text-slate-400">
          Nenhuma despesa registrada neste mês.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="cat in categoryExpenses"
            :key="cat.categoria_id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <span class="font-medium text-slate-700">{{ cat.categoria_nome }}</span>
            <span class="font-bold text-slate-900">{{ formatCentsToBRL(cat.total_cents) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

