<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { sessionStatusMeta } from '../utils/status'
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
  CircleDot,
  Library
} from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()

const currentRouteName = computed(() => String(route.name))
const sessionTitle = computed(() => store.presets.find(preset => preset.id === store.activePresetId)?.title || `${store.currentObjective.slice(0, 42)}${store.currentObjective.length > 42 ? '…' : ''}`)
const sessionStatus = computed(() => sessionStatusMeta(store.status, store.isExecuting).label)

const navItems = computed(() => [
  {
    group: 'UTAMA',
    items: [
      { names: ['home'], label: 'Beranda', path: '/', icon: Home },
      { names: ['research-library'], label: 'Pustaka riset', path: '/research', icon: History },
      { names: ['research-new'], label: 'Riset baru', path: '/research/new', icon: Search },
    ]
  },
  {
    group: 'INFORMASI',
    items: [
      { names: ['methodology'], label: 'Cara penilaian', path: '/methodology', icon: BookOpen },
      { names: ['glossary'], label: 'Kamus istilah', path: '/glossary', icon: Library },
      { names: ['research-activity'], label: 'Proses riset', path: `/research/${store.report.sessionId}/activity`, icon: Terminal },
      { names: ['research-trace'], label: 'Detail teknis', path: `/research/${store.report.sessionId}/trace`, icon: ShieldCheck },
    ]
  }
])

const sessionNavItems = computed(() => [
  { names: ['research-session'], label: 'Ringkasan', path: `/research/${store.report.sessionId}`, icon: Layers },
  { names: ['research-screener', 'research-company'], label: 'Seleksi', path: `/research/${store.report.sessionId}/screener`, icon: Filter },
  { names: ['research-peers'], label: 'Perbandingan', path: `/research/${store.report.sessionId}/peers`, icon: GitCompare },
  { names: ['research-report'], label: 'Laporan', path: `/research/${store.report.sessionId}/report`, icon: FileSpreadsheet }
])
</script>

<template>
  <aside class="w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 z-30 select-none">
    <!-- Top Brand & Header -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="p-6 border-b border-slate-100">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-[#2F64A8] flex items-center justify-center text-white shadow-sm shadow-[#407EC9]/30 transition-transform group-hover:scale-105">
            <Compass class="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-base tracking-tight text-slate-900 font-mono">VOYAGER<span class="text-[#2F64A8]">.ONE</span></span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Workspace riset finansial</p>
          </div>
        </router-link>

      </div>

      <!-- Navigation Groups -->
      <nav class="p-4 space-y-6">
        <div v-for="section in navItems" :key="section.group">
          <div class="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            {{ section.group }}
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              class="flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150"
              :class="item.names.includes(currentRouteName)
                ? 'bg-[#2F64A8] text-white shadow-sm shadow-[#407EC9]/25 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>

    <div class="shrink-0 border-t border-slate-200 bg-slate-50/80 p-3">
      <div class="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-[#2F64A8]"><CircleDot class="h-3 w-3" /> Sesi aktif</div>
      <router-link data-testid="sidebar-active-session" :to="`/research/${store.report.sessionId}`" class="block rounded-xl border border-[#407EC9]/20 bg-white p-3 transition-colors hover:border-[#407EC9]/50 hover:bg-blue-50" :aria-current="currentRouteName === 'research-session' ? 'page' : undefined">
        <p class="line-clamp-2 text-xs font-bold leading-5 text-slate-900">{{ sessionTitle }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ store.candidates.length }} kandidat · {{ sessionStatus }}</p>
        <p class="mt-2 font-mono text-xs font-semibold text-[#2F64A8]">{{ store.report.sessionId }}</p>
      </router-link>
      <nav class="mt-2 grid grid-cols-2 gap-1" aria-label="Navigasi sesi aktif">
        <router-link v-for="item in sessionNavItems" :key="item.path" :to="item.path" class="flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors" :class="item.names.includes(currentRouteName) ? 'bg-[#2F64A8] text-white' : 'text-slate-600 hover:bg-white hover:text-slate-950'">
          <component :is="item.icon" class="h-3.5 w-3.5 shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="mt-2 px-1 text-xs leading-4 text-slate-500">
        Mode demonstrasi · data contoh
      </div>
    </div>
  </aside>
</template>
