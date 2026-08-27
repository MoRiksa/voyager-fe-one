<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { 
  ArrowRight
} from '@lucide/vue'

const store = useResearchStore()
const leftTicker = ref(store.candidates[0]?.symbol || '')
const rightTicker = ref(store.candidates[1]?.symbol || '')
const metricGroup = ref<'quality' | 'valuation' | 'growth'>('quality')
const comparisonCandidates = computed(() => store.candidates)
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
const metricExplanation = computed(() => metricGroup.value === 'valuation'
  ? 'P/E, P/BV, dan EV/EBITDA menunjukkan harga relatif terhadap laba, ekuitas, atau laba operasional. Nilai lebih rendah dapat berarti lebih murah, tetapi juga dapat mencerminkan risiko. FCF yield menunjukkan kas bebas relatif terhadap nilai perusahaan.'
  : metricGroup.value === 'growth'
    ? 'CAGR adalah rata-rata pertumbuhan per tahun selama tiga tahun, bukan pertumbuhan setiap tahun. ROE mengukur laba terhadap modal, sedangkan ROA mengukur laba terhadap seluruh aset.'
    : 'Skor kualitas merangkum lima faktor dan 80+ adalah ambang shortlist. ROE tinggi dapat berasal dari laba atau leverage. Debt/Equity yang lebih rendah umumnya berarti beban utang lebih kecil di luar sektor perbankan.')
watch(() => store.candidates.map(candidate => candidate.symbol).join(','), () => {
  leftTicker.value = store.candidates[0]?.symbol || ''
  rightTicker.value = store.candidates[1]?.symbol || ''
})
const groupColumns = computed(() => metricGroup.value === 'valuation'
  ? [{ key: 'peRatio', label: 'P/E', suffix: 'x' }, { key: 'pbvRatio', label: 'P/BV', suffix: 'x' }, { key: 'evToEbitda', label: 'EV/EBITDA', suffix: 'x' }, { key: 'freeCashFlowYieldPercent', label: 'FCF yield', suffix: '%' }]
  : metricGroup.value === 'growth'
    ? [{ key: 'revenue3yCagrPercent', label: 'Revenue CAGR', suffix: '%' }, { key: 'netIncome3yCagrPercent', label: 'Net income CAGR', suffix: '%' }, { key: 'roePercent', label: 'ROE', suffix: '%' }, { key: 'roaPercent', label: 'ROA', suffix: '%' }]
    : [{ key: 'qualityScore', label: 'Skor kualitas', suffix: '' }, { key: 'roePercent', label: 'ROE', suffix: '%' }, { key: 'debtToEquity', label: 'Debt/Equity', suffix: 'x' }, { key: 'freeCashFlowYieldPercent', label: 'FCF yield', suffix: '%' }])
</script>

<template>
  <div class="page-shell space-y-7">
    <section v-if="store.status !== 'COMPLETED'" data-testid="results-pending" class="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center text-center">
      <span class="section-kicker">{{ store.status === 'FAILED' ? 'Hasil belum lengkap' : 'Riset sedang berjalan' }}</span>
      <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">{{ store.status === 'FAILED' ? 'Perbandingan belum tersedia' : 'Menunggu kandidat akhir' }}</h1>
      <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">Perbandingan tersedia setelah proses seleksi menghasilkan kandidat akhir. Kembali ke sesi untuk mengikuti progress riset.</p>
      <router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-6">Kembali ke progress riset</router-link>
    </section>
    <template v-else>
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
         Seluruh kandidat akhir dari sesi screening dibandingkan otomatis. Ubah tampilan metrik untuk meninjau kualitas, valuasi, atau pertumbuhan.
      </p>
    </div>

    <!-- Comparative Table -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden">
      <div class="mb-6 grid gap-5 border-b border-slate-100 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><h2 class="text-sm font-bold text-slate-900">Hasil seleksi akhir</h2><p class="mt-2 text-xs leading-5 text-slate-500">{{ comparisonCandidates.length }} kandidat dari tahap terakhir Screener. Daftar ini mengikuti hasil sesi dan tidak difilter ulang pada halaman perbandingan.</p></div>
        <label class="text-xs font-bold text-slate-700">Tampilan metrik<select v-model="metricGroup" data-testid="metric-view" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm lg:w-48"><option value="quality">Kualitas</option><option value="valuation">Valuasi</option><option value="growth">Pertumbuhan</option></select></label>
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
          <div v-for="metric in groupColumns" :key="metric.key" class="grid grid-cols-3 gap-2 p-3 text-center text-xs"><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === leftTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span><span class="text-slate-500">{{ metric.label }}</span><span class="font-mono font-bold text-slate-900">{{ store.candidates.find(c => c.symbol === rightTicker)?.[metric.key as keyof typeof store.candidates[number]] }}{{ metric.suffix }}</span></div>
        </div>
      </div>

      <div v-if="comparisonCandidates.length >= 2" class="hidden overflow-x-auto md:block">
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
              v-for="candidate in comparisonCandidates"
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

              <td v-for="column in groupColumns" :key="column.key" class="py-4 pr-4 text-right font-mono font-bold text-slate-800">{{ candidate[column.key as keyof typeof candidate] }}{{ column.suffix }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparative Synthesis Cards -->
    <div v-if="comparisonCandidates.length >= 2" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="highlight in comparisonHighlights" :key="highlight.label" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-[#407EC9] font-mono mb-2">{{ highlight.label }}</h4>
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
