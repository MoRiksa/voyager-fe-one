<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { ArrowLeft, BarChart3, CheckCircle2, AlertTriangle, Database, GitCompare } from '@lucide/vue'

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
const scoreInterpretation = computed(() => !company.value ? '' : company.value.qualityScore >= 90 ? 'Sangat kuat dalam ruang lingkup sesi' : company.value.qualityScore >= 80 ? 'Kuat, dengan tradeoff yang perlu diperiksa' : company.value.qualityScore >= 70 ? 'Campuran dan perlu analisis tambahan' : 'Tidak diprioritaskan oleh model')
const primaryMetrics = computed(() => company.value ? [
  { label: 'Efisiensi modal', term: 'ROE', value: `${company.value.roePercent}%`, help: 'Laba yang dihasilkan dari setiap Rp100 modal. Nilai tinggi juga dapat dipengaruhi leverage.' },
  { label: 'Harga dibanding laba', term: 'P/E', value: `${company.value.peRatio}x`, help: 'Harga untuk setiap Rp1 laba tahunan. Bandingkan dengan sektor dan histori perusahaan.' },
  { label: 'Pertumbuhan pendapatan', term: 'CAGR 3 tahun', value: `${company.value.revenue3yCagrPercent}%`, help: 'Rata-rata pertumbuhan per tahun selama tiga tahun, bukan pertumbuhan setiap tahun.' },
  { label: 'Kas bebas dibanding nilai', term: 'FCF yield', value: `${company.value.freeCashFlowYieldPercent}%`, help: 'Kas bebas tahunan relatif terhadap nilai perusahaan.' }
] : [])
const dupontParts = computed(() => company.value ? [
  { label: 'Margin laba bersih', value: `${company.value.dupontAnalysis.netProfitMargin}%`, help: 'Laba yang tersisa dari setiap Rp100 pendapatan.' },
  { label: 'Efisiensi aset', value: `${company.value.dupontAnalysis.assetTurnover}x`, help: 'Pendapatan yang dihasilkan setiap Rp1 aset.' },
  { label: 'Pengaruh leverage', value: `${company.value.dupontAnalysis.equityMultiplier}x`, help: 'Aset yang didukung setiap Rp1 modal; lebih tinggi berarti leverage lebih besar.' },
  { label: 'ROE terhitung', value: `${company.value.dupontAnalysis.calculatedRoe}%`, help: 'Hasil gabungan margin, efisiensi aset, dan leverage.' }
] : [])
</script>

<template>
  <div v-if="!company" class="mx-auto flex min-h-[65dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 class="text-2xl font-bold text-slate-950">Perusahaan tidak ditemukan</h1>
    <p class="mt-3 text-sm text-slate-600">Ticker ini tidak tersedia dalam sesi riset yang sedang dibuka.</p>
    <router-link :to="`/research/${store.report.sessionId}/screener`" class="button-primary mt-6">Kembali ke kandidat</router-link>
  </div>

  <div v-else class="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <router-link :to="`/research/${store.report.sessionId}/screener`" class="text-link inline-flex"><ArrowLeft class="h-4 w-4" /> Kembali ke kandidat</router-link>

    <header class="overflow-hidden rounded-3xl bg-[#102138] text-white shadow-xl">
      <div class="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-blue-200"><span>{{ company.sector }}</span><span>·</span><span>{{ company.subsector }}</span></div>
          <h1 class="mt-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl">{{ company.symbol }}</h1>
          <p class="mt-2 text-base text-slate-300">{{ company.name }}</p>
          <p class="mt-6 max-w-3xl text-sm leading-6 text-slate-200">{{ company.whySelected }}</p>
        </div>
        <div class="max-w-56 rounded-2xl border border-white/15 bg-white/8 p-5 text-center"><span class="text-xs text-blue-200">Skor kualitas</span><strong class="mt-1 block font-mono text-4xl">{{ company.qualityScore }}</strong><span class="text-xs text-slate-400">dari 100</span><p class="mt-2 text-xs leading-5 text-blue-100">{{ scoreInterpretation }}</p></div>
      </div>
    </header>

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Metrik utama">
      <div v-for="metric in primaryMetrics" :key="metric.term" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span class="text-xs font-semibold text-slate-700">{{ metric.label }}</span><span class="ml-1 text-xs text-slate-500">{{ metric.term }}</span><strong class="mt-1 block font-mono text-xl text-slate-950">{{ metric.value }}</strong><p class="mt-2 text-[11px] leading-5 text-slate-500">{{ metric.help }}</p></div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><BarChart3 class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Lima faktor penilaian</h2></div>
          <p class="mt-2 text-xs leading-5 text-slate-500">Setiap faktor dinilai 0-100 dalam model demonstrasi. Bobot menunjukkan kontribusi pada skor akhir, bukan peluang keuntungan.</p>
          <div class="mt-5 space-y-4"><div v-for="factor in factors" :key="factor.label"><div class="mb-1.5 flex justify-between text-xs"><span class="font-semibold text-slate-700">{{ factor.label }} · {{ factor.weight }}</span><span class="font-mono font-bold">{{ factor.value }}/100</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-[#407EC9]" :style="{ width: `${factor.value}%` }"></div></div></div></div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div class="flex items-center gap-2"><GitCompare class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Sumber ROE: margin × efisiensi aset × leverage</h2></div>
          <div class="mt-5 grid gap-3 sm:grid-cols-4"><div v-for="part in dupontParts" :key="part.label" class="rounded-xl bg-slate-50 p-4 text-center"><span class="text-xs font-semibold text-slate-700">{{ part.label }}</span><strong class="mt-1 block font-mono text-lg">{{ part.value }}</strong><p class="mt-2 text-[11px] leading-5 text-slate-500">{{ part.help }}</p></div></div>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-emerald-950"><CheckCircle2 class="h-4 w-4" /> Kekuatan utama</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="strength in company.keyStrengths" :key="strength" class="flex gap-2"><span class="text-emerald-600">•</span>{{ strength }}</li></ul></section>
        <section class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5"><h2 class="flex items-center gap-2 text-sm font-bold text-amber-950"><AlertTriangle class="h-4 w-4" /> Risiko dan hal yang perlu dipantau</h2><ul class="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li v-for="risk in company.potentialConcerns" :key="risk" class="flex gap-2"><span class="text-amber-600">•</span>{{ risk }}</li></ul></section>
      </aside>
    </div>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div class="flex items-center gap-2"><Database class="h-4 w-4 text-[#407EC9]" /><h2 class="text-lg font-bold text-slate-950">Nilai, sumber, dan konteks pembanding</h2></div>
      <div class="mt-5 grid gap-3 md:grid-cols-2"><article v-for="evidence in company.evidenceCitations" :key="`${evidence.metric}-${evidence.source}`" class="rounded-xl border border-slate-200 p-4"><div class="flex items-start justify-between gap-3"><div><h3 class="text-sm font-bold text-slate-900">{{ evidence.metric }}</h3><p class="mt-1 font-mono text-lg font-bold text-[#2F64A8]">{{ evidence.value }}</p></div><span class="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">{{ evidence.source }}</span></div><p class="mt-3 text-xs leading-5 text-slate-600">{{ evidence.context }}</p></article></div>
    </section>
  </div>
</template>
