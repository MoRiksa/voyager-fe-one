<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { sessionStatusMeta } from '../utils/status'
import CandidateCard from '../components/CandidateCard.vue'
import DataProvenance from '../components/DataProvenance.vue'
import { Activity, AlertTriangle, ArrowRight, Clock3, MessageSquare, RotateCcw, Send, Square, Terminal } from '@lucide/vue'

const store = useResearchStore()
const route = useRoute()
const activePanel = ref<'overview' | 'activity' | 'results'>('overview')
const followUp = ref('')
const followUpResponse = ref('')
const clarificationAnswer = ref('')
const sessionFound = ref(true)
const statusMeta = computed(() => sessionStatusMeta(store.status, store.isExecuting))
const contractBanners: Record<string, { title: string; description: string; className: string }> = {
  PARTIAL: { title: 'Hasil parsial tersedia', description: 'Sebagian tahap selesai. Tinjau kandidat dan jejak aktivitas yang tersedia sebelum menggunakan hasil.', className: 'border-amber-200 bg-amber-50 text-amber-950' },
  FAILED: { title: 'Riset tidak berhasil diselesaikan', description: 'Proses berhenti sebelum seluruh langkah selesai. Data yang sudah tersimpan tetap dapat ditinjau.', className: 'border-rose-200 bg-rose-50 text-rose-950' },
  CANCELLED: { title: 'Riset dibatalkan', description: 'Sesi dihentikan sebelum selesai. Tidak ada proses lanjutan yang dijalankan dari halaman ini.', className: 'border-slate-300 bg-slate-100 text-slate-900' },
  NEEDS_INPUT: { title: 'Riset memerlukan input', description: 'Rencana membutuhkan klarifikasi sebelum dapat dilanjutkan. Jawaban akan disimpan bersama brief sesi.', className: 'border-blue-200 bg-blue-50 text-blue-950' }
}
const contractBanner = computed(() => contractBanners[String(store.status)])

watch(() => String(route.params.id), id => {
  sessionFound.value = id === store.report.sessionId || store.sessions.some(session => session.id === id)
}, { immediate: true })

const activePillar = computed(() => store.pillars.find(pillar => pillar.status === 'active'))
const completedCount = computed(() => store.pillars.filter(pillar => pillar.status === 'completed').length)
const progress = computed(() => Math.round((completedCount.value / store.pillars.length) * 100))
const sessionDescription = computed(() => activePillar.value?.subtitle || (store.isExecuting
  ? 'Riset sedang berjalan. Hasil akan tersedia setelah seluruh tahap selesai.'
  : store.status === 'PARTIAL'
    ? 'Sebagian hasil tersimpan dan dapat ditinjau dengan memperhatikan keterbatasannya.'
    : store.status === 'NEEDS_INPUT'
      ? 'Riset memerlukan klarifikasi sebelum proses dapat dilanjutkan.'
      : store.status === 'CANCELLED'
        ? 'Riset dibatalkan. Artefak yang sudah tersimpan tetap tersedia untuk ditinjau.'
  : store.status === 'FAILED'
    ? 'Proses sebelumnya terputus. Hasil yang telah tersimpan tetap dapat ditinjau.'
    : store.status === 'COMPLETED'
      ? 'Hasil riset, kandidat, dan laporan telah tersedia untuk ditinjau.'
      : 'Riset sudah disiapkan dan akan segera dimulai.'))
const progressLabel = computed(() => activePillar.value?.name || (store.status === 'COMPLETED' ? 'Riset selesai' : store.status === 'PARTIAL' ? 'Hasil parsial' : store.status === 'NEEDS_INPUT' ? 'Menunggu klarifikasi' : store.status === 'CANCELLED' ? 'Riset dibatalkan' : store.status === 'FAILED' ? 'Proses terputus' : 'Menyiapkan riset'))

const askFollowUp = () => {
  if (!followUp.value.trim()) return
  store.addFollowUp(followUp.value.trim())
  followUpResponse.value = 'Catatan telah disimpan pada sesi ini. Dataset prototype tidak dihitung ulang oleh catatan.'
  followUp.value = ''
}

const answerClarification = () => {
  if (!store.answerClarification(clarificationAnswer.value)) return
  clarificationAnswer.value = ''
  store.notify('Klarifikasi disimpan pada brief sesi.', 'success')
}

const cancel = () => {
  if (store.cancelResearch()) store.notify('Riset dibatalkan. Hasil yang sudah tersimpan tetap dipertahankan.', 'info')
}

