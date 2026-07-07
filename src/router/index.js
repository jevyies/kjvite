import { createRouter, createWebHistory } from 'vue-router'
import InvitationView from '../views/InvitationView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/:id?', component: InvitationView }, // Optional ID for testing preview
    { path: '/admin', component: LoginView },
    {
      path: '/admin/dashboard',
      component: DashboardView,
      beforeEnter: () => {
        return localStorage.getItem('token') ? true : '/admin'
      },
    },
  ],
})

export default router
