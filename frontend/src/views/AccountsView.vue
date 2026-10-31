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
    // Conversão estrita de Reais para centavos inteiros antes do envio
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

onMounted(() => {
  loadAccounts();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Contas Bancárias</h1>
      <button
        @click="isModalOpen = true"
        class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
      >
        + Nova Conta
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
      Carregando contas...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="accounts.length === 0" class="p-12 text-center bg-white rounded-xl border border-slate-200">
      <p class="text-slate-500 mb-4">Você ainda não possui nenhuma conta bancária cadastrada.</p>
      <button
        @click="isModalOpen = true"
        class="text-emerald-600 font-semibold hover:underline"
      >
        Cadastrar primeira conta
      </button>
    </div>

    <!-- List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="acc in accounts"
        :key="acc.id"
        class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {{ acc.tipo }}
            </span>
            <button
              @click="handleDelete(acc.id)"
              class="text-xs text-rose-500 hover:text-rose-700 font-medium"
            >
              Excluir
            </button>
          </div>
          <h3 class="text-lg font-bold text-slate-800">{{ acc.nome }}</h3>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100">
          <span class="text-xs text-slate-400">Saldo Inicial</span>
          <p class="text-base font-semibold text-slate-700">
            {{ formatCentsToBRL(Number(acc.saldo_inicial_cents)) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Nova Conta -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Adicionar Nova Conta</h2>

        <form @submit.prevent="handleCreateAccount" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nome da Conta</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="ex: Nubank, Carteira..."
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select
              v-model="form.tipo"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Poupança</option>
              <option value="CARTEIRA">Carteira Física</option>
              <option value="INVESTIMENTO">Investimento</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial (R$)</label>
            <input
              v-model.number="form.saldoReais"
              type="number"
              step="0.01"
              required
              placeholder="0,00"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