const retry = () => {
  if (store.retryResearch()) store.notify('Riset dijalankan ulang dari awal.', 'info')
}
</script>

<template>
  <div v-if="!sessionFound" class="mx-auto flex min-h-[65dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-2xl font-bold text-slate-950">Sesi riset tidak ditemukan</h1>
    <p class="mt-3 text-sm leading-6 text-slate-600">Sesi ini tidak tersedia di perangkat ini atau telah melewati batas riwayat lokal.</p>
    <router-link to="/" class="button-primary mt-6">Kembali ke beranda</router-link>
  </div>
  <div v-else class="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-4xl">
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span class="text-[#2F64A8]">Sesi {{ store.report.sessionId }}</span>
             <span class="status-badge" :class="statusMeta.className">{{ statusMeta.label }}</span>
          </div>
          <h1 class="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">{{ store.presets.find(preset => preset.id === store.activePresetId)?.title || 'Riset khusus Anda' }}</h1>
          <div class="mt-4 max-w-4xl rounded-xl bg-slate-50 p-4"><span class="text-xs font-bold text-slate-500">Tujuan riset</span><p class="mt-1 text-sm leading-6 text-slate-700">{{ store.currentObjective }}</p></div>
          <p class="mt-3 text-sm leading-6 text-slate-600">{{ sessionDescription }}</p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <button v-if="store.isExecuting" type="button" data-testid="session-cancel" class="button-secondary text-rose-700" @click="cancel"><Square class="h-4 w-4" /> Batalkan</button>
          <button v-if="['FAILED', 'PARTIAL', 'CANCELLED'].includes(store.status)" type="button" data-testid="session-retry" class="button-secondary" @click="retry"><RotateCcw class="h-4 w-4" /> Jalankan ulang</button>
          <button v-if="store.status === 'COMPLETED'" type="button" data-testid="session-mark-partial" class="button-secondary" @click="store.markPartial()">Simulasikan parsial</button>
          <button v-if="store.status === 'COMPLETED'" type="button" data-testid="session-request-clarification" class="button-secondary" @click="store.requestClarification('Apakah prioritas utama Anda pertumbuhan, valuasi, atau dividen?')">Minta klarifikasi</button>
          <template v-if="store.status === 'COMPLETED' || (store.status === 'PARTIAL' && store.candidates.length)">
          <router-link v-if="store.candidates.length >= 2" data-testid="session-next" :to="`/research/${store.report.sessionId}/screener`" class="button-primary">Lihat cara kandidat dipilih <ArrowRight class="h-4 w-4" /></router-link>
          <router-link v-else-if="store.candidates.length === 1" data-testid="session-next" :to="`/research/${store.report.sessionId}/company/${store.candidates[0].symbol}`" class="button-primary">Buka analisis kandidat <ArrowRight class="h-4 w-4" /></router-link>
          <router-link v-else data-testid="session-next" to="/research/new" class="button-primary">Ubah kriteria riset <ArrowRight class="h-4 w-4" /></router-link>
          <router-link :to="`/research/${store.report.sessionId}/report`" class="button-secondary">Buka laporan</router-link>
          </template>
        </div>
      </div>
      <div class="mt-7">
         <div class="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600"><span>{{ progressLabel }}</span><span class="font-mono">{{ progress }}%</span></div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><div class="h-full rounded-full bg-[#407EC9] transition-[width] duration-300" :style="{ width: `${progress}%` }"></div></div>
      </div>
      <DataProvenance source="prototype-fixture-v1 dan metrik turunan sesi" :generated-at="store.report.timestamp" compact class="mt-5" />
    </header>

    <section v-if="contractBanner" role="status" class="mt-4 flex gap-3 rounded-2xl border p-4" :class="contractBanner.className">
      <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0" />
      <div><h2 class="text-sm font-bold">{{ contractBanner.title }}</h2><p class="mt-1 text-xs leading-5 opacity-80">{{ contractBanner.description }}</p></div>
    </section>
    <form v-if="store.status === 'NEEDS_INPUT'" data-testid="clarification-form" class="mt-4 rounded-2xl border border-blue-200 bg-white p-5" @submit.prevent="answerClarification">
      <label for="clarification-answer" class="text-sm font-bold text-slate-900">{{ store.clarificationQuestion }}</label>
      <p class="mt-1 text-xs text-slate-500">Jawaban disimpan pada brief sesi dan dapat ditinjau kembali.</p>
      <div class="mt-3 flex flex-col gap-2 sm:flex-row"><input id="clarification-answer" v-model="clarificationAnswer" data-testid="clarification-answer" required class="min-h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm" placeholder="Tulis prioritas Anda" /><button type="submit" class="button-primary">Simpan klarifikasi</button></div>
    </form>

    <div class="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 lg:hidden" aria-label="Panel sesi">
      <button v-for="panel in [{ id: 'overview', label: 'Ringkasan' }, { id: 'activity', label: 'Aktivitas' }, { id: 'results', label: 'Hasil' }]" :key="panel.id" type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold" :class="activePanel === panel.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="activePanel === panel.id" @click="activePanel = panel.id as typeof activePanel">{{ panel.label }}</button>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem]">
      <div class="space-y-6">
        <section v-show="activePanel === 'overview' || activePanel === 'results'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-start justify-between gap-3"><div><p class="section-kicker">Rencana riset aktif</p><h2 class="mt-1 text-xl font-bold text-slate-950">Kriteria dan langkah yang dijalankan</h2></div><span class="shrink-0 font-mono text-xs text-slate-500">{{ completedCount }}/{{ store.pillars.length }} tahap</span></div>
          <dl class="mt-5 grid gap-4 sm:grid-cols-2">
            <div data-testid="persisted-brief" class="rounded-xl border border-slate-200 p-4 sm:col-span-2"><dt class="text-xs font-bold text-slate-500">Brief tersimpan</dt><dd class="mt-2 text-sm leading-6 text-slate-800">{{ store.activeBrief.market }} · {{ store.activeBrief.sectorScope }} · {{ store.activeBrief.indexScope }} · target {{ store.activeBrief.candidateCount }} kandidat · {{ store.activeBrief.researchDepth.toLowerCase() }}</dd><dd class="mt-1 text-xs text-slate-500">{{ store.activeBrief.useSectorMetrics ? 'Metrik spesifik sektor bila tersedia' : 'Metrik umum' }}<template v-if="store.activeBrief.optionalDimensions.length"> · {{ store.activeBrief.optionalDimensions.join(', ') }}</template></dd></div>
            <div class="rounded-xl bg-slate-50 p-4 sm:col-span-2"><dt class="text-xs font-bold text-slate-500">Universe aktif</dt><dd class="mt-1 text-sm leading-6 text-slate-800">{{ store.activePlan.universe }}</dd></div>
            <div class="rounded-xl bg-blue-50 p-4 sm:col-span-2"><dt class="text-xs font-bold text-[#2F64A8]">Hipotesis</dt><dd class="mt-1 text-sm leading-6 text-slate-800">{{ store.activePlan.hypothesis }}</dd></div>
            <div><dt class="text-sm font-bold text-slate-900">Kriteria diterapkan</dt><dd><ul class="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600"><li v-for="criterion in store.activePlan.criteria" :key="criterion">{{ criterion }}</li><li v-if="!store.activePlan.criteria.length">Belum ada kriteria aktif.</li></ul></dd></div>
            <div><dt class="text-sm font-bold text-slate-900">Data yang dibutuhkan</dt><dd><ul class="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600"><li v-for="dataPoint in store.activePlan.requiredDataPoints" :key="dataPoint">{{ dataPoint }}</li><li v-if="!store.activePlan.requiredDataPoints.length">Belum ada data wajib.</li></ul></dd></div>
          </dl>
          <h3 class="mt-6 text-sm font-bold text-slate-900">Urutan eksekusi</h3>
          <ol class="mt-3 space-y-2">
            <li v-for="step in store.activePlan.steps" :key="`${step.order}-${step.action}`" class="grid grid-cols-[2rem_1fr] gap-3 rounded-xl border border-slate-200 p-4">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700">{{ step.order }}</span>
              <div><div class="flex flex-wrap items-center gap-x-2 gap-y-1"><h4 class="text-sm font-bold text-slate-900">{{ step.action }}</h4><code class="text-[10px] text-slate-500">{{ step.tool }}</code></div><p class="mt-1 text-xs leading-5 text-slate-500">{{ step.description }}</p></div>
            </li>
            <li v-if="!store.activePlan.steps.length" class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Langkah eksekusi belum disusun.</li>
          </ol>
        </section>

        <section v-show="activePanel === 'overview' || activePanel === 'results'" aria-labelledby="session-results-title">
           <div class="mb-4 flex items-end justify-between"><div><p class="section-kicker">{{ store.status === 'COMPLETED' ? 'Hasil akhir' : store.status === 'PARTIAL' ? 'Hasil parsial' : 'Menunggu hasil' }}</p><h2 id="session-results-title" class="mt-1 text-xl font-bold text-slate-950">Kandidat teratas</h2></div><router-link v-if="store.candidates.length >= 2 && (store.status === 'COMPLETED' || store.status === 'PARTIAL')" :to="`/research/${store.report.sessionId}/peers`" class="text-link hidden sm:inline-flex">Bandingkan kandidat <ArrowRight class="h-4 w-4" /></router-link></div>
          <div v-if="store.candidates.length" class="grid gap-4 xl:grid-cols-2"><CandidateCard v-for="candidate in store.candidates.slice(0, 4)" :key="candidate.symbol" :candidate="candidate" /></div>
           <div v-else-if="store.status === 'COMPLETED'" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><h3 class="font-bold text-slate-900">Tidak ada kandidat yang lolos</h3><p class="mt-2 text-sm text-slate-600">Tinjau tahap penyaringan untuk melihat perusahaan yang gugur, lalu gunakan riset ini sebagai template untuk menyesuaikan kriteria.</p><div class="mt-5 flex flex-wrap justify-center gap-2"><router-link :to="`/research/${store.report.sessionId}/screener`" class="button-secondary">Tinjau tahap seleksi</router-link><router-link to="/research/new" class="button-primary">Ubah kriteria</router-link></div></div>
           <div v-else class="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center"><Clock3 class="mx-auto h-5 w-5 text-[#407EC9]" /><h3 class="mt-3 font-bold text-slate-900">Kandidat belum tersedia</h3><p class="mt-2 text-sm text-slate-600">Hasil akhir akan muncul otomatis setelah proses riset selesai.</p></div>
        </section>

        <section v-show="activePanel === 'activity'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:hidden">
          <h2 class="text-lg font-bold text-slate-950">Aktivitas terbaru</h2>
          <div class="mt-4 space-y-4"><div v-for="call in store.toolCalls.slice(-6).reverse()" :key="call.id" class="border-l-2 border-slate-200 pl-4"><p class="text-sm font-bold text-slate-900">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-xs text-slate-500">{{ call.timestamp }} · {{ call.sourceKind === 'prototype-fixture' ? 'fixture v1' : 'input pengguna' }}</p></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-center gap-2"><MessageSquare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Catatan lanjutan</h2></div>
          <p class="mt-1 text-xs leading-5 text-slate-500">Simpan pertanyaan atau ide untuk riset berikutnya. Catatan tidak menghitung ulang hasil sesi ini.</p>
          <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="askFollowUp"><label for="follow-up" class="sr-only">Catatan lanjutan</label><input id="follow-up" v-model="followUp" class="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 text-sm focus:border-[#2F64A8]" placeholder="Contoh: Bandingkan tiga kandidat teratas dari sisi risiko." /><button type="submit" class="button-primary"><Send class="h-4 w-4" /> Simpan catatan</button></form>
          <p v-if="followUpResponse" role="status" class="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{{ followUpResponse }}</p>
        </section>
      </div>

      <aside class="hidden space-y-4 lg:block">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center gap-2"><Activity class="h-4 w-4 text-[#407EC9]" /><h2 class="text-sm font-bold text-slate-950">Aktivitas sesi</h2></div><div class="mt-5 space-y-5"><div v-for="call in store.toolCalls.slice(-5).reverse()" :key="call.id" class="relative border-l-2 border-slate-200 pl-4"><span class="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-[#407EC9]"></span><p class="text-xs font-semibold leading-5 text-slate-800">{{ call.outputSummary }}</p><p class="mt-1 font-mono text-[11px] text-slate-500">{{ call.timestamp }} · {{ call.sourceKind === 'prototype-fixture' ? 'fixture v1' : 'input pengguna' }}</p></div></div><router-link :to="`/research/${store.report.sessionId}/activity`" class="text-link mt-5">Lihat seluruh aktivitas <ArrowRight class="h-4 w-4" /></router-link></section>
        <section class="rounded-2xl bg-slate-900 p-5 text-white"><Terminal class="h-4 w-4 text-blue-200" /><h2 class="mt-4 text-sm font-bold">Perlu detail teknis?</h2><p class="mt-2 text-xs leading-5 text-slate-300">Payload dan metadata tersedia tanpa memenuhi ruang kerja utama.</p><router-link :to="`/research/${store.report.sessionId}/trace`" class="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-white">Buka audit teknis <ArrowRight class="h-4 w-4" /></router-link></section>
      </aside>
    </div>
  </div>
</template>
