import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Research Workspace' }
    },
    {
      path: '/research/new',
      name: 'research-new',
      component: () => import('../views/NewResearchView.vue'),
      meta: { title: 'Riset Baru' }
    },
    {
      path: '/research/:id',
      name: 'research-session',
      component: () => import('../views/ResearchSessionView.vue'),
      meta: { title: 'Sesi Riset' }
    },
    {
      path: '/company/:symbol',
      name: 'company-detail',
      component: () => import('../views/CompanyView.vue'),
      meta: { title: 'Analisis Perusahaan' }
    },
    {
      path: '/screener',
      name: 'screener',
      component: () => import('../views/ScreenerView.vue'),
      meta: { title: 'Autonomous Screener' }
    },
    {
      path: '/peers',
      name: 'peers',
      component: () => import('../views/PeersView.vue'),
      meta: { title: 'Peer Comparison Matrix' }
    },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('../views/ActivityView.vue'),
      meta: { title: 'Aktivitas Riset' }
    },
    {
      path: '/trace',
      name: 'trace',
      component: () => import('../views/TraceView.vue'),
      meta: { title: 'Tool Trace & Observability' }
    },
    {
      path: '/methodology',
      name: 'methodology',
      component: () => import('../views/MethodologyView.vue'),
      meta: { title: 'Derived Intelligence Scoring' }
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportView.vue'),
      meta: { title: 'Final Research Report' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Halaman Tidak Ditemukan' }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (_to.hash) return { el: _to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + ' — ' : ''}Voyager One Financial Agent`
})

export default router
