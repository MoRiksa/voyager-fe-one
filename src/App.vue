<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import MobileNav from './components/MobileNav.vue'
import CandidateDetailModal from './components/CandidateDetailModal.vue'
import MethodologyModal from './components/MethodologyModal.vue'
import { useResearchStore } from './stores/researchStore'
import { AlertCircle, CheckCircle2, Info, X } from '@lucide/vue'
import { getResearchSessionFull, ResearchApiError } from './services/researchApi'

const route = useRoute()
const router = useRouter()
const store = useResearchStore()

const loadingSession = ref(false)
const sessionError = ref('')
let loadToken = 0
const loadRouteSession = async () => {
  const token = ++loadToken
  const id = route.params.id
  sessionError.value = ''
  loadingSession.value = false
  if (typeof id !== 'string') return
  loadingSession.value = true
  store.disconnectSse()
  try {
    const session = await getResearchSessionFull(id)
    if (token === loadToken) store.hydrateFromBackendSession(session)
  } catch (error) {
    if (token !== loadToken) return
    if (error instanceof ResearchApiError && error.status === 404) await router.replace('/not-found')
    else sessionError.value = error instanceof Error ? error.message : 'Sesi belum dapat dimuat.'
  } finally { if (token === loadToken) loadingSession.value = false }
}
watch(() => route.params.id, loadRouteSession, { immediate: true })
</script>

<template>
  <div class="min-h-dvh bg-[#F8FAFC] flex text-slate-900 selection:bg-[#407EC9]/20 selection:text-[#1E4270]">
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
    <!-- Persistent Left Sidebar Navigation -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <AppNavbar />

      <main id="main-content" tabindex="-1" class="flex-1 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-12">
        <p v-if="loadingSession" role="status" class="page-shell">Memuat sesi dari layanan riset…</p>
        <section v-else-if="sessionError" class="page-shell"><h1 class="text-2xl font-bold">Sesi belum dapat dimuat</h1><p role="alert" class="mt-3 text-rose-700">{{ sessionError }}</p><button type="button" class="button-primary mt-4" @click="loadRouteSession">Coba lagi</button></section>
        <router-view v-else />
      </main>

      <!-- Institutional Footer -->
      <footer class="border-t border-slate-200 bg-white py-6 px-6 lg:px-8 print:hidden">
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
    <div v-if="store.toast" class="fixed inset-x-4 z-[60] flex justify-center bottom-[calc(var(--mobile-nav-height)+1rem)] md:bottom-6" :role="store.toast.tone === 'error' ? 'alert' : 'status'" :aria-live="store.toast.tone === 'error' ? 'assertive' : 'polite'">
      <div data-testid="toast" class="flex w-full max-w-md items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl" :class="store.toast.tone === 'error' ? 'border-rose-200' : store.toast.tone === 'success' ? 'border-emerald-200' : 'border-blue-200'">
        <CheckCircle2 v-if="store.toast.tone === 'success'" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <AlertCircle v-else-if="store.toast.tone === 'error'" class="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <Info v-else class="mt-0.5 h-5 w-5 shrink-0 text-[#407EC9]" />
        <p class="flex-1 text-sm font-medium leading-5 text-slate-800">{{ store.toast.message }}</p>
        <button type="button" class="icon-button -m-2 shrink-0" aria-label="Tutup notifikasi" @click="store.dismissToast"><X class="h-4 w-4" /></button>
      </div>
    </div>
  </div>
</template>
