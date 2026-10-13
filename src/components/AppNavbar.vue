<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { getEconomicEvents } from '../services/researchApi'
import {
  CalendarDays
} from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 8 }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Nearest economic forum / release count from backend; degrades to 0 (no dot) on failure.
const economicCount = ref(0)
onMounted(async () => {
  try { economicCount.value = (await getEconomicEvents()).length }
  catch { economicCount.value = 0 }
})

const isSessionRoute = computed(() => typeof route.params.id === 'string')
const sessionTitle = computed(() => store.presets.find(preset => preset.id === store.activePresetId)?.title || 'Sesi riset')

interface BreadcrumbItem {
  label: string
  to?: string
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const name = String(route.name || '')
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  const symbol = typeof route.params.symbol === 'string' ? route.params.symbol.toUpperCase() : ''

  const crumbs: BreadcrumbItem[] = [
    { label: 'Beranda', to: '/' }
  ]

  // Session-scoped routes
  if (isSessionRoute.value && id) {
    crumbs.push({ label: 'Pustaka', to: '/research' })
    crumbs.push({
      label: sessionTitle.value,
      to: name === 'research-session' ? undefined : `/research/${id}`
    })

    if (name === 'research-screener') {
      crumbs.push({ label: 'Proses Penyaringan' })
    } else if (name === 'research-peers') {
      crumbs.push({ label: 'Perbandingan Kandidat' })
    } else if (name === 'research-report') {
      crumbs.push({ label: 'Laporan Riset' })
    } else if (name === 'research-company') {
      crumbs.push({ label: 'Laporan Riset', to: `/research/${id}/report` })
      crumbs.push({ label: symbol || 'Analisis Emiten' })
    }
    return crumbs
  }

  // Non-session standalone routes
  switch (name) {
    case 'research-library':
      crumbs.push({ label: 'Pustaka Riset' })
      break
    case 'research-new':
      crumbs.push({ label: 'Pustaka', to: '/research' })
      crumbs.push({ label: 'Riset Baru' })
      break
    case 'screener':
      crumbs.push({ label: 'Proses Penyaringan' })
      break
    case 'peers':
      crumbs.push({ label: 'Perbandingan Kandidat' })
      break
    case 'report':
      crumbs.push({ label: 'Laporan Riset' })
      break
    case 'company-detail':
      crumbs.push({ label: 'Pustaka', to: '/research' })
      crumbs.push({ label: symbol || 'Analisis Emiten' })
      break
    case 'methodology':
      crumbs.push({ label: 'Metodologi Penilaian' })
      break
    case 'glossary':
      crumbs.push({ label: 'Kamus Istilah Finansial' })
      break
    case 'help':
      crumbs.push({ label: 'Bantuan' })
      break
    case 'accessibility':
      crumbs.push({ label: 'Status Aksesibilitas' })
      break
    case 'economic-calendar':
    case 'economic-date':
      crumbs.push({ label: 'Kalender Ekonomi' })
      break
    case 'economic-calendar-detail':
      crumbs.push({ label: 'Kalender Ekonomi', to: '/economic-calendar' })
      crumbs.push({ label: 'Rincian Penuh' })
      break
    case 'not-found':
      crumbs.push({ label: 'Halaman Tidak Ditemukan' })
      break
    case 'landing-page':
      crumbs.push({ label: 'Selamat Datang' })
      break
    default:
      // When at Home ('home')
      break
  }

  return crumbs
})

const pageTitle = computed(() => {
  switch (route.name) {
    case 'landing-page': return 'Selamat Datang di Voyager.One'
    case 'screener': return 'Proses Penyaringan'
    case 'peers': return 'Perbandingan Kandidat'
    case 'trace': return 'Audit Teknis'
    case 'activity': return 'Aktivitas Riset'
    case 'methodology': return 'Metodologi Penilaian'
    case 'glossary': return 'Kamus Istilah Finansial'
    case 'help': return 'Bantuan'
    case 'accessibility': return 'Status Aksesibilitas'
    case 'report': return 'Laporan Riset'
    case 'research-new': return 'Riset Baru'
    case 'research-library': return 'Pustaka Riset'
    case 'research-session': return 'Sesi Riset'
    case 'research-screener': return 'Proses Penyaringan'
    case 'research-peers': return 'Perbandingan Kandidat'
    case 'research-activity': return 'Aktivitas Riset'
    case 'research-trace': return 'Audit Teknis'
    case 'research-report': return 'Laporan Riset'
    case 'company-detail': return route.params.symbol ? `Analisis ${String(route.params.symbol).toUpperCase()}` : 'Analisis Perusahaan'
    case 'research-company': return route.params.symbol ? `Analisis ${String(route.params.symbol).toUpperCase()}` : 'Analisis Perusahaan'
    case 'economic-calendar-detail': return 'Rincian Agenda Ekonomi'
    case 'not-found': return 'Halaman Tidak Ditemukan'
    default: return 'Workspace Riset'
  }
})

