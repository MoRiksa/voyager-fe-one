<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { Home, Layers, FileText, Menu, X, Filter, GitCompare, BookOpen, Terminal, Search, History } from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()
const isMoreOpen = ref(false)

const primaryItems = computed(() => [
  { label: 'Beranda', to: '/', icon: Home, names: ['home'] },
  { label: 'Sesi', to: `/research/${store.report.sessionId}`, icon: Layers, names: ['research-session'] },
  { label: 'Laporan', to: `/research/${store.report.sessionId}/report`, icon: FileText, names: ['report', 'research-report'] }
])

const moreItems = computed(() => [
  { label: 'Cara kandidat dipilih', to: `/research/${store.report.sessionId}/screener`, icon: Filter },
  { label: 'Bandingkan kandidat', to: `/research/${store.report.sessionId}/peers`, icon: GitCompare },
  { label: 'Riset baru', to: '/research/new', icon: Search },
  { label: 'Riwayat riset', to: '/#recent-sessions-title', icon: History },
  { label: 'Cara penilaian', to: '/methodology', icon: BookOpen },
  { label: 'Proses riset', to: `/research/${store.report.sessionId}/activity`, icon: Terminal },
  { label: 'Detail teknis', to: `/research/${store.report.sessionId}/trace`, icon: Terminal }
])

const moreIsActive = computed(() => ['research-new', 'screener', 'research-screener', 'research-company', 'peers', 'research-peers', 'methodology', 'activity', 'research-activity', 'trace', 'research-trace'].includes(String(route.name)))
</script>

<template>
  <div class="md:hidden print:hidden">
    <div v-if="isMoreOpen" class="fixed inset-0 z-40 bg-slate-950/35" @click="isMoreOpen = false"></div>
    <section
      v-if="isMoreOpen"
      id="mobile-more-menu"
      aria-label="Menu lainnya"
      class="fixed inset-x-3 bottom-20 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
    >
      <div class="flex items-center justify-between px-2 pb-2">
        <div><h2 class="text-sm font-bold text-slate-900">Menu lainnya</h2><p class="mt-0.5 text-xs text-slate-500">Sesi {{ store.report.sessionId }}</p></div>
        <button class="icon-button" type="button" aria-label="Tutup menu" @click="isMoreOpen = false">
          <X class="h-5 w-5" />
        </button>
      </div>
      <nav class="grid grid-cols-2 gap-2" aria-label="Navigasi sekunder">
        <router-link
          v-for="item in moreItems"
          :key="item.to"
          :to="item.to"
          class="flex min-h-16 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700"
          @click="isMoreOpen = false"
        >
          <component :is="item.icon" class="h-4 w-4 text-[#407EC9]" />
          {{ item.label }}
        </router-link>
      </nav>
    </section>

    <nav class="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md" aria-label="Navigasi utama mobile">
      <router-link
        v-for="item in primaryItems"
        :key="item.to"
        :to="item.to"
        class="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold"
        :class="item.names.includes(String(route.name)) ? 'text-[#2F64A8]' : 'text-slate-500'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </router-link>
      <button
        type="button"
        class="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold"
        :class="moreIsActive || isMoreOpen ? 'text-[#2F64A8]' : 'text-slate-500'"
        :aria-expanded="isMoreOpen"
        aria-controls="mobile-more-menu"
        @click="isMoreOpen = !isMoreOpen"
      >
        <Menu class="h-5 w-5" />
        Lainnya
      </button>
    </nav>
  </div>
</template>
