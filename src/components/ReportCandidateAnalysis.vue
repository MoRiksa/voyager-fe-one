<script setup lang="ts">
import { computed } from 'vue'
import type { CandidateCompany } from '../types'
import CandidateCard from './CandidateCard.vue'

const props = defineProps<{ candidates: CandidateCompany[]; selectedTicker: string; sessionId: string }>()
const emit = defineEmits<{ 'update:selectedTicker': [ticker: string] }>()
const activeCandidate = computed(() => props.candidates.find(c => c.symbol === props.selectedTicker) || props.candidates[0])
const bank = computed(() => activeCandidate.value?.formulaVersion === 'bank-evidence-v1')
const factors = computed(() => activeCandidate.value ? [
  { label: 'Profitabilitas (ROE)', value: activeCandidate.value.scoreBreakdown?.profitability, weight: '38,46%' },
  { label: 'Solvabilitas (D/E)', value: activeCandidate.value.scoreBreakdown?.solvency, weight: '30,77%' },
  { label: 'Valuasi (P/E)', value: activeCandidate.value.scoreBreakdown?.valuation, weight: '30,77%' }
] : [])
const metric = (value: number | undefined, suffix = '') => Number.isFinite(value) 
  ? `${value!.toLocaleString('id-ID', { maximumFractionDigits: 2 })}${suffix}` 
  : 'Tidak tersedia'
</script>

