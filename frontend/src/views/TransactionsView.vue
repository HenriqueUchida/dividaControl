<script setup>
import { ref, onMounted } from 'vue';
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
  origemTipo: 'conta', // 'conta' ou 'cartao'
  conta_id: '',
  cartao_id: '',
});

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
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Transações e Extrato</h1>
      <div class="space-x-3">
        <button
          @click="isTransferModalOpen = true"
          class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded-lg shadow-sm transition"
        >
          Transferir
        </button>
        <button
          @click="isTxModalOpen = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
        >
          + Novo Lançamento
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
      Carregando extrato...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="transactions.length === 0" class="p-12 text-center bg-white rounded-xl border border-slate-200">
      <p class="text-slate-500 mb-4">Nenhuma transação encontrada.</p>
      <button
        @click="isTxModalOpen = true"
        class="text-emerald-600 font-semibold hover:underline"
      >
        Registrar primeiro lançamento
      </button>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th class="py-3 px-4">Data</th>
            <th class="py-3 px-4">Descrição</th>
            <th class="py-3 px-4">Categoria</th>
            <th class="py-3 px-4">Origem</th>
            <th class="py-3 px-4 text-right">Valor</th>
            <th class="py-3 px-4 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-slate-50/50">
            <td class="py-3 px-4 text-slate-500 whitespace-nowrap">{{ formatDateBR(tx.date) }}</td>
            <td class="py-3 px-4 font-medium text-slate-800">{{ tx.descricao }}</td>
            <td class="py-3 px-4 text-slate-600">{{ tx.categoria_nome || '-' }}</td>
            <td class="py-3 px-4 text-slate-600">{{ tx.conta_nome || tx.cartao_nome || '-' }}</td>
            <td
              class="py-3 px-4 text-right font-bold whitespace-nowrap"
              :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ tx.type === 'income' ? '+' : '-' }} {{ formatCentsToBRL(Number(tx.amount_cents)) }}
            </td>
            <td class="py-3 px-4 text-center">
              <button
                @click="handleDelete(tx.id)"
                class="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Novo Lançamento -->
    <div
      v-if="isTxModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Novo Lançamento</h2>

        <form @submit.prevent="handleCreateTransaction" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="txForm.type = 'expense'"
                class="py-2 text-sm font-semibold rounded-lg border transition"
                :class="txForm.type === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'"
              >
                Despesa
              </button>
              <button
                type="button"
                @click="txForm.type = 'income'"
                class="py-2 text-sm font-semibold rounded-lg border transition"
                :class="txForm.type === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'"
              >
                Receita
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input
              v-model="txForm.descricao"
              type="text"
              required
              placeholder="ex: Mercado, Almoço..."
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input
                v-model.number="txForm.amountReais"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                v-model="txForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select
              v-model="txForm.categoria_id"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.nome }} ({{ cat.tipo }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Origem do Pagamento</label>
            <div class="grid grid-cols-2 gap-3 mb-2">
              <label class="flex items-center text-sm text-slate-700">
                <input type="radio" value="conta" v-model="txForm.origemTipo" class="mr-2" />
                Conta Bancária
              </label>
              <label class="flex items-center text-sm text-slate-700">
                <input type="radio" value="cartao" v-model="txForm.origemTipo" class="mr-2" />
                Cartão
              </label>
            </div>

            <select
              v-if="txForm.origemTipo === 'conta'"
              v-model="txForm.conta_id"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

    <!-- Modal Transferência -->
    <div
      v-if="isTransferModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Transferência entre Contas</h2>

        <form @submit.prevent="handleCreateTransfer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Conta de Origem (Saída)</label>
            <select
              v-model="transferForm.conta_origem_id"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Selecione a conta de saída</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Conta de Destino (Entrada)</label>
            <select
              v-model="transferForm.conta_destino_id"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label class="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input
                v-model.number="transferForm.amountReais"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input
                v-model="transferForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
            <input
              v-model="transferForm.descricao"
              type="text"
              placeholder="ex: Aplicação na poupança"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isTransferModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

