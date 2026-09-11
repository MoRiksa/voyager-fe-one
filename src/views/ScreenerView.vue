<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import type { CandidateCompany } from '../types'
import DataProvenance from '../components/DataProvenance.vue'
import { 
  ArrowRight,
  CheckCircle2,
  XCircle
} from '@lucide/vue'

const store = useResearchStore()
const selectedStage = ref(store.screeningFunnel.length - 1)
const resultMode = ref<'retained' | 'excluded'>('retained')
const sortBy = ref<'rank' | 'score' | 'symbol'>('rank')
const sortLabel = computed(() => ({ rank: 'peringkat', score: 'skor tertinggi', symbol: 'ticker A-Z' })[sortBy.value])
const activeStep = computed(() => store.screeningFunnel[selectedStage.value])
type StageCompany = Partial<CandidateCompany> & { symbol: string; name: string }
const candidateBySymbol = computed(() => new Map(store.candidates.map(candidate => [candidate.symbol, candidate])))
const stageCompany = (symbol: string): StageCompany => candidateBySymbol.value.get(symbol) || { symbol, name: symbol }
const retainedCompanies = computed(() => (activeStep.value?.retainedSymbols || []).map(stageCompany))
const excludedSymbols = computed(() => activeStep.value?.excludedSymbols
  || (activeStep.value?.inputSymbols || store.screeningFunnel[selectedStage.value - 1]?.retainedSymbols || []).filter(symbol => !activeStep.value?.retainedSymbols.includes(symbol)))
