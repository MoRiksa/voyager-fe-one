<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  ArrowRight,
  CheckCircle2,
  XCircle
} from '@lucide/vue'

const store = useResearchStore()
const selectedStage = ref(store.screeningFunnel.length - 1)
const resultMode = ref<'retained' | 'excluded'>('retained')
const activeStep = computed(() => store.screeningFunnel[selectedStage.value])
const retainedCompanies = computed(() => store.companyUniverse.filter(company => activeStep.value?.retainedSymbols.includes(company.symbol)))
const excludedCompanies = computed(() => {
  if (selectedStage.value === 0) return []
  const previousSymbols = store.screeningFunnel[selectedStage.value - 1]?.retainedSymbols || []
  return store.companyUniverse.filter(company => previousSymbols.includes(company.symbol) && !activeStep.value?.retainedSymbols.includes(company.symbol))
})
const visibleCompanies = computed(() => resultMode.value === 'retained' ? retainedCompanies.value : excludedCompanies.value)
const initialCount = computed(() => store.screeningFunnel[0]?.count || 0)

watch(() => store.report.sessionId, () => {
  selectedStage.value = Math.max(0, store.screeningFunnel.length - 1)
  resultMode.value = 'retained'
})
</script>

<template>
  <div class="page-shell space-y-7">
    <section v-if="store.status !== 'COMPLETED'" data-testid="results-pending" class="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center text-center">
      <span class="section-kicker">{{ store.status === 'FAILED' ? 'Hasil belum lengkap' : 'Riset sedang berjalan' }}</span>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">{{ store.status === 'FAILED' ? 'Tahap seleksi tidak selesai' : 'Kandidat sedang diseleksi' }}</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">{{ store.status === 'FAILED' ? 'Kembali ke ringkasan sesi untuk melihat status dan hasil yang sempat tersimpan.' : 'Voyager One sedang mengevaluasi ruang lingkup dan kriteria. Hasil tahap seleksi akan muncul setelah riset selesai.' }}</p>
      <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke progress riset</router-link>
    </section>
    <template v-else>
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
        <button type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold sm:flex-none" :class="resultMode === 'retained' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="resultMode === 'retained'" @click="resultMode = 'retained'">Lolos · {{ retainedCompanies.length }} contoh</button>
        <button type="button" class="min-h-11 flex-1 rounded-lg px-4 text-xs font-bold sm:flex-none" :class="resultMode === 'excluded' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'" :aria-pressed="resultMode === 'excluded'" @click="resultMode = 'excluded'">Tidak lolos · {{ excludedCompanies.length }} contoh</button>
      </div>
        <p class="mt-3 text-xs text-slate-500">Hasil ini berasal dari {{ initialCount }} perusahaan fixture pada dataset prototype. Produksi nanti menggunakan membership tahap yang dikirim screening engine.</p>
    </section>

    <!-- Shortlisted Companies Preview Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
           <h3 class="text-lg font-bold text-slate-900">{{ resultMode === 'retained' ? 'Perusahaan yang lolos tahap ini' : 'Perusahaan yang tidak lolos tahap ini' }}</h3>
           <p class="text-xs text-slate-500 mt-0.5">{{ resultMode === 'retained' ? 'Perusahaan yang tetap berada dalam proses' : 'Perusahaan yang gugur tepat pada tahap ini' }}</p>
        </div>
        <div class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
           Data sesi {{ store.report.sessionId }}
        </div>
      </div>

      <div v-if="visibleCompanies.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h3 class="text-base font-bold text-slate-900">Tidak ada sampel pada kategori ini</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">Data prototype tidak memiliki contoh perusahaan untuk kombinasi tahap dan status yang dipilih. Pilih tahap lain atau kembali ke perusahaan yang lolos.</p>
        <button type="button" class="button-secondary mt-5" @click="resultMode = 'retained'">Lihat perusahaan yang lolos</button>
      </div>

      <div v-else class="grid gap-3 md:hidden">
        <article v-for="candidate in visibleCompanies" :key="candidate.symbol" class="rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between gap-3">
            <div><button :data-testid="`candidate-${candidate.symbol}`" class="min-h-11 font-mono text-base font-bold text-[#2F64A8]" @click="store.openCandidateModal(candidate.symbol)">{{ candidate.symbol }}</button><p class="text-xs text-slate-500">{{ candidate.name }}</p></div>
            <span class="rounded-lg bg-[#407EC9]/10 px-2.5 py-1 font-mono text-sm font-bold text-[#2F64A8]">Skor {{ candidate.qualityScore }}/100</span>
          </div>
          <dl class="mt-4 grid grid-cols-3 gap-2 text-xs"><div><dt class="text-slate-500">ROE</dt><dd class="mt-1 font-mono font-bold">{{ candidate.roePercent }}%</dd></div><div><dt class="text-slate-500">P/E</dt><dd class="mt-1 font-mono font-bold">{{ candidate.peRatio }}x</dd></div><div><dt class="text-slate-500">FCF yield</dt><dd class="mt-1 font-mono font-bold">{{ candidate.freeCashFlowYieldPercent }}%</dd></div></dl>
          <p class="mt-3 text-[11px] leading-5 text-slate-500">Skor 80+ lolos ambang kualitas. Rasio keuangan tetap perlu dibandingkan dalam sektor yang sama.</p>
          <div class="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-xs" :class="resultMode === 'retained' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"><CheckCircle2 v-if="resultMode === 'retained'" class="mt-0.5 h-3.5 w-3.5 shrink-0" /><XCircle v-else class="mt-0.5 h-3.5 w-3.5 shrink-0" />{{ resultMode === 'retained' ? 'Lolos berdasarkan kriteria tahap ini.' : `Tidak memenuhi: ${activeStep.filterCriteria}.` }}</div>
        </article>
      </div>

      <div v-if="visibleCompanies.length > 0" class="hidden overflow-x-auto md:block">
        <p data-testid="screener-metric-guide" class="mb-4 text-xs leading-5 text-slate-500">Kapitalisasi menunjukkan ukuran perusahaan. ROE mengukur laba terhadap modal; P/E harga terhadap laba; Debt/Equity utang terhadap modal; FCF yield kas bebas relatif terhadap nilai perusahaan. Skor 80/100 adalah ambang kualitas, bukan rekomendasi membeli.</p>
        <table class="w-full text-left text-xs">
          <caption class="sr-only">Kandidat yang lolos seluruh tahap penyaringan</caption>
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-mono font-semibold">
               <th scope="col" class="pb-3 pr-4">Peringkat</th>
               <th scope="col" class="pb-3 pr-4">Ticker</th>
               <th scope="col" class="pb-3 pr-4">Sektor</th>
               <th scope="col" class="pb-3 pr-4 text-right">Kapitalisasi</th>
               <th scope="col" class="pb-3 pr-4 text-right">ROE</th>
               <th scope="col" class="pb-3 pr-4 text-right">P/E</th>
               <th scope="col" class="pb-3 pr-4 text-right">Debt/Equity</th>
               <th scope="col" class="pb-3 pr-4 text-right">FCF yield</th>
               <th scope="col" class="pb-3 text-right">Skor kualitas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
               v-for="candidate in visibleCompanies"
              :key="candidate.symbol"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-3.5 pr-4 font-bold text-slate-900">#{{ candidate.rank }}</td>
               <th scope="row" class="py-3.5 pr-4 font-bold text-[#2F64A8]">
                 <button
                   :data-testid="`candidate-${candidate.symbol}`"
                   @click="store.openCandidateModal(candidate.symbol)"
                  class="hover:underline cursor-pointer"
                >
                  {{ candidate.symbol }}
                </button>
               </th>
              <td class="py-3.5 pr-4 font-sans text-slate-700">{{ candidate.sector }}</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">IDR {{ candidate.marketCapTrillionIdr }}T</td>
              <td class="py-3.5 pr-4 text-right font-bold text-slate-900">{{ candidate.roePercent }}%</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">{{ candidate.peRatio }}x</td>
              <td class="py-3.5 pr-4 text-right text-slate-800">{{ candidate.debtToEquity }}x</td>
              <td class="py-3.5 pr-4 text-right font-bold text-slate-900">{{ candidate.freeCashFlowYieldPercent }}%</td>
              <td class="py-3.5 text-right font-bold text-[#2F64A8]">
                <span class="px-2 py-1 rounded bg-[#407EC9]/10 border border-[#407EC9]/20">
                  {{ candidate.qualityScore }}/100
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section data-testid="screener-next" class="grid gap-5 rounded-2xl bg-[#102138] p-6 text-white shadow-xl sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div><p class="text-xs font-bold uppercase tracking-wider text-blue-200">Langkah berikutnya</p><h2 class="mt-2 text-xl font-bold">{{ store.candidates.length >= 2 ? `${store.candidates.length} kandidat siap dibandingkan` : store.candidates.length === 1 ? 'Satu kandidat siap ditinjau' : 'Sesuaikan kriteria untuk mencari kandidat lain' }}</h2><p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{{ store.candidates.length >= 2 ? 'Bandingkan kualitas, valuasi, dan pertumbuhan seluruh kandidat yang lolos tahap akhir.' : store.candidates.length === 1 ? 'Buka analisis lengkap untuk memahami kekuatan, risiko, dan bukti pendukungnya.' : 'Gunakan tujuan riset ini sebagai titik awal, lalu longgarkan atau ubah kriteria seleksi.' }}</p></div>
      <div class="flex flex-wrap gap-2">
        <router-link v-if="store.candidates.length >= 2" data-testid="screener-primary-next" :to="`/research/${store.report.sessionId}/peers`" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Bandingkan kandidat <ArrowRight class="h-4 w-4" /></router-link>
        <router-link v-else-if="store.candidates.length === 1" data-testid="screener-primary-next" :to="`/research/${store.report.sessionId}/company/${store.candidates[0].symbol}`" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Buka analisis <ArrowRight class="h-4 w-4" /></router-link>
        <router-link v-else data-testid="screener-primary-next" to="/research/new" class="button-primary bg-white text-[#1E4270] hover:bg-blue-50">Ubah kriteria <ArrowRight class="h-4 w-4" /></router-link>
        <router-link :to="`/research/${store.report.sessionId}/report`" class="inline-flex min-h-11 items-center px-3 text-sm font-bold text-white">Buka laporan</router-link>
      </div>
    </section>
    </template>
  </div>
</template>
