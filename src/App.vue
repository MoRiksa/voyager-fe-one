<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import MobileNav from './components/MobileNav.vue'
import CandidateDetailModal from './components/CandidateDetailModal.vue'
import MethodologyModal from './components/MethodologyModal.vue'
import { useResearchStore } from './stores/researchStore'
import { AlertCircle, CheckCircle2, Info, X } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const store = useResearchStore()

watch(() => route.params.id, id => {
  if (typeof id === 'string' && id !== store.report.sessionId && !store.loadSession(id)) router.replace('/not-found')
}, { immediate: true })
</script>

<template>
  <div class="min-h-dvh bg-[#F8FAFC] flex text-slate-900 selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
    <!-- Persistent Left Sidebar Navigation -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <AppNavbar />

      <main id="main-content" tabindex="-1" class="flex-1 pb-24 md:pb-12">
        <router-view />
      </main>

      <!-- Institutional Footer -->
      <footer class="border-t border-slate-200 bg-white py-6 px-6 lg:px-8 print:hidden mb-16 md:mb-0">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 font-mono">VOYAGER.ONE</span>
            <span class="text-slate-300">•</span>
            <span>Workspace riset finansial</span>
          </div>

          <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-500 text-xs">
            <span>Sectors Hackathon 2026</span>
            <span>•</span>
            <span>Analisis terukur dan dapat ditelusuri</span>
          </div>
        </div>
      </footer>
    </div>

    <MobileNav />
    <CandidateDetailModal />
    <MethodologyModal />
    <div v-if="store.toast" class="fixed inset-x-4 bottom-20 z-[60] flex justify-center md:bottom-6" :role="store.toast.tone === 'error' ? 'alert' : 'status'" :aria-live="store.toast.tone === 'error' ? 'assertive' : 'polite'">
      <div class="flex w-full max-w-md items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl" :class="store.toast.tone === 'error' ? 'border-rose-200' : store.toast.tone === 'success' ? 'border-emerald-200' : 'border-blue-200'">
        <CheckCircle2 v-if="store.toast.tone === 'success'" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <AlertCircle v-else-if="store.toast.tone === 'error'" class="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <Info v-else class="mt-0.5 h-5 w-5 shrink-0 text-[#407EC9]" />
        <p class="flex-1 text-sm font-medium leading-5 text-slate-800">{{ store.toast.message }}</p>
        <button type="button" class="icon-button -m-2 shrink-0" aria-label="Tutup notifikasi" @click="store.dismissToast"><X class="h-4 w-4" /></button>
      </div>
    </div>
  </div>
</template>
