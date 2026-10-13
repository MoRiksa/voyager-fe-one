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
  <header class="sticky top-2 z-20 pt-1 print:hidden">
    <div class="mx-auto max-w-[84rem] px-2 sm:px-3 lg:px-4">
      <div
        class="flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-3.5 py-2 ring-1 transition-all duration-300 sm:min-h-16 sm:px-4"
        :class="isScrolled
          ? 'border-slate-200/90 bg-white/85 ring-slate-900/5 shadow-[0_12px_36px_-12px_rgba(15,33,56,0.18)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-slate-200/80 bg-white/95 ring-slate-900/5 shadow-[0_4px_20px_-8px_rgba(15,33,56,0.12)] backdrop-blur-md'"
      >
        <!-- Left: Semantic Text-Only Horizontal Breadcrumbs with Page Title -->
        <div class="min-w-0 flex-1 pr-2">
          <!-- Breadcrumb Trail Navigation: Clean horizontal text-only trail -->
          <nav aria-label="Navigasi rekam jejak" class="flex items-center text-xs overflow-x-auto no-scrollbar py-0.5">
            <ol class="flex items-center whitespace-nowrap gap-1.5 text-[11px] font-medium leading-none text-slate-400">
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
                  <span>{{ crumb.label }}</span>
                </router-link>

                <!-- Current page leaf breadcrumb -->
                <span
                  v-else
                  class="font-semibold text-slate-700 tracking-tight"
                  aria-current="page"
                >
                  {{ crumb.label }}
                </span>
              </li>
            </ol>
          </nav>

          <!-- Main Page Title Header -->
          <h1 class="mt-0.5 truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base lg:text-lg">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- Center: Session journey stepper (only on session routes) -->
        <nav
          v-if="isSessionRoute"
          class="hidden items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 xl:flex shrink-0 shadow-2xs"
          aria-label="Tahap riset"
        >
          <router-link
            v-for="(step, index) in journeySteps"
            :key="step.name"
            :to="step.to"
            class="group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
            :class="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company')
              ? 'bg-white text-[#1E4270] shadow-xs ring-1 ring-slate-900/5 font-bold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'"
            :aria-current="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company') ? 'step' : undefined"
          >
            <span
              class="font-mono text-[10px] tabular-nums font-bold transition-opacity"
              :class="route.name === step.name || (step.name === 'research-screener' && route.name === 'research-company') ? 'text-[#244F87]' : 'text-slate-400 group-hover:text-slate-600'"
            >0{{ index + 1 }}</span>
            <span class="tracking-tight">{{ step.label }}</span>
          </router-link>
        </nav>

        <!-- Right: Utilities -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- Quick Economic Calendar Navigation Button (Clean, tabular count without garish AI slop badge) -->
          <router-link
            to="/economic-calendar"
            class="group relative inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2.5 sm:px-3 text-slate-600 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-[#1E4270] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#244F87] sm:h-10"
            :aria-label="economicCount > 0 ? `Kalender ekonomi, ${economicCount} agenda terdekat` : 'Kalender ekonomi'"
            title="Buka Kalender Ekonomi"
          >
            <CalendarDays class="size-4 shrink-0 text-slate-500 transition-colors group-hover:text-[#244F87]" aria-hidden="true" />
            <span class="hidden md:inline text-xs font-semibold tracking-tight text-slate-700 group-hover:text-slate-900">
              Kalender
            </span>
            <span
              v-if="economicCount > 0"
              class="inline-flex items-center justify-center font-mono text-[11px] font-bold tabular-nums text-slate-600 bg-slate-100 rounded-md px-1.5 py-0.5 group-hover:bg-blue-50 group-hover:text-[#1E4270] transition-colors"
            >
              {{ economicCount > 99 ? '99+' : economicCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
