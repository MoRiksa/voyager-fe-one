<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Compass,
  ArrowUpRight
} from '@lucide/vue'

withDefaults(defineProps<{
  activeSection?: string
}>(), {
  activeSection: 'hero'
})

// Dynamic glassmorphic topbar state when scrolled
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- Floating Glass Island Navbar for Landing Page: Strictly Centered -->
  <header class="fixed top-3 inset-x-0 z-50 px-4 transition-all duration-300 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[84rem]">
      <div
        class="flex h-16 items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:px-6"
        :class="isScrolled
          ? 'border-white/50 bg-white/60 shadow-[0_16px_40px_-12px_rgba(36,79,135,0.22)] backdrop-blur-2xl backdrop-saturate-200 ring-1 ring-[#244F87]/15'
          : 'border-white/80 bg-white/85 shadow-[0_8px_24px_-8px_rgba(36,79,135,0.06)] backdrop-blur-md ring-1 ring-slate-900/5'"
      >
        <!-- Left: Brand Mark -->
        <router-link to="/landing-page" class="group flex items-center gap-3 text-[#102138] transition-transform hover:scale-[1.01]">
          <div class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E4270] to-[#244F87] text-white shadow-sm ring-1 ring-slate-900/10">
            <Compass class="size-5 stroke-[2.2]" />
          </div>
          <div class="leading-tight">
            <span class="block font-mono text-sm font-extrabold tracking-tight">VOYAGER<span class="text-[#407EC9]">.ONE</span></span>
            <span class="block text-[10px] font-semibold text-slate-500">Riset Finansial Terbuka</span>
          </div>
        </router-link>

        <!-- Center: Editorial Section Anchors -->
        <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600" aria-label="Navigasi halaman pengenalan">
          <a
            href="#hero"
            class="transition-colors hover:text-[#1E4270]"
            :class="activeSection === 'hero' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
          >
            Ringkasan
          </a>
          <a
            href="#features"
            class="transition-colors hover:text-[#1E4270]"
            :class="activeSection === 'features' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
          >
            Kapabilitas
          </a>
          <a
            href="#faq"
            class="transition-colors hover:text-[#1E4270]"
            :class="activeSection === 'faq' ? 'text-[#1E4270] font-bold underline underline-offset-4 decoration-2 decoration-[#407EC9]' : ''"
          >
            Tanya Jawab
          </a>
          <router-link to="/economic-calendar" class="transition-colors hover:text-[#1E4270]">
            Kalender Ekonomi
          </router-link>
          <router-link to="/methodology" class="transition-colors hover:text-[#1E4270]">
            Metodologi
          </router-link>
        </nav>

        <!-- Right: Minimalized Action Button -->
        <div class="flex items-center gap-3">
          <router-link
            to="/workspace"
            class="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1E4270] shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-[#244F87]/30 hover:bg-[#1E4270] hover:text-white hover:shadow-xs active:scale-[0.97]"
            title="Masuk ke Workspace Riset"
          >
            <span>Workspace</span>
            <ArrowUpRight class="size-3.5 stroke-[2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
