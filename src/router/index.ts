import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/PGS_Research/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/landing-page'
    },
    {
      path: '/landing-page',
      name: 'landing-page',
      component: () => import('../views/PGS_Marketing/LandingPageView.vue'),
      meta: { title: 'Selamat Datang di Voyager One' }
    },
    {
      path: '/workspace',
      name: 'home',
      component: HomeView,
      meta: { title: 'Riset saham' }
    },
    {
      path: '/research',
      name: 'research-library',
      component: () => import('../views/PGS_Research/ResearchLibraryView.vue'),
      meta: { title: 'Pustaka Riset' }
    },
    {
      path: '/research/new',
      name: 'research-new',
      component: () => import('../views/PGS_Research/NewResearchView.vue'),
      meta: { title: 'Riset Baru' }
    },
    {
      path: '/research/:id',
      name: 'research-session',
      component: () => import('../views/PGS_Research/ResearchSessionView.vue'),
      meta: { title: 'Sesi Riset' }
    },
    {
      path: '/research/:id/screener',
      name: 'research-screener',
      component: () => import('../views/PGS_Research/ScreenerView.vue'),
      meta: { title: 'Proses Penyaringan' }
    },
    {
      path: '/research/:id/peers',
      name: 'research-peers',
      component: () => import('../views/PGS_Research/PeersView.vue'),
      meta: { title: 'Perbandingan Kandidat' }
    },
    {
      path: '/research/:id/activity',
      name: 'research-activity',
      redirect: to => `/research/${to.params.id}`,
      meta: { title: 'Aktivitas Riset' }
    },
    {
      path: '/research/:id/trace',
      name: 'research-trace',
      redirect: to => `/research/${to.params.id}`,
      meta: { title: 'Audit Teknis' }
    },
    {
      path: '/research/:id/report',
      name: 'research-report',
      component: () => import('../views/PGS_Research/ReportView.vue'),
      meta: { title: 'Laporan Riset' }
    },
    {
      path: '/research/:id/company/:symbol',
      name: 'research-company',
      component: () => import('../views/PGS_Company/CompanyView.vue'),
      meta: { title: 'Analisis Perusahaan' }
    },
    {
      path: '/company/:symbol',
      name: 'company-detail',
      component: () => import('../views/PGS_Company/CompanyView.vue'),
      meta: { title: 'Analisis Perusahaan' }
    },
    {
      path: '/screener',
      name: 'screener',
      component: () => import('../views/PGS_Research/ScreenerView.vue'),
      meta: { title: 'Proses Penyaringan' }
    },
    {
      path: '/peers',
      name: 'peers',
      component: () => import('../views/PGS_Research/PeersView.vue'),
      meta: { title: 'Perbandingan Kandidat' }
    },
    {
      path: '/activity',
      name: 'activity',
      redirect: '/research',
      meta: { title: 'Aktivitas Riset' }
    },
    {
      path: '/trace',
      name: 'trace',
      redirect: '/research',
      meta: { title: 'Audit Teknis' }
    },
    {
      path: '/methodology',
      name: 'methodology',
      component: () => import('../views/PGS_Docs/MethodologyView.vue'),
      meta: { title: 'Metodologi Penilaian' }
    },
    {
      path: '/glossary',
      name: 'glossary',
      component: () => import('../views/PGS_Docs/GlossaryView.vue'),
      meta: { title: 'Kamus Istilah Finansial' }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/PGS_Docs/HelpView.vue'),
      meta: { title: 'Bantuan' }
    },
    {
      path: '/accessibility',
      name: 'accessibility',
      component: () => import('../views/PGS_Docs/AccessibilityView.vue'),
      meta: { title: 'Status Aksesibilitas' }
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/PGS_Research/ReportView.vue'),
      meta: { title: 'Laporan Riset' }
    },
    {
      path: '/schedules',
      name: 'schedules',
      redirect: '/research',
      meta: { title: 'Riset Terjadwal' }
    },
    {
      path: '/economic-calendar',
      name: 'economic-calendar',
      component: () => import('../views/PGS_Economic/EconomicDateView.vue'),
      meta: { title: 'Kalender Ekonomi' }
    },
    {
      path: '/economic-calendar/detail',
      name: 'economic-calendar-detail',
      component: () => import('../views/PGS_Economic/EconomicDetailView.vue'),
      meta: { title: 'Rincian Agenda Ekonomi' }
    },
    {
      path: '/economic-date',
      name: 'economic-date',
      redirect: '/economic-calendar',
      meta: { title: 'Kalender Ekonomi' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/common/NotFoundView.vue'),
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
  document.title = `${to.meta.title ? to.meta.title + ' — ' : ''}Voyager One`
})

export default router
