<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CandidateCompany } from '../types'
import DataProvenance from './DataProvenance.vue'
const props = defineProps<{ candidates: CandidateCompany[]; generatedAt: string }>()
defineEmits<{ 'open-candidate': [symbol: string] }>()
type MetricKey = 'roePercent' | 'debtToEquity' | 'peRatio' | 'freeCashFlowYieldPercent' | 'pbvRatio' | 'capitalToRwaPercent' | 'qualityScore'
const metric = ref<MetricKey>('roePercent')
const bank = computed(() => props.candidates.some(candidate => candidate.formulaVersion === 'bank-health-3f-v1'))
const metrics = computed<Record<MetricKey, string>>(() => bank.value
  ? { roePercent: 'ROE (%)', capitalToRwaPercent: 'Capital-to-RWA proxy (%)', pbvRatio: 'P/BV (x)', qualityScore: 'Skor heuristik bank (/100)' } as Record<MetricKey, string>
  : { roePercent: 'ROE (%)', debtToEquity: 'Debt/Equity (x)', peRatio: 'P/E (x)', freeCashFlowYieldPercent: 'FCF yield (%)', qualityScore: 'Skor tiga faktor (/100)' } as Record<MetricKey, string>)
const value = (candidate: CandidateCompany) => metric.value === 'capitalToRwaPercent' ? candidate.bankMetrics?.capitalToRwaPercent : candidate[metric.value as keyof CandidateCompany]
const direction = ref<'asc' | 'desc'>('desc')
const sorted = computed(() => [...props.candidates].sort((a, b) => {
  const av = value(a) as number | undefined, bv = value(b) as number | undefined
  if (!Number.isFinite(av)) return Number.isFinite(bv) ? 1 : a.symbol.localeCompare(b.symbol)
  if (!Number.isFinite(bv)) return -1
  return (av! - bv!) * (direction.value === 'asc' ? 1 : -1) || a.symbol.localeCompare(b.symbol)
}))
const display = (value: number) => Number.isFinite(value) ? value.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : 'Tidak tersedia'
</script>
<template>
  <section class="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 class="text-xl font-bold">Metrik kandidat sesi</h2>
    <p data-testid="relative-warning" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Benchmark peer sektor belum didukung. Tabel ini hanya menampilkan kandidat hasil screening, bukan cohort representatif. Perbedaan sektor dan FY membatasi keterbandingan; nilai tertinggi bukan berarti perusahaan terbaik.</p>
    <DataProvenance :generated-at="generatedAt" />
    <p data-testid="metric-explanation" class="text-sm leading-6 text-slate-600">{{ bank ? 'Skor bank hanya memakai ROE, capital-to-RWA proxy, dan P/BV. Proxy bukan CAR regulator resmi.' : 'Skor hanya memakai ROE, D/E, dan P/E. FCF yield menggunakan FCF FY dan kapitalisasi snapshot, bukan faktor skor.' }} Skor bukan confidence atau peluang untung.</p>
    <p v-if="candidates.length < 2" data-testid="peers-empty" class="rounded-xl bg-slate-50 p-4 text-sm">Kandidat belum cukup untuk dibandingkan. Diperlukan sedikitnya dua kandidat.</p>
    <template v-else><div class="grid gap-4 sm:grid-cols-2"><label class="text-sm font-semibold">Metrik<select v-model="metric" data-testid="metric-view" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3"><option v-for="(label, key) in metrics" :key="key" :value="key">{{ label }}</option></select></label><label class="text-sm font-semibold">Urutan<select v-model="direction" data-testid="sort-direction" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3"><option value="desc">Tertinggi ke terendah</option><option value="asc">Terendah ke tertinggi</option></select></label></div><div class="overflow-x-auto"><table class="w-full text-left text-sm"><caption class="sr-only">Perbandingan nilai absolut kandidat sesi, bukan benchmark sektor</caption><thead><tr class="border-b border-slate-200"><th scope="col" class="p-3">Kandidat / periode</th><th scope="col" class="p-3 text-right">{{ metrics[metric] }}</th></tr></thead><tbody><tr v-for="candidate in sorted" :key="candidate.symbol" :data-testid="`comparison-row-${candidate.symbol}`" class="border-b border-slate-100"><th scope="row" class="p-3 font-normal"><button type="button" class="min-h-11 font-bold text-[#2F64A8] underline" @click="$emit('open-candidate', candidate.symbol)">{{ candidate.symbol }}</button><p class="text-xs leading-5 text-slate-600">{{ candidate.sector }} · {{ candidate.financialPeriod || 'FY tidak tersedia' }}<br />Harga per: {{ candidate.priceAsOf || 'Tidak tersedia' }}</p></th><td class="p-3 text-right font-mono tabular-nums">{{ display(value(candidate) as number) }}</td></tr></tbody></table></div></template>
  </section>
</template>
