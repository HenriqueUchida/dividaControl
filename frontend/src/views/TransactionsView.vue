<script setup>
import { ref, computed, onMounted } from 'vue';
import { transactionsApi, accountsApi, categoriesApi, cardsApi } from '../services/api.js';
import { formatCentsToBRL, formatDateBR } from '../utils/formatters.js';

const transactions = ref([]);
const accounts = ref([]);
const categories = ref([]);
const cards = ref([]);
const loading = ref(true);
const error = ref('');

const isTxModalOpen = ref(false);
const isTransferModalOpen = ref(false);

const txForm = ref({
  descricao: '',
  amountReais: 0,
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  categoria_id: '',
  origemTipo: 'conta',
  conta_id: '',
  cartao_id: '',
});

// Filtra as categorias para exibir apenas as correspondentes ao tipo de lançamento selecionado
const filteredCategories = computed(() => {
  return categories.value.filter((cat) => cat.tipo === txForm.value.type);
});

function setTxType(newType) {
  txForm.value.type = newType;
  const currentCategory = categories.value.find((c) => c.id === txForm.value.categoria_id);
  if (currentCategory && currentCategory.tipo !== newType) {
    txForm.value.categoria_id = '';
  }
}

const transferForm = ref({
  conta_origem_id: '',
  conta_destino_id: '',
  amountReais: 0,
  date: new Date().toISOString().slice(0, 10),
  descricao: '',
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [txRes, accRes, catRes, cardRes] = await Promise.all([
      transactionsApi.list(),
      accountsApi.list(),
      categoriesApi.list(),
      cardsApi.list(),
    ]);

    transactions.value = txRes.data;
    accounts.value = accRes.data;
    categories.value = catRes.data;
    cards.value = cardRes.data;
  } catch (err) {
    error.value = 'Erro ao carregar transações.';
  } finally {
    loading.value = false;
  }
}

async function handleCreateTransaction() {
  try {
    const amount_cents = Math.round(Number(txForm.value.amountReais || 0) * 100);

    const payload = {
      descricao: txForm.value.descricao,
      amount_cents,
      type: txForm.value.type,
      date: txForm.value.date,
      categoria_id: txForm.value.categoria_id,
    };

    if (txForm.value.origemTipo === 'conta') {
      payload.conta_id = txForm.value.conta_id;
    } else {
      payload.cartao_id = txForm.value.cartao_id;
    }

    await transactionsApi.create(payload);
    isTxModalOpen.value = false;
    txForm.value = {
      descricao: '',
      amountReais: 0,
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      categoria_id: '',
      origemTipo: 'conta',
      conta_id: '',
      cartao_id: '',
    };
    await loadData();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao criar transação.');
  }
}

async function handleCreateTransfer() {
  try {
    const amount_cents = Math.round(Number(transferForm.value.amountReais || 0) * 100);

    await transactionsApi.transfer({
      conta_origem_id: transferForm.value.conta_origem_id,
      conta_destino_id: transferForm.value.conta_destino_id,
      amount_cents,
      date: transferForm.value.date,
      descricao: transferForm.value.descricao || undefined,
    });

    isTransferModalOpen.value = false;
    transferForm.value = {
      conta_origem_id: '',
      conta_destino_id: '',
      amountReais: 0,
      date: new Date().toISOString().slice(0, 10),
      descricao: '',
    };
    await loadData();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao realizar transferência.');
  }
}

