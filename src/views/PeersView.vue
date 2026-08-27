<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import DataProvenance from '../components/DataProvenance.vue'
import type { CandidateCompany } from '../types'
import { 
  ArrowRight
} from '@lucide/vue'

const store = useResearchStore()
const leftTicker = ref(store.candidates[0]?.symbol || '')
const rightTicker = ref(store.candidates[1]?.symbol || '')
type MetricGroup = 'quality' | 'profitability' | 'valuation' | 'growth' | 'balance-sheet' | 'cash-flow'
type MetricColumn = {
  key: string
  label: string
  suffix: string
  better: 'higher' | 'lower'
  value: (candidate: CandidateCompany) => number
}

const metricGroups: Record<MetricGroup, { label: string; explanation: string; columns: MetricColumn[] }> = {
  quality: {
    label: 'Kualitas',
    explanation: 'Skor kualitas merangkum faktor profitabilitas, pertumbuhan, solvabilitas, valuasi, dan konsistensi. Skor 80+ adalah ambang shortlist model.',
    columns: [
      { key: 'qualityScore', label: 'Skor kualitas', suffix: '', better: 'higher', value: candidate => candidate.qualityScore },
      { key: 'consistencyScore', label: 'Konsistensi', suffix: '', better: 'higher', value: candidate => candidate.scoreBreakdown.consistency }
    ]
  },
  profitability: {
    label: 'Profitabilitas',
    explanation: 'ROE mengukur laba terhadap modal, ROA terhadap aset, dan margin laba bersih terhadap pendapatan. ROE tinggi juga dapat dipengaruhi leverage.',
    columns: [
      { key: 'roePercent', label: 'ROE', suffix: '%', better: 'higher', value: candidate => candidate.roePercent },
      { key: 'roaPercent', label: 'ROA', suffix: '%', better: 'higher', value: candidate => candidate.roaPercent },
      { key: 'netProfitMargin', label: 'Margin laba bersih', suffix: '%', better: 'higher', value: candidate => candidate.dupontAnalysis.netProfitMargin }
    ]
  },
  valuation: {
    label: 'Valuasi',
    explanation: 'P/E, P/BV, dan EV/EBITDA menunjukkan harga relatif terhadap laba, ekuitas, atau laba operasional. Nilai lebih rendah dapat berarti lebih murah, tetapi juga dapat mencerminkan risiko.',
    columns: [
      { key: 'peRatio', label: 'P/E', suffix: 'x', better: 'lower', value: candidate => candidate.peRatio },
      { key: 'pbvRatio', label: 'P/BV', suffix: 'x', better: 'lower', value: candidate => candidate.pbvRatio },
      { key: 'evToEbitda', label: 'EV/EBITDA', suffix: 'x', better: 'lower', value: candidate => candidate.evToEbitda }
    ]
  },
  growth: {
    label: 'Pertumbuhan',
    explanation: 'CAGR adalah rata-rata pertumbuhan per tahun selama tiga tahun, bukan pertumbuhan setiap tahun.',
    columns: [
      { key: 'revenue3yCagrPercent', label: 'CAGR pendapatan', suffix: '%', better: 'higher', value: candidate => candidate.revenue3yCagrPercent },
      { key: 'netIncome3yCagrPercent', label: 'CAGR laba bersih', suffix: '%', better: 'higher', value: candidate => candidate.netIncome3yCagrPercent }
    ]
  },
  'balance-sheet': {
    label: 'Neraca',
    explanation: 'Debt/Equity dan equity multiplier yang lebih rendah umumnya menunjukkan leverage lebih kecil, sedangkan current ratio yang lebih tinggi menunjukkan likuiditas lebih besar. Interpretasi berbeda untuk sektor keuangan.',
    columns: [
      { key: 'debtToEquity', label: 'Debt/Equity', suffix: 'x', better: 'lower', value: candidate => candidate.debtToEquity },
      { key: 'currentRatio', label: 'Current ratio', suffix: 'x', better: 'higher', value: candidate => candidate.currentRatio },
      { key: 'equityMultiplier', label: 'Pengali ekuitas', suffix: 'x', better: 'lower', value: candidate => candidate.dupontAnalysis.equityMultiplier }
    ]
  },
  'cash-flow': {
    label: 'Arus kas',
    explanation: 'FCF yield menunjukkan kas bebas relatif terhadap nilai perusahaan. Dividend yield menunjukkan distribusi kas kepada pemegang saham.',
    columns: [
      { key: 'freeCashFlowYieldPercent', label: 'FCF yield', suffix: '%', better: 'higher', value: candidate => candidate.freeCashFlowYieldPercent },
      { key: 'dividendYieldPercent', label: 'Dividend yield', suffix: '%', better: 'higher', value: candidate => candidate.dividendYieldPercent }
    ]
  }
}

