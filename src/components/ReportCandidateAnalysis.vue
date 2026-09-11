<script setup lang="ts">
import { computed } from 'vue'
import type { CandidateCompany } from '../types'
import CandidateCard from './CandidateCard.vue'
const props = defineProps<{ candidates: CandidateCompany[]; selectedTicker: string; sessionId: string }>()
const emit = defineEmits<{ 'update:selectedTicker': [ticker: string] }>()
const activeCandidate = computed(() => props.candidates.find(c => c.symbol === props.selectedTicker) || props.candidates[0])
const bank = computed(() => activeCandidate.value?.formulaVersion === 'bank-screen-2f-v1')
const factors = computed(() => activeCandidate.value ? bank.value ? [
  { label: 'ROE', value: activeCandidate.value.scoreBreakdown?.profitability, weight: '60%' },
  { label: 'P/BV', value: activeCandidate.value.scoreBreakdown?.valuation, weight: '40%' }
] : [
  { label: 'Profitabilitas (ROE)', value: activeCandidate.value.scoreBreakdown?.profitability, weight: '38,46%' },
  { label: 'Solvabilitas (D/E)', value: activeCandidate.value.scoreBreakdown?.solvency, weight: '30,77%' },
  { label: 'Valuasi (P/E)', value: activeCandidate.value.scoreBreakdown?.valuation, weight: '30,77%' }
] : [])
const metric = (value: number | undefined, suffix = '') => Number.isFinite(value) ? `${value!.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${suffix}` : 'Tidak tersedia'
</script>
<template>
  <div v-if="activeCandidate" class="space-y-5">
    <div class="flex flex-wrap gap-2" aria-label="Pilih kandidat"><button v-for="candidate in candidates" :key="candidate.symbol" type="button" :aria-pressed="activeCandidate.symbol === candidate.symbol" class="button-secondary" @click="emit('update:selectedTicker', candidate.symbol)">{{ candidate.symbol }}</button></div>
    <CandidateCard :candidate="activeCandidate" />
    <section class="rounded-2xl border border-slate-200 bg-white p-6"><h3 class="text-lg font-bold">{{ bank ? 'Dua faktor pendukung' : 'Tiga faktor pendukung' }}</h3><p class="mt-2 text-sm leading-6 text-slate-600"><template v-if="bank">bank-screen-2f-v1 memakai bobot 60% ROE dan 40% P/BV. Skor hanya heuristik ranking; bukan penilaian risiko, confidence, atau peluang untung.</template><template v-else>{{ activeCandidate.formulaVersion || 'Versi formula tidak tersedia' }}. Bobot heuristik 25:20:20 dinormalisasi terhadap 65. Belum dikalibrasi empiris, bukan penilaian relatif sektor. Pertumbuhan dan konsistensi belum dinilai.</template></p><dl class="mt-5 grid gap-4 sm:grid-cols-3"><div v-for="factor in factors" :key="factor.label" class="rounded-xl bg-slate-50 p-4"><dt class="text-sm">{{ factor.label }} · {{ factor.weight }}</dt><dd class="mt-2 font-mono font-bold">{{ metric(factor.value) }}<span v-if="Number.isFinite(factor.value)">/100</span></dd></div></dl><details class="mt-4"><summary class="min-h-11 cursor-pointer text-sm font-semibold">Rumus dan asumsi</summary><template v-if="bank"><pre class="overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs leading-6">R = clamp((ROE − 15) / 15 × 100, 0, 100)
V = clamp(pb_peer_avg / P/BV × 100, 0, 100)
Q = round(0.60R + 0.40V)</pre><p class="mt-3 text-sm leading-6 text-slate-600">Jika pb_peer_avg positif tidak tersedia, backend memakai fallback absolut terbatas. FY keuangan dan valuasi harus sama. Benchmark P/BV berasal dari provider dan cohort-nya belum diverifikasi independen.</p></template><template v-else><pre class="overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs leading-6">P = clamp(round(ROE × 4.2), 40, 100)
S = clamp(round((2.5 − min(2.5, D/E)) × 40), 30, 100)
V = clamp(round((35 − min(35, P/E)) × 3.5), 30, 100)
Q = round((0.25P + 0.20S + 0.20V) / 0.65)</pre><p class="mt-3 text-sm leading-6 text-slate-600">Input harus bermakna dan FY keuangan/valuasi sama. FCF bukan faktor skor. FCF negatif dapat menghasilkan Q=100; ini bukan bukti arus kas sehat.</p></template></details></section>
    <details v-if="!bank" class="rounded-2xl border border-slate-200 bg-white p-6"><summary class="min-h-11 cursor-pointer font-bold">Dekomposisi ROE DuPont</summary><p class="mt-3 text-sm leading-6 text-slate-600">Identitas aljabar dari laporan yang sama, bukan pemeriksaan silang independen. Rasio menggunakan saldo akhir.</p><dl v-if="activeCandidate.dupontAnalysis" class="mt-4 grid gap-4 sm:grid-cols-2"><div><dt>Margin laba bersih</dt><dd>{{ metric(activeCandidate.dupontAnalysis.netProfitMargin, '%') }}</dd></div><div><dt>Perputaran aset</dt><dd>{{ metric(activeCandidate.dupontAnalysis.assetTurnover, 'x') }}</dd></div><div><dt>Pengali ekuitas</dt><dd>{{ metric(activeCandidate.dupontAnalysis.equityMultiplier, 'x') }}</dd></div><div><dt>ROE terhitung</dt><dd>{{ metric(activeCandidate.dupontAnalysis.calculatedRoe, '%') }}</dd></div></dl><p v-else class="mt-3 text-sm">Dekomposisi belum tersedia.</p></details>
  </div>
  <p v-else class="rounded-2xl border border-slate-200 bg-white p-6">Tidak ada kandidat yang dapat ditampilkan. Tinjau alasan seleksi dan kelengkapan data.</p>
</template>
