<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2 } from '@lucide/vue'
import type { CandidateCompany } from '../types'

const props = defineProps<{
  candidates: CandidateCompany[]
  selectedTicker: string
  sessionId: string
}>()

const emit = defineEmits<{
  'update:selectedTicker': [ticker: string]
}>()

const activeCandidate = computed(() => {
  return props.candidates.find(candidate => candidate.symbol === props.selectedTicker) || props.candidates[0]
})
const compactSource = (source: string) => source.startsWith('Derived')
  ? `Turunan · ${source.split('/').pop()}`
  : `Fixture v1 · ${source.split('/').slice(-2).join('/')}`
</script>

<template>
  <div v-if="activeCandidate" id="report-panel-candidates" role="tabpanel" aria-labelledby="report-tab-candidates" class="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-[#2F64A8] font-mono">
          Analisis mendalam
        </div>
        <h3 class="text-lg font-bold text-slate-900">
          Kandidat: <span class="font-mono text-[#2F64A8]">{{ activeCandidate.symbol }}</span> ({{ activeCandidate.name }})
        </h3>
        <router-link :to="`/research/${sessionId}/company/${activeCandidate.symbol}`" class="text-link mt-2 inline-flex">Buka halaman perusahaan <ArrowUpRight class="h-4 w-4" /></router-link>
      </div>

      <!-- Horizontal Candidate Ticker Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="c in candidates"
          :key="c.symbol"
          @click="emit('update:selectedTicker', c.symbol)"
          :aria-pressed="selectedTicker === c.symbol"
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          :class="selectedTicker === c.symbol
            ? 'bg-[#2F64A8] text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        >
          <span>#{{ c.rank }}</span>
          <span>{{ c.symbol }}</span>
        </button>
      </div>
    </div>

    <!-- Active Candidate Content -->
    <div class="space-y-6">
      <!-- 4-Stat Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
          <span class="text-xs font-mono uppercase text-slate-500 font-semibold">Skor kualitas</span>
          <p class="text-xl font-bold font-mono text-[#2F64A8] mt-0.5">{{ activeCandidate.qualityScore }}<span class="text-xs text-slate-500">/100</span></p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
          <span class="text-xs font-mono uppercase text-slate-500 font-semibold">Return on Equity</span>
          <p class="text-xl font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.roePercent }}%</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
          <span class="text-xs font-mono uppercase text-slate-500 font-semibold">Valuation (P/E)</span>
          <p class="text-xl font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.peRatio }}x</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
          <span class="text-xs font-mono uppercase text-slate-500 font-semibold">Free Cash Flow Yield</span>
          <p class="text-xl font-bold font-mono text-emerald-700 mt-0.5">{{ activeCandidate.freeCashFlowYieldPercent }}%</p>
        </div>
      </div>

      <!-- 3-Stage DuPont ROE Decomposition Visualizer -->
      <div class="p-5 rounded-2xl bg-[#407EC9]/5 border border-[#407EC9]/20 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BarChart3 class="w-4 h-4 text-[#407EC9]" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Dekomposisi ROE DuPont 3 Tahap
            </h4>
          </div>
          <span class="text-xs font-mono font-bold text-[#407EC9]">
            ROE terhitung: {{ activeCandidate.dupontAnalysis.calculatedRoe }}%
          </span>
        </div>

        <!-- Formula Chain Visualizer -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="block text-xs uppercase font-mono text-slate-500 font-bold">1. Margin Laba</span>
            <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.netProfitMargin }}%</p>
            <span class="text-[10px] text-slate-500">Profitabilitas operasional</span>
          </div>

          <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="block text-xs uppercase font-mono text-slate-500 font-bold">2. Perputaran Aset</span>
            <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.assetTurnover }}x</p>
            <span class="text-[10px] text-slate-500">Efisiensi aset</span>
          </div>

          <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="block text-xs uppercase font-mono text-slate-500 font-bold">3. Multiplier Ekuitas</span>
            <p class="text-base font-bold font-mono text-slate-900 mt-0.5">{{ activeCandidate.dupontAnalysis.equityMultiplier }}x</p>
            <span class="text-[10px] text-slate-500">Leverage finansial</span>
          </div>

          <div class="p-3 rounded-xl bg-[#2F64A8] text-white shadow-sm">
            <span class="text-[10px] uppercase font-mono text-white/80 font-bold block">= ROE Terhitung</span>
            <p class="text-base font-bold font-mono text-white mt-0.5">{{ activeCandidate.dupontAnalysis.calculatedRoe }}%</p>
            <span class="text-[10px] text-white/80">Return gabungan</span>
          </div>
        </div>
      </div>

      <!-- 5-Factor Scoring Meters -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Lima faktor penilaian (skala 0-100)
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-600 font-medium">Profitabilitas & ROIC · bobot 25%</span>
              <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.profitability }}/100</span>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-[#407EC9] rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.profitability}%` }"></div>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex justify-between text-xs"><span class="text-slate-600 font-medium">Konsistensi laba dan dividen · bobot 10%</span><span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.consistency }}/100</span></div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200"><div class="h-full rounded-full bg-slate-500" :style="{ width: `${activeCandidate.scoreBreakdown.consistency}%` }"></div></div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-600 font-medium">Solvabilitas dan kesehatan utang · bobot 20%</span>
              <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.solvency }}/100</span>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-600 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.solvency}%` }"></div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-600 font-medium">Valuasi relatif · bobot 20%</span>
              <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.valuation }}/100</span>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.valuation}%` }"></div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-600 font-medium">Pertumbuhan · bobot 25%</span>
              <span class="font-mono font-bold text-slate-900">{{ activeCandidate.scoreBreakdown.growth }}/100</span>
            </div>
            <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 rounded-full" :style="{ width: `${activeCandidate.scoreBreakdown.growth}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Why Selected & Strengths / Concerns -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Alasan pemilihan dan risiko
        </h4>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <strong>Inti tesis:</strong> {{ activeCandidate.whySelected }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Strengths -->
          <div class="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
            <span class="text-xs font-bold text-emerald-900 uppercase font-mono flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              Keunggulan kompetitif utama
            </span>
            <ul class="space-y-1.5 text-xs text-slate-700">
              <li v-for="(s, idx) in activeCandidate.keyStrengths" :key="idx" class="flex items-start gap-1.5">
                <span class="text-emerald-600 font-bold">•</span>
                <span>{{ s }}</span>
              </li>
            </ul>
          </div>

          <!-- Concerns -->
          <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
            <span class="text-xs font-bold text-amber-900 uppercase font-mono flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
              Risiko dan hal yang perlu dipantau
            </span>
            <ul class="space-y-1.5 text-xs text-slate-700">
              <li v-for="(c, idx) in activeCandidate.potentialConcerns" :key="idx" class="flex items-start gap-1.5">
                <span class="text-amber-600 font-bold">•</span>
                <span>{{ c }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Evidence Citations Strip -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Data pendukung
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
          <div
            v-for="(citation, idx) in activeCandidate.evidenceCitations"
            :key="idx"
            class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2"
          >
            <div>
              <div class="font-bold text-slate-800">{{ citation.metric }}: <span class="text-[#2F64A8]">{{ citation.value }}</span></div>
              <div class="text-[10px] text-slate-500 font-sans mt-0.5">{{ citation.context }}</div>
            </div>
            <div class="shrink-0 text-right">
              <span class="block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700" :title="citation.source">{{ compactSource(citation.source) }}</span>
              <span v-if="citation.period" class="mt-1 block text-[10px] text-slate-500">Periode: {{ citation.period }}</span>
              <span v-if="citation.asOf" class="mt-1 block text-[10px] text-slate-500">Per tanggal: {{ citation.asOf }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else id="report-panel-candidates" role="tabpanel" aria-labelledby="report-tab-candidates" class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 class="font-bold text-slate-900">Tidak ada kandidat dalam laporan ini</h2><p class="mt-2 text-sm text-slate-600">Tidak ada perusahaan pada dataset prototype yang memenuhi seluruh kriteria.</p></div>
</template>
