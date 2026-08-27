<script lang="ts">
const hadPersistedSessions = (() => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('voyager-one-research-sessions-v1') !== null
  } catch {
    return false
  }
})()
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { sessionStatusMeta } from '../utils/status'
import CandidateCard from '../components/CandidateCard.vue'
import DataProvenance from '../components/DataProvenance.vue'
import { ArrowRight, FileText, Search, Sparkles, Activity, ChevronRight, Trash2, Lightbulb, BookOpen, HelpCircle } from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()
const draftObjective = ref('')
const pendingDeleteId = ref<string | null>(null)

const isFirstTimeUser = !hadPersistedSessions

const exampleObjectives = [
  { text: 'Temukan bank Indonesia dengan ROE tinggi dan valuasi wajar', preset: 'obj-banking-moat' },
  { text: 'Cari perusahaan consumer dengan margin stabil dan pertumbuhan konsisten', preset: 'obj-consumer-growth' },
  { text: 'Identifikasi saham dengan dividen tinggi dan neraca kuat', preset: 'obj-dividend-fcf' }
]

const useExample = (example: typeof exampleObjectives[0]) => {
  store.setObjective(example.text, example.preset)
  router.push('/research/new')
}

const currentPillar = computed(() => store.pillars.find(pillar => pillar.status === 'active'))
const completedSteps = computed(() => store.pillars.filter(pillar => pillar.status === 'completed').length)
const sessionStatus = computed(() => sessionStatusMeta(store.status, store.isExecuting).label)
const savedStatusMeta = (status: Parameters<typeof sessionStatusMeta>[0]) => sessionStatusMeta(status)
const sessionSummary = computed(() => currentPillar.value?.subtitle || (store.status === 'COMPLETED' ? 'Seluruh tahap selesai. Kandidat dan laporan dapat dibuka kembali kapan saja.' : 'Sesi telah disiapkan dan menunggu proses berikutnya.'))

const startDraft = () => {
  if (draftObjective.value.trim()) store.setObjective(draftObjective.value.trim())
  router.push('/research/new')
}

