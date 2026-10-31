<script setup>
import { ref, onMounted } from 'vue';
import { cardsApi, accountsApi } from '../services/api.js';
import { formatCentsToBRL } from '../utils/formatters.js';

const cards = ref([]);
const accounts = ref([]);
const loading = ref(true);
const error = ref('');
const isModalOpen = ref(false);

const form = ref({
  nome: '',
  tipo: 'CREDITO',
  bandeira: '',
  conta_id: '',
  limiteReais: 0,
  dia_fechamento: 25,
  dia_vencimento: 5,
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [cardsRes, accountsRes] = await Promise.all([
      cardsApi.list(),
      accountsApi.list(),
    ]);
    cards.value = cardsRes.data;
    accounts.value = accountsRes.data;
  } catch (err) {
    error.value = 'Erro ao carregar cartões.';
  } finally {
    loading.value = false;
  }
}

async function handleCreateCard() {
  try {
    const payload = {
      nome: form.value.nome,
      tipo: form.value.tipo,
      bandeira: form.value.bandeira || undefined,
    };

    if (form.value.tipo === 'DEBITO') {
      payload.conta_id = form.value.conta_id;
    } else {
      // Crédito: converte reais para centavos inteiros
      payload.limite_cents = Math.round(Number(form.value.limiteReais || 0) * 100);
      payload.dia_fechamento = Number(form.value.dia_fechamento);
      payload.dia_vencimento = Number(form.value.dia_vencimento);
    }

    await cardsApi.create(payload);
    isModalOpen.value = false;
    await loadData();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao cadastrar cartão.');
  }
}

async function handleDelete(id) {
  if (confirm('Tem certeza que deseja desativar este cartão?')) {
    try {
      await cardsApi.delete(id);
      await loadData();
    } catch (err) {
      alert('Erro ao excluir cartão.');
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Cartões</h1>
      <button
        @click="isModalOpen = true"
        class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
      >
        + Novo Cartão
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
      Carregando cartões...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="cards.length === 0" class="p-12 text-center bg-white rounded-xl border border-slate-200">
      <p class="text-slate-500 mb-4">Você ainda não possui cartões cadastrados.</p>
      <button
        @click="isModalOpen = true"
        class="text-emerald-600 font-semibold hover:underline"
      >
        Cadastrar primeiro cartão
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="card in cards"
        :key="card.id"
        class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <span
              class="text-xs font-semibold px-2.5 py-0.5 rounded"
              :class="card.tipo === 'CREDITO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ card.tipo }}
            </span>
            <button
              @click="handleDelete(card.id)"
              class="text-xs text-rose-500 hover:text-rose-700 font-medium"
            >
              Excluir
            </button>
          </div>
          <h3 class="text-lg font-bold text-slate-800">{{ card.nome }}</h3>
          <p v-if="card.bandeira" class="text-xs text-slate-400 mt-0.5">{{ card.bandeira }}</p>
        </div>

        <div v-if="card.tipo === 'CREDITO'" class="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Limite:</span>
            <span class="font-bold text-slate-800">{{ formatCentsToBRL(Number(card.limite_cents)) }}</span>
          </div>
          <div class="flex justify-between text-xs text-slate-400">
            <span>Fecha dia {{ card.dia_fechamento }}</span>
            <span>Vence dia {{ card.dia_vencimento }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Novo Cartão -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Adicionar Novo Cartão</h2>

        <form @submit.prevent="handleCreateCard" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nome do Cartão</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="ex: Nubank Gold..."
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select
              v-model="form.tipo"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Bandeira (opcional)</label>
            <input
              v-model="form.bandeira"
              type="text"
              placeholder="ex: Mastercard, Visa..."
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div v-if="form.tipo === 'DEBITO'">
            <label class="block text-sm font-medium text-slate-700 mb-1">Conta Bancária Associada</label>
            <select
              v-model="form.conta_id"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Selecione uma conta</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.nome }}
              </option>
            </select>
          </div>

          <div v-if="form.tipo === 'CREDITO'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Limite (R$)</label>
              <input
                v-model.number="form.limiteReais"
                type="number"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Dia Fechamento</label>
                <input
                  v-model.number="form.dia_fechamento"
                  type="number"
                  min="1"
                  max="31"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Dia Vencimento</label>
                <input
                  v-model.number="form.dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
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

