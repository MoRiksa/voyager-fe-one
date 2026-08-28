<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { Home, Layers, FileText, Menu, X, Filter, GitCompare, BookOpen, Terminal, Search, History, Library } from '@lucide/vue'

const route = useRoute()
const store = useResearchStore()
const isMoreOpen = ref(false)
const navRoot = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const menuPanel = ref<HTMLElement | null>(null)
const inertElements = new Map<HTMLElement, boolean>()
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const primaryItems = computed(() => [
  { label: 'Beranda', to: '/', icon: Home, names: ['home'] },
  { label: 'Sesi', to: `/research/${store.report.sessionId}`, icon: Layers, names: ['research-session'] },
  { label: 'Laporan', to: `/research/${store.report.sessionId}/report`, icon: FileText, names: ['report', 'research-report'] }
])

const moreItems = computed(() => [
  { label: 'Cara kandidat dipilih', to: `/research/${store.report.sessionId}/screener`, icon: Filter },
  { label: 'Bandingkan kandidat', to: `/research/${store.report.sessionId}/peers`, icon: GitCompare },
  { label: 'Riset baru', to: '/research/new', icon: Search },
  { label: 'Pustaka riset', to: '/research', icon: History },
  { label: 'Cara penilaian', to: '/methodology', icon: BookOpen },
  { label: 'Kamus istilah', to: '/glossary', icon: Library },
  { label: 'Proses riset', to: `/research/${store.report.sessionId}/activity`, icon: Terminal },
  { label: 'Detail teknis', to: `/research/${store.report.sessionId}/trace`, icon: Terminal }
])

const moreIsActive = computed(() => ['research-library', 'research-new', 'screener', 'research-screener', 'research-company', 'peers', 'research-peers', 'methodology', 'glossary', 'activity', 'research-activity', 'trace', 'research-trace'].includes(String(route.name)))

const setBackgroundInert = (inert: boolean) => {
  if (!inert) {
    inertElements.forEach((wasInert, element) => { element.inert = wasInert })
    inertElements.clear()
    return
  }

  let current = navRoot.value
  while (current?.parentElement && current.parentElement !== document.body) {
    for (const sibling of current.parentElement.children) {
      if (sibling instanceof HTMLElement && sibling !== current && !inertElements.has(sibling)) {
        inertElements.set(sibling, sibling.inert)
        sibling.inert = true
      }
    }
    current = current.parentElement
  }
}

const closeMenu = () => { isMoreOpen.value = false }

const handleMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }
  if (event.key !== 'Tab' || !menuPanel.value) return

  const focusable = [...menuPanel.value.querySelectorAll<HTMLElement>(focusableSelector)]
  if (!focusable.length) {
    event.preventDefault()
    menuPanel.value.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isMoreOpen, async open => {
  setBackgroundInert(open)
  await nextTick()
  if (open) menuPanel.value?.querySelector<HTMLElement>(focusableSelector)?.focus()
  else menuButton.value?.focus()
})

onBeforeUnmount(() => setBackgroundInert(false))
</script>

<template>
  <div ref="navRoot" class="md:hidden print:hidden">
    <div v-if="isMoreOpen" class="fixed inset-0 z-40 bg-slate-950/35" aria-hidden="true" @click="closeMenu"></div>
    <section
      v-if="isMoreOpen"
      ref="menuPanel"
      id="mobile-more-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu lainnya"
      tabindex="-1"
      class="fixed inset-x-3 z-50 max-h-[calc(100dvh-var(--mobile-nav-height)-env(safe-area-inset-top)-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl bottom-[calc(var(--mobile-nav-height)+0.75rem)]"
      @keydown="handleMenuKeydown"
    >
      <div class="flex items-center justify-between px-2 pb-2">
        <div><h2 class="text-sm font-bold text-slate-900">Menu lainnya</h2><p class="mt-0.5 text-xs text-slate-500">Sesi {{ store.report.sessionId }}</p></div>
        <button class="icon-button" type="button" aria-label="Tutup menu" @click="closeMenu">
          <X class="h-5 w-5" />
        </button>
      </div>
      <nav class="grid grid-cols-2 gap-2" aria-label="Navigasi sekunder">
        <router-link
          v-for="item in moreItems"
          :key="item.to"
          :to="item.to"
          class="flex min-h-16 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors"
          :class="route.path === item.to ? 'bg-[#EAF2FB] text-[#1E4F88] ring-1 ring-[#407EC9]/30' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'"
          :aria-current="route.path === item.to ? 'page' : undefined"
          @click="closeMenu"
        >
          <component :is="item.icon" class="h-4 w-4 text-[#2F64A8]" />
          {{ item.label }}
        </router-link>
      </nav>
    </section>

    <nav class="fixed inset-x-0 bottom-0 z-40 grid h-[var(--mobile-nav-height)] grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md" aria-label="Navigasi utama mobile">
      <router-link
        v-for="item in primaryItems"
        :key="item.to"
        :to="item.to"
        class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold"
        :class="item.names.includes(String(route.name)) ? 'bg-[#EAF2FB] text-[#1E4F88]' : 'text-slate-500'"
        :aria-current="item.names.includes(String(route.name)) ? 'page' : undefined"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </router-link>
      <button
        ref="menuButton"
        type="button"
        class="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold"
        :class="moreIsActive || isMoreOpen ? 'text-[#2F64A8]' : 'text-slate-500'"
        :aria-expanded="isMoreOpen"
        :aria-controls="isMoreOpen ? 'mobile-more-menu' : undefined"
        @click="isMoreOpen = !isMoreOpen"
      >
        <Menu class="h-5 w-5" />
        Lainnya
      </button>
    </nav>
  </div>
</template>
