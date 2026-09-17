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
  Settings
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
    ]
  },
  {
    group: 'Bantuan',
    items: [
      { names: ['methodology'], label: 'Cara penilaian', path: '/methodology', icon: BookOpen },
      { names: ['glossary'], label: 'Kamus istilah', path: '/glossary', icon: Library },
      { names: ['help'], label: 'Bantuan', path: '/help', icon: Compass },
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
  <aside class="w-64 shrink-0 bg-[#F8FAFC] border-r border-slate-200/90 flex flex-col h-screen sticky top-0 z-30 select-none">
    <!-- Top Brand & Header -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="p-5 border-b border-slate-200/80 bg-white/60">
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-[#244F87] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
            <Compass class="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-base tracking-tight text-slate-900 font-mono">VOYAGER<span class="text-[#244F87]">.ONE</span></span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Workspace riset finansial</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation Groups -->
      <nav class="p-3.5 space-y-5" aria-label="Navigasi utama">
        <!-- Riset General Nav -->
        <div>
          <div class="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            {{ navItems[0].group }}
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in navItems[0].items"
              :key="item.path"
              :to="item.path"
              class="flex min-h-9 items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150"
              :class="item.names.includes(currentRouteName)
                ? 'bg-[#244F87] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-2xs'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- Bantuan General Nav -->
        <div>
          <div class="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            {{ navItems[1].group }}
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in navItems[1].items"
              :key="item.path"
              :to="item.path"
              class="flex min-h-9 items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150"
              :class="item.names.includes(currentRouteName)
                ? 'bg-[#244F87] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-2xs'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
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
    <div class="shrink-0 border-t border-slate-200/90 bg-[#F8FAFC] p-3 space-y-2.5">
      <!-- Quick Watchlist Matrix (Clean Financial Workbench Layout) -->
      <div class="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-xs space-y-2">
        <div class="flex items-center justify-between px-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          <span>Pantauan Emiten</span>
          <span class="text-[10px] font-normal text-slate-400">
            {{ totalCandidatesCount > 5 ? `${totalCandidatesCount} Saham (Top 5)` : 'IDX · 5 Saham' }}
          </span>
        </div>

        <!-- 2-Column Ticker Matrix -->
        <div class="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
          <router-link
            v-for="item in watchlistItems"
            :key="item.symbol"
            :to="item.path"
            class="flex items-center justify-between rounded-lg border px-2 py-1.5 text-xs transition-all duration-150 group"
            :class="currentSymbol === item.symbol
              ? getTickerColors(item.symbol).selected
              : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white'"
          >
            <div class="flex items-center gap-1.5 min-w-0">
              <span
                v-if="currentSymbol !== item.symbol"
                class="size-1.5 rounded-full shrink-0"
                :class="getTickerColors(item.symbol).dot"
              ></span>
              <span
                class="font-mono text-[11px] font-bold truncate"
                :class="currentSymbol === item.symbol ? 'text-white' : `text-slate-900 ${getTickerColors(item.symbol).textHover}`"
              >
                {{ item.symbol }}
              </span>
            </div>
            <span
              class="text-[10px] font-mono shrink-0 pl-1"
              :class="currentSymbol === item.symbol ? 'text-white/85' : 'text-slate-400'"
            >
              {{ item.badge }}
            </span>
          </router-link>

          <!-- Condition: if too many emitten in watchlist (> 5), show overflow tile linking to full screener -->
          <router-link
            v-if="hasOverflowCandidates"
            :to="store.report.sessionId ? `/research/${store.report.sessionId}/screener` : '/research'"
            class="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 px-2 py-1.5 text-xs text-[#244F87] font-semibold hover:bg-blue-100/70 hover:border-blue-300 transition-all group"
            :title="`Buka ${overflowCount} emiten lainnya di proses penyaringan`"
          >
            <span class="font-mono text-[11px] font-bold text-[#244F87]">
              +{{ overflowCount }}
            </span>
            <span class="text-[10px] font-mono text-blue-600/80 group-hover:text-blue-700">
              Lainnya
            </span>
          </router-link>

          <!-- Default 6th slot when 5 or fewer: Quick Add / New Research shortcut -->
          <router-link
            v-else
            to="/research/new"
            class="flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300/80 bg-slate-50/40 px-2 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-slate-400 hover:bg-white hover:text-slate-900 transition-all"
            title="Mulai Riset Baru"
          >
            <Search class="size-3 text-slate-400" />
            <span>+ Riset</span>
          </router-link>
        </div>
      </div>

      <!-- Dedicated User Profile Card -->
      <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs transition-colors hover:bg-slate-50">
        <div class="flex items-center gap-2.5 min-w-0">
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
            <p class="truncate text-[11px] text-slate-500 font-medium">analis@voyager.one</p>
          </div>
        </div>

        <!-- Quick settings / help action -->
        <router-link
          to="/help"
          class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title="Bantuan & Pengaturan Akun"
          aria-label="Pengaturan akun dan bantuan"
        >
          <Settings class="size-4" />
        </router-link>
      </div>
    </div>
  </aside>
</template>
