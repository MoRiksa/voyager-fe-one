<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { 
  Compass, 
  Home, 
  BookOpen, 
  Search, 
  History, 
  Library, 
  Settings,
  CalendarDays
} from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()

const currentRouteName = computed(() => String(route.name))
const currentSymbol = computed(() => String(route.params.symbol || ''))

const navItems = computed(() => [
  {
    group: 'Riset',
    items: [
      { names: ['home'], label: 'Beranda', path: '/', icon: Home },
      { names: ['research-library'], label: 'Pustaka riset', path: '/research', icon: History },
      { names: ['research-new'], label: 'Riset baru', path: '/research/new', icon: Search },
      { names: ['economic-calendar', 'economic-date'], label: 'Kalender ekonomi', path: '/economic-calendar', icon: CalendarDays }
    ]
  },
  {
    group: 'Bantuan',
    items: [
      { names: ['methodology'], label: 'Cara penilaian', path: '/methodology', icon: BookOpen },
      { names: ['glossary'], label: 'Kamus istilah', path: '/glossary', icon: Library },
      { names: ['help'], label: 'Bantuan', path: '/help', icon: Compass }
    ]
  }
])

interface TickerColorConfig {
  selected: string
  dot: string
  textHover: string
}

const getTickerColors = (symbol: string): TickerColorConfig => {
  const map: Record<string, TickerColorConfig> = {
    BBCA: {
      selected: 'bg-[#00529C] border-[#00529C] text-white shadow-xs',
      dot: 'bg-[#00529C]',
      textHover: 'group-hover:text-[#00529C]'
    },
    BBRI: {
      selected: 'bg-[#00609C] border-[#00609C] text-white shadow-xs',
      dot: 'bg-[#00609C]',
      textHover: 'group-hover:text-[#00609C]'
    },
    BMRI: {
      selected: 'bg-[#113B7A] border-[#113B7A] text-white shadow-xs',
      dot: 'bg-[#113B7A]',
      textHover: 'group-hover:text-[#113B7A]'
    },
    BBNI: {
      selected: 'bg-[#EA5B23] border-[#EA5B23] text-white shadow-xs',
      dot: 'bg-[#EA5B23]',
      textHover: 'group-hover:text-[#EA5B23]'
    },
    ASII: {
      selected: 'bg-[#1F3A60] border-[#1F3A60] text-white shadow-xs',
      dot: 'bg-[#1F3A60]',
      textHover: 'group-hover:text-[#1F3A60]'
    },
    TLKM: {
      selected: 'bg-[#CE181E] border-[#CE181E] text-white shadow-xs',
      dot: 'bg-[#CE181E]',
      textHover: 'group-hover:text-[#CE181E]'
    }
  }

  if (map[symbol]) return map[symbol]

  const fallbackList: TickerColorConfig[] = [
    { selected: 'bg-indigo-600 border-indigo-600 text-white shadow-xs', dot: 'bg-indigo-500', textHover: 'group-hover:text-indigo-600' },
    { selected: 'bg-emerald-600 border-emerald-600 text-white shadow-xs', dot: 'bg-emerald-500', textHover: 'group-hover:text-emerald-600' },
    { selected: 'bg-amber-600 border-amber-600 text-white shadow-xs', dot: 'bg-amber-500', textHover: 'group-hover:text-amber-600' },
    { selected: 'bg-cyan-700 border-cyan-700 text-white shadow-xs', dot: 'bg-cyan-600', textHover: 'group-hover:text-cyan-700' },
    { selected: 'bg-rose-600 border-rose-600 text-white shadow-xs', dot: 'bg-rose-500', textHover: 'group-hover:text-rose-600' }
  ]
  const charSum = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return fallbackList[charSum % fallbackList.length]
}

const totalCandidatesCount = computed(() => {
  return store.candidates.length > 0 ? store.candidates.length : 5
})

const hasOverflowCandidates = computed(() => {
  return store.candidates.length > 5
})

const overflowCount = computed(() => {
  return Math.max(0, store.candidates.length - 5)
})

const watchlistItems = computed(() => {
  const sessionId = store.report.sessionId
  if (store.candidates.length > 0) {
    return store.candidates.slice(0, 5).map(c => ({
      symbol: c.symbol,
      name: c.name || c.symbol,
      badge: c.subsector?.slice(0, 5) || 'IDX',
      path: sessionId ? `/research/${sessionId}/company/${c.symbol}` : `/company/${c.symbol}`
    }))
  }

  const defaultList = [
    { symbol: 'BBCA', name: 'Bank Central Asia', badge: 'Bank' },
    { symbol: 'BBRI', name: 'Bank Rakyat Indonesia', badge: 'Bank' },
    { symbol: 'BMRI', name: 'Bank Mandiri', badge: 'Bank' },
    { symbol: 'BBNI', name: 'Bank Negara Indonesia', badge: 'Bank' },
    { symbol: 'ASII', name: 'Astra International', badge: 'Auto' }
  ]

  return defaultList.map(item => ({
    ...item,
    path: sessionId ? `/research/${sessionId}/company/${item.symbol}` : `/company/${item.symbol}`
  }))
})
</script>