<template>
  <div v-if="activeCandidate" class="space-y-6">
    <!-- Ticker Tab Selector (rendered when multiple candidates are compared) -->
    <div v-if="candidates.length > 1" class="flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="group" aria-label="Pilih kandidat">
      <button
        v-for="candidate in candidates"
        :key="candidate.symbol"
        type="button"
        :aria-pressed="activeCandidate.symbol === candidate.symbol"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
        :class="activeCandidate.symbol === candidate.symbol 
          ? 'bg-[#244F87] text-white shadow-xs' 
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'"
        @click="emit('update:selectedTicker', candidate.symbol)"
      >
        <span class="font-mono">{{ candidate.symbol }}</span>
        <span class="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-mono opacity-90">#{{ candidate.rank }}</span>
        <span v-if="candidate.subsector" class="hidden font-sans text-[10px] font-normal opacity-85 sm:inline">· {{ candidate.subsector }}</span>
      </button>
    </div>

    <!-- Candidate Card Component -->
    <CandidateCard :candidate="activeCandidate" />

    <!-- Bukti Data Bank (Flagship Evidence Panel with Blue SaaS Theme) -->
    <section v-if="bank" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E4270] bg-[#244F87] px-6 py-4 text-white">
        <div class="flex items-center gap-2.5">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          <h3 class="text-base font-bold tracking-wide text-white">Bukti data bank</h3>
          <span class="font-mono text-xs text-blue-100">PROVIDER EVIDENCE</span>
        </div>
        <span class="font-mono text-xs text-blue-100 bg-[#1E4270] border border-[#2F64A8] px-2.5 py-1 rounded">
          Emiten: {{ activeCandidate.symbol }}
        </span>
      </header>

      <div class="p-6">
        <p class="text-sm leading-6 text-slate-600">
          Data bank yang tersedia ditampilkan menurut kapitalisasi pasar dari penyedia data. Nilai ROE dan P/BV tidak menentukan apakah bank ditampilkan.
        </p>

        <dl class="mt-5 grid gap-3 sm:grid-cols-3">
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
            <dt class="text-xs font-semibold text-slate-600">ROE dari data penyedia; basis belum diverifikasi</dt>
            <dd class="mt-3 font-mono text-2xl font-bold tabular-nums text-slate-950">
              {{ metric(activeCandidate.roePercent, '%') }}
            </dd>
          </div>

          <div class="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
            <dt class="text-xs font-semibold text-slate-600">P/BV historis; basis belum diverifikasi</dt>
            <dd 
              class="mt-3 font-mono text-2xl font-bold tabular-nums"
              :class="activeCandidate.pbvRatio && activeCandidate.pbvRatio < 0 ? 'text-rose-700' : 'text-slate-950'"
            >
              {{ metric(activeCandidate.pbvRatio, 'x') }}
            </dd>
          </div>

          <div class="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
            <dt class="text-xs font-semibold text-slate-600">Periode tahunan yang sama</dt>
            <dd class="mt-3 font-mono text-xl font-bold text-slate-950 truncate">
              {{ activeCandidate.financialPeriod || 'Tidak tersedia' }}
            </dd>
          </div>
        </dl>

        <p class="mt-4 rounded-xl border border-amber-300/80 bg-amber-50/80 p-4 text-xs sm:text-sm leading-6 text-amber-950">
          Basis laba dan ekuitas dapat tidak cocok; basis tanggal dan jumlah saham P/BV belum diverifikasi.
        </p>
      </div>
    </section>

    <!-- Standard Three Factors Panel -->
    <section v-else class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-bold text-slate-950">Tiga faktor pendukung</h3>
      <p class="mt-2 text-sm leading-6 text-slate-600">
        {{ activeCandidate.formulaVersion || 'Versi formula tidak tersedia' }}. Bobot heuristik 25:20:20 dinormalisasi terhadap 65. Belum dikalibrasi empiris, bukan penilaian relatif sektor. Pertumbuhan dan konsistensi belum dinilai.
      </p>

      <dl class="mt-5 grid gap-3 sm:grid-cols-3">
        <div v-for="factor in factors" :key="factor.label" class="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
          <dt class="text-xs font-semibold text-slate-600">{{ factor.label }} · {{ factor.weight }}</dt>
          <dd class="mt-2 font-mono text-2xl font-bold text-slate-950">
            {{ metric(factor.value) }}<span v-if="Number.isFinite(factor.value)" class="text-sm font-normal text-slate-500">/100</span>
          </dd>
        </div>
      </dl>

      <details class="group mt-5 border-t border-slate-100 pt-4">
        <summary class="min-h-11 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors">
          Rumus dan asumsi
        </summary>
        <pre class="mt-3 overflow-x-auto rounded-xl bg-[#102138] text-slate-100 p-4 font-mono text-xs leading-6">P = clamp(round(ROE × 4.2), 40, 100)
S = clamp(round((2.5 − min(2.5, D/E)) × 40), 30, 100)
V = clamp(round((35 − min(35, P/E)) × 3.5), 30, 100)
Q = round((0.25P + 0.20S + 0.20V) / 0.65)</pre>
        <p class="mt-3 text-xs leading-5 text-slate-500">
          Input harus bermakna dan FY keuangan/valuasi sama. FCF bukan faktor skor. FCF negatif dapat menghasilkan Q=100; ini bukan bukti arus kas sehat.
        </p>
      </details>
    </section>

    <!-- DuPont Analysis (Non-bank) -->
    <details v-if="!bank" class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <summary class="min-h-11 cursor-pointer font-bold text-slate-950 hover:text-slate-700 transition-colors">
        Dekomposisi ROE DuPont
      </summary>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        Identitas aljabar dari laporan yang sama, bukan pemeriksaan silang independen. Rasio menggunakan saldo akhir.
      </p>

      <dl v-if="activeCandidate.dupontAnalysis" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <dt class="text-xs font-medium text-slate-500">Margin laba bersih</dt>
          <dd class="mt-1 font-mono text-lg font-bold text-slate-900">{{ metric(activeCandidate.dupontAnalysis.netProfitMargin, '%') }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <dt class="text-xs font-medium text-slate-500">Perputaran aset</dt>
          <dd class="mt-1 font-mono text-lg font-bold text-slate-900">{{ metric(activeCandidate.dupontAnalysis.assetTurnover, 'x') }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <dt class="text-xs font-medium text-slate-500">Pengali ekuitas</dt>
          <dd class="mt-1 font-mono text-lg font-bold text-slate-900">{{ metric(activeCandidate.dupontAnalysis.equityMultiplier, 'x') }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <dt class="text-xs font-medium text-slate-500">ROE terhitung</dt>
          <dd class="mt-1 font-mono text-lg font-bold text-slate-900">{{ metric(activeCandidate.dupontAnalysis.calculatedRoe, '%') }}</dd>
        </div>
      </dl>
      <p v-else class="mt-3 text-sm text-slate-500">Dekomposisi belum tersedia.</p>
    </details>
  </div>

  <p v-else class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
    Tidak ada kandidat yang dapat ditampilkan. Tinjau alasan seleksi dan kelengkapan data.
  </p>
</template>
