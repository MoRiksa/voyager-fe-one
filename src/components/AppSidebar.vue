<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { 
  Compass, 
  Home,
  Layers, 
  Filter, 
  GitCompare, 
  Terminal, 
  BookOpen, 
  FileSpreadsheet,
  Search,
  ShieldCheck,
  History,
  CircleDot
} from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()

const currentRouteName = computed(() => String(route.name))
const sessionTitle = computed(() => store.presets.find(preset => preset.id === store.activePresetId)?.title || `${store.currentObjective.slice(0, 42)}${store.currentObjective.length > 42 ? '…' : ''}`)
const sessionStatus = computed(() => store.isExecuting ? 'Sedang berjalan' : store.status === 'COMPLETED' ? 'Selesai' : store.status === 'FAILED' ? 'Hasil parsial' : 'Disiapkan')

const navItems = computed(() => [
  {
    group: 'UTAMA',
    items: [
      { names: ['home'], label: 'Beranda', path: '/', icon: Home },
      { names: [], label: 'Riwayat riset', path: '/#recent-sessions-title', icon: History },
      { names: ['research-new'], label: 'Riset baru', path: '/research/new', icon: Search },
    ]
  },
  {
    group: 'SESI AKTIF',
    items: [
      { names: ['research-session'], label: 'Ringkasan', path: `/research/${store.report.sessionId}`, icon: Layers },
      { names: ['research-screener', 'research-company'], label: 'Cara kandidat dipilih', path: `/research/${store.report.sessionId}/screener`, icon: Filter },
      { names: ['research-peers'], label: 'Bandingkan kandidat', path: `/research/${store.report.sessionId}/peers`, icon: GitCompare },
      { names: ['research-report'], label: 'Laporan', path: `/research/${store.report.sessionId}/report`, icon: FileSpreadsheet },
    ]
  },
  {
    group: 'INFORMASI',
    items: [
      { names: ['methodology'], label: 'Cara penilaian', path: '/methodology', icon: BookOpen },
      { names: ['research-activity'], label: 'Proses riset', path: `/research/${store.report.sessionId}/activity`, icon: Terminal },
      { names: ['research-trace'], label: 'Detail teknis', path: `/research/${store.report.sessionId}/trace`, icon: ShieldCheck },
    ]
  }
])
</script>

<template>
  <aside class="w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
    <!-- Top Brand & Header -->
    <div>
      <div class="p-6 border-b border-slate-100">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-[#407EC9] flex items-center justify-center text-white shadow-sm shadow-[#407EC9]/30 transition-transform group-hover:scale-105">
            <Compass class="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-base tracking-tight text-slate-900 font-mono">VOYAGER<span class="text-[#407EC9]">.ONE</span></span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Workspace riset finansial</p>
          </div>
        </router-link>

        <div class="mt-4 rounded-xl border border-[#407EC9]/20 bg-[#407EC9]/5 p-3">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#2F64A8]"><CircleDot class="h-3 w-3" /> Sesi aktif</div>
          <p class="mt-2 line-clamp-2 text-xs font-bold leading-5 text-slate-900">{{ sessionTitle }}</p>
          <p class="mt-1 text-[11px] text-slate-500">{{ store.candidates.length }} kandidat · {{ sessionStatus }}</p>
        </div>
      </div>

      <!-- Navigation Groups -->
      <nav class="p-4 space-y-6">
        <div v-for="section in navItems" :key="section.group">
          <div class="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {{ section.group }}
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
              :class="item.names.includes(currentRouteName)
                ? 'bg-[#407EC9] text-white shadow-sm shadow-[#407EC9]/25 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>

    <div class="border-t border-slate-100 bg-slate-50/50 p-4">
      <div class="rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-5 text-slate-500">
        <strong class="block text-xs text-slate-800">Mode demonstrasi</strong>
        Data contoh untuk mencoba seluruh alur riset.
      </div>
    </div>
  </aside>
</template>