const metricGroup = ref<MetricGroup>('quality')
const selectedSymbols = ref(store.candidates.slice(0, 5).map(candidate => candidate.symbol))
const sortMetric = ref('qualityScore')
const sortDirection = ref<'asc' | 'desc'>('desc')
const comparisonMode = ref<'absolute' | 'relative'>('absolute')
const comparisonCandidates = computed(() => store.candidates)
const groupColumns = computed(() => metricGroups[metricGroup.value].columns)
const selectedCandidates = computed(() => comparisonCandidates.value.filter(candidate => selectedSymbols.value.includes(candidate.symbol)))
const sameSector = computed(() => new Set(selectedCandidates.value.map(candidate => candidate.sector)).size <= 1)
const activeSortColumn = computed(() => groupColumns.value.find(column => column.key === sortMetric.value) || groupColumns.value[0])
const median = (values: number[]) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
const metricMedian = (column: MetricColumn) => median(selectedCandidates.value.map(column.value))
const sortedCandidates = computed(() => [...selectedCandidates.value].sort((a, b) => {
  const column = activeSortColumn.value
  const aValue = column.value(a)
  const bValue = column.value(b)
  if (!Number.isFinite(aValue)) return 1
  if (!Number.isFinite(bValue)) return -1
  return (aValue - bValue) * (sortDirection.value === 'asc' ? 1 : -1) || a.rank - b.rank
}))
const formatNumber = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
const displayValue = (candidate: CandidateCompany, column: MetricColumn) => {
  const value = column.value(candidate)
  if (!Number.isFinite(value)) return 'Tidak tersedia'
  if (comparisonMode.value === 'relative' && sameSector.value) {
    const benchmark = metricMedian(column)
    if (benchmark === null) return 'Tidak tersedia'
    const delta = value - benchmark
    return `${delta > 0 ? '+' : ''}${formatNumber(delta)}${column.suffix || ' poin'}`
  }
  return `${formatNumber(value)}${column.suffix}`
}
const mobileValue = (symbol: string, column: MetricColumn) => {
  const candidate = comparisonCandidates.value.find(item => item.symbol === symbol)
  if (!candidate || !Number.isFinite(column.value(candidate))) return 'Tidak tersedia'
  return `${formatNumber(column.value(candidate))}${column.suffix}`
}
const benchmarkValue = (column: MetricColumn) => {
  const value = metricMedian(column)
  if (value === null) return 'Tidak tersedia'
  return comparisonMode.value === 'relative' && sameSector.value ? `0${column.suffix || ' poin'}` : `${formatNumber(value)}${column.suffix}`
}
const indicator = (candidate: CandidateCompany, column: MetricColumn) => {
  const available = selectedCandidates.value.filter(item => Number.isFinite(column.value(item)))
  if (available.length < 2 || !Number.isFinite(column.value(candidate))) return ''
  const values = available.map(column.value)
  const best = column.better === 'higher' ? Math.max(...values) : Math.min(...values)
  const worst = column.better === 'higher' ? Math.min(...values) : Math.max(...values)
  if (best === worst) return ''
  if (column.value(candidate) === best) return 'Terbaik'
  if (column.value(candidate) === worst) return 'Terburuk'
  return ''
}
const toggleCandidate = (symbol: string) => {
  if (selectedSymbols.value.includes(symbol)) {
    if (selectedSymbols.value.length > 2) selectedSymbols.value = selectedSymbols.value.filter(item => item !== symbol)
    return
  }
  if (selectedSymbols.value.length < 5) selectedSymbols.value = [...selectedSymbols.value, symbol]
}
const leftOptions = computed(() => comparisonCandidates.value.filter(candidate => candidate.symbol !== rightTicker.value))
const rightOptions = computed(() => comparisonCandidates.value.filter(candidate => candidate.symbol !== leftTicker.value))
const comparisonHighlights = computed(() => {
  if (!comparisonCandidates.value.length) return []
  const highest = (key: 'roePercent' | 'freeCashFlowYieldPercent' | 'qualityScore') => [...comparisonCandidates.value].sort((a, b) => b[key] - a[key])[0]
  return [
    { label: 'Pengembalian modal tertinggi', company: highest('roePercent'), metric: `${highest('roePercent').roePercent}% ROE` },
    { label: 'Arus kas bebas tertinggi', company: highest('freeCashFlowYieldPercent'), metric: `${highest('freeCashFlowYieldPercent').freeCashFlowYieldPercent}% FCF yield` },
    { label: 'Skor kualitas tertinggi', company: highest('qualityScore'), metric: `skor ${highest('qualityScore').qualityScore}/100` }
  ]
})
const metricExplanation = computed(() => metricGroups[metricGroup.value].explanation)
const provenanceSources = computed(() => [...new Set(selectedCandidates.value.flatMap(candidate => candidate.evidenceCitations.map(citation => citation.source)).filter(Boolean))])
watch(() => store.candidates.map(candidate => candidate.symbol).join(','), () => {
  leftTicker.value = store.candidates[0]?.symbol || ''
  rightTicker.value = store.candidates[1]?.symbol || ''
  selectedSymbols.value = store.candidates.slice(0, 5).map(candidate => candidate.symbol)
})
watch(metricGroup, () => {
  sortMetric.value = groupColumns.value[0].key
  sortDirection.value = groupColumns.value[0].better === 'higher' ? 'desc' : 'asc'
})
watch(sameSector, value => {
  if (!value) comparisonMode.value = 'absolute'
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
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden">
      <div class="mb-6 grid gap-5 border-b border-slate-100 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
         <div><h2 class="text-sm font-bold text-slate-900">Hasil seleksi akhir</h2><p class="mt-2 text-xs leading-5 text-slate-500">{{ comparisonCandidates.length }} kandidat dari tahap terakhir Screener. Daftar ini mengikuti hasil sesi dan tidak difilter ulang pada halaman perbandingan.</p></div>
        <label class="text-xs font-bold text-slate-700">Tampilan metrik<select v-model="metricGroup" data-testid="metric-view" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm lg:w-48"><option v-for="(group, key) in metricGroups" :key="key" :value="key">{{ group.label }}</option></select></label>
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
      <p data-testid="metric-explanation" class="mb-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{{ metricExplanation }} Perbandingan ini hanya mencakup kandidat akhir sesi.</p>

      <div v-if="comparisonCandidates.length < 2" data-testid="peers-empty" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h3 class="text-base font-bold text-slate-900">Kandidat belum cukup untuk dibandingkan</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">Sesi screening hanya menghasilkan {{ comparisonCandidates.length }} kandidat. Perbandingan membutuhkan sedikitnya dua perusahaan.</p>
      </div>

      <div v-else class="md:hidden">
        <p class="mb-3 text-xs text-slate-500">Pilih dua dari kandidat hasil screening untuk tampilan mobile.</p>
        <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><label class="text-xs font-bold text-slate-700">Kandidat A<select v-model="leftTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in leftOptions" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label><span class="pb-3 text-xs text-slate-500">vs</span><label class="text-xs font-bold text-slate-700">Kandidat B<select v-model="rightTicker" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm"><option v-for="candidate in rightOptions" :key="candidate.symbol" :value="candidate.symbol">{{ candidate.symbol }}</option></select></label></div>
        <div class="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <div v-for="metric in groupColumns" :key="metric.key" class="grid grid-cols-3 gap-2 p-3 text-center text-xs"><span class="font-mono font-bold text-slate-900">{{ mobileValue(leftTicker, metric) }}</span><span class="text-slate-500">{{ metric.label }}</span><span class="font-mono font-bold text-slate-900">{{ mobileValue(rightTicker, metric) }}</span></div>
        </div>
      </div>

      <div v-if="comparisonCandidates.length >= 2" class="hidden md:block">
        <fieldset class="mb-5 rounded-xl border border-slate-200 p-4">
          <legend class="px-1 text-xs font-bold text-slate-700">Kandidat desktop (2–5)</legend>
          <div class="flex flex-wrap gap-2">
            <label v-for="candidate in comparisonCandidates" :key="candidate.symbol" class="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-mono font-bold text-slate-700 has-[:checked]:border-[#407EC9] has-[:checked]:bg-[#407EC9]/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
              <input type="checkbox" :checked="selectedSymbols.includes(candidate.symbol)" :disabled="(!selectedSymbols.includes(candidate.symbol) && selectedSymbols.length >= 5) || (selectedSymbols.includes(candidate.symbol) && selectedSymbols.length <= 2)" :data-testid="`candidate-select-${candidate.symbol}`" class="h-4 w-4 accent-[#2F64A8]" @change="toggleCandidate(candidate.symbol)">
              {{ candidate.symbol }}
            </label>
          </div>
          <p class="mt-2 text-xs text-slate-500">{{ selectedSymbols.length }} kandidat dipilih. Minimal dua dan maksimal lima.</p>
        </fieldset>

        <div class="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label class="text-xs font-bold text-slate-700">Urutkan metrik<select v-model="sortMetric" data-testid="sort-metric" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option v-for="column in groupColumns" :key="column.key" :value="column.key">{{ column.label }}</option></select></label>
          <label class="text-xs font-bold text-slate-700">Arah<select v-model="sortDirection" data-testid="sort-direction" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="desc">Tertinggi ke terendah</option><option value="asc">Terendah ke tertinggi</option></select></label>
          <fieldset>
            <legend class="mb-2 text-xs font-bold text-slate-700">Basis nilai</legend>
            <div class="flex rounded-xl border border-slate-300 bg-white p-1">
              <label class="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold" :class="comparisonMode === 'absolute' ? 'bg-slate-900 text-white' : 'text-slate-600'"><input v-model="comparisonMode" class="sr-only" type="radio" value="absolute">Absolut</label>
              <label class="rounded-lg px-3 py-2 text-xs font-semibold" :class="sameSector ? 'cursor-pointer' : 'cursor-not-allowed text-slate-400'" :title="sameSector ? 'Bandingkan terhadap median sektor kandidat terpilih' : 'Pilih kandidat dari sektor yang sama'"><input v-model="comparisonMode" class="sr-only" type="radio" value="relative" :disabled="!sameSector">Relatif sektor</label>
            </div>
          </fieldset>
        </div>
        <p v-if="!sameSector" data-testid="relative-warning" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Mode relatif sektor dinonaktifkan karena kandidat terpilih berasal dari sektor berbeda. Pilih kandidat dalam sektor yang sama untuk membandingkan selisih terhadap median.</p>

        <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <caption class="sr-only">Perbandingan metrik kandidat terpilih</caption>
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-mono font-semibold">
               <th scope="col" class="pb-3 pr-4">Kandidat</th>
              <th v-for="column in groupColumns" :key="column.key" scope="col" class="pb-3 pr-4 text-right">{{ column.label }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono">
            <tr 
              v-for="candidate in sortedCandidates"
              :key="candidate.symbol"
              :data-testid="`comparison-row-${candidate.symbol}`"
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
                      class="font-bold text-[#2F64A8] hover:underline cursor-pointer text-sm"
                    >
                      {{ candidate.symbol }}
                    </button>
                    <div class="text-[11px] text-slate-500 font-sans truncate max-w-[150px]">{{ candidate.name }}</div>
                  </div>
                </div>
              </td>

              <td v-for="column in groupColumns" :key="column.key" class="py-4 pr-4 text-right font-mono font-bold text-slate-800">
                <span :class="displayValue(candidate, column) === 'Tidak tersedia' ? 'text-slate-400' : ''">{{ displayValue(candidate, column) }}</span>
                <span v-if="indicator(candidate, column)" class="ml-1 rounded px-1.5 py-0.5 font-sans text-[9px] uppercase" :class="indicator(candidate, column) === 'Terbaik' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">{{ indicator(candidate, column) }}</span>
              </td>
            </tr>
            <tr data-testid="comparison-median" class="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-700">
              <th scope="row" class="py-3 pr-4 font-sans">Median kandidat terpilih</th>
              <td v-for="column in groupColumns" :key="column.key" class="py-3 pr-4 text-right">{{ benchmarkValue(column) }}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div data-testid="data-provenance" class="mt-5 space-y-2">
          <DataProvenance :source="provenanceSources.length ? provenanceSources.join(', ') : undefined" :generated-at="store.report.timestamp" compact />
          <p class="text-xs leading-5 text-slate-500">Nilai relatif dihitung pada halaman ini terhadap median kandidat terpilih dalam sektor yang sama.</p>
        </div>
      </div>
    </div>

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
