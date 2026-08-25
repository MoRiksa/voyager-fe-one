import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScreenerView from '../views/ScreenerView.vue'
import PeersView from '../views/PeersView.vue'
import TraceView from '../views/TraceView.vue'
import MethodologyView from '../views/MethodologyView.vue'
import ReportView from '../views/ReportView.vue'

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
      path: '/screener',
      name: 'screener',
      component: ScreenerView,
      meta: { title: 'Autonomous Screener' }
    },
    {
      path: '/peers',
      name: 'peers',
      component: PeersView,
      meta: { title: 'Peer Comparison Matrix' }
    },
    {
      path: '/trace',
      name: 'trace',
      component: TraceView,
      meta: { title: 'Tool Trace & Observability' }
    },
    {
      path: '/methodology',
      name: 'methodology',
      component: MethodologyView,
      meta: { title: 'Derived Intelligence Scoring' }
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView,
      meta: { title: 'Final Research Report' }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + ' — ' : ''}Voyager One Financial Agent`
})

export default router
