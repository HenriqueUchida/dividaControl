<script setup>
import { ref, computed, onMounted } from 'vue';
import { categoriesApi } from '../services/api.js';

const categories = ref([]);
const loading = ref(true);
const error = ref('');
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const seeding = ref(false);

const form = ref({
  nome: '',
  tipo: 'expense',
});

const editingCategory = ref({
  id: '',
  nome: '',
});

const expenseCategories = computed(() =>
  categories.value.filter((c) => c.tipo === 'expense')
);

const incomeCategories = computed(() =>
  categories.value.filter((c) => c.tipo === 'income')
);

async function loadCategories() {
  loading.value = true;
  error.value = '';
  try {
    const res = await categoriesApi.list();
    categories.value = res.data;
  } catch (err) {
    error.value = 'Erro ao carregar categorias.';
  } finally {
    loading.value = false;
  }
}

async function handleCreateCategory() {
  try {
    await categoriesApi.create({
      nome: form.value.nome,
      tipo: form.value.tipo,
    });
    isCreateModalOpen.value = false;
    form.value = { nome: '', tipo: 'expense' };
    await loadCategories();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao criar categoria.');
  }
}

function openEditModal(category) {
  editingCategory.value = { id: category.id, nome: category.nome };
  isEditModalOpen.value = true;
}

async function handleUpdateCategory() {
  try {
    await categoriesApi.update(editingCategory.value.id, {
      nome: editingCategory.value.nome,
    });
    isEditModalOpen.value = false;
    await loadCategories();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao atualizar categoria.');
  }
}

async function handleDelete(id) {
  if (confirm('Tem certeza que deseja desativar esta categoria?')) {
    try {
      await categoriesApi.delete(id);
      await loadCategories();
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  }
}

async function handleSeedDefaults() {
  seeding.value = true;
  try {
    const res = await categoriesApi.seedDefaults();
    alert(res.data.message || 'Categorias geradas com sucesso!');
    await loadCategories();
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Erro ao gerar categorias padrão.';
    alert(errorMsg);
  } finally {
    seeding.value = false;
  }
}

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Categorias</h1>
        <p class="text-sm text-slate-500 mt-0.5">Classificação e organização das suas despesas e receitas</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          @click="handleSeedDefaults"
          :disabled="seeding"
          class="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition text-sm disabled:opacity-50 active:scale-95"
          title="Gera categorias padrões como Alimentação, Moradia, Salário, etc."
        >
          <span>✨</span>
          <span>{{ seeding ? 'Gerando...' : 'Gerar Padrões' }}</span>
        </button>

        <button
          @click="isCreateModalOpen = true"
          class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-sm"
        >
          <span>+</span> Nova Categoria
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
      <p class="font-medium animate-pulse text-slate-600">Carregando categorias...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="categories.length === 0" class="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl font-bold">
        🏷️
      </div>
      <p class="text-slate-600 font-medium mb-1">Nenhuma categoria cadastrada</p>
      <p class="text-xs text-slate-400 mb-5">Você pode criar uma nova ou gerar automaticamente o conjunto padrão</p>
      <button
        @click="handleSeedDefaults"
        class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm transition"
      >
        ✨ Gerar Categorias Padrão Agora
      </button>
    </div>

    <!-- Conteúdo com duas colunas bem definidas -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Coluna: Despesas -->
      <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-sm">
              ↓
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Despesas</h2>
              <p class="text-xs text-slate-400">Classificação dos seus gastos</p>
            </div>
          </div>
          <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {{ expenseCategories.length }}
          </span>
        </div>

        <div v-if="expenseCategories.length === 0" class="text-center py-8 text-xs text-slate-400">
          Nenhuma categoria de despesa cadastrada.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition"
          >
            <span class="font-bold text-slate-800 text-sm">{{ cat.nome }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(cat)"
                class="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/60 transition"
              >
                Editar
              </button>
              <button
                @click="handleDelete(cat.id)"
                class="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna: Receitas -->
      <div class="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
              ↑
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Receitas</h2>
              <p class="text-xs text-slate-400">Classificação das suas entradas</p>
            </div>
          </div>
          <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {{ incomeCategories.length }}
          </span>
        </div>

        <div v-if="incomeCategories.length === 0" class="text-center py-8 text-xs text-slate-400">
          Nenhuma categoria de receita cadastrada.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="cat in incomeCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition"
          >
            <span class="font-bold text-slate-800 text-sm">{{ cat.nome }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(cat)"
                class="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/60 transition"
              >
                Editar
              </button>
              <button
                @click="handleDelete(cat.id)"
                class="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nova Categoria -->
    <div
      v-if="isCreateModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Nova Categoria</h2>
        <p class="text-xs text-slate-500 mb-5">Crie uma categoria para organizar suas finanças</p>

        <form @submit.prevent="handleCreateCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipo de Categoria</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.tipo = 'expense'"
                class="py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5"
                :class="form.tipo === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'"
              >
                <span>↓</span> Despesa
              </button>
              <button
                type="button"
                @click="form.tipo = 'income'"
                class="py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5"
                :class="form.tipo === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'"
              >
                <span>↑</span> Receita
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nome da Categoria</label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="ex: Farmácia, Combustível, Bônus..."
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isCreateModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Salvar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Categoria -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-1">Editar Categoria</h2>
        <p class="text-xs text-slate-500 mb-5">Altere o nome da categoria selecionada</p>

        <form @submit.prevent="handleUpdateCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Novo Nome</label>
            <input
              v-model="editingCategory.nome"
              type="text"
              required
              class="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isEditModalOpen = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Atualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

