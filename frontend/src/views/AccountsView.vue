<script setup>
import { ref, onMounted } from 'vue';
import { accountsApi } from '../services/api.js';
import { formatCentsToBRL } from '../utils/formatters.js';

const accounts = ref([]);
const loading = ref(true);
const error = ref('');
const isModalOpen = ref(false);

const form = ref({
  nome: '',
  tipo: 'CORRENTE',
  saldoReais: 0,
});

async function loadAccounts() {
  loading.value = true;
  error.value = '';
  try {
    const res = await accountsApi.list();
    accounts.value = res.data;
  } catch (err) {
    error.value = 'Erro ao carregar contas bancárias.';
  } finally {
    loading.value = false;
  }
}

async function handleCreateAccount() {
  try {
    const saldo_inicial_cents = Math.round(Number(form.value.saldoReais || 0) * 100);

    await accountsApi.create({
      nome: form.value.nome,
      tipo: form.value.tipo,
      saldo_inicial_cents,
    });

    isModalOpen.value = false;
    form.value = { nome: '', tipo: 'CORRENTE', saldoReais: 0 };
    await loadAccounts();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao criar conta.');
  }
}

async function handleDelete(id) {
  if (confirm('Tem certeza que deseja desativar esta conta?')) {
    try {
      await accountsApi.delete(id);
      await loadAccounts();
    } catch (err) {
      alert('Erro ao excluir conta.');
    }
  }
}

function getAccountBadgeStyle(tipo) {
  switch (tipo) {
    case 'CORRENTE':
      return { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏦' };
    case 'POUPANCA':
      return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🌱' };
    case 'CARTEIRA':
      return { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: '👛' };
    case 'INVESTIMENTO':
      return { badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📈' };
    default:
      return { badge: 'bg-slate-50 text-slate-700 border-slate-200', icon: '💰' };
  }
}

onMounted(() => {
  loadAccounts();
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Contas Bancárias</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gerenciamento de contas correntes, investimentos e carteiras</p>
      </div>
      <button
        @click="isModalOpen = true"
        class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
      >
        <span>+</span> Nova Conta
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
      <p class="font-medium animate-pulse text-slate-600">Carregando contas bancárias...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="accounts.length === 0" class="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl font-bold">
        🏦
      </div>
      <p class="text-slate-600 font-medium mb-1">Nenhuma conta cadastrada</p>
      <p class="text-xs text-slate-400 mb-4">Cadastre suas contas para acompanhar saldos e transações</p>
      <button
        @click="isModalOpen = true"
        class="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
      >
        + Cadastrar primeira conta
      </button>
    </div>

    <!-- List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-center mb-3">
            <span
              :class="['text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border flex items-center gap-1.5', getAccountBadgeStyle(acc.tipo).badge]"
            >
              <span>{{ getAccountBadgeStyle(acc.tipo).icon }}</span>
              <span>{{ acc.tipo }}</span>
            </span>
            <button
              @click="handleDelete(acc.id)"
              class="text-xs text-rose-400 hover:text-rose-600 font-semibold p-1 transition"
              title="Desativar conta"
            >
              Excluir
            </button>
          </div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">{{ acc.nome }}</h3>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100">
          <span class="text-xs font-medium text-slate-400 block mb-0.5">Saldo Inicial Configurado</span>
          <p class="text-xl font-black text-slate-800">
            {{ formatCentsToBRL(Number(acc.saldo_inicial_cents)) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Nova Conta -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Nova Conta Bancária</h2>
        <p class="text-xs text-slate-500 mb-5">Adicione os detalhes da conta para gestão de saldo</p>

        <form @submit.prevent="handleCreateAccount" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nome da Conta</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="ex: Nubank, Banco Inter, Carteira..."
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipo de Conta</label>
            <select
              v-model="form.tipo"
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Conta Poupança</option>
              <option value="CARTEIRA">Carteira Física</option>
              <option value="INVESTIMENTO">Conta de Investimentos</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Saldo Inicial (R$)</label>
            <input
              v-model.number="form.saldoReais"
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Salvar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
