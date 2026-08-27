<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { sessionStatusMeta } from '../utils/status'
import { 
  ChevronRight
} from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()
const isSessionRoute = computed(() => String(route.name).startsWith('research-') && route.name !== 'research-new')
const sessionTitle = computed(() => store.presets.find(preset => preset.id === store.activePresetId)?.title || 'Sesi riset')

const pageTitle = computed(() => {
  switch (route.name) {
    case 'screener': return 'Proses Penyaringan'
    case 'peers': return 'Perbandingan Kandidat'
    case 'trace': return 'Audit Teknis'
    case 'activity': return 'Aktivitas Riset'
    case 'methodology': return 'Metodologi Penilaian'
    case 'report': return 'Laporan Riset'
    case 'research-new': return 'Riset Baru'
    case 'research-library': return 'Pustaka Riset'
    case 'research-session': return 'Sesi Riset'
    case 'research-screener': return 'Proses Penyaringan'
    case 'research-peers': return 'Perbandingan Kandidat'
    case 'research-activity': return 'Aktivitas Riset'
    case 'research-trace': return 'Audit Teknis'
    case 'research-report': return 'Laporan Riset'
    case 'company-detail': return 'Analisis Perusahaan'
    case 'research-company': return 'Analisis Perusahaan'
    case 'not-found': return 'Halaman Tidak Ditemukan'
    default: return 'Workspace Riset'
  }
})

const statusBadge = computed(() => {
  switch (store.status) {
    case 'UNDERSTANDING': return { text: 'Memahami tujuan', active: true, failed: false }
    case 'PLANNING': return { text: 'Menyusun rencana', active: true, failed: false }
    case 'DISCOVERING': return { text: 'Meninjau perusahaan', active: true, failed: false }
    case 'SCREENING': return { text: 'Menyaring kandidat', active: true, failed: false }
    case 'RANKING': return { text: 'Menghitung skor', active: true, failed: false }
    case 'RESEARCHING': return { text: 'Menganalisis kandidat', active: true, failed: false }
    case 'COMPARING': return { text: 'Membandingkan kandidat', active: true, failed: false }
    case 'VALIDATING': return { text: 'Memeriksa temuan', active: true, failed: false }
    case 'REPORTING': return { text: 'Menyusun laporan', active: true, failed: false }
    case 'COMPLETED': return { text: 'Riset selesai', active: false, failed: false }
    case 'FAILED': return { text: 'Gagal', active: false, failed: true }
    default: return { text: 'Sesi disiapkan', active: false, failed: false }
  }
})
const statusMeta = computed(() => sessionStatusMeta(store.status, store.isExecuting))
</script>

<template>
  <header class="min-h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-20 print:hidden">
    <!-- Left: Context & Breadcrumb -->
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span v-if="route.name === 'research-session'" class="hidden max-w-52 truncate text-slate-500 lg:inline">{{ sessionTitle }}</span>
        <router-link v-else-if="isSessionRoute" :to="`/research/${store.report.sessionId}`" class="hidden max-w-52 truncate text-slate-500 hover:text-slate-900 lg:inline">{{ sessionTitle }}</router-link>
        <span v-else class="hidden lg:inline text-slate-400">Voyager One</span>
        <ChevronRight class="hidden lg:block w-3.5 h-3.5 text-slate-300" />
        <span class="truncate text-slate-900 font-bold text-sm">{{ pageTitle }}</span>
      </div>
    </div>

    <!-- Right: Subtle Status & Clean Action Button -->
    <div class="flex shrink-0 items-center gap-2">
      <!-- Subtle Minimal Status Pill -->
      <div role="status" aria-live="polite" class="status-badge" :class="statusMeta.className">
        <span 
          class="h-2 w-2 rounded-full bg-current"
          :class="statusBadge.active ? 'animate-pulse' : ''"
        ></span>
        <span class="font-bold"><span class="min-[390px]:hidden">{{ statusMeta.shortLabel }}</span><span class="hidden min-[390px]:inline">{{ statusBadge.text }}</span></span>
      </div>
    </div>
  </header>
</template>