async function handleDelete(id) {
  if (confirm('Tem certeza que deseja excluir este lançamento?')) {
    try {
      await transactionsApi.delete(id);
      await loadData();
    } catch (err) {
      alert('Erro ao excluir transação.');
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
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Transações</h1>
        <p class="text-sm text-slate-500 mt-0.5">Extrato completo de receitas, despesas e transferências</p>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          @click="isTransferModalOpen = true"
          class="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-sm"
        >
          <span>⇄</span> Transferir
        </button>
        <button
          @click="isTxModalOpen = true"
          class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-sm"
        >
          <span>+</span> Novo Lançamento
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
      <p class="font-medium animate-pulse text-slate-600">Carregando extrato financeiro...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="transactions.length === 0" class="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl font-bold">
        📝
      </div>
      <p class="text-slate-600 font-medium mb-1">Nenhum lançamento encontrado</p>
      <p class="text-xs text-slate-400 mb-4">Registre despesas e receitas para acompanhar seu fluxo</p>
      <button
        @click="isTxModalOpen = true"
        class="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
      >
        + Registrar primeiro lançamento
      </button>
    </div>

    <!-- Tabela / Cards de Extrato -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <!-- Visualização Mobile (Cards) -->
      <div class="sm:hidden divide-y divide-slate-100">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="p-4 hover:bg-slate-50/70 transition flex flex-col gap-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="font-bold text-slate-900 text-sm">
              {{ tx.descricao }}
            </div>
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black shrink-0"
              :class="tx.type === 'income' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'"
            >
              <span>{{ tx.type === 'income' ? '↑' : '↓' }}</span>
              <span>{{ formatCentsToBRL(Number(tx.amount_cents)) }}</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-1 border-t border-slate-50">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDateBR(tx.date) }}
              </span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                {{ tx.categoria_nome || 'Sem categoria' }}
              </span>
              <span v-if="tx.conta_nome || tx.cartao_nome" class="text-slate-500 text-[11px] font-medium">
                • {{ tx.conta_nome || tx.cartao_nome }}
              </span>
            </div>
            <button
              @click="handleDelete(tx.id)"
              class="text-xs text-rose-500 hover:text-rose-700 font-bold p-1 hover:bg-rose-50 rounded-md transition"
              title="Excluir lançamento"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela Desktop / Tablet -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-5">Data</th>
              <th class="py-3.5 px-5">Descrição</th>
              <th class="py-3.5 px-5">Categoria</th>
              <th class="py-3.5 px-5">Origem</th>
              <th class="py-3.5 px-5 text-right">Valor</th>
              <th class="py-3.5 px-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50/70 transition">
              <td class="py-3.5 px-5 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDateBR(tx.date) }}
                </span>
              </td>
              <td class="py-3.5 px-5 font-bold text-slate-900">
                {{ tx.descricao }}
              </td>
              <td class="py-3.5 px-5">
                <span class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {{ tx.categoria_nome || 'Sem categoria' }}
                </span>
              </td>
              <td class="py-3.5 px-5 text-xs text-slate-600 font-medium">
                {{ tx.conta_nome || tx.cartao_nome || '-' }}
              </td>
              <td class="py-3.5 px-5 text-right whitespace-nowrap font-black">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg"
                  :class="tx.type === 'income' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'"
                >
                  <span>{{ tx.type === 'income' ? '↑' : '↓' }}</span>
                  <span>{{ formatCentsToBRL(Number(tx.amount_cents)) }}</span>
                </span>
              </td>
              <td class="py-3.5 px-5 text-center">
                <button
                  @click="handleDelete(tx.id)"
                  class="text-xs text-rose-500 hover:text-rose-700 font-bold p-1 hover:bg-rose-50 rounded-md transition"
                  title="Excluir lançamento"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Novo Lançamento -->
    <div
      v-if="isTxModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Novo Lançamento</h2>
        <p class="text-xs text-slate-500 mb-5">Adicione uma receita ou despesa financeira</p>

        <form @submit.prevent="handleCreateTransaction" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipo de Lançamento</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="setTxType('expense')"
                class="py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5"
                :class="txForm.type === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'"
              >
                <span>↓</span> Despesa
              </button>
              <button
                type="button"
                @click="setTxType('income')"
                class="py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5"
                :class="txForm.type === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'"
              >
                <span>↑</span> Receita
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Descrição</label>
            <input
              v-model="txForm.descricao"
              type="text"
              required
              placeholder="ex: Mercado da semana, Aluguel, Salário..."
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Valor (R$)</label>
              <input
                v-model.number="txForm.amountReais"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Data</label>
              <input
                v-model="txForm.date"
                type="date"
                required
                class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Categoria</label>
            <select
              v-model="txForm.categoria_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Origem do Movimento</label>
            <div class="grid grid-cols-2 gap-3 mb-2">
              <label class="flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="radio" value="conta" v-model="txForm.origemTipo" class="mr-2 text-emerald-600 focus:ring-emerald-500" />
                Conta Bancária
              </label>
              <label class="flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="radio" value="cartao" v-model="txForm.origemTipo" class="mr-2 text-emerald-600 focus:ring-emerald-500" />
                Cartão
              </label>
            </div>

            <select
              v-if="txForm.origemTipo === 'conta'"
              v-model="txForm.conta_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione a conta</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.nome }}
              </option>
            </select>

            <select
              v-else
              v-model="txForm.cartao_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione o cartão</option>
              <option v-for="c in cards" :key="c.id" :value="c.id">
                {{ c.nome }} ({{ c.tipo }})
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isTxModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Transferência -->
    <div
      v-if="isTransferModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Transferência entre Contas</h2>
        <p class="text-xs text-slate-500 mb-5">Movimente saldo entre contas com registro atômico</p>

        <form @submit.prevent="handleCreateTransfer" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Conta de Origem (Saída)</label>
            <select
              v-model="transferForm.conta_origem_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione a conta de saída</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Conta de Destino (Entrada)</label>
            <select
              v-model="transferForm.conta_destino_id"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="" disabled>Selecione a conta de entrada</option>
              <option
                v-for="acc in accounts"
                :key="acc.id"
                :value="acc.id"
                :disabled="acc.id === transferForm.conta_origem_id"
              >
                {{ acc.nome }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Valor (R$)</label>
              <input
                v-model.number="transferForm.amountReais"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Data</label>
              <input
                v-model="transferForm.date"
                type="date"
                required
                class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Descrição (opcional)</label>
            <input
              v-model="transferForm.descricao"
              type="text"
              placeholder="ex: Transferência para reserva"
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isTransferModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
