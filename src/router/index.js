import { createRouter, createWebHistory } from 'vue-router'
import InvitationView from '../views/InvitationView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import QRDownloadView from '../views/QRDownloadView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView,
      beforeEnter: () => {
        return localStorage.getItem('token') ? '/admin/dashboard' : true
      },
    },
    {
      path: '/qr-download/:id?',
      component: QRDownloadView,
      beforeEnter: () => {
        return true
      },
    },
    {
      path: '/:id?',
      component: InvitationView,
      beforeEnter: () => {
        return true
      },
    }, // Optional ID for testing preview
    {
      path: '/admin',
      component: LoginView,
      beforeEnter: () => {
        return localStorage.getItem('token') ? '/admin/dashboard' : true
      },
    },
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
