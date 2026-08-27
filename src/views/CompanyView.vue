<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { ArrowLeft, BarChart3, CheckCircle2, AlertTriangle, Database, GitCompare } from 'lucide-vue-next'

const route = useRoute()
const store = useResearchStore()
const company = computed(() => store.candidates.find(candidate => candidate.symbol === String(route.params.symbol).toUpperCase()))
const factors = computed(() => company.value ? [
  { label: 'Profitabilitas', value: company.value.scoreBreakdown.profitability, weight: '25%' },
  { label: 'Pertumbuhan', value: company.value.scoreBreakdown.growth, weight: '25%' },
  { label: 'Solvabilitas', value: company.value.scoreBreakdown.solvency, weight: '20%' },
  { label: 'Valuasi', value: company.value.scoreBreakdown.valuation, weight: '20%' },
  { label: 'Konsistensi', value: company.value.scoreBreakdown.consistency, weight: '10%' }
] : [])
</script>

<template>
  <div v-if="!company" class="mx-auto flex min-h-[65dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-2xl font-bold text-slate-950">Perusahaan tidak ditemukan</h1>
    <p class="mt-3 text-sm text-slate-600">Ticker ini tidak tersedia dalam sesi riset yang sedang dibuka.</p>
    <router-link to="/screener" class="button-primary mt-6">Kembali ke kandidat</router-link>
  </div>

  <div v-else class="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <router-link to="/screener" class="text-link inline-flex"><ArrowLeft class="h-4 w-4" /> Kembali ke kandidat</router-link>

    <header class="overflow-hidden rounded-3xl bg-[#102138] text-white shadow-xl">
      <div class="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-blue-200"><span>{{ company.sector }}</span><span>·</span><span>{{ company.subsector }}</span></div>
          <h1 class="mt-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl">{{ company.symbol }}</h1>
          <p class="mt-2 text-base text-slate-300">{{ company.name }}</p>
          <p class="mt-6 max-w-3xl text-sm leading-6 text-slate-200">{{ company.whySelected }}</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/8 p-5 text-center"><span class="text-xs text-blue-200">Skor kualitas</span><strong class="mt-1 block font-mono text-4xl">{{ company.qualityScore }}</strong><span class="text-xs text-slate-400">dari 100</span></div>
      </div>
    </header>

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Metrik utama">
      <div v-for="metric in [{ label: 'ROE', value: `${company.roePercent}%` }, { label: 'P/E', value: `${company.peRatio}x` }, { label: '3Y revenue CAGR', value: `${company.revenue3yCagrPercent}%` }, { label: 'FCF yield', value: `${company.freeCashFlowYieldPercent}%` }]" :key="metric.label" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span class="text-xs text-slate-500">{{ metric.label }}</span><strong class="mt-1 block font-mono text-xl text-slate-950">{{ metric.value }}</strong></div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><BarChart3 class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Lima faktor penilaian</h2></div>
          <div class="mt-5 space-y-4"><div v-for="factor in factors" :key="factor.label"><div class="mb-1.5 flex justify-between text-xs"><span class="font-semibold text-slate-700">{{ factor.label }} · {{ factor.weight }}</span><span class="font-mono font-bold">{{ factor.value }}/100</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#407EC9]" :style="{ width: `${factor.value}%` }"></div></div></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><GitCompare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">DuPont ROE</h2></div>
          <div class="mt-5 grid gap-3 sm:grid-cols-4"><div v-for="part in [{ label: 'Net margin', value: `${company.dupontAnalysis.netProfitMargin}%` }, { label: 'Asset turnover', value: `${company.dupontAnalysis.assetTurnover}x` }, { label: 'Equity multiplier', value: `${company.dupontAnalysis.equityMultiplier}x` }, { label: 'Calculated ROE', value: `${company.dupontAnalysis.calculatedRoe}%` }]" :key="part.label" class="rounded-xl bg-slate-50 p-4 text-center"><span class="text-xs text-slate-500">{{ part.label }}</span><strong class="mt-1 block font-mono text-lg">{{ part.value }}</strong></div></div>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-emerald-950"><CheckCircle2 class="h-4 w-4" /> Kekuatan utama</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="strength in company.keyStrengths" :key="strength" class="flex gap-2"><span class="text-emerald-600">•</span>{{ strength }}</li></ul></section>
        <section class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-amber-950"><AlertTriangle class="h-4 w-4" /> Risiko dan hal yang perlu dipantau</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="risk in company.potentialConcerns" :key="risk" class="flex gap-2"><span class="text-amber-600">•</span>{{ risk }}</li></ul></section>
      </aside>
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-2"><Database class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Data pendukung</h2></div>
      <div class="mt-5 grid gap-3 md:grid-cols-2"><article v-for="evidence in company.evidenceCitations" :key="`${evidence.metric}-${evidence.source}`" class="rounded-xl border border-slate-200 p-4"><div class="flex items-start justify-between gap-3"><div><h3 class="text-sm font-bold text-slate-900">{{ evidence.metric }}</h3><p class="mt-1 font-mono text-lg font-bold text-[#2F64A8]">{{ evidence.value }}</p></div><span class="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">{{ evidence.source }}</span></div><p class="mt-3 text-xs leading-5 text-slate-600">{{ evidence.context }}</p></article></div>
    </section>
  </div>
</template>
