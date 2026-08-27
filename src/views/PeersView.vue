<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  ArrowRight
} from '@lucide/vue'

const store = useResearchStore()
const leftTicker = ref(store.candidates[0]?.symbol || '')
const rightTicker = ref(store.candidates[1]?.symbol || '')
const selectedTickers = ref(store.candidates.slice(0, 3).map(candidate => candidate.symbol))
const metricGroup = ref<'quality' | 'valuation' | 'growth'>('quality')
const selectedCandidates = computed(() => store.candidates.filter(candidate => selectedTickers.value.includes(candidate.symbol)))
const comparisonHighlights = computed(() => {
  if (!selectedCandidates.value.length) return []
  const highest = (key: 'roePercent' | 'freeCashFlowYieldPercent' | 'qualityScore') => [...selectedCandidates.value].sort((a, b) => b[key] - a[key])[0]
  return [
    { label: 'Pengembalian modal tertinggi', company: highest('roePercent'), metric: `${highest('roePercent').roePercent}% ROE` },
    { label: 'Arus kas bebas tertinggi', company: highest('freeCashFlowYieldPercent'), metric: `${highest('freeCashFlowYieldPercent').freeCashFlowYieldPercent}% FCF yield` },
    { label: 'Skor kualitas tertinggi', company: highest('qualityScore'), metric: `skor ${highest('qualityScore').qualityScore}/100` }
  ]
})
watch(() => store.report.sessionId, () => {
  selectedTickers.value = store.candidates.slice(0, 3).map(candidate => candidate.symbol)
  leftTicker.value = store.candidates[0]?.symbol || ''
  rightTicker.value = store.candidates[1]?.symbol || ''
})
const toggleCandidate = (symbol: string) => {
  if (selectedTickers.value.includes(symbol)) {
    selectedTickers.value = selectedTickers.value.filter(item => item !== symbol)
  } else if (selectedTickers.value.length < 5) {
    selectedTickers.value = [...selectedTickers.value, symbol]
  } else {
    store.notify('Maksimal lima kandidat dapat dibandingkan sekaligus.', 'info')
  }
}
const groupColumns = computed(() => metricGroup.value === 'valuation'
  ? [{ key: 'peRatio', label: 'P/E', suffix: 'x' }, { key: 'pbvRatio', label: 'P/BV', suffix: 'x' }, { key: 'evToEbitda', label: 'EV/EBITDA', suffix: 'x' }, { key: 'freeCashFlowYieldPercent', label: 'FCF yield', suffix: '%' }]
  : metricGroup.value === 'growth'
    ? [{ key: 'revenue3yCagrPercent', label: 'Revenue CAGR', suffix: '%' }, { key: 'netIncome3yCagrPercent', label: 'Net income CAGR', suffix: '%' }, { key: 'roePercent', label: 'ROE', suffix: '%' }, { key: 'roaPercent', label: 'ROA', suffix: '%' }]
    : [{ key: 'qualityScore', label: 'Skor kualitas', suffix: '' }, { key: 'roePercent', label: 'ROE', suffix: '%' }, { key: 'debtToEquity', label: 'Debt/Equity', suffix: 'x' }, { key: 'freeCashFlowYieldPercent', label: 'FCF yield', suffix: '%' }])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- View Header -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
         <span class="section-kicker">Perbandingan kandidat</span>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
           Peer benchmark
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
         Bandingkan kekuatan dan tradeoff kandidat
      </h1>
      <p class="text-sm text-slate-600 mt-1 max-w-3xl">
         Pilih kandidat dan lihat perbedaan profitabilitas, pertumbuhan, valuasi, serta kesehatan neracanya.
      </p>
    </div>

    <!-- Comparative Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden">
      <div class="mb-6 grid gap-5 border-b border-slate-100 pb-5 lg:grid-cols-[1fr_auto]">
        <fieldset><legend class="text-sm font-bold text-slate-900">Pilih kandidat</legend><div class="mt-3 flex flex-wrap gap-2"><label v-for="candidate in store.candidates" :key="candidate.symbol" class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-xs font-bold" :class="selectedTickers.includes(candidate.symbol) ? 'border-[#407EC9] bg-[#407EC9]/5 text-[#2F64A8]' : 'border-slate-200 text-slate-600'"><input type="checkbox" :data-testid="`peer-${candidate.symbol}`" class="sr-only" :checked="selectedTickers.includes(candidate.symbol)" @change="toggleCandidate(candidate.symbol)" />{{ candidate.symbol }}</label></div><p class="mt-2 text-xs text-slate-500">Pilih 2 sampai 5 perusahaan.</p></fieldset>
        <label class="text-xs font-bold text-slate-700">Kelompok metrik<select v-model="metricGroup" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm lg:w-48"><option value="quality">Kualitas</option><option value="valuation">Valuasi</option><option value="growth">Pertumbuhan</option></select></label>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
           <h3 class="text-lg font-bold text-slate-900">Metrik utama kandidat</h3>
           <p class="text-xs text-slate-500 mt-0.5">Gunakan tabel desktop atau perbandingan dua kandidat di mobile</p>
        </div>
        <div class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
           {{ store.candidates.length }} kandidat
        </div>
      </div>

      <div v-if="selectedCandidates.length < 2" data-testid="peers-empty" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h3 class="text-base font-bold text-slate-900">Pilih sedikitnya dua kandidat</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">Perbandingan membutuhkan minimal dua perusahaan agar perbedaan metrik dapat dibaca dengan bermakna.</p>
      </div>

      <div v-else class="md:hidden">
        <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><label class="text-xs font-bold text-slate-700">Kandidat A<select v-model="leftTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in store.candidates" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label><span class="pb-3 text-xs text-slate-400">vs</span><label class="text-xs font-bold text-slate-700">Kandidat B<select v-model="rightTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in store.candidates" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label></div>
        <div class="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <div v-for="metric in groupColumns" :key="metric.key" class="grid grid-cols-3 gap-2 p-3 text-center text-xs"><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === leftTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span><span class="text-slate-500">{{ metric.label }}</span><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === rightTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span></div>
        </div>
      </div>

      <div v-if="selectedCandidates.length >= 2" class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-xs">
          <caption class="sr-only">Perbandingan metrik kandidat terpilih</caption>
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 uppercase font-mono font-semibold">
               <th scope="col" class="pb-3 pr-4">Kandidat</th>
              <th v-for="column in groupColumns" :key="column.key" scope="col" class="pb-3 pr-4 text-right">{{ column.label }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
              v-for="candidate in selectedCandidates"
              :key="candidate.symbol"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-4 pr-4">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-md bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    #{{ candidate.rank }}
                  </span>
                  <div>
                    <button 
                      @click="store.openCandidateModal(candidate.symbol)"
                      class="font-bold text-[#407EC9] hover:underline cursor-pointer text-sm"
                    >
                      {{ candidate.symbol }}
                    </button>
                    <div class="text-[11px] text-slate-500 font-sans truncate max-w-[150px]">{{ candidate.name }}</div>
                  </div>
                </div>
              </td>

              <td v-for="column in groupColumns" :key="column.key" class="py-4 pr-4 text-right font-mono font-bold text-slate-800">{{ candidate[column.key as keyof typeof candidate] }}{{ column.suffix }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparative Synthesis Cards -->
    <div v-if="selectedCandidates.length >= 2" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="highlight in comparisonHighlights" :key="highlight.label" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono mb-2">{{ highlight.label }}</h4>
        <div class="text-xl font-bold font-mono text-slate-900">{{ highlight.company.symbol }} ({{ highlight.metric }})</div>
        <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ highlight.company.whySelected }}</p>
      </div>
    </div>
  </div>
</template>
