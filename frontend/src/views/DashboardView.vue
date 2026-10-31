<script setup>
import { ref, computed, onMounted } from 'vue';
import { reportsApi } from '../services/api.js';
import { formatCentsToBRL } from '../utils/formatters.js';

const loading = ref(true);
const error = ref('');
const summary = ref(null);
const balances = ref([]);
const categoryExpenses = ref([]);

const totalDespesas = computed(() => {
  return categoryExpenses.value.reduce((acc, cat) => acc + (cat.total_cents || 0), 0);
});

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

function getAccountBadgeColor(tipo) {
  switch (tipo) {
    case 'CORRENTE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'POUPANCA':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CARTEIRA':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'INVESTIMENTO':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Top Bar com Título e Ação -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Painel Financeiro</h1>
        <p class="text-sm text-slate-500 mt-0.5">Visão consolidada das suas receitas, despesas e patrimônio</p>
      </div>
      <button
        @click="loadDashboardData"
        class="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto text-sm font-semibold bg-white border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-sm transition active:scale-95"
      >
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Atualizar
      </button>
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="loading" class="p-16 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200/80">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
      <p class="font-medium animate-pulse text-slate-600">Calculando indicadores financeiros...</p>
    </div>

    <!-- Estado de Erro -->
    <div v-else-if="error" class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 shadow-sm">
      <div class="flex items-center gap-2 font-semibold">
        <svg class="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>
      <button @click="loadDashboardData" class="mt-2 text-sm text-rose-700 underline font-medium hover:text-rose-900">
        Tentar novamente
      </button>
    </div>

    <!-- Conteúdo Principal -->
    <div v-else class="space-y-8">
      <!-- Cards de Métricas Principais (com gradientes e contraste) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Receitas -->
        <div class="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-6 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs uppercase tracking-wider font-bold text-emerald-800">Receitas do Mês</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-sm">
              ↑
            </div>
          </div>
          <p class="text-3xl font-black text-emerald-700 tracking-tight">
            {{ formatCentsToBRL(summary?.total_receitas_cents || 0) }}
          </p>
          <span class="text-xs text-slate-500 mt-1 block">Lançamentos pagos neste mês</span>
        </div>

        <!-- Despesas -->
        <div class="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-6 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs uppercase tracking-wider font-bold text-rose-800">Despesas do Mês</span>
            <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-700 flex items-center justify-center font-bold text-sm">
              ↓
            </div>
          </div>
          <p class="text-3xl font-black text-rose-700 tracking-tight">
            {{ formatCentsToBRL(summary?.total_despesas_cents || 0) }}
          </p>
          <span class="text-xs text-slate-500 mt-1 block">Lançamentos pagos neste mês</span>
        </div>

        <!-- Saldo Líquido -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700 shadow-md relative overflow-hidden">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-300">Resultado Líquido</span>
            <div class="w-8 h-8 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              Σ
            </div>
          </div>
          <p
            class="text-3xl font-black tracking-tight"
            :class="(summary?.saldo_liquido_cents || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ formatCentsToBRL(summary?.saldo_liquido_cents || 0) }}
          </p>
          <span class="text-xs text-slate-400 mt-1 block">Receitas menos despesas</span>
        </div>
      </div>

      <!-- Seção de Saldos por Conta -->
      <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Saldos Bancários</h2>
            <p class="text-xs text-slate-500">Saldo atual consolidado por conta ativa</p>
          </div>
          <router-link
            to="/accounts"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Gerenciar Contas →
          </router-link>
        </div>

        <div v-if="balances.length === 0" class="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p class="text-sm text-slate-500 font-medium">Nenhuma conta bancária cadastrada.</p>
          <router-link
            to="/accounts"
            class="mt-2 inline-block text-xs font-bold text-emerald-600 hover:underline"
          >
            Cadastrar primeira conta
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="acc in balances"
            :key="acc.id"
            class="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span :class="['text-[11px] font-bold px-2 py-0.5 rounded-md border', getAccountBadgeColor(acc.tipo)]">
                  {{ acc.tipo }}
                </span>
              </div>
              <p class="font-bold text-slate-800 truncate">{{ acc.nome }}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100">
              <span class="text-[11px] text-slate-400 block font-medium">Saldo Atual</span>
              <p class="text-xl font-extrabold text-slate-900">
                {{ formatCentsToBRL(acc.saldo_atual_cents) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de Gastos por Categoria -->
      <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900 mb-1">Distribuição de Gastos</h2>
        <p class="text-xs text-slate-500 mb-5">Despesas pagas no mês divididas por categoria</p>

        <div v-if="categoryExpenses.length === 0" class="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p class="text-sm text-slate-500">Nenhum gasto registrado neste mês.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="cat in categoryExpenses"
            :key="cat.categoria_id"
            class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100"
          >
            <div class="flex items-center justify-between mb-1.5 text-sm">
              <span class="font-bold text-slate-800">{{ cat.categoria_nome }}</span>
              <span class="font-extrabold text-slate-900">{{ formatCentsToBRL(cat.total_cents) }}</span>
            </div>
            <!-- Barra de Progresso Relativa -->
            <div class="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                class="bg-rose-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${totalDespesas > 0 ? Math.round((cat.total_cents / totalDespesas) * 100) : 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
