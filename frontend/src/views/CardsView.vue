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
      payload.limite_cents = Math.round(Number(form.value.limiteReais || 0) * 100);
      payload.dia_fechamento = Number(form.value.dia_fechamento);
      payload.dia_vencimento = Number(form.value.dia_vencimento);
    }

    await cardsApi.create(payload);
    isModalOpen.value = false;
    form.value = {
      nome: '',
      tipo: 'CREDITO',
      bandeira: '',
      conta_id: '',
      limiteReais: 0,
      dia_fechamento: 25,
      dia_vencimento: 5,
    };
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
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Meus Cartões</h1>
        <p class="text-sm text-slate-500 mt-0.5">Gerenciamento de cartões de crédito, débito e limites</p>
      </div>
      <button
        @click="isModalOpen = true"
        class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
      >
        <span>+</span> Novo Cartão
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
      <p class="font-medium animate-pulse text-slate-600">Carregando seus cartões...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="cards.length === 0" class="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl font-bold">
        💳
      </div>
      <p class="text-slate-600 font-medium mb-1">Nenhum cartão cadastrado</p>
      <p class="text-xs text-slate-400 mb-4">Adicione seus cartões para controlar compras e faturas</p>
      <button
        @click="isModalOpen = true"
        class="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
      >
        + Cadastrar primeiro cartão
      </button>
    </div>

    <!-- Grid de Cartões estilo Cartão Real -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="card in cards"
        :key="card.id"
        class="rounded-2xl p-6 shadow-md transition hover:shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        :class="card.tipo === 'CREDITO' 
          ? 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/40' 
          : 'bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 text-white border border-sky-900/40'"
      >
        <!-- Topo do Cartão -->
        <div class="flex items-start justify-between">
          <div>
            <span
              class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
              :class="card.tipo === 'CREDITO' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'"
            >
              {{ card.tipo }}
            </span>
            <h3 class="text-xl font-black mt-2 tracking-tight">{{ card.nome }}</h3>
          </div>

          <button
            @click="handleDelete(card.id)"
            title="Excluir cartão"
            class="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <!-- Simulação de Chip e Contactless -->
        <div class="flex items-center gap-3 my-4 opacity-80">
          <div class="w-10 h-7 rounded-md bg-amber-400/30 border border-amber-300/40 flex items-center justify-center">
            <div class="w-6 h-4 border border-amber-300/60 rounded-xs"></div>
          </div>
          <span class="text-xs text-slate-400 font-mono tracking-widest">•••• •••• •••• 9999</span>
        </div>

        <!-- Rodapé do Cartão com Métricas -->
        <div class="pt-3 border-t border-white/10 flex items-end justify-between">
          <div v-if="card.tipo === 'CREDITO'">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Limite Total</span>
            <span class="text-lg font-extrabold text-white">
              {{ formatCentsToBRL(Number(card.limite_cents)) }}
            </span>
            <div class="flex gap-3 text-[11px] text-slate-300 mt-1">
              <span>Fecha dia <strong>{{ card.dia_fechamento }}</strong></span>
              <span>Vence dia <strong>{{ card.dia_vencimento }}</strong></span>
            </div>
          </div>

          <div v-else>
            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Modalidade</span>
            <span class="text-sm font-semibold text-sky-200">Débito em Conta</span>
          </div>

          <span v-if="card.bandeira" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {{ card.bandeira }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Novo Cartão -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Cadastrar Cartão</h2>
        <p class="text-xs text-slate-500 mb-5">Preencha as informações do seu cartão</p>

        <form @submit.prevent="handleCreateCard" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nome do Cartão</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="ex: Nubank Ultravioleta, Inter Black..."
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipo de Cartão</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.tipo = 'CREDITO'"
                class="py-2 text-xs font-bold rounded-xl border transition"
                :class="form.tipo === 'CREDITO' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600'"
              >
                Crédito
              </button>
              <button
                type="button"
                @click="form.tipo = 'DEBITO'"
                class="py-2 text-xs font-bold rounded-xl border transition"
                :class="form.tipo === 'DEBITO' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'border-slate-200 text-slate-600'"
              >
                Débito
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Bandeira (opcional)</label>
            <input
              v-model="form.bandeira"
              type="text"
              placeholder="ex: Mastercard, Visa, Elo..."
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div v-if="form.tipo === 'DEBITO'">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Conta Bancária Vinculada</label>
            <select
              v-model="form.conta_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione uma conta bancária</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.nome }} ({{ acc.tipo }})
              </option>
            </select>
          </div>

          <div v-if="form.tipo === 'CREDITO'" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Limite (R$)</label>
              <input
                v-model.number="form.limiteReais"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="5000,00"
                class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Dia Fechamento</label>
                <input
                  v-model.number="form.dia_fechamento"
                  type="number"
                  min="1"
                  max="31"
                  required
                  class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Dia Vencimento</label>
                <input
                  v-model.number="form.dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  required
                  class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
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
              Salvar Cartão
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