const removeSession = (id: string) => {
  if (store.deleteSession(id)) store.notify('Sesi riset dihapus dari perangkat ini.', 'success')
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-10 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <section class="overflow-hidden rounded-3xl border border-[#407EC9]/20 bg-[#102138] text-white shadow-[0_24px_70px_-35px_rgba(16,33,56,0.8)]">
      <div class="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:px-12 lg:py-12">
        <div>
          <div class="mb-4 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-2.5 py-1 text-xs font-semibold text-blue-100">
            <Sparkles class="h-3.5 w-3.5" />
            Ruang kerja riset
          </div>
          <h1 class="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
            Apa yang ingin Anda teliti hari ini?
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Jelaskan tujuan riset Anda. Voyager One akan menyusun ruang lingkup, menyeleksi kandidat, dan merangkum temuan beserta risiko yang perlu diperiksa.
          </p>

          <form class="mt-7 rounded-2xl border border-white/15 bg-white p-2 shadow-xl" @submit.prevent="startDraft">
            <label for="dashboard-objective" class="sr-only">Tujuan riset</label>
            <textarea
              id="dashboard-objective"
              v-model="draftObjective"
              rows="2"
              class="block w-full resize-none rounded-xl px-4 py-3 text-sm leading-6 text-slate-900"
              placeholder="Contoh: Temukan perusahaan consumer Indonesia dengan margin stabil dan valuasi yang wajar."
            ></textarea>
            <div class="flex flex-col gap-2 border-t border-slate-100 px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <router-link to="/research/new" class="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-slate-600 hover:text-slate-950">
                Gunakan template riset
              </router-link>
              <button type="submit" class="button-primary w-full sm:w-auto">
                Susun riset
                <ArrowRight class="h-4 w-4" />
              </button>
            </div>
          </form>

          <!-- Quick Examples -->
          <div class="mt-5">
            <p class="mb-2 text-xs font-semibold text-blue-200">Atau coba contoh:</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="example in exampleObjectives"
                :key="example.preset"
                type="button"
                class="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                @click="useExample(example)"
              >
                {{ example.text.slice(0, 45) }}{{ example.text.length > 45 ? '...' : '' }}
              </button>
            </div>
          </div>
        </div>

        <aside class="rounded-2xl border border-white/12 bg-white/7 p-5 backdrop-blur-sm" aria-label="Ringkasan sesi terakhir">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-blue-200">Sesi terakhir</p>
              <h2 class="mt-1 font-mono text-sm font-bold">{{ store.report.sessionId }}</h2>
            </div>
            <span class="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-blue-100">{{ sessionStatus }}</span>
          </div>
          <p class="mt-5 line-clamp-3 text-sm leading-6 text-slate-200">{{ store.report.objective }}</p>
          <DataProvenance source="prototype-fixture-v1" :generated-at="store.report.timestamp" compact class="mt-4 border-white/15 bg-white/8 text-slate-300 [&_h2]:text-blue-100 [&_dt]:text-slate-400 [&_dd]:text-white" />
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-black/15 p-3">
              <span class="text-xs text-slate-400">Kandidat</span>
              <strong class="mt-1 block font-mono text-xl">{{ store.candidates.length }}</strong>
            </div>
            <div class="rounded-xl bg-black/15 p-3">
              <span class="text-xs text-slate-400">Skor tertinggi</span>
              <strong class="mt-1 block font-mono text-xl">{{ store.candidates[0] ? `${store.candidates[0].qualityScore}/100` : 'Belum ada' }}</strong>
              <span class="mt-1 block text-[10px] text-slate-400">80+ masuk shortlist sesi</span>
            </div>
          </div>
          <router-link :to="`/research/${store.report.sessionId}`" class="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white hover:text-blue-100">
            Buka sesi riset
            <ChevronRight class="h-4 w-4" />
          </router-link>
        </aside>
      </div>
    </section>

    <!-- Onboarding for First-Time Users -->
    <section v-if="isFirstTimeUser" class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8">
      <div class="flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2F64A8] text-white">
          <Lightbulb class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-bold text-slate-900">Selamat datang di Voyager One</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Voyager One membantu Anda meneliti saham dengan pendekatan sistematis. Jelaskan tujuan riset, dan sistem akan menyaring kandidat berdasarkan kriteria fundamental.
          </p>

          <div class="mt-5 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm">1</span>
              <h3 class="mt-3 font-semibold text-slate-900">Tentukan tujuan</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">Jelaskan apa yang Anda cari, misalnya "bank dengan ROE tinggi".</p>
            </div>
            <div class="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">2</span>
              <h3 class="mt-3 font-semibold text-slate-900">Tinjau seleksi</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">Lihat bagaimana kandidat disaring dan bandingkan metrik kunci.</p>
            </div>
            <div class="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 font-bold text-sm">3</span>
              <h3 class="mt-3 font-semibold text-slate-900">Baca laporan</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">Dapatkan ringkasan temuan, risiko, dan hal yang perlu diverifikasi.</p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <router-link to="/research/new" class="button-primary">
              Mulai riset pertama
              <ArrowRight class="h-4 w-4" />
            </router-link>
            <router-link to="/methodology" class="text-link">
              <BookOpen class="h-4 w-4" />
              Pelajari metodologi
            </router-link>
            <router-link to="/glossary" class="text-link">
              <HelpCircle class="h-4 w-4" />
              Kamus istilah
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="active-research-title">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <p class="section-kicker">Riset aktif</p>
          <h2 id="active-research-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Lanjutkan dari konteks terakhir</h2>
        </div>
        <router-link :to="`/research/${store.report.sessionId}`" class="text-link hidden sm:inline-flex">Lihat sesi <ArrowRight class="h-4 w-4" /></router-link>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_0.38fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="max-w-3xl">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Activity class="h-4 w-4 text-[#407EC9]" />
                 {{ currentPillar ? currentPillar.name : store.status === 'COMPLETED' ? 'Laporan siap ditinjau' : 'Sesi riset' }}
              </div>
              <h3 class="mt-2 text-lg font-bold text-slate-950">{{ store.report.objective }}</h3>
               <p class="mt-2 text-sm leading-6 text-slate-600">{{ sessionSummary }}</p>
            </div>
             <span class="shrink-0 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs font-bold text-slate-700">{{ completedSteps }}/{{ store.pillars.length }} tahap</span>
          </div>
           <div class="mt-6 h-2 overflow-hidden rounded-full bg-slate-100" aria-label="Progress riset" role="progressbar" :aria-valuenow="completedSteps" aria-valuemin="0" :aria-valuemax="store.pillars.length">
            <div class="h-full rounded-full bg-[#407EC9]" :style="{ width: `${store.pillars.length ? (completedSteps / store.pillars.length) * 100 : 0}%` }"></div>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-4">
            <router-link :to="`/research/${store.report.sessionId}`" class="button-secondary">Buka riset</router-link>
          </div>
          <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :generated-at="store.report.timestamp" compact class="mt-4" />
        </article>

        <article class="rounded-2xl bg-[#2F64A8] p-6 text-white shadow-[0_18px_45px_-25px_rgba(64,126,201,0.9)]">
          <FileText class="h-5 w-5 text-blue-100" />
          <h3 class="mt-5 text-lg font-bold">{{ store.status === 'COMPLETED' ? 'Laporan tersedia' : 'Hasil sementara' }}</h3>
          <p class="mt-2 text-sm leading-6 text-blue-100">Tinjau ranking, analisis kandidat, risiko, dan keterbatasan riset.</p>
          <router-link :to="`/research/${store.report.sessionId}/report`" class="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-white">
            Buka laporan <ArrowRight class="h-4 w-4" />
          </router-link>
        </article>
      </div>
    </section>

    <section aria-labelledby="latest-findings-title">
      <div class="mb-4 flex items-end justify-between gap-4">
        <div>
          <p class="section-kicker">Temuan terbaru</p>
           <h2 id="latest-findings-title" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Kandidat teratas</h2>
        </div>
        <router-link :to="`/research/${store.report.sessionId}/screener`" class="text-link hidden sm:inline-flex">Lihat semua kandidat <ArrowRight class="h-4 w-4" /></router-link>
      </div>
       <div class="grid gap-4 lg:grid-cols-3">
         <CandidateCard v-for="candidate in store.candidates.slice(0, 3)" :key="candidate.symbol" :candidate="candidate" />
       </div>
       <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :generated-at="store.report.timestamp" compact class="mt-4" />
    </section>

    <section v-if="store.recentSessions.length" id="recent-sessions-title" aria-labelledby="recent-sessions-heading">
      <div class="mb-4 flex items-end justify-between gap-4"><div><p class="section-kicker">Riwayat lokal</p><h2 id="recent-sessions-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Riset terbaru</h2><p class="mt-1 text-xs text-slate-500">Tersimpan pada browser ini, maksimal lima sesi.</p></div><router-link to="/research" class="text-link hidden sm:inline-flex">Buka pustaka <ArrowRight class="h-4 w-4" /></router-link></div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <article v-for="session in store.recentSessions" :key="session.id" class="flex min-h-20 items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-0 hover:bg-slate-50 sm:px-5">
          <router-link :to="`/research/${session.id}`" class="min-w-0 flex-1 rounded-lg px-2 py-2">
            <h3 class="truncate text-sm font-bold text-slate-900">{{ session.objective }}</h3>
            <p class="mt-1 font-mono text-xs text-slate-500">{{ session.id }} · {{ session.candidates.length }} kandidat</p>
          </router-link>
          <span class="status-badge hidden shrink-0 sm:inline-flex" :class="savedStatusMeta(session.status).className">{{ savedStatusMeta(session.status).label }}</span>
          <div v-if="pendingDeleteId === session.id" class="flex shrink-0 items-center gap-1">
            <button type="button" data-testid="confirm-delete-session" class="min-h-11 rounded-lg px-3 text-xs font-bold text-rose-700 hover:bg-rose-50" @click="removeSession(session.id)">Hapus</button>
            <button type="button" class="min-h-11 rounded-lg px-3 text-xs font-bold text-slate-600 hover:bg-slate-100" @click="pendingDeleteId = null">Batal</button>
          </div>
          <button v-else type="button" data-testid="delete-session" class="icon-button shrink-0 disabled:cursor-not-allowed disabled:opacity-35" :disabled="store.recentSessions.length <= 1" :aria-label="store.recentSessions.length <= 1 ? 'Sesi terakhir tidak dapat dihapus' : `Hapus sesi ${session.id}`" @click="pendingDeleteId = session.id"><Trash2 class="h-4 w-4" /></button>
        </article>
      </div>
      <router-link to="/research" class="button-secondary mt-4 sm:hidden">Buka pustaka riset</router-link>
    </section>
  </div>
</template>