const journeySteps = computed(() => [
  { label: 'Ringkasan', name: 'research-session', to: `/research/${store.report.sessionId}` },
  { label: 'Seleksi', name: 'research-screener', to: `/research/${store.report.sessionId}/screener` },
  { label: 'Perbandingan', name: 'research-peers', to: `/research/${store.report.sessionId}/peers` },
  { label: 'Laporan', name: 'research-report', to: `/research/${store.report.sessionId}/report` }
])
</script>

<template>
  <header class="w-full pt-3 px-4 sm:px-6 lg:px-8 print:hidden">
    <div
      class="w-full max-w-[96rem] flex h-16 items-center justify-between gap-4 px-4 sm:px-6 rounded-2xl border transition-all duration-200"
      :class="isScrolled
        ? 'border-slate-200/90 bg-white/95 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.12)] backdrop-blur-md backdrop-saturate-150 ring-1 ring-slate-900/5'
        : 'border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5'"
    >
      
      <!-- Left: Semantic Horizontal Breadcrumbs (No duplicate bulky h1) -->
      <div class="flex items-center gap-3 min-w-0">
        <nav aria-label="Navigasi rekam jejak" class="flex items-center text-xs overflow-x-auto no-scrollbar py-0.5">
          <ol class="flex items-center whitespace-nowrap gap-1.5 text-xs font-medium text-slate-500">
            <li
              v-for="(crumb, idx) in breadcrumbs"
              :key="`${crumb.label}-${idx}`"
              class="inline-flex items-center gap-1.5 shrink-0"
            >
              <span v-if="idx > 0" class="text-slate-300 font-normal select-none" aria-hidden="true">/</span>

              <!-- Linked parent breadcrumb -->
              <router-link
                v-if="crumb.to && idx < breadcrumbs.length - 1"
                :to="crumb.to"
                class="text-slate-500 transition-colors duration-150 hover:text-[#1E4270] hover:underline underline-offset-2"
              >
                {{ crumb.label }}
              </router-link>

              <!-- Current page leaf breadcrumb -->
              <span
                v-else
                class="font-semibold text-slate-900 tracking-tight"
                aria-current="page"
              >
                {{ crumb.label }}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Center: Session journey stepper (only on session routes) -->
      <nav
        v-if="isSessionRoute"
        class="hidden md:flex items-center rounded-lg bg-slate-100/90 p-0.5 border border-slate-200/60 text-xs shrink-0 shadow-2xs"
        aria-label="Tahap riset"
      >
        <router-link
          v-for="(step, index) in journeySteps"
          :key="step.name"
          :to="step.to"
          class="group flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150"
          :class="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company')
            ? 'bg-white text-[#1E4270] shadow-xs font-semibold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'"
          :aria-current="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company') ? 'step' : undefined"
        >
          <span
            class="font-mono text-[10px] tabular-nums font-bold"
            :class="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company') ? 'text-[#244F87]' : 'text-slate-400'"
          >0{{ index + 1 }}</span>
          <span class="tracking-tight">{{ step.label }}</span>
        </router-link>
      </nav>

      <!-- Right: Utilities -->
      <div class="flex shrink-0 items-center gap-2.5">
        <div class="hidden lg:inline-flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-200/70 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <span class="size-1.5 rounded-full bg-emerald-500"></span>
          <span class="font-mono text-[10px]">Riset Terbuka</span>
        </div>

        <!-- Quick Economic Calendar Navigation Button -->
        <router-link
          to="/economic-calendar"
          class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-[#1E4270] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#244F87]"
          :aria-label="economicCount > 0 ? `Kalender ekonomi, ${economicCount} agenda` : 'Kalender ekonomi'"
          title="Buka Kalender Ekonomi"
        >
          <CalendarDays class="size-3.5 text-slate-500" aria-hidden="true" />
          <span class="hidden sm:inline">Kalender</span>
          <span
            v-if="economicCount > 0"
            class="inline-flex items-center font-mono text-[10px] font-bold tabular-nums text-slate-600 bg-slate-100 rounded px-1.5 py-0.5"
          >
            {{ economicCount > 99 ? '99+' : economicCount }}
          </span>
        </router-link>
      </div>

    </div>
  </header>
</template>
