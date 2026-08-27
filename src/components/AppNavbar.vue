<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { 
  ChevronRight, 
  Building2
} from 'lucide-vue-next'

const route = useRoute()
const store = useResearchStore()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'screener': return 'Proses Penyaringan'
    case 'peers': return 'Perbandingan Kandidat'
    case 'trace': return 'Riwayat Aktivitas'
    case 'methodology': return 'Metodologi Penilaian'
    case 'report': return 'Laporan Riset'
    case 'research-new': return 'Riset Baru'
    case 'research-session': return 'Sesi Riset'
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
    case 'COMPLETED': return { text: 'Siap memulai riset', active: false, failed: false }
    case 'FAILED': return { text: 'Riset gagal', active: false, failed: true }
    default: return { text: 'Belum ada riset', active: false, failed: false }
  }
})
</script>

<template>
  <header class="min-h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sticky top-0 z-20 print:hidden">
    <!-- Left: Context & Breadcrumb -->
    <div class="flex min-w-0 items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span class="hidden lg:inline text-slate-400">Voyager One</span>
        <ChevronRight class="hidden lg:block w-3.5 h-3.5 text-slate-300" />
        <span class="truncate text-slate-900 font-bold text-sm">{{ pageTitle }}</span>
      </div>

      <span class="hidden sm:inline text-slate-200">|</span>

      <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
        <Building2 class="w-3.5 h-3.5 text-slate-400" />
        <span>IDX Universe: <strong class="text-slate-800 font-mono">914 Companies</strong></span>
      </div>
    </div>

    <!-- Right: Subtle Status & Clean Action Button -->
    <div class="flex shrink-0 items-center gap-2">
      <!-- Subtle Minimal Status Pill -->
      <div role="status" aria-live="polite" class="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
        <span 
          class="w-2 h-2 rounded-full"
          :class="statusBadge.failed ? 'bg-rose-500' : statusBadge.active ? 'bg-[#407EC9] animate-pulse' : 'bg-emerald-500'"
        ></span>
        <span class="hidden min-[390px]:inline text-slate-700 font-medium text-xs">{{ statusBadge.text }}</span>
      </div>
    </div>
  </header>
</template>
