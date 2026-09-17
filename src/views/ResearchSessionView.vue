<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { getResearchSessionFull, startResearchSession } from '../services/researchApi'
import { sessionStatusMeta } from '../utils/status'
import CandidateCard from '../components/CandidateCard.vue'
import DataProvenance from '../components/DataProvenance.vue'
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCw, 
  Play, 
  Filter, 
  AlertCircle,
  HelpCircle,
  ChevronDown
} from '@lucide/vue'

const store = useResearchStore()
const busy = ref(false)
const readError = ref('')
let token = 0

const poll = async (id: string, current: number) => {
  while (current === token && store.isExecuting) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (current !== token) return
    try {
      const session = await getResearchSessionFull(id)
      if (current !== token) return
      store.hydrateFromBackendSession(session)
      readError.value = ''
    } catch {
      readError.value = 'Pembaruan status terputus. Snapshot terakhir ditampilkan; mencoba menghubungkan kembali.'
    }
  }
}

watch(() => [store.report.sessionId, store.isExecuting] as const, ([id, running]) => {
  const current = ++token
  if (id && running) void poll(id, current)
}, { immediate: true })

onUnmounted(() => {
  token += 1
  store.disconnectSse()
})

const act = async (action: 'start' | 'retry' | 'cancel') => {
  if (busy.value) return
  busy.value = true
  try {
    if (action === 'start') {
      store.hydrateFromBackendSession((await startResearchSession(store.report.sessionId, store.currentRevision)).session)
    } else if (action === 'retry') {
      await store.retryResearch()
    } else {
      await store.cancelResearch()
    }
  } catch (error) {
    store.notify(error instanceof Error ? error.message : 'Proses gagal dimulai.', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="page-shell space-y-7">
    <!-- Header: Session Cockpit -->
    <header class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="section-kicker">Sesi riset</span>
            <span class="text-slate-300">•</span>
            <span class="font-mono text-xs font-semibold text-slate-500">{{ store.report.sessionId }}</span>
            <span v-if="store.currentRevision" class="font-mono text-xs text-slate-400">rev.{{ store.currentRevision }}</span>
          </div>
          <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {{ store.currentObjective }}
          </h1>
        </div>

        <!-- Distinct Status Tag (No glowing AI slop) -->
        <div class="shrink-0 self-start">
          <div
            class="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors"
            :class="{
              'border-emerald-200 bg-emerald-50 text-emerald-800': store.status === 'COMPLETED',
              'border-blue-200 bg-blue-50 text-[#1E4270]': store.isExecuting,
              'border-rose-200 bg-rose-50 text-rose-800': store.status === 'FAILED',
              'border-amber-200 bg-amber-50 text-amber-800': ['PARTIAL', 'NEEDS_INPUT'].includes(store.status),
              'border-slate-200 bg-slate-50 text-slate-700': ['IDLE', 'CANCELLED'].includes(store.status) && !store.isExecuting
            }"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="{
                'bg-emerald-500': store.status === 'COMPLETED',
                'bg-blue-600 animate-pulse': store.isExecuting,
                'bg-rose-500': store.status === 'FAILED',
                'bg-amber-500': ['PARTIAL', 'NEEDS_INPUT'].includes(store.status),
                'bg-slate-400': ['IDLE', 'CANCELLED'].includes(store.status) && !store.isExecuting
              }"
            />
            <span role="status">Proses: {{ sessionStatusMeta(store.status, store.isExecuting).label }}</span>
          </div>
        </div>
      </div>

      <!-- Restriction Warning Banner -->
      <div v-if="store.isActiveSessionRestricted" data-testid="restricted-session" class="mt-5 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-sm leading-6 text-rose-950">
        <strong>Arsip ini tidak dapat digunakan untuk keputusan investasi.</strong> Metode lama tidak sesuai dengan tujuan tertulis atau data wajib tidak lengkap. Kandidat, skor, dan kesimpulan lama tidak divalidasi.
      </div>

      <!-- Narrative status explainer -->
      <p class="mt-4 text-sm leading-6 text-slate-600">
        {{ store.status === 'COMPLETED' ? 'Proses perhitungan selesai. Ini tidak berarti tujuan berhasil dijawab.' : store.isExecuting ? 'Pemeriksaan data berjalan. Hasil hanya tersedia setelah publikasi.' : 'Sesi belum menghasilkan proses pemeriksaan yang selesai.' }}
      </p>

      <p v-if="store.failureReason" role="alert" class="mt-3 flex items-center gap-2 text-sm font-medium leading-6 text-rose-700">
        <AlertCircle class="h-4 w-4 shrink-0" />
        <span>{{ store.failureReason }}</span>
      </p>
      <p v-if="readError" role="alert" class="mt-3 text-sm font-medium text-amber-900">
        {{ readError }}
      </p>

      <!-- Action Buttons Row -->
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button
          v-if="store.status === 'IDLE' && store.activePlan.contract?.status === 'supported'"
          type="button"
          :disabled="busy"
          class="button-primary"
          @click="act('start')"
        >
          <Play class="h-4 w-4" />
          <span>Mulai sesi</span>
        </button>

        <button
          v-if="store.isExecuting"
          data-testid="session-cancel"
          type="button"
          :disabled="busy"
          class="button-secondary border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
          @click="act('cancel')"
        >
          <XCircle class="h-4 w-4 text-rose-600" />
          <span>Batalkan</span>
        </button>

        <button
          v-if="['FAILED', 'PARTIAL', 'CANCELLED'].includes(store.status) && store.activePlan.contract?.status === 'supported'"
          data-testid="session-retry"
          type="button"
          :disabled="busy"
          class="button-primary"
          @click="act('retry')"
        >
          <RotateCw class="h-4 w-4" />
          <span>Jalankan ulang</span>
        </button>

        <router-link
          v-if="store.publishedAttemptId"
          data-testid="session-next"
          :to="`/research/${store.report.sessionId}/report`"
          class="button-primary"
        >
          <span>{{ store.isActiveSessionRestricted ? 'Baca arsip dengan peringatan' : 'Baca laporan' }}</span>
          <ArrowRight class="h-4 w-4" />
        </router-link>

        <router-link
          v-if="store.screeningFunnel.length"
          :to="`/research/${store.report.sessionId}/screener`"
          class="button-secondary"
        >
          <Filter class="h-4 w-4 text-slate-500" />
          <span>Tinjau proses data</span>
        </router-link>
      </div>
    </header>

    <!-- Unsupported Contract Notice -->
    <section v-if="store.activePlan.contract?.status !== 'supported'" class="rounded-xl border border-amber-200 bg-amber-50/90 p-5 text-sm leading-6 text-amber-950">
      <h2 class="font-bold">Tujuan belum didukung atau kontrak sesi lama belum terverifikasi</h2>
      <p v-for="reason in store.activePlan.contract?.unsupportedReasons" :key="reason" class="mt-1">
        {{ reason }}
      </p>
      <router-link to="/research/new" class="mt-3 inline-block font-semibold text-amber-900 underline underline-offset-4">
        Pilih screening yang didukung
      </router-link>
    </section>

    <!-- Five Pillars Process Strip -->
    <section aria-labelledby="phase-title" class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="phase-title" class="text-lg font-bold text-slate-950 sm:text-xl">Lima tahap screening</h2>
        <p class="text-xs text-slate-500">
          Setiap tahap berhenti jika sumber wajib gagal. Data dummy, salinan kedaluwarsa, dan sumber pengganti tidak digunakan.
        </p>
      </div>

      <ol class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <li
          v-for="(pillar, index) in store.pillars"
          :key="pillar.id"
          class="flex flex-col justify-between rounded-xl border p-4 transition-all"
          :class="{
            'border-emerald-200/90 bg-emerald-50/40': pillar.status === 'completed',
            'border-blue-300 bg-blue-50/50 ring-1 ring-blue-400/20': pillar.status === 'active',
            'border-rose-200 bg-rose-50/60': pillar.status === 'failed',
            'border-slate-200/80 bg-slate-50/40': pillar.status === 'pending'
          }"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-slate-400">0{{ index + 1 }}</span>
              <span
                class="inline-flex items-center gap-1 text-[11px] font-bold"
                :class="{
                  'text-emerald-700': pillar.status === 'completed',
                  'text-[#2F64A8]': pillar.status === 'active',
                  'text-rose-700': pillar.status === 'failed',
                  'text-slate-400': pillar.status === 'pending'
                }"
              >
                <CheckCircle2 v-if="pillar.status === 'completed'" class="h-3.5 w-3.5 text-emerald-600" />
                <span v-else-if="pillar.status === 'active'" class="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <Clock v-else-if="pillar.status === 'pending'" class="h-3 w-3 text-slate-400" />
                <XCircle v-else class="h-3.5 w-3.5 text-rose-600" />
                <span>{{ pillar.status === 'completed' ? 'Selesai' : pillar.status === 'active' ? 'Sedang berjalan' : pillar.status === 'failed' ? 'Gagal' : 'Menunggu' }}</span>
              </span>
            </div>

            <h3 class="mt-2.5 text-sm font-bold leading-snug text-slate-900">{{ pillar.name }}</h3>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ pillar.subtitle }}</p>
          </div>

          <div class="mt-4 border-t border-slate-100/80 pt-3">
            <p v-if="pillar.metricsSummary" class="truncate font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200/90 rounded px-2 py-0.5 inline-block max-w-full">
              {{ pillar.metricsSummary }}
            </p>
            <p v-if="pillar.reason" role="alert" class="text-xs font-medium leading-5 text-rose-800">
              {{ pillar.reason }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Candidate Results Grid -->
    <section v-if="store.publishedAttemptId" class="space-y-4">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 class="text-xl font-bold tracking-tight text-slate-950">Data kandidat untuk ditinjau</h2>
        <span class="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">{{ store.candidates.length }} emiten memenuhi kriteria</span>
      </div>

      <p class="text-sm leading-6 text-slate-600">
        {{ store.report.objectiveStatus === 'cannot_assess' ? 'Satu atau lebih bank top-eight tidak memiliki data wajib; tujuan belum dapat dinilai sepenuhnya.' : store.report.objectiveStatus === 'not_answered' ? 'Tidak ada data kandidat yang dapat ditampilkan; tujuan belum terjawab.' : 'Laporan menampilkan hingga delapan kandidat sesuai data yang tersedia pada cakupan provider.' }}
      </p>

      <div class="grid gap-4 xl:grid-cols-2">
        <CandidateCard v-for="candidate in store.candidates" :key="candidate.symbol" :candidate="candidate" />
      </div>
    </section>

    <!-- Institutional Provenance -->
    <DataProvenance />

    <!-- Collapsible Scope & Rules -->
    <details class="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <summary class="min-h-11 cursor-pointer font-bold text-slate-950 hover:text-slate-800 transition-colors flex items-center justify-between">
        <span>Cakupan dan aturan yang diperiksa</span>
        <ChevronDown class="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
      </summary>
      
      <div class="mt-4 border-t border-slate-100 pt-4 space-y-3">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md" data-testid="persisted-brief">
            {{ store.activeBrief.market }} · {{ store.activeBrief.sectorScope }} · {{ store.activeBrief.indexScope }} · {{ store.activePlan.contract?.objectiveType === 'bank-evidence' ? 'hingga 8 data kandidat tersedia' : `maksimal ${store.activeBrief.candidateCount} kandidat` }} · {{ store.activeBrief.researchDepth }}
          </span>
        </div>

        <p class="text-sm leading-6 text-slate-700">
          {{ store.activePlan.contract?.coveragePolicy || store.activePlan.universe }}
        </p>

        <ul class="list-disc space-y-1.5 pl-5 text-sm text-slate-600">
          <li v-for="criterion in store.activePlan.contract?.criteria || store.activePlan.criteria" :key="criterion">
            {{ criterion }}
          </li>
        </ul>

        <p class="text-xs leading-5 text-slate-500 pt-2 border-t border-slate-100">
          Pendalaman dan benchmark peer independen belum didukung. Tinjauan bank hanya menampilkan ROE dan P/BV yang tersedia. Status proses selesai tidak berarti riset lanjutan telah dilakukan.
        </p>
      </div>
    </details>
  </div>
</template>