<template>
  <aside class="fixed left-3 top-3 bottom-3 z-30 flex w-72 select-none flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-12px_rgba(15,33,56,0.25)] ring-1 ring-slate-900/5">
    <!-- Top Brand & Header -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="p-4">
        <router-link
          to="/"
          class="group flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#1E4270] to-[#244F87] p-3 text-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          <div class="flex size-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25 transition-transform group-hover:rotate-6">
            <Compass class="size-5 stroke-[2.2]" />
          </div>
          <div class="min-w-0">
            <span class="block truncate text-sm font-extrabold tracking-tight">VOYAGER<span class="text-blue-200">.ONE</span></span>
            <p class="-mt-0.5 truncate text-[11px] font-medium text-blue-100/90">Workspace riset finansial</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation Groups -->
      <nav class="space-y-6 px-3 pb-2" aria-label="Navigasi utama">
        <div v-for="group in navItems" :key="group.group">
          <div class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {{ group.group }}
          </div>
          <div class="space-y-0.5">
            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="group relative flex min-h-9 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-150"
              :class="item.names.includes(currentRouteName)
                ? 'bg-[#244F87]/10 text-[#1E4270]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
            >
              <span
                v-if="item.names.includes(currentRouteName)"
                class="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#244F87]"
                aria-hidden="true"
              ></span>
              <component
                :is="item.icon"
                class="size-4 shrink-0 transition-colors"
                :class="item.names.includes(currentRouteName) ? 'text-[#244F87]' : 'text-slate-400 group-hover:text-slate-600'"
              />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </nav>
    </div>

    <!-- Hidden state indicator for contract compatibility -->
    <div v-if="!store.report.sessionId" data-testid="sidebar-no-active-session" class="sr-only">
      Belum ada sesi yang sedang dibuka
    </div>

    <!-- Dedicated Sidebar Footer: Quick Watchlist (grouped in footer) + User Profile -->
    <div class="shrink-0 space-y-2.5 border-t border-slate-100 bg-slate-50/60 p-3">
      <!-- Quick Watchlist Matrix (Clean Financial Workbench Layout) -->
      <div class="space-y-2 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
        <div class="flex items-center justify-between px-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
          <span>Pantauan Emiten</span>
          <span class="text-[10px] font-normal text-slate-400">
            {{ totalCandidatesCount > 5 ? `${totalCandidatesCount} Saham (Top 5)` : 'IDX · 5 Saham' }}
          </span>
        </div>

        <!-- 2-Column Ticker Matrix -->
        <div class="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-0.5">
          <router-link
            v-for="item in watchlistItems"
            :key="item.symbol"
            :to="item.path"
            class="group flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs transition-all duration-150"
            :class="currentSymbol === item.symbol
              ? getTickerColors(item.symbol).selected
              : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white'"
          >
            <div class="flex min-w-0 items-center gap-1.5">
              <span
                v-if="currentSymbol !== item.symbol"
                class="size-1.5 shrink-0 rounded-full"
                :class="getTickerColors(item.symbol).dot"
              ></span>
              <span
                class="truncate font-mono text-[11px] font-bold"
                :class="currentSymbol === item.symbol ? 'text-white' : `text-slate-900 ${getTickerColors(item.symbol).textHover}`"
              >
                {{ item.symbol }}
              </span>
            </div>
            <span
              class="shrink-0 pl-1 font-mono text-[10px]"
              :class="currentSymbol === item.symbol ? 'text-white/85' : 'text-slate-400'"
            >
              {{ item.badge }}
            </span>
          </router-link>

          <!-- Condition: if too many emitten in watchlist (> 5), show overflow tile linking to full screener -->
          <router-link
            v-if="hasOverflowCandidates"
            :to="store.report.sessionId ? `/research/${store.report.sessionId}/screener` : '/research'"
            class="group flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 px-2 py-1.5 text-xs font-semibold text-[#244F87] transition-all hover:border-blue-300 hover:bg-blue-100/70"
            :title="`Buka ${overflowCount} emiten lainnya di proses penyaringan`"
          >
            <span class="font-mono text-[11px] font-bold text-[#244F87]">
              +{{ overflowCount }}
            </span>
            <span class="font-mono text-[10px] text-blue-600/80 group-hover:text-blue-700">
              Lainnya
            </span>
          </router-link>

          <!-- Default 6th slot when 5 or fewer: Quick Add / New Research shortcut -->
          <router-link
            v-else
            to="/research/new"
            class="flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300/80 bg-slate-50/40 px-2 py-1.5 text-[11px] font-semibold text-slate-500 transition-all hover:border-slate-400 hover:bg-white hover:text-slate-900"
            title="Mulai Riset Baru"
          >
            <Search class="size-3 text-slate-400" />
            <span>+ Riset</span>
          </router-link>
        </div>
      </div>

      <!-- Dedicated User Profile Card -->
      <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-colors hover:bg-slate-50">
        <div class="flex min-w-0 items-center gap-2.5">
          <!-- Avatar with initials & active indicator -->
          <div class="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#244F87] font-mono text-xs font-bold text-white shadow-xs">
            <span>AN</span>
            <span class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" title="Online"></span>
          </div>

          <!-- User details -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-xs font-bold text-slate-900">Analis Riset</span>
              <span class="rounded bg-blue-100/80 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-[#244F87]">PRO</span>
            </div>
            <p class="truncate text-[11px] font-medium text-slate-500">analis@voyager.one</p>
          </div>
        </div>

        <!-- Quick settings / help action -->
        <router-link
          to="/help"
          class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          title="Bantuan & Pengaturan Akun"
          aria-label="Pengaturan akun dan bantuan"
        >
          <Settings class="size-4" />
        </router-link>
      </div>
    </div>
  </aside>
</template>
