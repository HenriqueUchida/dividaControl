import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: () => import('../views/AccountsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cards',
    name: 'Cards',
    component: () => import('../views/CardsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/TransactionsView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  return next();
});

export default router;