const excludedCompanies = computed(() => excludedSymbols.value.map(stageCompany))
const visibleCompanies = computed(() => [...(resultMode.value === 'retained' ? retainedCompanies.value : excludedCompanies.value)].sort((a, b) => {
  if (sortBy.value === 'score') return (b.qualityScore ?? -Infinity) - (a.qualityScore ?? -Infinity) || a.symbol.localeCompare(b.symbol)
  if (sortBy.value === 'symbol') return a.symbol.localeCompare(b.symbol)
  return (a.rank ?? Infinity) - (b.rank ?? Infinity) || a.symbol.localeCompare(b.symbol)
}))
const initialCount = computed(() => store.screeningFunnel[0]?.count || 0)
const hasScreeningData = computed(() => store.screeningFunnel.length > 0)
const isBank = computed(() => store.candidates.some(candidate => candidate.formulaVersion === 'bank-screen-2f-v1') || store.screeningFunnel.some(stage => stage.formulaVersion === 'bank-screen-2f-v1'))
const previousCount = computed(() => activeStep.value?.inputSymbols?.length ?? (selectedStage.value > 0 ? store.screeningFunnel[selectedStage.value - 1]?.count || 0 : initialCount.value))
const excludedCount = computed(() => activeStep.value?.excludedCount ?? excludedSymbols.value.length)
const exclusionImpact = computed(() => previousCount.value ? (excludedCount.value / previousCount.value) * 100 : 0)
const requiredMetrics = computed(() => isBank.value ? [['Kapitalisasi', 'marketCapTrillionIdr'], ['ROE', 'roePercent'], ['P/BV', 'pbvRatio'], ['Skor heuristik', 'qualityScore']] as const : [['Kapitalisasi', 'marketCapTrillionIdr'], ['ROE', 'roePercent'], ['Debt/Equity', 'debtToEquity'], ['FCF yield', 'freeCashFlowYieldPercent'], ['Skor kualitas', 'qualityScore']] as const)
const missingMetrics = (company: Record<string, unknown>) => requiredMetrics.value.filter(([, key]) => typeof company[key] !== 'number' || !Number.isFinite(company[key])).map(([label]) => label)
const exclusionReasons = (company: StageCompany) => (activeStep.value?.reasons || []).filter(reason => reason.symbol === company.symbol).map(reason => reason.message)
const reasonCounts = computed(() => {
  const counts = new Map<string, number>()
  excludedCompanies.value.flatMap(company => exclusionReasons(company)).forEach(reason => counts.set(reason, (counts.get(reason) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})
const metric = (value: number | undefined, suffix = '') => Number.isFinite(value) ? `${value}${suffix}` : 'Tidak tersedia'
const hasDossier = (symbol: string) => candidateBySymbol.value.has(symbol)

watch(() => store.report.sessionId, () => {
  selectedStage.value = Math.max(0, store.screeningFunnel.length - 1)
  resultMode.value = 'retained'
})
watch(() => store.screeningFunnel.length, length => {
  if (length && (selectedStage.value < 0 || selectedStage.value >= length)) selectedStage.value = length - 1
})
</script>

<template>
  <div class="page-shell space-y-7">
    <section v-if="!hasScreeningData" data-testid="results-pending" class="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center text-center">
      <div v-if="store.isExecuting" class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2F64A8]" role="progressbar" aria-label="Memproses"></div>
       <span class="section-kicker">{{ store.isExecuting ? 'Riset sedang berjalan' : 'Hasil belum tersedia' }}</span>
       <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">{{ store.isExecuting ? 'Kandidat sedang diseleksi' : 'Tahap seleksi belum tersedia' }}</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">{{ store.status === 'FAILED' ? 'Kembali ke ringkasan sesi untuk melihat status dan hasil yang sempat tersimpan.' : 'Voyager One sedang mengevaluasi ruang lingkup dan kriteria. Hasil tahap seleksi akan muncul setelah riset selesai.' }}</p>
      <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke progress riset</router-link>
    </section>
    <template v-else>
    <section v-if="store.status !== 'COMPLETED'" role="alert" class="rounded-2xl border p-4 text-sm" :class="store.status === 'FAILED' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'"><strong>{{ store.status === 'FAILED' ? 'Penyaringan gagal sebelum selesai.' : 'Hasil penyaringan masih parsial.' }}</strong> Data tahap yang sudah tersedia tetap ditampilkan dan belum merupakan hasil akhir.</section>
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Proses penyaringan</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           {{ store.screeningFunnel.length }} tahap
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Dari {{ initialCount }} perusahaan menjadi {{ store.candidates.length }} kandidat
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Tinjau kriteria yang digunakan pada setiap tahap dan perusahaan yang dipilih untuk analisis lebih lanjut.
      </p>
    </div>

    <!-- Funnel Breakdown Stages -->
    <div class="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible" aria-label="Tahap penyaringan">
      <button
        v-for="(step, idx) in store.screeningFunnel"
        :key="step.stage"
        type="button"
        :aria-pressed="selectedStage === idx"
        @click="selectedStage = idx"
        class="min-w-[15rem] snap-start bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between lg:min-w-0"
        :class="selectedStage === idx ? 'border-[#407EC9] ring-2 ring-[#407EC9]/15' : 'hover:border-slate-300'"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold flex items-center justify-center">
              0{{ idx + 1 }}
            </span>
             <span class="text-xs font-mono font-bold text-[#2F64A8] bg-[#407EC9]/10 px-2 py-0.5 rounded">
               {{ initialCount ? ((step.count / initialCount) * 100).toFixed(1) : '0.0' }}% tersisa
            </span>
          </div>

          <h3 class="text-sm font-bold text-slate-900">{{ step.stage }}</h3>
          <div class="text-2xl font-mono font-bold text-slate-900 my-2 tabular-nums">
            {{ step.count.toLocaleString() }}
            <span class="text-xs font-sans text-slate-500 font-normal">emiten</span>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed">{{ step.description }}</p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100">
           <span class="text-xs text-slate-500 font-semibold block mb-1">Kriteria tahap ini</span>
          <span class="text-[11px] font-mono font-medium text-slate-700 bg-slate-50 p-1.5 rounded block border border-slate-200/60 truncate">
            {{ step.filterCriteria }}
          </span>
        </div>
      </button>
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="stage-detail-title">
      <div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div><p class="section-kicker">Tahap {{ selectedStage + 1 }}</p><h2 id="stage-detail-title" class="mt-1 text-xl font-bold text-slate-950">{{ activeStep.stage }}</h2><p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{{ activeStep.description }}</p></div>
        <div class="rounded-xl bg-slate-50 px-4 py-3"><span class="text-xs text-slate-500">Kriteria yang diterapkan</span><strong class="mt-1 block font-mono text-xs text-slate-800">{{ activeStep.filterCriteria }}</strong></div>
      </div>
      <div class="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit">
         <button type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold sm:flex-none" :class="resultMode === 'retained' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="resultMode === 'retained'" @click="resultMode = 'retained'">Diteruskan · {{ retainedCompanies.length }} perusahaan</button>
         <button data-testid="show-excluded" type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold sm:flex-none" :class="resultMode === 'excluded' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="resultMode === 'excluded'" @click="resultMode = 'excluded'">Tidak diteruskan · {{ excludedCompanies.length }} perusahaan</button>
      </div>
      <div v-if="selectedStage > 0" class="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs"><span class="text-slate-500">Dampak tahap</span><strong class="mt-1 block font-mono text-slate-900">{{ excludedCount }} dari {{ previousCount }} dikeluarkan ({{ exclusionImpact.toFixed(1) }}%)</strong></div>
        <div data-testid="exclusion-reasons" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs"><span class="text-slate-500">Alasan pada sampel tersedia</span><div v-if="reasonCounts.length" class="mt-2 flex flex-wrap gap-2"><span v-for="([reason, count]) in reasonCounts" :key="reason" class="rounded-md border border-slate-200 bg-white px-2 py-1">{{ reason }} · <strong>{{ count }}</strong></span></div><p v-else class="mt-1 text-slate-700">Tidak ada rincian alasan yang tersimpan.</p></div>
      </div>
        <p class="mt-3 text-xs leading-6 text-slate-600">Membership dan alasan berasal dari backend. DATA_INCOMPLETE berarti belum dapat dinilai, bukan gagal finansial. COVERAGE_LIMIT berarti belum diperiksa. Metrik rinci hanya diterbitkan untuk kandidat akhir.</p>
    </section>

    <DataProvenance source="screening engine dan snapshot sesi backend" :generated-at="store.report.timestamp" />

    <!-- Shortlisted Companies Preview Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
            <h3 class="text-lg font-bold text-slate-900">{{ resultMode === 'retained' ? 'Perusahaan yang diteruskan' : 'Perusahaan yang tidak diteruskan' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ resultMode === 'retained' ? 'Perusahaan yang tetap berada dalam proses' : 'Alasan dapat berupa kriteria, data tidak lengkap, atau batas cakupan.' }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2"><label class="text-xs font-bold text-slate-700">Urutkan <select v-model="sortBy" class="ml-1 min-h-10 rounded-lg border border-slate-300 bg-white px-2 font-sans font-normal"><option value="rank">Peringkat</option><option value="score">Skor tertinggi</option><option value="symbol">Ticker A-Z</option></select></label><div class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Data sesi {{ store.report.sessionId }}</div></div>
      </div>

      <div v-if="visibleCompanies.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h3 class="text-base font-bold text-slate-900">Tidak ada perusahaan pada kategori ini</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">Snapshot tidak memuat membership untuk kombinasi tahap dan status ini. Pilih tahap lain.</p>
        <button type="button" class="button-secondary mt-5" @click="resultMode = 'retained'">Lihat perusahaan yang lolos</button>
      </div>

      <div v-else class="grid gap-3 md:hidden">
        <article v-for="candidate in visibleCompanies" :key="candidate.symbol" class="rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between gap-3">
            <div><button v-if="hasDossier(candidate.symbol)" :data-testid="`candidate-${candidate.symbol}`" class="min-h-11 min-w-11 rounded-lg font-mono text-base font-bold text-[#2F64A8] hover:bg-[#F4F8FD]" @click="store.openCandidateModal(candidate.symbol)">{{ candidate.symbol }}</button><span v-else class="inline-flex min-h-11 min-w-11 items-center font-mono text-base font-bold text-slate-900">{{ candidate.symbol }}</span><p class="text-xs text-slate-500">{{ candidate.name }}</p></div>
            <span class="rounded-lg bg-[#407EC9]/10 px-2.5 py-1 font-mono text-sm font-bold text-[#2F64A8]">Skor {{ metric(candidate.qualityScore, '/100') }}</span>
          </div>
          <div v-if="missingMetrics(candidate).length" class="mt-3 flex flex-wrap gap-1"><span v-for="missing in missingMetrics(candidate)" :key="missing" class="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">Data hilang: {{ missing }}</span></div>
          <dl class="mt-4 grid grid-cols-3 gap-2 text-xs"><div><dt class="text-slate-500">ROE</dt><dd class="mt-1 font-mono font-bold">{{ metric(candidate.roePercent, '%') }}</dd></div><div><dt class="text-slate-500">{{ isBank ? 'P/BV' : 'P/E' }}</dt><dd class="mt-1 font-mono font-bold">{{ isBank ? metric(candidate.pbvRatio, 'x') : metric(candidate.peRatio, 'x') }}</dd></div><div><dt class="text-slate-500">{{ isBank ? 'Skor' : 'FCF yield' }}</dt><dd class="mt-1 font-mono font-bold">{{ isBank ? metric(candidate.qualityScore, '/100') : metric(candidate.freeCashFlowYieldPercent, '%') }}</dd></div></dl>
          <p class="mt-3 text-[11px] leading-5 text-slate-500">{{ isBank ? 'Skor bank adalah ranking ROE 60% dan P/BV 40% tanpa ambang tambahan.' : 'Skor 80+ adalah ambang heuristik tiga faktor.' }} Bukan confidence. Benchmark sektor belum tersedia.</p>
          <div class="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-xs" :class="resultMode === 'retained' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"><CheckCircle2 v-if="resultMode === 'retained'" class="mt-0.5 h-3.5 w-3.5 shrink-0" /><XCircle v-else class="mt-0.5 h-3.5 w-3.5 shrink-0" />{{ resultMode === 'retained' ? 'Diteruskan pada tahap ini.' : exclusionReasons(candidate).join('; ') || 'Alasan tidak diteruskan belum tersedia.' }}</div>
        </article>
      </div>

      <div v-if="visibleCompanies.length > 0" class="hidden overflow-x-auto md:block">
        <p data-testid="screener-metric-guide" class="mb-4 text-xs leading-5 text-slate-500">Kapitalisasi menunjukkan ukuran perusahaan. <template v-if="isBank">ROE 60% dan P/BV 40% adalah faktor bank-screen-2f-v1; skor hanya ranking heuristik.</template><template v-else>ROE, P/E, Debt/Equity, dan FCF memakai aturan quality-3f-v2. Skor 80/100 adalah ambang kualitas.</template> Bukan rekomendasi membeli.</p>
        <table class="w-full text-left text-xs">
          <caption class="sr-only">{{ resultMode === 'retained' ? `Perusahaan yang lolos tahap ${activeStep.stage}, diurutkan berdasarkan ${sortLabel}` : `Perusahaan yang tidak lolos tahap ${activeStep.stage}, diurutkan berdasarkan ${sortLabel}` }}</caption>
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-mono font-semibold">
               <th scope="col" class="pb-3 pr-4">Peringkat</th>
               <th scope="col" class="pb-3 pr-4">Ticker</th>
               <th scope="col" class="pb-3 pr-4">Sektor</th>
               <th scope="col" class="pb-3 pr-4 text-right">Kapitalisasi</th>
               <th scope="col" class="pb-3 pr-4 text-right">ROE</th>
               <th scope="col" class="pb-3 pr-4 text-right">{{ isBank ? 'P/BV' : 'P/E' }}</th>
               <th v-if="!isBank" scope="col" class="pb-3 pr-4 text-right">Debt/Equity</th>
               <th v-if="!isBank" scope="col" class="pb-3 pr-4 text-right">FCF yield</th>
               <th scope="col" class="pb-3 text-right">Skor {{ isBank ? 'heuristik' : 'kualitas' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
               v-for="candidate in visibleCompanies"
              :key="candidate.symbol"
              class="hover:bg-slate-50/80 transition-colors"
            >
               <td class="py-3.5 pr-4 font-bold text-slate-900">{{ Number.isFinite(candidate.rank) ? `#${candidate.rank}` : 'Tidak tersedia' }}</td>
               <th scope="row" class="py-3.5 pr-4 font-bold text-[#2F64A8]">
                  <button v-if="hasDossier(candidate.symbol)"
                   :data-testid="`candidate-${candidate.symbol}`"
                   @click="store.openCandidateModal(candidate.symbol)"
                   class="inline-flex min-h-11 min-w-11 items-center rounded-lg hover:bg-[#F4F8FD] hover:underline cursor-pointer"
                >
                   {{ candidate.symbol }}
                  </button>
                  <span v-else>{{ candidate.symbol }}</span>
               </th>
              <td class="py-3.5 pr-4 font-sans text-slate-700">{{ candidate.sector }}</td>
               <td class="py-3.5 pr-4 text-right text-slate-800"><span v-if="Number.isFinite(candidate.marketCapTrillionIdr)">IDR {{ candidate.marketCapTrillionIdr }}T</span><span v-else class="rounded bg-amber-100 px-1.5 py-1 font-sans text-[10px] font-bold text-amber-900">Data hilang</span></td>
               <td class="py-3.5 pr-4 text-right font-bold text-slate-900">{{ metric(candidate.roePercent, '%') }}</td>
               <td class="py-3.5 pr-4 text-right text-slate-800">{{ isBank ? metric(candidate.pbvRatio, 'x') : metric(candidate.peRatio, 'x') }}</td>
               <td v-if="!isBank" class="py-3.5 pr-4 text-right text-slate-800">{{ metric(candidate.debtToEquity, 'x') }}</td>
               <td v-if="!isBank" class="py-3.5 pr-4 text-right font-bold text-slate-900">{{ metric(candidate.freeCashFlowYieldPercent, '%') }}</td>
              <td class="py-3.5 text-right font-bold text-[#2F64A8]">
                <span class="px-2 py-1 rounded bg-[#407EC9]/10 border border-[#407EC9]/20">
                   {{ metric(candidate.qualityScore, '/100') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section data-testid="screener-next" class="grid gap-5 rounded-2xl bg-[#102138] p-6 text-white shadow-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div><p class="text-xs font-bold uppercase tracking-wider text-blue-200">Langkah berikutnya</p><h2 class="mt-2 text-xl font-bold">{{ store.candidates.length >= 2 ? `${store.candidates.length} kandidat siap dibandingkan` : store.candidates.length === 1 ? 'Satu kandidat siap ditinjau' : 'Tinjau alasan dan batas cakupan' }}</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{{ store.candidates.length >= 2 ? isBank ? 'Bandingkan nilai absolut ROE, P/BV, dan skor heuristik, lalu lanjutkan riset bank secara independen.' : 'Bandingkan nilai absolut ROE, D/E, P/E, dan FCF. Pertumbuhan dan benchmark sektor belum dinilai.' : store.candidates.length === 1 ? 'Buka analisis untuk memahami risiko dan bukti pendukungnya.' : 'Periksa alasan seleksi dan data tidak lengkap. Ambang screening kanonik belum dapat diubah.' }}</p></div>
      <div class="flex flex-wrap gap-2">
        <router-link v-if="store.candidates.length >= 2" data-testid="screener-primary-next" :to="`/research/${store.report.sessionId}/peers`" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Bandingkan kandidat <ArrowRight class="h-4 w-4" /></router-link>
        <router-link v-else-if="store.candidates.length === 1" data-testid="screener-primary-next" :to="`/research/${store.report.sessionId}/company/${store.candidates[0].symbol}`" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Buka analisis <ArrowRight class="h-4 w-4" /></router-link>
        <router-link v-else data-testid="screener-primary-next" to="/research/new" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Mulai riset baru <ArrowRight class="h-4 w-4" /></router-link>
        <router-link :to="`/research/${store.report.sessionId}/report`" class="inline-flex min-h-11 items-center px-3 text-sm font-bold text-white">Buka laporan</router-link>
      </div>
    </section>
    </template>
  </div>
</template>
