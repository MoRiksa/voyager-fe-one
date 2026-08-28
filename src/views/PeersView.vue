<script setup lang="ts">
import { computed } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import PeerComparisonWorkbench from '../components/PeerComparisonWorkbench.vue'
import { 
  ArrowRight
} from '@lucide/vue'

const store = useResearchStore()
const comparisonCandidates = computed(() => store.candidates)
const comparisonHighlights = computed(() => {
  if (!comparisonCandidates.value.length) return []
  const highest = (key: 'roePercent' | 'freeCashFlowYieldPercent' | 'qualityScore') => [...comparisonCandidates.value].sort((a, b) => b[key] - a[key])[0]
  return [
    { label: 'Pengembalian modal tertinggi', company: highest('roePercent'), metric: `${highest('roePercent').roePercent}% ROE` },
    { label: 'Arus kas bebas tertinggi', company: highest('freeCashFlowYieldPercent'), metric: `${highest('freeCashFlowYieldPercent').freeCashFlowYieldPercent}% FCF yield` },
    { label: 'Skor kualitas tertinggi', company: highest('qualityScore'), metric: `skor ${highest('qualityScore').qualityScore}/100` }
  ]
})
</script>

<template>
  <div class="page-shell space-y-7">
    <section v-if="store.status !== 'COMPLETED' && comparisonCandidates.length < 2" data-testid="results-pending" class="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center text-center">
      <div v-if="store.isExecuting" class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2F64A8]" role="progressbar" aria-label="Memproses"></div>
      <span class="section-kicker">{{ store.status === 'FAILED' ? 'Hasil belum lengkap' : 'Riset sedang berjalan' }}</span>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">{{ store.status === 'FAILED' ? 'Perbandingan belum tersedia' : 'Menunggu kandidat akhir' }}</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">Perbandingan tersedia setelah proses seleksi menghasilkan kandidat akhir. Kembali ke sesi untuk mengikuti progress riset.</p>
      <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke progress riset</router-link>
    </section>
    <template v-else>
    <section v-if="store.status !== 'COMPLETED'" role="alert" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Perbandingan menggunakan hasil parsial.</strong> Kandidat atau nilai dapat berubah setelah seluruh tahap selesai.</section>
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Perbandingan kandidat</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Pembanding sesi
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Bandingkan kekuatan dan tradeoff kandidat
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Pilih 2–5 kandidat akhir untuk membandingkan kualitas, profitabilitas, valuasi, pertumbuhan, neraca, atau arus kas.
      </p>
    </div>

    <!-- Comparative Table -->
    <PeerComparisonWorkbench
      :candidates="comparisonCandidates"
      :generated-at="store.report.timestamp"
      @open-candidate="store.openCandidateModal"
    />

    <!-- Comparative Synthesis Cards -->
    <div v-if="comparisonCandidates.length >= 2" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="highlight in comparisonHighlights" :key="highlight.label" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#2F64A8] font-mono mb-2">{{ highlight.label }}</h4>
        <div class="text-xl font-bold font-mono text-slate-900">{{ highlight.company.symbol }} ({{ highlight.metric }})</div>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ highlight.company.whySelected }}</p>
      </div>
    </div>

    <section data-testid="peers-next" class="grid gap-5 rounded-2xl border border-[#407EC9]/20 bg-[#407EC9]/5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div><p class="section-kicker">Lanjutkan riset</p><h2 class="mt-2 text-xl font-bold text-slate-950">{{ comparisonCandidates.length >= 2 ? 'Baca kesimpulan lengkap dan keterbatasannya' : 'Tinjau kembali hasil seleksi' }}</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{{ comparisonCandidates.length >= 2 ? 'Laporan merangkum ranking, alasan pemilihan, risiko, sumber data, dan batas analisis untuk seluruh kandidat.' : 'Perbandingan membutuhkan sedikitnya dua kandidat. Lihat tahap seleksi untuk memahami hasil sesi ini.' }}</p></div>
      <div class="flex flex-wrap gap-2"><router-link v-if="comparisonCandidates.length >= 2" data-testid="peers-primary-next" :to="`/research/${store.report.sessionId}/report`" class="button-primary">Baca laporan riset <ArrowRight class="h-4 w-4" /></router-link><router-link :to="`/research/${store.report.sessionId}/screener`" class="button-secondary">Kembali ke tahap seleksi</router-link></div>
    </section>
    </template>
  </div>
</template>
